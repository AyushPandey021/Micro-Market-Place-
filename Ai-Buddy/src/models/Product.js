import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    priceAmount: {
        type: Number,
        required: true,
    },
    priceCurrency: {
        type: String,
        default: 'INR',
    },
    images: [{
        type: String,
    }],
    stock: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

export default mongoose.model('Product', productSchema);

