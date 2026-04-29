import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Vendor } from "./Vendor";
import { ProductCondition } from "../utils/constants";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ── Vendor Relationship ──────────────────────────────────────────
  @ManyToOne(() => Vendor)
  @JoinColumn({ name: "vendor_id" })
  vendor: Vendor;

  // ── Product Info ─────────────────────────────────────────────────
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 300, unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  price: number;

  @Column({ type: "varchar", length: 10, default: "AED" })
  currency: string;

  @Column({ type: "int", default: 0 })
  stock: number;

  @Column({
    type: "enum",
    enum: ProductCondition,
    default: ProductCondition.NEW,
  })
  condition: ProductCondition;

  @Column({ type: "varchar", length: 100, nullable: true })
  category: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  brand: string;

  // ── Media ────────────────────────────────────────────────────────
  @Column({ type: "text", nullable: true })
  image_url: string;

  @Column({ type: "jsonb", nullable: true })
  images: string[]; // Array of image URLs

  @Column({ type: "jsonb", default: {} })
  specifications: Record<string, any>;

  @Column({ type: "varchar", length: 255, nullable: true })
  video_url: string;

  // ── Status ───────────────────────────────────────────────────────
  @Column({ type: "boolean", default: true })
  is_active: boolean;

  // ── Timestamps ───────────────────────────────────────────────────
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date; // Soft delete
}
