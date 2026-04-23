import db from "../database/db.js";
export const createProductsTable = async () => {
  try {
    const query = `
          CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),     
          name VARCHAR(255) NOT NULL,     
          description TEXT NOT NULL,     
          price DECIMAL(10,2) NOT NULL CHECK (price >= 0),     
          category VARCHAR(100) NOT NULL,    
          ratings DECIMAL(3,2) DEFAULT 0 CHECK (ratings BETWEEN 0 AND 5),     
          images JSONB DEFAULT '[]'::JSONB,     
          stock INT NOT NULL CHECK (stock >= 0),     
          created_by UUID NOT NULL,     
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,     
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE);`;
    await db.query(query);
  } catch (error) {
    console.log("Error creating products table", error);
    process.exit(1);
  }
};
