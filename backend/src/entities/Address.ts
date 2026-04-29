import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";

@Entity("addresses")
export class Address {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ── Foreign Key ─────────────────────────────────────────────────
  @Index()
  @Column({ type: "uuid" })
  user_id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  // ── Fields ──────────────────────────────────────────────────────
  @Column({ type: "varchar", length: 100 })
  label: string; // e.g. "Home", "Work", "Office"

  @Column({ type: "varchar", length: 100 })
  emirate: string;

  @Column({ type: "text" })
  address: string;

  @Column({ type: "text", nullable: true })
  landmark: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string | null;

  @Column({ type: "boolean", default: false })
  is_default: boolean;

  // ── Timestamps ──────────────────────────────────────────────────
  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}
