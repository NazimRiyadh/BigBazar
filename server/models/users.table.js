import db from "../database/db.js";

export const createUserTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
            name VARCHAR(255) NOT NULL CHECK(char_length(name) >= 3),
            email VARCHAR(255) NOT NULL UNIQUE,
            password TEXT NOT NULL CHECK(char_length(password) >= 8),
            role VARCHAR(255) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
            avatar JSONB DEFAULT NULL,
            reset_password_token TEXT DEFAULT NULL,
            reset_password_expires TIMESTAMP DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `
        await db.query(query)
        console.log("User table created successfully");
    } catch (error) {
        console.log("Error creating user table", error);
        process.exit(1);
    }
}