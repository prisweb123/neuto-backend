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

        res.status(201).json({
            success: true,
            data: { ...priceOffer._doc, createdBy: { username: req.user.name } },
            message: 'Price offer created successfully'
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            data: null,
            message: error.message 
        });
    }
});

// @desc    Get all price offers
// @route   GET /api/priceoffers
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        console.log('Starting to fetch price offers...');
        
        const priceOffers = await PriceOffer.find({})
            .sort({ createdAt: -1 })
            .populate({
                path: 'createdBy',
                select: 'name email',
                transform: doc => {
                    console.log('Transform function called with doc:', doc);
                    if (!doc) {
                        console.log('Document is null, returning null');
                        return null;
                    }
                    if (!doc._doc) {
                        console.log('Document._doc is null, returning basic doc');
                        return {
                            id: doc._id,
                            username: doc.name || 'Unknown User',
                            email: doc.email || ''
                        };
                    }
                    console.log('Transforming document:', doc._doc);
                    return {
                        ...doc._doc,
                        username: doc.name,
                        name: undefined
                    };
                }
            })
            .populate('selectedPackage');

        console.log('Price offers fetched:', priceOffers);

        res.json({
            success: true,
            data: priceOffers,
            message: 'Price offers fetched successfully'
        });
    } catch (error) {
        console.error('Error in GET /priceoffers:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false,
            data: null,
            message: error.message 
        });
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
                transform: doc => {
                    if (!doc) return null;
                    return {
                        ...doc._doc,
                        username: doc.name,
                        name: undefined
                    };
                }
            })
            .populate('selectedPackage');

        if (!priceOffer) {
            return res.status(404).json({ 
                success: false,
                data: null,
                message: 'Price offer not found' 
            });
        }

        res.json({
            success: true,
            data: priceOffer,
            message: 'Price offer fetched successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            data: null,
            message: error.message 
        });
    }
});

// @desc    Delete price offer
// @route   DELETE /api/priceoffers/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const priceOffer = await PriceOffer.findById(req.params.id);

        if (!priceOffer) {
            return res.status(404).json({ 
                success: false,
                data: null,
                message: 'Price offer not found' 
            });
        }

        await priceOffer.deleteOne();

        res.json({ 
            success: true,
            data: null,
            message: 'Price offer removed successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            data: null,
            message: error.message 
        });
    }
});

module.exports = router;