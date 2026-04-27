import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("brands")
export class Brand {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100, unique: true })
  name: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100, unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "text", nullable: true })
  logo_url: string | null;

  @Column({ type: "text", nullable: true })
  website_url: string | null;

  @Column({ type: "integer", default: 0 })
  display_order: number;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}