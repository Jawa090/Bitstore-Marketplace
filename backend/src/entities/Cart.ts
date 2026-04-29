import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { User } from "./User";
import { CartItem } from "./CartItem";

@Entity("carts")
export class Cart {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ── Owner (one cart per user) ──────────────────────────────────────
  @Column({ type: "uuid", unique: true })
  user_id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  // ── Items ──────────────────────────────────────────────────────────
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true, eager: true })
  items: CartItem[];

  // ── Timestamps ─────────────────────────────────────────────────────
  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}
