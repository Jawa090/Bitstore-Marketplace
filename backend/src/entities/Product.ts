import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { Vendor } from "./Vendor";
import { Category } from "./Category";
import { Brand } from "./Brand";
import { ProductImage } from "./ProductImage";

export enum ProductCondition {
  NEW = "new",
  USED_LIKE_NEW = "used_like_new",
  USED_GOOD = "used_good", 
  USED_FAIR = "used_fair",
  REFURBISHED = "refurbished",
}

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  vendor_id: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: "vendor_id" })
  vendor: Vendor;

  @Column({ type: "uuid", nullable: true })
  category_id: string | null;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: "category_id" })
  category: Category | null;

  @Column({ type: "uuid", nullable: true })
  brand_id: string | null;

  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: "brand_id" })
  brand: Brand | null;

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  original_price: number | null;

  @Column({
    type: "enum",
    enum: ProductCondition,
  })
  condition: ProductCondition;

  @Column({ type: "integer", default: 0 })
  stock_quantity: number;

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @Column({ type: "boolean", default: false })
  is_featured: boolean;

  // Phone Specifications
  @Column({ type: "varchar", length: 50, nullable: true })
  ram: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  storage: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  camera: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  battery: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  display_size: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  processor: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  os: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  color: string | null;

  @Column({ type: "integer", nullable: true })
  warranty_months: number | null;

  // SEO
  @Column({ type: "varchar", length: 255, nullable: true })
  meta_title: string | null;

  @Column({ type: "text", nullable: true })
  meta_description: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at: Date;
}