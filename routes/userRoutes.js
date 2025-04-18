const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Register user
router.post('/register', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, email, mobile, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email or mobile number already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            mobile,
            password,
            role
        });

        res.status(201).json({
            success: true,
            message: 'Bruker registrert!',
            data: user
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating user', error: err.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Brukernavn/Passord er feil' });
        }

        if(!user.active){
            return res.status(401).json({ message: 'Has not Acces to login' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Brukernavn/Passord er feil' });
        }

        // Create token
        const token = user.getSignedJwtToken();

        res.json({
            success: true,
            message: 'Du er nå logget inn',
            token,
            role: user.role,
            name: user.name
        });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
});

// Get all users
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            message: 'Users fetched successfully',
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
});

// Get current logged in user
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            message: 'User profile fetched successfully',
            data: user
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user profile', error: err.message });
    }
});

// Update user
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, email, mobile, role, active } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only allow admin to update any user's profile
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this user' });
        }

        // Check if email/mobile is being changed and if it already exists
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        if (mobile && mobile !== user.mobile) {
            const mobileExists = await User.findOne({ mobile });
            if (mobileExists) {
                return res.status(400).json({ message: 'Mobile number already exists' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, mobile, role, active },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
});

// Delete user
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user', error: err.message });
    }
});

// Toggle user active status
router.patch('/:id/toggle-active', protect, authorize('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.active = !user.active;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.active ? 'activated' : 'deactivated'} successfully`,
            data: user
        });
    } catch (err) {
        res.status(500).json({ message: 'Error toggling user status', error: err.message });
    }
});

module.exports = router;