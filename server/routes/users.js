const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Get current user profile
router.get('/me', auth, async (req, res) => {
    res.send(req.user);
});

// Update current user profile
router.put('/me/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'phone', 'specialization', 'notificationPrefs'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'تحديثات غير صالحة!' });
    }

    try {
        // If email is being updated, check if it's already in use
        if (req.body.email && req.body.email !== req.user.email) {
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(400).send({ error: 'البريد الإلكتروني مستخدم بالفعل من قبل مستخدم آخر.' });
            }
        }

        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        console.error('Profile update error:', e);
        res.status(400).send({ error: 'فشل في تحديث بيانات الملف الشخصي.' });
    }
});

// Change password
router.put('/me/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).send({ error: 'يجب توفير كلمة المرور الحالية والجديدة.' });
        }

        const isMatch = await req.user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).send({ error: 'كلمة المرور الحالية غير صحيحة.' });
        }

        req.user.password = newPassword;
        await req.user.save();
        res.send({ message: 'تم تغيير كلمة المرور بنجاح.' });
    } catch (e) {
        console.error('Password change error:', e);
        res.status(400).send({ error: 'حدث خطأ أثناء تغيير كلمة المرور.' });
    }
});



// Get users by role
router.get('/role/:role', auth, async (req, res) => {
    try {
        const users = await User.find({ role: req.params.role }).select('-password');
        res.send(users);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get all users
router.get('/', auth, authorize('Admin'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.send(users);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Create a new user (Admin only)
router.post('/', auth, authorize('Admin'), async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send({ message: 'User created successfully', user });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Update user
router.put('/:id', auth, authorize('Admin'), async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'phone', 'specialization', 'role', 'password'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send();
        }

        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete user
router.delete('/:id', auth, authorize('Admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
