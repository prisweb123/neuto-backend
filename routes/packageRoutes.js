const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Package = require('../models/Package');
const { protect, authorize } = require('../middleware/auth');

const upload = multer();

// Helper function to parse date from DD.MM.YYYY format
const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('.');
    return new Date(year, month - 1, day);
};

// Create new package
router.post('/', protect, authorize('admin'), upload.none(), async (req, res) => {
    try {
        // Parse markeModels from the request body
        const markeModels = Array.isArray(req.body.markeModels) 
            ? req.body.markeModels 
            : req.body.marke && req.body.model 
                ? [{ marke: req.body.marke, model: req.body.model }] 
                : [];

        const packageData = {
            ...req.body,
            markeModels,
            endDate: parseDate(req.body.endDate)
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
        const packages = await Package.find({}, '-image');
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
router.put('/:id', protect, authorize('admin'), upload.none(), async (req, res) => {
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
            markeModels,
            endDate: parseDate(req.body.endDate)
        };

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