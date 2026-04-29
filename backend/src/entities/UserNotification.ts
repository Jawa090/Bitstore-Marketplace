import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";

@Entity("user_notifications")
export class UserNotification {
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
  type: string; // e.g. "order_update", "promotion", "system"

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text", nullable: true })
  message: string | null;

  @Column({ type: "boolean", default: false })
  is_read: boolean;

  // ── Timestamp ────────────────────────────────────────────────────
  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
