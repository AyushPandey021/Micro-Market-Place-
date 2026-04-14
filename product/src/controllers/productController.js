import Product from '../models/product.model.js';
import imageKitService from '../services/imagekitservice.js';

export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency } = req.body;
        const seller = req.user?.id || req.body.seller;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Images are required'
            });
        }

        let images = [];
        try {
            const uploadPromises = req.files.map(file => imageKitService.uploadImage(file));
            const uploadResults = await Promise.all(uploadPromises);
            images = uploadResults.map(result => ({
                url: result.url,
                fileId: result.fileId,
                thumbnail: result.thumbnail
            }));
        } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload images'
            });
        }

        // Create new product
        const product = new Product({
            title,
            description,
            priceAmount,
            priceCurrency: priceCurrency || 'INR',
            seller,
            images
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
