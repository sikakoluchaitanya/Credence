import mongoose from "mongoose";
import { config } from "../../config/app.config";

const connectdb = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("Database connected");
    } catch (error) {
        console.log(error);
    }
};

export default connectdb;