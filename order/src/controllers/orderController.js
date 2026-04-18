import { v4 as uuidv4 } from 'uuid';
import Order from '../models/order.model.js';
import { getCart, clearCart } from '../services/cartService.js';
import { checkInventory, updateInventory } from '../services/productService.js';
import { processPayment } from '../services/paymentService.js';
import { publishEvent } from '../services/rabbitmq.js';

export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { shippingAddress } = req.body;

        // Get cart items
        const cart = await getCart(userId);
        if (!cart.items || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Check inventory for all items
        const inventoryCheck = await checkInventory(cart.items);
        if (!inventoryCheck.available) {
            return res.status(400).json({
                success: false,
                message: 'Some items are out of stock',
                unavailableItems: inventoryCheck.unavailableItems
            });
        }

        // Update cart items with current prices and names
        const updatedItems = cart.items.map(item => {
            const productInfo = inventoryCheck.itemsWithPrices.find(p => p.productId === item.productId);
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: productInfo.price,
                name: productInfo.name
            };
        });

        // Calculate total amount
        const totalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Process payment (simplified)
        const paymentResult = await processPayment(totalAmount, req.user);
        if (!paymentResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Payment failed'
            });
        }

        // Create order
        const orderId = uuidv4();
        const order = new Order({
            orderId,
            userId,
            items: updatedItems,
            totalAmount,
            shippingAddress,
            paymentId: paymentResult.paymentId,
            status: 'pending'
        });

        await order.save();

        // Update inventory
        await updateInventory(cart.items, 'reserve');

        // Clear cart
        await clearCart(userId);

        // Publish order created event
        await publishEvent('order.created', {
            orderId,
            userId,
            items: updatedItems,
            totalAmount,
            shippingAddress
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: {
                orderId,
                totalAmount,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order'
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({ orderId: id, userId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order'
        });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments({ userId });

        res.json({
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders'
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await Order.findOne({ orderId: id, userId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled'
            });
        }

        order.status = 'cancelled';
        order.timeline.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: 'Order cancelled by user'
        });

        await order.save();

        // Release inventory
        await updateInventory(order.items, 'release');

        // Publish order cancelled event
        await publishEvent('order.cancelled', {
            orderId: id,
            userId,
            items: order.items
        });

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel order'
        });
    }
};

export const updateOrderAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { shippingAddress } = req.body;

        const order = await Order.findOne({ orderId: id, userId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Order address cannot be updated'
            });
        }

        order.shippingAddress = shippingAddress;
        order.timeline.push({
            status: 'address_updated',
            timestamp: new Date(),
            note: 'Shipping address updated'
        });

        await order.save();

        res.json({
            success: true,
            message: 'Order address updated successfully'
        });
    } catch (error) {
        console.error('Error updating order address:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order address'
        });
    }
};