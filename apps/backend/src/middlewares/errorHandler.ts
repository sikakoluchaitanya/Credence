import { ErrorRequestHandler } from "express";
import { HttpStatus } from "../config/http.config";
import { AppError } from "../shared/utils/AppError";


export const errorHandler: ErrorRequestHandler = (
    err,
    req,
    res,
    next
): any => {
    console.error(`error occured on path ${req.path}`, err);

    if(err instanceof SyntaxError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message:" Invalid JSON Format, check your request body",
            error: err?.message || "unknown error",
        })
    }

    if(err instanceof AppError) {
        return res.status(err.statusCode).json({ 
            message: err.message,
            errorcode: err.errorCode
        });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: err?.message || "unknown error",
    });
}