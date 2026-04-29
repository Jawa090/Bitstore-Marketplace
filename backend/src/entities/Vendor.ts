import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { TradeLicense } from "./TradeLicense";
import { VendorStatus } from "../utils/constants";

@Entity("vendors")
export class Vendor {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 255 })
  store_name: string;

  @Column({ type: "text", nullable: true })
  store_description: string;

  @Column({ type: "text", nullable: true })
  logo_url: string;

  @Column({ type: "varchar", length: 50 })
  emirate: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  contact_email: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  contact_phone: string;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 10.0 })
  commission_rate: number;

  @Column({ type: "boolean", default: false })
  is_bitstores: boolean;

  @Column({ type: "enum", enum: VendorStatus, default: VendorStatus.PENDING })
  status: VendorStatus;

  @OneToMany(() => TradeLicense, (license) => license.vendor)
  licenses: TradeLicense[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date; // Soft Delete for data integrity
}
