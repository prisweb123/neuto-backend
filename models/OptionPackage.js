const mongoose = require('mongoose');

const optionPackageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a package name'],
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
    info: {
        type: String,
        required: [true, 'Please add package information'],
        trim: true
    },
    options: {
        type: [mongoose.Schema.Types.Mixed],
        required: [true, 'Please add package options'],
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('OptionPackage', optionPackageSchema);