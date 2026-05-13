import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../config/config.env") });

const { default: db } = await import("../database/db.js");

// Remap legacy categories to the unified set
await db.query("UPDATE products SET category = 'Laptops' WHERE category = 'Laptop'");
await db.query("UPDATE products SET category = 'Smartphones' WHERE category = 'Phone'");
await db.query("DELETE FROM products WHERE category = 'Testing'");

const cats = await db.query("SELECT category, COUNT(*) as cnt FROM products GROUP BY category ORDER BY cnt DESC");
console.log("Final Category Distribution:");
cats.rows.forEach(r => console.log(`  ${r.category}: ${r.cnt} products`));

process.exit(0);
