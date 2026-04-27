import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";

export enum VendorStatus {
  PENDING = "pending",
  VERIFIED = "verified", 
  REJECTED = "rejected",
}

@Entity("vendors")
export class Vendor {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index({ unique: true })
  @Column({ type: "uuid", unique: true })
  user_id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 255 })
  store_name: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, unique: true })
  store_slug: string;

  @Column({ type: "text", nullable: true })
  logo_url: string | null;

  @Column({ type: "text", nullable: true })
  banner_url: string | null;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  emirate: string | null;

  @Column({ type: "boolean", default: false })
  is_bitstores: boolean;

  @Column({ type: "boolean", default: false })
  is_verified: boolean;

  @Column({
    type: "enum",
    enum: VendorStatus,
    default: VendorStatus.PENDING,
  })
  verification_status: VendorStatus;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 10.00 })
  commission_rate: number;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}