const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const packageRoutes = require('./routes/packageRoutes');
const optionPackageRoutes = require('./routes/optionPackageRoutes');
const priceOffer =  require('./routes/priceOfferRoutes')

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// CORS configuration
// app.use(cors({
//   origin: ['http://localhost:3000', 'https://netauto-theta.vercel.app', 'https://merhebia.prisweb.no', ''],
//   credentials: true
// }));
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true); // Allow any origin
  },
  credentials: true
}));
// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(`${process.env.MONGODB_URL}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Nettauto API' });
});

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/option-packages', optionPackageRoutes);
app.use('/api/priceoffers', priceOffer);


// Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;
