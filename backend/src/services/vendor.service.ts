import { AppDataSource } from "../config/database";
import { Vendor } from "../entities/Vendor";
import { TradeLicense } from "../entities/TradeLicense";
import { Product } from "../entities/Product";
import { SubOrder } from "../entities/SubOrder";
import { VendorPayout } from "../entities/VendorPayout";
import { AppError } from "../utils/AppError";
import { VendorStatus, SubOrderStatus } from "../utils/constants";
import { In, Not } from "typeorm";

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────
interface ApplyForVendorPayload {
  store_name: string;
  store_description?: string;
  emirate: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  license_number: string;
  license_expiry_date: string; // ISO date string
  license_document_url?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// APPLY FOR VENDOR
// Wraps Vendor + TradeLicense creation in a single DB transaction so a
// failure at any step rolls back all inserts.
// ─────────────────────────────────────────────────────────────────────────
export const applyForVendor = async (
  userId: string,
  payload: ApplyForVendorPayload
): Promise<Vendor> => {
  // ── 1. Check for existing pending/approved vendor profile ────────
  const existing = await AppDataSource.getRepository(Vendor).findOne({
    where: {
      user: { id: userId },
      status: In([VendorStatus.PENDING, VendorStatus.APPROVED]),
    },
    relations: ["user"],
  });

  if (existing) {
    throw new AppError(
      existing.status === VendorStatus.APPROVED
        ? "You already have an approved vendor profile."
        : "You already have a pending vendor application.",
      400
    );
  }

  // ── 2. Open a transaction ────────────────────────────────────────
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Step A — Insert vendor profile
    const newVendor = queryRunner.manager.create(Vendor, {
      store_name: payload.store_name,
      store_description: payload.store_description,
      emirate: payload.emirate,
      address: payload.address,
      contact_email: payload.contact_email,
      contact_phone: payload.contact_phone,
    });
    // Assign relation separately to bypass strict DeepPartial checks
    newVendor.user = { id: userId } as any;
    const savedVendor = await queryRunner.manager.save(newVendor);

    // Step B — Insert trade license
    const newLicense = queryRunner.manager.create(TradeLicense, {
      license_number: payload.license_number,
      expiry_date: payload.license_expiry_date,
      document_url: payload.license_document_url || undefined,
    });
    // Assign relation separately
    newLicense.vendor = savedVendor;
    await queryRunner.manager.save(newLicense);

    // ── 3. Commit ──────────────────────────────────────────────────
    await queryRunner.commitTransaction();

    // Return the saved vendor with relations eagerly loaded
    return AppDataSource.getRepository(Vendor).findOneOrFail({
      where: { id: savedVendor.id },
      relations: ["user", "licenses"],
    });
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────
// CHECK VENDOR STATUS
// Returns the vendor profile for the given user, or null if no application
// exists. Does NOT throw — "no vendor" is a valid state for customers.
// ─────────────────────────────────────────────────────────────────────────
export const checkVendorStatus = async (
  userId: string
): Promise<Vendor | null> => {
  const vendor = await AppDataSource.getRepository(Vendor).findOne({
    where: { user: { id: userId } },
    select: ["id", "store_name", "status", "is_bitstores", "created_at"],
  });

  return vendor;
};

// ─────────────────────────────────────────────────────────────────────────
// GET VENDOR OVERVIEW (Dashboard Metrics)
// Runs 4 concurrent queries to calculate key vendor KPIs.
// ─────────────────────────────────────────────────────────────────────────
interface VendorOverview {
  total_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
}

export const getVendorOverview = async (
  vendorId: string
): Promise<VendorOverview> => {
  const productRepo = AppDataSource.getRepository(Product);
  const subOrderRepo = AppDataSource.getRepository(SubOrder);

  const [totalProducts, totalOrders, pendingOrders, revenueResult] =
    await Promise.all([
      // 1. Active products (soft-deleted excluded by default)
      productRepo.count({
        where: { vendor: { id: vendorId } },
      }),

      // 2. Total sub-orders
      subOrderRepo.count({
        where: { vendor_id: vendorId },
      }),

      // 3. Pending/confirmed orders (actionable)
      subOrderRepo.count({
        where: {
          vendor_id: vendorId,
          status: In([SubOrderStatus.PENDING, SubOrderStatus.CONFIRMED]),
        },
      }),

      // 4. Total revenue (all non-cancelled sub-orders)
      subOrderRepo
        .createQueryBuilder("so")
        .select("COALESCE(SUM(so.subtotal), 0)", "total")
        .where("so.vendor_id = :vendorId", { vendorId })
        .andWhere("so.status != :cancelled", {
          cancelled: SubOrderStatus.CANCELLED,
        })
        .getRawOne(),
    ]);

  return {
    total_products: totalProducts,
    total_orders: totalOrders,
    pending_orders: pendingOrders,
    total_revenue: parseFloat(revenueResult?.total ?? "0"),
  };
};

// ─────────────────────────────────────────────────────────────────────────
// GET VENDOR SETTINGS
// Returns the full vendor profile for the settings page.
// ─────────────────────────────────────────────────────────────────────────
export const getVendorSettings = async (
  vendorId: string
): Promise<Vendor> => {
  const vendor = await AppDataSource.getRepository(Vendor).findOne({
    where: { id: vendorId },
  });

  if (!vendor) {
    throw new AppError("Vendor not found.", 404);
  }

  return vendor;
};

// ─────────────────────────────────────────────────────────────────────────
// UPDATE VENDOR SETTINGS
// Only allows updating store-facing fields. Blocks sensitive fields like
// commission_rate, status, and is_bitstores (admin-only).
// ─────────────────────────────────────────────────────────────────────────
interface UpdateSettingsPayload {
  store_name?: string;
  store_description?: string;
  logo_url?: string;
  emirate?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
}

export const updateVendorSettings = async (
  vendorId: string,
  payload: UpdateSettingsPayload
): Promise<Vendor> => {
  const repo = AppDataSource.getRepository(Vendor);

  const vendor = await repo.findOne({ where: { id: vendorId } });

  if (!vendor) {
    throw new AppError("Vendor not found.", 404);
  }

  // Whitelist: only update allowed fields
  if (payload.store_name !== undefined) vendor.store_name = payload.store_name;
  if (payload.store_description !== undefined) vendor.store_description = payload.store_description as any;
  if (payload.logo_url !== undefined) vendor.logo_url = payload.logo_url as any;
  if (payload.emirate !== undefined) vendor.emirate = payload.emirate;
  if (payload.address !== undefined) vendor.address = payload.address as any;
  if (payload.contact_email !== undefined) vendor.contact_email = payload.contact_email as any;
  if (payload.contact_phone !== undefined) vendor.contact_phone = payload.contact_phone as any;

  return repo.save(vendor);
};

// ─────────────────────────────────────────────────────────────────────────
// GET VENDOR PAYOUTS
// Returns all payout records for the given vendor.
// ─────────────────────────────────────────────────────────────────────────
export const getVendorPayouts = async (
  vendorId: string
): Promise<VendorPayout[]> => {
  return AppDataSource.getRepository(VendorPayout).find({
    where: { vendor: { id: vendorId } },
    order: { created_at: "DESC" },
  });
};

// ─────────────────────────────────────────────────────────────────────────
// GET VENDOR ANALYTICS
// Returns revenue-over-time chart data (last 30 days) and 5 most recent
// orders for the vendor dashboard.
// ─────────────────────────────────────────────────────────────────────────
interface RevenueDataPoint {
  date: string;
  revenue: number;
}

interface VendorAnalytics {
  revenue_chart: RevenueDataPoint[];
  recent_orders: SubOrder[];
}

export const getVendorAnalytics = async (
  vendorId: string
): Promise<VendorAnalytics> => {
  const subOrderRepo = AppDataSource.getRepository(SubOrder);

  const [revenueChart, recentOrders] = await Promise.all([
    // 1. Revenue grouped by day (last 30 days)
    subOrderRepo
      .createQueryBuilder("so")
      .select("DATE(so.created_at)", "date")
      .addSelect("COALESCE(SUM(so.subtotal), 0)", "revenue")
      .where("so.vendor_id = :vendorId", { vendorId })
      .andWhere("so.status != :cancelled", {
        cancelled: SubOrderStatus.CANCELLED,
      })
      .andWhere("so.created_at >= NOW() - INTERVAL '30 days'")
      .groupBy("DATE(so.created_at)")
      .orderBy("date", "ASC")
      .getRawMany(),

    // 2. 5 most recent sub-orders
    subOrderRepo.find({
      where: { vendor_id: vendorId },
      relations: ["order", "items"],
      order: { created_at: "DESC" },
      take: 5,
    }),
  ]);

  return {
    revenue_chart: revenueChart.map((r: any) => ({
      date: r.date,
      revenue: parseFloat(r.revenue),
    })),
    recent_orders: recentOrders,
  };
};
