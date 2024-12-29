import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.static("public"))

app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the API"
    });
});
// route import 
import userRouter from './routes/user.route.js';
import documentRoutes from './routes/document.routes.js';
import roomRoutes from './routes/room.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import housekeepingRoutes from './routes/housekeeping.routes.js';

// pats

app.use("/api/v1/users", userRouter)

app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/room', roomRoutes);
app.use('/api/v1/book', bookingRoutes);
app.use('/api/v1/housekeping', housekeepingRoutes);



export { app }