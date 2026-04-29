import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { ReturnRequestStatus } from "../utils/constants";

@Entity("return_requests")
export class ReturnRequest {
  // ── Primary Key ─────────────────────────────────────────────────────
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ── References (loosely coupled — plain UUID strings) ────────────────
  // We store these as plain columns rather than FK constraints so that
  // this entity can be developed independently of the Order/User modules.
  @Column({ type: "uuid" })
  order_id: string;

  @Column({ type: "uuid" })
  customer_id: string;

  // ── Return Details ───────────────────────────────────────────────────
  @Column({ type: "varchar", length: 50 })
  reason: string;

  @Column({ type: "text", nullable: true })
  comments: string | null;

  // ── Status ───────────────────────────────────────────────────────────
  @Column({
    type: "enum",
    enum: ReturnRequestStatus,
    default: ReturnRequestStatus.PENDING,
  })
  status: ReturnRequestStatus;

  // ── Timestamps ───────────────────────────────────────────────────────
  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
