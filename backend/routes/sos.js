const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User'); // Import User model

// @route   POST api/sos
// @desc    A logged-in user sends an SOS alert with their location
// @access  Private
router.post('/', auth, async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ msg: 'Location data is required.' });
  }

  try {
    const newAlert = new SOSAlert({
      user: req.user.id,
      location: { latitude, longitude },
    });

    await newAlert.save();
    const io = req.app.get('io');
    if (io) {
      const populated = await newAlert.populate('user', ['name', 'email']);
      io.emit('sos:new', populated);
    }
    res.status(201).json({ msg: 'SOS alert sent successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/sos/admin/all
// @desc    Get all SOS alerts (Admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    const alerts = await SOSAlert.find().populate('user', ['name', 'email']).sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});
// ... (imports and other routes)

// @route   DELETE api/sos/admin/:id
// @desc    Delete an SOS alert (Admin only)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied.' });
    }
    const alert = await SOSAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ msg: 'SOS Alert not found' });
    }
    await alert.deleteOne();
    res.json({ msg: 'SOS Alert deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
