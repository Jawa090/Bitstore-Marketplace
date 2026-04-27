import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "./Product";

@Entity("product_images")
export class ProductImage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  product_id: string;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column({ type: "text" })
  image_url: string;

  @Column({ type: "boolean", default: false })
  is_primary: boolean;

  @Column({ type: "integer", default: 0 })
  display_order: number;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;
}