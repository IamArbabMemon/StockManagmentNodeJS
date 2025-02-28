class ErrorResponse extends Error {
    constructor(errorMessage, statusCode, success) {
        super(errorMessage);
        this.statusCode = statusCode;
        this.success = success;
        Error.captureStackTrace(this, this.constructor);
    }
}

export {
    ErrorResponse
}