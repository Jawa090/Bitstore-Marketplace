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

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // Who performed the action
  @Index()
  @Column({ type: "uuid", nullable: true })
  user_id: string | null;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "user_id" })
  user: User;

  // What action was performed
  @Index()
  @Column({ type: "varchar", length: 100 })
  action: string; // e.g., "DELETE_PRODUCT", "UPDATE_USER_ROLE", "CREATE_CATEGORY"

  // What entity was affected
  @Index()
  @Column({ type: "varchar", length: 50 })
  entity_type: string; // e.g., "product", "user", "category"

  @Column({ type: "uuid", nullable: true })
  entity_id: string | null;

  // Additional details (JSON)
  @Column({ type: "jsonb", nullable: true })
  details: Record<string, any> | null;

  // IP address for security tracking
  @Column({ type: "varchar", length: 45, nullable: true })
  ip_address: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}
