import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Vendor } from "./Vendor";
import { TradeLicenseStatus } from "../utils/constants";

@Entity("trade_licenses")
export class TradeLicense {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Vendor, (vendor) => vendor.licenses)
  @JoinColumn({ name: "vendor_id" })
  vendor: Vendor;

  @Column({ type: "varchar", length: 100 })
  license_number: string;

  @Column({ type: "date" })
  expiry_date: Date;

  @Column({ type: "text", nullable: true })
  document_url: string;

  @Column({
    type: "enum",
    enum: TradeLicenseStatus,
    default: TradeLicenseStatus.PENDING,
  })
  status: TradeLicenseStatus;

  @CreateDateColumn()
  created_at: Date;
}
