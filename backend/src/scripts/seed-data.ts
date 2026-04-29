import { AppDataSource } from "../config/database";
import { Brand } from "../entities/Brand";
import { Category } from "../entities/Category";
import { Vendor, VendorStatus } from "../entities/Vendor";
import { Product } from "../entities/Product";
import { ProductImage } from "../entities/ProductImage";
import { Collection } from "../entities/Collection";
import { User } from "../entities/User";
import { UserRoleEntity } from "../entities/UserRole";
import { Emirate, UserRole, ProductCondition } from "../utils/constants";

export const seedSampleData = async () => {
  try {
    console.log("🌱 Starting to seed sample data...");

    // Create sample user for vendor
    const userRepo = AppDataSource.getRepository(User);
    const userRoleRepo = AppDataSource.getRepository(UserRoleEntity);
    
    let sampleUser = await userRepo.findOne({ where: { email: "vendor@bitstores.com" } });
    if (!sampleUser) {
      sampleUser = userRepo.create({
        email: "vendor@bitstores.com",
        full_name: "BitStores Vendor",
        phone: "+971501234567",
        emirate: Emirate.DUBAI,
        is_active: true,
        email_verified: true
      });
      await userRepo.save(sampleUser);

      // Add vendor role
      const vendorRole = userRoleRepo.create({
        user_id: sampleUser.id,
        role: UserRole.VENDOR
      });
      await userRoleRepo.save(vendorRole);
    }

    // Create admin user
    let adminUser = await userRepo.findOne({ where: { email: "admin@bitstores.com" } });
    if (!adminUser) {
      const { hashPassword } = await import("../utils/password");
      const hashedPassword = await hashPassword("Admin123456");
      
      adminUser = userRepo.create({
        email: "admin@bitstores.com",
        password_hash: hashedPassword,
        full_name: "BitStores Admin",
        phone: "+971501234568",
        emirate: Emirate.DUBAI,
        is_active: true,
        email_verified: true
      });
      await userRepo.save(adminUser);

      // Add admin role
      const adminRole = userRoleRepo.create({
        user_id: adminUser.id,
        role: UserRole.ADMIN
      });
      await userRoleRepo.save(adminRole);

      console.log("✅ Admin user created:");
      console.log("   Email: admin@bitstores.com");
      console.log("   Password: Admin123456");
    }

    // Create brands
    const brandRepo = AppDataSource.getRepository(Brand);
    const brands = [
      {
        name: "Apple",
        slug: "apple",
        description: "Premium technology products",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
        website_url: "https://apple.com",
        display_order: 1
      },
      {
        name: "Samsung",
        slug: "samsung",
        description: "Innovation for everyone",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
        website_url: "https://samsung.com",
        display_order: 2
      },
      {
        name: "Google",
        slug: "google",
        description: "Made by Google",
        logo_url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        website_url: "https://store.google.com",
        display_order: 3
      }
    ];

    const savedBrands = [];
    for (const brandData of brands) {
      let brand = await brandRepo.findOne({ where: { slug: brandData.slug } });
      if (!brand) {
        brand = brandRepo.create(brandData);
        await brandRepo.save(brand);
      }
      savedBrands.push(brand);
    }

    // Create categories
    const categoryRepo = AppDataSource.getRepository(Category);
    const categories = [
      {
        name: "Smartphones",
        slug: "smartphones",
        description: "Latest mobile phones and accessories",
        display_order: 1
      },
      {
        name: "Laptops",
        slug: "laptops", 
        description: "Powerful laptops for work and gaming",
        display_order: 2
      },
      {
        name: "Tablets",
        slug: "tablets",
        description: "Portable tablets and iPads",
        display_order: 3
      },
      {
        name: "Headphones",
        slug: "headphones",
        description: "Premium audio devices and earphones",
        display_order: 4
      },
      {
        name: "Smartwatches",
        slug: "smartwatches",
        description: "Fitness trackers and smart wearables",
        display_order: 5
      },
      {
        name: "Gaming",
        slug: "gaming",
        description: "Gaming consoles, accessories and peripherals",
        display_order: 6
      },
      {
        name: "Monitors",
        slug: "monitors",
        description: "Computer monitors and displays",
        display_order: 7
      },
      {
        name: "Cameras",
        slug: "cameras",
        description: "Digital cameras and photography equipment",
        display_order: 8
      },
      {
        name: "Speakers",
        slug: "speakers",
        description: "Bluetooth speakers and sound systems",
        display_order: 9
      },
      {
        name: "Networking",
        slug: "networking",
        description: "Routers, modems and network equipment",
        display_order: 10
      },
      {
        name: "Power & Charging",
        slug: "power-charging",
        description: "Power banks, chargers and cables",
        display_order: 11
      },
      {
        name: "Storage",
        slug: "storage",
        description: "External drives, SSDs and memory cards",
        display_order: 12
      },
      {
        name: "Computer Components",
        slug: "computer-components",
        description: "CPUs, GPUs, RAM and motherboards",
        display_order: 13
      },
      {
        name: "Accessories",
        slug: "accessories",
        description: "Phone cases, screen protectors and more",
        display_order: 14
      }
    ];

    const savedCategories = [];
    for (const categoryData of categories) {
      let category = await categoryRepo.findOne({ where: { slug: categoryData.slug } });
      if (!category) {
        category = categoryRepo.create(categoryData);
        await categoryRepo.save(category);
      }
      savedCategories.push(category);
    }

    // Create vendor
    const vendorRepo = AppDataSource.getRepository(Vendor);
    let vendor = await vendorRepo.findOne({ where: { user_id: sampleUser.id } });
    if (!vendor) {
      vendor = vendorRepo.create({
        user_id: sampleUser.id,
        store_name: "BitStores Official",
        store_slug: "bitstores-official",
        description: "Official BitStores marketplace",
        emirate: "Dubai",
        is_bitstores: true,
        is_verified: true,
        verification_status: VendorStatus.VERIFIED,
        commission_rate: 0
      });
      await vendorRepo.save(vendor);
    }

    // Create products
    const productRepo = AppDataSource.getRepository(Product);
    const productImageRepo = AppDataSource.getRepository(ProductImage);
    
    const products = [
      {
        name: "iPhone 16 Pro Max 256GB",
        slug: "iphone-16-pro-max-256gb",
        description: "The most advanced iPhone ever with titanium design and A18 Pro chip",
        price: 4899,
        original_price: 5299,
        condition: ProductCondition.NEW,
        stock_quantity: 25,
        brand: savedBrands[0], // Apple
        category: savedCategories[0], // Smartphones
        ram: "8GB",
        storage: "256GB",
        camera: "48MP Pro Camera System",
        battery: "4441mAh",
        display_size: "6.9 inch",
        processor: "A18 Pro",
        os: "iOS 18",
        color: "Natural Titanium",
        warranty_months: 12,
        images: [
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop&sat=-100"
        ]
      },
      {
        name: "Samsung Galaxy S24 Ultra 512GB",
        slug: "samsung-galaxy-s24-ultra-512gb",
        description: "Ultimate Galaxy experience with S Pen and AI features",
        price: 4199,
        original_price: 4699,
        condition: ProductCondition.NEW,
        stock_quantity: 18,
        brand: savedBrands[1], // Samsung
        category: savedCategories[0], // Smartphones
        ram: "12GB",
        storage: "512GB", 
        camera: "200MP Quad Camera",
        battery: "5000mAh",
        display_size: "6.8 inch",
        processor: "Snapdragon 8 Gen 3",
        os: "Android 14",
        color: "Titanium Black",
        warranty_months: 12,
        images: [
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=800&fit=crop"
        ]
      },
      {
        name: "Google Pixel 9 Pro 256GB",
        slug: "google-pixel-9-pro-256gb",
        description: "AI-powered photography and pure Android experience",
        price: 3299,
        condition: ProductCondition.NEW,
        stock_quantity: 12,
        brand: savedBrands[2], // Google
        category: savedCategories[0], // Smartphones
        ram: "16GB",
        storage: "256GB",
        camera: "50MP Triple Camera",
        battery: "5050mAh",
        display_size: "6.3 inch",
        processor: "Google Tensor G4",
        os: "Android 14",
        color: "Obsidian",
        warranty_months: 12,
        images: [
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=800&fit=crop"
        ]
      },
      {
        name: "MacBook Pro 14-inch M4",
        slug: "macbook-pro-14-m4",
        description: "Supercharged for pros with M4 chip",
        price: 7999,
        condition: ProductCondition.NEW,
        stock_quantity: 8,
        brand: savedBrands[0], // Apple
        category: savedCategories[1], // Laptops
        ram: "16GB",
        storage: "512GB SSD",
        display_size: "14.2 inch",
        processor: "Apple M4",
        os: "macOS Sequoia",
        color: "Space Black",
        warranty_months: 12,
        images: [
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=800&fit=crop"
        ]
      },
      {
        name: "iPad Pro 12.9-inch M4",
        slug: "ipad-pro-12-9-m4",
        description: "Ultimate iPad experience with M4 chip",
        price: 4599,
        condition: ProductCondition.NEW,
        stock_quantity: 15,
        brand: savedBrands[0], // Apple
        category: savedCategories[2], // Tablets
        ram: "8GB",
        storage: "256GB",
        display_size: "12.9 inch",
        processor: "Apple M4",
        os: "iPadOS 18",
        color: "Space Gray",
        warranty_months: 12,
        images: [
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop"
        ]
      }
    ];

    for (const productData of products) {
      let product = await productRepo.findOne({ where: { slug: productData.slug } });
      if (!product) {
        const { images, ...productInfo } = productData;
        product = productRepo.create({
          ...productInfo,
          vendor_id: vendor.id,
          category_id: productData.category.id,
          brand_id: productData.brand.id
        });
        await productRepo.save(product);

        // Add product images
        for (let i = 0; i < images.length; i++) {
          const productImage = productImageRepo.create({
            product_id: product.id,
            image_url: images[i],
            is_primary: i === 0,
            display_order: i
          });
          await productImageRepo.save(productImage);
        }
      }
    }

    // Create collections
    const collectionRepo = AppDataSource.getRepository(Collection);
    
    const collections = [
      {
        name: "Best Sellers",
        slug: "best-sellers",
        description: "Our most popular products loved by customers",
        banner_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop",
        display_order: 1
      },
      {
        name: "New Arrivals",
        slug: "new-arrivals",
        description: "Latest products just added to our store",
        banner_url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=400&fit=crop",
        display_order: 2
      },
      {
        name: "Summer Sale",
        slug: "summer-sale",
        description: "Hot deals for the summer season",
        banner_url: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&h=400&fit=crop",
        display_order: 3
      },
      {
        name: "Premium Picks",
        slug: "premium-picks",
        description: "Handpicked premium products for tech enthusiasts",
        banner_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=400&fit=crop",
        display_order: 4
      }
    ];

    const savedCollections = [];
    for (const collectionData of collections) {
      let collection = await collectionRepo.findOne({ where: { slug: collectionData.slug } });
      if (!collection) {
        collection = collectionRepo.create(collectionData);
        await collectionRepo.save(collection);
      }
      savedCollections.push(collection);
    }

    // Add products to collections
    // Get all products
    const allProducts = await productRepo.find({ take: 5 });
    
    if (allProducts.length > 0 && savedCollections.length > 0) {
      // Best Sellers - Add first 3 products
      if (savedCollections[0] && allProducts.length >= 3) {
        savedCollections[0].products = [allProducts[0], allProducts[1], allProducts[2]];
        await collectionRepo.save(savedCollections[0]);
      }

      // New Arrivals - Add last 3 products
      if (savedCollections[1] && allProducts.length >= 3) {
        savedCollections[1].products = [allProducts[2], allProducts[3], allProducts[4]];
        await collectionRepo.save(savedCollections[1]);
      }

      // Summer Sale - Add products with discounts
      if (savedCollections[2] && allProducts.length >= 2) {
        savedCollections[2].products = [allProducts[0], allProducts[1]];
        await collectionRepo.save(savedCollections[2]);
      }

      // Premium Picks - Add Apple products
      if (savedCollections[3] && allProducts.length >= 3) {
        savedCollections[3].products = [allProducts[0], allProducts[3], allProducts[4]];
        await collectionRepo.save(savedCollections[3]);
      }
    }

    console.log("✅ Sample data seeded successfully!");
    console.log(`📊 Created: ${savedBrands.length} brands, ${savedCategories.length} categories, ${products.length} products, ${savedCollections.length} collections`);
    
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
};