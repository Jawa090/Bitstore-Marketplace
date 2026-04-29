import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { Cart } from "./Cart";
import { Product } from "./Product";

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

  // ── Product ────────────────────────────────────────────────────────
  @Column({ type: "uuid" })
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product;

  // ── Quantity ───────────────────────────────────────────────────────
  @Column({ type: "int", default: 1 })
  quantity: number;

  // ── Timestamps ─────────────────────────────────────────────────────
  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
