import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import authRoutes from "./routers/authRoutes.js";
import { globalLimiter } from "./utils/rateLimiter.js";

const app = express();

const { createTable } = await import("./utils/createTable.js");

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
);

app.use("/api", globalLimiter);
app.use("/api/v1/auth", authRoutes);

createTable();

app.use(errorMiddleware);

export default app;
