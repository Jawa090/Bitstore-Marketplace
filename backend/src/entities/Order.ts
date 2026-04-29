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
import { User } from "./User";
import { SubOrder } from "./SubOrder";
import { OrderStatus, PaymentStatus } from "../utils/constants";

@Entity("orders")
export class Order {
  // ── Primary Key ─────────────────────────────────────────────────────
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ── Customer (FK → users) ────────────────────────────────────────────
  @Column({ type: "uuid" })
  customer_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "customer_id" })
  customer: User;

  // ── Financials ───────────────────────────────────────────────────────
  @Column({ type: "decimal", precision: 12, scale: 2 })
  total_amount: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  vat_amount: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  cod_fee: string;

  // ── Payment ──────────────────────────────────────────────────────────
  @Column({ type: "varchar", length: 20, nullable: true })
  payment_method: string | null;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  payment_status: PaymentStatus;

  // Stripe PaymentIntent ID (e.g. "pi_3Nxxx..."). Null until Stripe creates it.
  @Column({ type: "varchar", length: 255, nullable: true })
  stripe_payment_intent_id: string | null;

  // ── Delivery Details ─────────────────────────────────────────────────
  @Column({ type: "varchar", length: 50 })
  delivery_emirate: string;

  @Column({ type: "text" })
  delivery_address: string;

  @Column({ type: "text", nullable: true })
  delivery_landmark: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string | null;

  // ── Notes ────────────────────────────────────────────────────────────
  @Column({ type: "text", nullable: true })
  notes: string | null;

  // ── Status ───────────────────────────────────────────────────────────
  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // ── Sub-orders ───────────────────────────────────────────────────────
  @OneToMany(() => SubOrder, (subOrder) => subOrder.order, {
    cascade: ["insert", "update"],
  })
  sub_orders: SubOrder[];

  // ── Timestamps ───────────────────────────────────────────────────────
  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}
