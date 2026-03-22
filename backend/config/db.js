import mongoose from "mongoose";

 export const connectDB = async() =>{
    const mongoUri = String(process.env.MONGODB_URI).trim()
    await mongoose.connect(mongoUri).then( ()=>console.log("DB connected" ))
}
