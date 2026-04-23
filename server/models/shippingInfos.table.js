import db from "../database/db.js"; 
export const createShippingInfoTable = async () => {   
    try {     
        const query = `
                CREATE TABLE IF NOT EXISTS shipping_infos (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                order_id UUID NOT NULL UNIQUE,
                full_name VARCHAR(255) NOT NULL,
                address VARCHAR(255) NOT NULL,
                city VARCHAR(255) NOT NULL,
                state VARCHAR(255) NOT NULL,
                pincode VARCHAR(20) NOT NULL,
                country VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            )`;     
        await db.query(query);
        console.log("Shipping info table created successfully");
    } catch (error) {
            console.log("Error creating shipping info table", error);
            process.exit(1);
        }
}