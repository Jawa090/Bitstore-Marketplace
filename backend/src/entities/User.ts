import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
} from "typeorm";
import { Emirate } from "../utils/constants";
import { Vendor } from "./Vendor";

@Entity("users")
export class User {
  // ── Primary Key ─────────────────────────────────────────────────
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ── Authentication ──────────────────────────────────────────────
  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  password_hash: string | null;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, unique: true, nullable: true })
  google_id: string | null;

  // ── Profile ─────────────────────────────────────────────────────
  @Column({ type: "varchar", length: 255 })
  full_name: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string | null;

  @Column({ type: "boolean", default: false })
  phone_verified: boolean;

  @Column({
    type: "enum",
    enum: Emirate,
    nullable: true,
  })
  emirate: Emirate | null;

  @Column({ type: "text", nullable: true })
  avatar_url: string | null;

  // ── Account Status ──────────────────────────────────────────────
  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "boolean", default: false })
  email_verified: boolean;

  // ── Vendor Profile ───────────────────────────────────────────────
  @OneToOne(() => Vendor, (vendor) => vendor.user)
  vendor: Vendor;

  // ── Timestamps ──────────────────────────────────────────────────
  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}
