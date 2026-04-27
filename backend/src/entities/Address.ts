import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Emirate } from "../utils/constants";

@Entity("addresses")
export class Address {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", length: 100 })
  type: string; // 'home', 'work', 'other'

  @Column({ type: "varchar", length: 255 })
  full_name: string;

  @Column({ type: "varchar", length: 20 })
  phone: string;

  @Column({ type: "text" })
  address_line_1: string;

  @Column({ type: "text", nullable: true })
  address_line_2: string | null;

  @Column({ type: "varchar", length: 100 })
  city: string;

  @Column({
    type: "enum",
    enum: Emirate,
  })
  emirate: Emirate;

  @Column({ type: "varchar", length: 10, nullable: true })
  postal_code: string | null;

  @Column({ type: "boolean", default: false })
  is_default: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}