const express = require('express');
const router = express.Router();
const OptionPackage = require('../models/OptionPackage');
const { protect, authorize } = require('../middleware/auth');

// Create new option package
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, info, options } = req.body;

        // Parse markeModels from the request body
        const markeModels = Array.isArray(req.body.markeModels) 
            ? req.body.markeModels 
            : req.body.marke && req.body.model 
                ? [{ marke: req.body.marke, model: req.body.model }] 
                : [];

        // Check if option package already exists
        const existingPackage = await OptionPackage.findOne({ name });
        if (existingPackage) {
            return res.status(400).json({ message: 'Option package with this name already exists for this model' });
        }

        const optionPackage = await OptionPackage.create({
            name,
            markeModels,
            info,
            options
        });

        res.status(201).json({
            success: true,
            data: optionPackage
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating option package', error: err.message });
    }
});

// Get all option packages
router.get('/', async (req, res) => {
    try {
        const optionPackages = await OptionPackage.find();
        res.json({ success: true, count: optionPackages.length, data: optionPackages });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching option packages', error: err.message });
    }
});

// Get single option package
router.get('/:id', async (req, res) => {
    try {
        const optionPackage = await OptionPackage.findById(req.params.id);
        if (!optionPackage) {
            return res.status(404).json({ message: 'Option package not found' });
        }
        res.json({
            success: true,
            data: optionPackage
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching option package', error: err.message });
    }
});

// Update option package
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, info, options } = req.body;
        let optionPackage = await OptionPackage.findById(req.params.id);

        if (!optionPackage) {
            return res.status(404).json({ message: 'Option package not found' });
        }

        // Parse markeModels from the request body
        const markeModels = Array.isArray(req.body.markeModels) 
            ? req.body.markeModels 
            : req.body.marke && req.body.model 
                ? [{ marke: req.body.marke, model: req.body.model }] 
                : [];

        // Check if name is being changed and if it already exists for any of the marke-model pairs
        if (name && name !== optionPackage.name) {
            const nameExists = await OptionPackage.findOne({ name });
            if (nameExists) {
                return res.status(400).json({ message: 'Option package name already exists for this model' });
            }
        }

        optionPackage = await OptionPackage.findByIdAndUpdate(
            req.params.id,
            { name, markeModels, info, options },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Option package updated successfully',
            data: optionPackage
        });
    } catch (err) {
        res.status(500).json({ message: 'Error updating option package', error: err.message });
    }
});

// Delete option package
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const optionPackage = await OptionPackage.findById(req.params.id);

        if (!optionPackage) {
            return res.status(404).json({ message: 'Option package not found' });
        }

        await optionPackage.deleteOne();
        res.json({ success: true, message: 'Option package deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting option package', error: err.message });
    }
});

module.exports = router;