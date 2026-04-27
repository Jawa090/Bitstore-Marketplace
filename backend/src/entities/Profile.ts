import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Emirate } from "../utils/constants";

@Entity("profiles")
export class Profile {
  // ── Primary Key ─────────────────────────────────────────────────
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ── Foreign Key to User (one-to-one) ────────────────────────────
  @Index({ unique: true })
  @Column({ type: "uuid", unique: true })
  user_id: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  // ── Profile Fields ──────────────────────────────────────────────
  @Column({ type: "varchar", length: 255, nullable: true })
  display_name: string | null;

  @Column({ type: "text", nullable: true })
  bio: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string | null;

  @Column({
    type: "enum",
    enum: Emirate,
    nullable: true,
  })
  emirate: Emirate | null;

  @Column({ type: "text", nullable: true })
  avatar_url: string | null;

  // ── Preferences ─────────────────────────────────────────────────
  @Column({ type: "varchar", length: 5, default: "en" })
  preferred_language: string;

  @Column({ type: "varchar", length: 5, default: "AED" })
  preferred_currency: string;

  // ── Timestamp ───────────────────────────────────────────────────
  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
