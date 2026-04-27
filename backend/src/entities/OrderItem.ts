import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { SubOrder } from "./SubOrder";

@Entity("order_items")
export class OrderItem {
  // ── Primary Key ─────────────────────────────────────────────────────
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ── Parent SubOrder (FK → sub_orders, CASCADE DELETE) ────────────────
  @Column({ type: "uuid" })
  sub_order_id: string;

  @ManyToOne(() => SubOrder, (subOrder) => subOrder.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sub_order_id" })
  sub_order: SubOrder;

  // ── Product (loosely coupled — no FK constraint) ─────────────────────
  // The Product entity is owned by another team; UUID stored as plain column.
  @Column({ type: "uuid" })
  product_id: string;

  // ── Line Details ─────────────────────────────────────────────────────
  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  unit_price: string;
}
