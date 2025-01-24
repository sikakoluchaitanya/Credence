import { HttpStatus, HttpStatusCode } from "../../config/http.config";
import { ErrorCode } from "../enums/error-code.enum";
import { AppError } from "./AppError";


export class NotFoundException extends AppError {
    constructor(message:string = "Resource not found", errorCode?: ErrorCode) {
        super(
            message,
            HttpStatus.NOT_FOUND,
            errorCode || ErrorCode.RESOURCE_NOT_FOUND
        )
    }
}

export class BadRequestException extends AppError {
    constructor(message:string = "bad request", errorCode?: ErrorCode) {
        super(
            message,
            HttpStatus.BAD_REQUEST,
            errorCode || ErrorCode.VALIDATION_ERROR
        )
    }
}

export class UnauthorizedException extends AppError {
    constructor(message:string = "Unauthorized", errorCode?: ErrorCode) {
        super(
            message,
            HttpStatus.UNAUTHORIZED,
            errorCode || ErrorCode.AUTH_UNAUTHORIZED_ACCESS
        )
    }
}

export class InternalServerException extends AppError {
    constructor(message:string ="Internal Server Error", errorCode?: ErrorCode) {
        super(
            message,
            HttpStatus.INTERNAL_SERVER_ERROR,
            errorCode || ErrorCode.INTERNAL_SERVER_ERROR
        )
    }
}

export class HttpException extends AppError {
    constructor(
        message:string = "Http Exception Error",
        statusCode: HttpStatusCode, 
        errorCode?: ErrorCode,
    ) {
        super(
            message,
            statusCode,
            errorCode
        )
    }
}