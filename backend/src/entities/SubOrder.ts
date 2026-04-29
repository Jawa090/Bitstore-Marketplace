import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Order } from "./Order";
import { OrderItem } from "./OrderItem";
import { SubOrderStatus } from "../utils/constants";

@Entity("sub_orders")
export class SubOrder {
  // ── Primary Key ─────────────────────────────────────────────────────
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ── Parent Order (FK → orders, CASCADE DELETE) ───────────────────────
  @Column({ type: "uuid" })
  order_id: string;

  @ManyToOne(() => Order, (order) => order.sub_orders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Order;

  // ── Vendor (loosely coupled — no FK constraint) ──────────────────────
  // The Vendor entity is owned by another team; UUID stored as plain column.
  @Column({ type: "uuid" })
  vendor_id: string;

  // ── Financials ───────────────────────────────────────────────────────
  @Column({ type: "decimal", precision: 12, scale: 2 })
  subtotal: string;

  // ── Status ───────────────────────────────────────────────────────────
  @Column({
    type: "enum",
    enum: SubOrderStatus,
    default: SubOrderStatus.PENDING,
  })
  status: SubOrderStatus;

  // ── Shipping ─────────────────────────────────────────────────────────
  @Column({ type: "varchar", length: 255, nullable: true })
  tracking_number: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  courier: string | null;

  // ── Order Items ──────────────────────────────────────────────────────
  @OneToMany(() => OrderItem, (item) => item.sub_order, {
    cascade: ["insert", "update"],
  })
  items: OrderItem[];

  // ── Timestamps ───────────────────────────────────────────────────────
  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}
