import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    name: {
        type: String,
        required: true
    }
});

const shippingAddressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    }
});

const timelineSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'address_updated'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    note: {
        type: String,
        default: ''
    }
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: shippingAddressSchema,
    timeline: [timelineSchema],
    taxes: {
        type: Number,
        default: 0
    },
    shipping: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Add initial timeline entry on creation
orderSchema.pre('save', async function () {
    if (this.isNew) {
        if (!this.timeline) this.timeline = [];
        this.timeline.push({
            status: this.status,
            timestamp: new Date(),
            note: 'Order created'
        });
    }
});

const Order = mongoose.model('Order', orderSchema);

export default Order;