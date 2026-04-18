import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    priceAmount: {
        type: Number,
        required: true
    },
    priceCurrency: {
        type: String,
        enum: ["INR", "EUR", "GBP"],
        default: "INR"
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    images: [
        {
            url: String,
            thumbnail: String,
            fileId: String
        }
    ],
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    created: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
const Product = mongoose.model("Product", productSchema);
export default Product;
