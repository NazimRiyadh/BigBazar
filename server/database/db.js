import pkg from "pg";

const {Client} = pkg;

const db = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

try {
    await db.connect();
    console.log("Connected to the database");
} catch (error) {
    console.log("Error connecting to the database", error);
    process.exit(1);
}

export default db;