import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Vendor } from "./Vendor";

@Entity("vendor_payouts")
export class VendorPayout {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: "vendor_id" })
  vendor: Vendor;

  @Column({ type: "uuid", nullable: true })
  remittance_id: string; // Left loosely coupled for Phase 1

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ type: "enum", enum: ["pending", "paid"], default: "pending" })
  status: string;

  @Column({ type: "timestamptz", nullable: true })
  paid_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
