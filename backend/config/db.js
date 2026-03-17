import mongoose from "mongoose";

 export const connectDB = async() =>{
    const mongoUri = String(process.env.MONGODB_URI || 'mongodb+srv://modolan:12345678a@cluster0.avbn0r1.mongodb.net/food-delivery').trim()
    await mongoose.connect(mongoUri).then( ()=>console.log("DB connected" ))
}