import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from "typeorm";
import { Product } from "./Product";

@Entity("collections")
export class Collection {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, unique: true })
  name: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "text", nullable: true })
  banner_url: string | null;

  @Column({ type: "integer", default: 0 })
  display_order: number;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @ManyToMany(() => Product)
  @JoinTable({
    name: "collection_products",
    joinColumn: { name: "collection_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "product_id", referencedColumnName: "id" },
  })
  products: Product[];

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}
