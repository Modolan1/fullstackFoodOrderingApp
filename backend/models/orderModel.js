import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        foodId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
)

const addressSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true },
    },
    { _id: false }
)

const orderSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        items: { type: [orderItemSchema], required: true },
        amount: { type: Number, required: true },
        address: { type: addressSchema, required: true },
        status: {
            type: String,
            enum: ["Food Processing", "Out for Delivery", "Delivered"],
            default: "Food Processing",
        },
        payment: { type: Boolean, default: false },
        paymentMethod: { type: String, default: "Cash On Delivery" },
        stripeSessionId: { type: String, default: "" },
        stripePaymentIntentId: { type: String, default: "" },
    },
    { timestamps: true }
)

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema)

export default orderModel;