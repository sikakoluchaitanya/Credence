import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from './config/app.config';
import { errorHandler } from "./middlewares/errorHandler";
import { HttpStatus } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler";
import authRoutes from "./modules/auth/auth.routes";
import connectdb from "./database/database";
import passport from "./middlewares/passport";
import { authenticateJWT } from "./shared/strats/jwt.strategy";
import sessionRoutes from "./modules/sessions/session.routes";
import mfaRoutes from "./modules/mfa/mfa.routes";


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
app.use(passport.initialize());

app.get("/", 
    asyncHandler(async (req: Request, res: Response, next: NextFunction ) => {
        res.status(HttpStatus.OK).json({
            message: "Hello World",
        });
    })
)

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/mfa`, mfaRoutes)
app.use(`${BASE_PATH}/session`, authenticateJWT, sessionRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
    console.log(`Server listening on port ${config.PORT} in development mode`);
    await connectdb();
})