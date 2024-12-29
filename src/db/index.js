// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";

// const connectDB = async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);
//         console.log(`Connected to mongoDB !! DB host ${connectionInstance.connection.host}`);
//     } catch (error) {
//         console.log("Mongodb connection error", error);
//         process.exit(1);
//     }
// }
// export default connectDB;

import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

// Load environment variables from .env file
dotenv.config();

const connectDB = async () => {
    try {
        // Ensure correct URI construction
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to MongoDB! DB host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

export default connectDB;
