import { createUserTable } from "../models/users.table.js";
import { createShippingInfoTable } from "../models/shippingInfos.table.js";
import { createProductsTable } from "../models/products.table.js";
import { createProductReviewsTable } from "../models/productReviews.table.js";
import { createPaymentsTable } from "../models/payments.table.js";
import { createOrderItemTable } from "../models/order_items.table.js";
import { createOrdersTable } from "../models/orders.table.js";

export const createTable=async()=>{
    try {
        await createUserTable()
        await createShippingInfoTable()
        await createProductsTable()
        await createProductReviewsTable()
        await createOrdersTable()
        await createOrderItemTable()
        await createPaymentsTable()
        console.log("All tables created succesfully")
    } catch (error) {
        console.log("Failed to create the tables", error)
    }
}