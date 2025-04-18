const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// Create new product
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, model, active } = req.body;

        // Check if product already exists
        const existingProduct = await Product.findOne({ name, model });
        if (existingProduct) {
            return res.status(400).json({ message: 'Product with this name already exists' });
        }

        const product = await Product.create({
            name,
            model,
            active
        });

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating product', error: err.message });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ name: 1, model: 1 });
        res.json({ success: true, count: products.length, data: products });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products', error: err.message });
    }
});


// Get all products
router.get('/get-all', async (req, res) => {
    try {
        const products = await Product.find({ active: true }).sort({ name: 1, model: 1 });
        res.json({ success: true, count: products.length, data: products });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products', error: err.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product', error: err.message });
    }
});

// Update product
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, model, active } = req.body;
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if name is being changed and if it already exists
        if (name && name !== product.name) {
            const nameExists = await Product.findOne({ name });
            if (nameExists) {
                return res.status(400).json({ message: 'Product name already exists' });
            }
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, model, active },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (err) {
        res.status(500).json({ message: 'Error updating product', error: err.message });
    }
});

// Delete product
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await product.deleteOne();
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product', error: err.message });
    }
});

// Toggle product active status
router.patch('/:id/toggle-active', protect, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.active = !product.active;
        await product.save();

        res.json({
            success: true,
            message: `Product ${product.active ? 'activated' : 'deactivated'} successfully`,
            data: product
        });
    } catch (err) {
        res.status(500).json({ message: 'Error toggling product status', error: err.message });
    }
});

module.exports = router;