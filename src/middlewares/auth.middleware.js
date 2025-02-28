import jwt from 'jsonwebtoken';
import { ErrorResponse } from '../utils/errorResponse.js';
import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
})

const checkAuthentication = async (req, res, next) => {

    try {

        let token;

        token = req.cookies.token || req.headers['token'];
        console.log("TOKEN : ", token)


        // If no token is found in both places, throw an error
        if (!token) {
            throw new ErrorResponse('Not authenticated, token missing', 401);
        }

        const deocdedToken = jwt.decode(token);

        if (!deocdedToken)
            throw new ErrorResponse('Invalid Token', 401);

        const currentTime = Math.floor(Date.now() / 1000);
        if (deocdedToken.exp && deocdedToken.exp < currentTime) {
            throw new ErrorResponse('Token has expired', 401);
        }

        // Verify the token
        if (!process.env.JWT_SECRET) {
            throw new ErrorResponse('ENVIRONMENT VARIABLE NOT LOADED PROPERLY, JWT_SECRET_KEY is missing', 500);
        }

        const data = jwt.verify(token, process.env.JWT_SECRET);

        if (!data)
            throw new ErrorResponse('Authentication failed with jwt', 401);

        // Attach the decoded user data to the request object
        req.user = data;

        // Proceed to the next middleware or route handler
        next();

    } catch (err) {
        console.log(err.statusCode);
        next(err);
    }

}

export {
    checkAuthentication
}

