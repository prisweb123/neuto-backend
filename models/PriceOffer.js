const mongoose = require('mongoose');

const priceOfferSchema = new mongoose.Schema({
    offerNo: {
        type: Number,
        unique: true
    },
    selectedPackage: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    marke: {
        type: String,
        required: [true, 'Please add a marke'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Please add a model'],
        trim: true
    },
    info: {
        type: String,
        default: '',
        trim: true
    },
    addedOptionPackages: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    manualProducts: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    discount: {
        type: String,
        default: 0,
        trim: true
    },
    terms: {
        type: String,
        default: '',
        trim: true
    },
    validDays: {
        type: String,
        default: '1',
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please add a user']
    }
}, {
    timestamps: true
});

priceOfferSchema.pre('save', async function(next) {
    if (!this.offerNo) {
        const lastOffer = await this.constructor.findOne({}, {}, { sort: { 'offerNo': -1 } });
        this.offerNo = lastOffer ? lastOffer.offerNo + 1 : 1;
    }
    next();
});

module.exports = mongoose.model('PriceOffer', priceOfferSchema);