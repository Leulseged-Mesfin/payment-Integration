import mongoose from "mongoose";

const productSchema = mongoose.Schema(
    {
        name: String,
        price: Number,
        imageUrl: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Product", productSchema);