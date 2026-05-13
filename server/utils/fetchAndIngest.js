import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../config/config.env") });

const { default: db } = await import("../database/db.js");

// All categories the storefront supports
const categoriesToFetch = [
  "smartphones",
  "laptops",
  "mobile-accessories",
  "tablets",
  "mens-watches",
  "womens-watches",
  "sunglasses",
];

// Map DummyJSON categories → BigBazar unified categories
const categoryMap = {
  "smartphones": "Smartphones",
  "laptops": "Laptops",
  "mobile-accessories": "Accessories",
  "tablets": "Smartphones",
  "mens-watches": "Accessories",
  "womens-watches": "Accessories",
  "sunglasses": "Accessories",
};

const ingest = async () => {
  try {
    // 1. Get a user to assign as creator
    const userResult = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (userResult.rows.length === 0) {
      console.error("❌ No admin user found. Run: node server/utils/seedAdmin.js first.");
      process.exit(1);
    }
    const creatorId = userResult.rows[0].id;

    console.log("🚀 Starting Fetch & Ingest process...\n");

    let totalIngested = 0;
    let totalSkipped = 0;

    for (const category of categoriesToFetch) {
      console.log(`📦 Fetching category: ${category}...`);
      
      let products;
      try {
        const response = await axios.get(`https://dummyjson.com/products/category/${category}?limit=30`);
        products = response.data.products;
      } catch (err) {
        console.log(`   ⚠️  Failed to fetch ${category}: ${err.message}`);
        continue;
      }

      for (const p of products) {
        // Skip products with no images or broken thumbnails
        if (!p.images || p.images.length === 0) {
          console.log(`   ⏭️  Skipped (no images): ${p.title}`);
          totalSkipped++;
          continue;
        }

        // Filter out placeholder/broken images
        const validImages = p.images.filter(url => 
          url && !url.includes("placeholder") && url.startsWith("http")
        );

        if (validImages.length === 0) {
          console.log(`   ⏭️  Skipped (invalid images): ${p.title}`);
          totalSkipped++;
          continue;
        }

        // Check for duplicates
        const exists = await db.query(
          "SELECT id FROM products WHERE name = $1",
          [p.title]
        );
        if (exists.rows.length > 0) {
          console.log(`   ⏭️  Skipped (duplicate): ${p.title}`);
          totalSkipped++;
          continue;
        }

        // Map images to BigBazar format
        const formattedImages = validImages.map((url, index) => ({
          public_id: `${p.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${index}`,
          url: url
        }));

        const targetCategory = categoryMap[category] || "Accessories";

        await db.query(
          `INSERT INTO products (name, description, price, category, stock, images, ratings, created_by) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            p.title,
            p.description,
            p.price,
            targetCategory,
            p.stock || Math.floor(Math.random() * 50) + 5,
            JSON.stringify(formattedImages),
            p.rating ? Math.min(p.rating, 5) : 0,
            creatorId
          ]
        );
        console.log(`   ✅ Ingested: ${p.title} → ${targetCategory}`);
        totalIngested++;
      }
    }

    console.log(`\n🎉 Fetch & Ingest complete!`);
    console.log(`   ✅ Ingested: ${totalIngested} products`);
    console.log(`   ⏭️  Skipped: ${totalSkipped} products\n`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Fetch & Ingest failed:", err.message);
    process.exit(1);
  }
};

ingest();
