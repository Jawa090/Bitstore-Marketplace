import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from "typeorm";
import { User } from "./User";
import { UserRole as UserRoleEnum } from "../utils/constants";

@Entity("user_roles")
@Unique(["user_id", "role"]) // A user can't have the same role twice
export class UserRoleEntity {
  // ── Primary Key ─────────────────────────────────────────────────
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ── Foreign Key to User ─────────────────────────────────────────
  @Index()
  @Column({ type: "uuid" })
  user_id: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  // ── Role ────────────────────────────────────────────────────────
  @Column({
    type: "enum",
    enum: UserRoleEnum,
    default: UserRoleEnum.CUSTOMER,
  })
  role: UserRoleEnum;

  // ── Timestamp ───────────────────────────────────────────────────
  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
