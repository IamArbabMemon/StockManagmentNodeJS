import express from 'express';

import cors from 'cors'
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandling.middleware.js';
import { router as userRouter } from './routes/users.routes.js';
import { router as authRouter } from './routes/auth.routes.js';
import { router as stockRouter } from '../src/routes/stocks.routes.js'
import { router as salesRecordRouter } from './routes/salesRecord.routes.js';
import { router as faultyRouter } from "./routes/faulty.routes.js"
import { router as reserveRouter } from "./routes/reserve.routes.js"
import{ router as closingRouter } from "./routes/closing.routes.js" 
const app = express();


app.use(express.json());

// note :    if this code does not work try this 
//          origin: "http://localhost:3000", // Change this to your frontend URL


app.use(cors({ origin: true, credentials: true }));


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/stocks', stockRouter);
app.use('/api/salesRecords', salesRecordRouter);
app.use('/api/faulty', faultyRouter);
app.use('/api/reserve', reserveRouter);
app.use('/api/closing', closingRouter);



app.get('/get', (req, res) => {
    console.log("hitting get token");

    return res.status(200).json({ message: "giving you access" });

});



app.use(errorHandler);


export { app }

// const whitelist = ['http://localhost:3000', 'https://3bb2-137-59-221-159.ngrok-free.app/login','https://3bb2-137-59-221-159.ngrok-free.app']; // Add your frontend URLs here

// // Configure CORS options
// const corsOptions = {
//   origin: function (origin, callback) {
//     // Check if the incoming request's origin is in the whitelist
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       // Allow requests with no `origin` (like mobile apps or Postman)
//       callback(null, true); // Allow access
//     } else {
//       callback(new Error('Not allowed by CORS')); // Reject access
//     }
//   },
//   credentials: true, // Allow credentials (cookies, authorization headers, etc.)
// };

//app.use(cors());

