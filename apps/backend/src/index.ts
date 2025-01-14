import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from './config/app.config';
import { errorHandler } from "./middlewares/errorHandler";
import { HttpStatus } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: config.APP_ORIGIN,
        credentials: true
    })
)

app.use(cookieParser());

app.get("/", 
    asyncHandler(async (req: Request, res: Response, next: NextFunction ) => {
        res.status(HttpStatus.OK).json({
            message: "Hello World",
        });
    })
)

app.use(errorHandler);

app.listen(config.PORT, async () => {
    console.log(`Server listening on port ${config.PORT} in development mode`);
})