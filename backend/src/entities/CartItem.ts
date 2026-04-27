import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Cart } from "./Cart";

@Entity("cart_items")
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ── Parent Cart ────────────────────────────────────────────────────
  @Column({ type: "uuid" })
  cart_id: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cart_id" })
  cart: Cart;

  // ── Product (loosely coupled — no FK constraint) ───────────────────
  // The Product entity doesn't exist yet; we store the UUID as a plain
  // column so we avoid migration conflicts with the products team.
  @Column({ type: "uuid" })
  product_id: string;

  // ── Quantity ───────────────────────────────────────────────────────
  @Column({ type: "int", default: 1 })
  quantity: number;

  // ── Timestamps ─────────────────────────────────────────────────────
  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
