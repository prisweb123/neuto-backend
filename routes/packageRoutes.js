const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Package = require('../models/Package');
const { protect, authorize } = require('../middleware/auth');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image file (jpg, jpeg, or png)'));
        }
        cb(null, true);
    }
});

// Helper function to convert buffer to base64
const bufferToBase64 = (buffer, mimetype) => {
    return `data:${mimetype};base64,${buffer.toString('base64')}`;
};

// Create new package
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image' });
        }

        const base64Image = bufferToBase64(req.file.buffer, req.file.mimetype);

        // Parse markeModels from the request body
        const markeModels = Array.isArray(req.body.markeModels) 
            ? req.body.markeModels 
            : req.body.marke && req.body.model 
                ? [{ marke: req.body.marke, model: req.body.model }] 
                : [];

        const packageData = {
            ...req.body,
            markeModels,
            image: base64Image
        };

        const package = await Package.create(packageData);

        res.status(201).json({
            success: true,
            data: package
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating package', error: err.message });
    }
});

// Get all packages
router.get('/', async (req, res) => {
    try {
        const packages = await Package.find();
        res.json({ success: true, count: packages.length, data: packages });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching packages', error: err.message });
    }
});

// Get single package
router.get('/:id', async (req, res) => {
    try {
        const package = await Package.findById(req.params.id);
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }
        res.json({
            success: true,
            message: '',
            data: package
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching package', error: err.message });
    }
});

// Update package
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
    try {
        let package = await Package.findById(req.params.id);
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Parse markeModels from the request body
        const markeModels = Array.isArray(req.body.markeModels) 
            ? req.body.markeModels 
            : req.body.marke && req.body.model 
                ? [{ marke: req.body.marke, model: req.body.model }] 
                : [];

        let packageData = {
            ...req.body,
            markeModels
        };

        if (req.file) {
            const base64Image = bufferToBase64(req.file.buffer, req.file.mimetype);
            packageData.image = base64Image;
        }

        package = await Package.findByIdAndUpdate(
            req.params.id,
            packageData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Package updated successfully',
            data: package
        });
    } catch (err) {
        res.status(500).json({ message: 'Vennligst prøv igjen', error: err.message });
    }
});

// Delete package
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const package = await Package.findById(req.params.id);
        if (!package) {
            return res.status(404).json({ message: 'Package not found' });
        }

        await package.deleteOne();
        res.json({ success: true, message: 'Varen/Tjenesten er slettet!' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting package', error: err.message });
    }
});

module.exports = router;