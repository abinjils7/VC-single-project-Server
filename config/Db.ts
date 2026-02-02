import mongoose from "mongoose";

const connectDB = async () => {
  console.log('mongod')
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(" MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
export default connectDB;
