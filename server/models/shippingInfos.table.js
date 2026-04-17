import db from "../database/db.js"; 
export const createShippingInfoTable = async () => {   
    try {     
        const query = `
                CREATE TABLE IF NOT EXISTS shipping_infos (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL,
                address VARCHAR(255) NOT NULL,
                city VARCHAR(255) NOT NULL,
                state VARCHAR(255) NOT NULL,
                zip VARCHAR(255) NOT NULL,
                country VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`;     
        await db.query(query);
        console.log("Shipping info table created successfully");
    } catch (error) {
            console.log("Error creating shipping info table", error);
            process.exit(1);
        }
}