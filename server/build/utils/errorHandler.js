"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        // Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = ErrorHandler;
