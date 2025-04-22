const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a package name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        trim: true
    },
    markeModels: [{
        marke: {
            type: String,
            required: [true, 'Please add a marke'],
            trim: true
        },
        model: {
            type: String,
            required: [true, 'Please add a model'],
            trim: true
        }
    }],
    discount: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    endDate: {
        type: Date,
        default: new Date()
    },
    include: {
        type: [String],
        required: [true, 'Please add package inclusions']
    },
    info: {
        type: String,
        required: [true, 'Please add package information'],
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Package', packageSchema);