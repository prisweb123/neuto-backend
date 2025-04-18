const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const packageRoutes = require('./routes/packageRoutes');
const optionPackageRoutes = require('./routes/optionPackageRoutes');
const priceOffer = require('./routes/priceOfferRoutes');

// Load environment variables
dotenv.config();

// Verify environment variables
console.log('Environment variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('MONGODB_URL:', process.env.MONGODB_URL ? 'Set' : 'Not set');

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables');
    process.exit(1);
}

// Initialize express app
const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://neuto-frontend-sumy.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware
app.use(express.json());

// Remove any trailing slashes from URLs
app.use((req, res, next) => {
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

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
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/packages', packageRoutes);
app.use('/option-packages', optionPackageRoutes);
app.use('/priceoffers', priceOffer);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
