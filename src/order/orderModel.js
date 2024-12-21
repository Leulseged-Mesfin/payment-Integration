import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        productName: { type: String, required: true },
        productPrice: { type: Number, required: true },
        txRef: {
            type: String,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "completed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);