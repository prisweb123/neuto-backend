const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const PriceOffer = require('../models/PriceOffer');

// @desc    Create new price offer
// @route   POST /api/priceoffers
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const priceOffer = await PriceOffer.create({
            ...req.body,
            createdBy: req.user.id
        });

        res.status(201).json({ ...priceOffer._doc, createdBy: { username: req.user.name } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc    Get all price offers
// @route   GET /api/priceoffers
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const priceOffers = await PriceOffer.find({})
            .sort({ createdAt: -1 })
            .populate({
                path: 'createdBy',
                select: 'name email',
                transform: doc => ({
                    ...doc._doc,
                    username: doc.name,
                    name: undefined
                })
            })
            .populate('selectedPackage');

        res.json(priceOffers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get single price offer
// @route   GET /api/priceoffers/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const priceOffer = await PriceOffer.findById(req.params.id)
            .populate({
                path: 'createdBy',
                select: 'name email',
                transform: doc => ({
                    ...doc._doc,
                    username: doc.name,
                    name: undefined
                })
            })
            .populate('selectedPackage');

        if (!priceOffer) {
            return res.status(404).json({ message: 'Price offer not found' });
        }

        res.json(priceOffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete price offer
// @route   DELETE /api/priceoffers/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const priceOffer = await PriceOffer.findById(req.params.id);

        if (!priceOffer) {
            return res.status(404).json({ message: 'Price offer not found' });
        }

        await priceOffer.deleteOne();

        res.json({ message: 'Price offer removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;