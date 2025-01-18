import { ErrorRequestHandler, Response } from "express";
import { HttpStatus } from "../config/http.config";
import { AppError } from "../shared/utils/AppError";
import { z } from "zod";
import { clearAuthenticationCookies, REFRESH_PATH } from "../shared/utils/cookie";

const formatZodError = (res: Response, err: z.ZodError) => {
    const errors = err?.issues?.map((err) => ({
        field: err.path.join("."),
        message: err.message,
    }));

    return res.status(HttpStatus.BAD_REQUEST).json({
        message: "Validation Error",
        errors: errors,
    })
}

export const errorHandler: ErrorRequestHandler = (
    err,
    req,
    res,
    next
): any => {
    console.error(`error occured on path ${req.path}`, err);

    if(req.path === REFRESH_PATH) {
        clearAuthenticationCookies(res);
    }

    if(err instanceof SyntaxError) {
        return res.status(HttpStatus.BAD_REQUEST).json({
            message:" Invalid JSON Format, check your request body",
            error: err?.message || "unknown error",
        })
    }

    if(err instanceof z.ZodError) {
        return formatZodError(res, err);
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