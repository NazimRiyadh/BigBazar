/**
 * Admin Seed Utility for BigBazar
 * 
 * Usage: node server/utils/seedAdmin.js
 * 
 * Creates an admin user or promotes an existing user to admin role.
 * Default credentials: admin@bigbazar.com / Admin@123
 */

import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "..", "config", "config.env") });

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD),
  port: parseInt(process.env.DB_PORT),
});

const ADMIN_NAME = "BigBazar Admin";
const ADMIN_EMAIL = "admin@bigbazar.com";
const ADMIN_PASSWORD = "Admin@123";

const seedAdmin = async () => {
  try {
    console.log("🔧 BigBazar Admin Seeder\n");

    // Check if admin user already exists
    const existing = await pool.query(
      `SELECT id, name, email, role FROM users WHERE email = $1`,
      [ADMIN_EMAIL]
    );

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      if (user.role === "admin") {
        console.log(`✅ Admin user already exists:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Name:  ${user.name}`);
        console.log(`   Role:  ${user.role}`);
      } else {
        // Promote to admin
        await pool.query(
          `UPDATE users SET role = 'admin' WHERE email = $1`,
          [ADMIN_EMAIL]
        );
        console.log(`✅ Existing user promoted to admin:`);
        console.log(`   Email: ${user.email}`);
      }
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const result = await pool.query(
        `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'admin') RETURNING id, name, email, role`,
        [ADMIN_NAME, ADMIN_EMAIL, hashedPassword]
      );
      const admin = result.rows[0];
      console.log(`✅ Admin user created successfully:`);
      console.log(`   Email:    ${admin.email}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   Role:     ${admin.role}`);
    }

    console.log(`\n🔑 Login at: ${process.env.FRONTEND_URL}/login`);
    console.log(`   Then navigate to: /admin\n`);
  } catch (error) {
    console.error("❌ Failed to seed admin:", error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
};

seedAdmin();
