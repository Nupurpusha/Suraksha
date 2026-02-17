const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');

// @route   POST api/reports
// @desc    Create a new report
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, location, dateOfIncident, type, otherType, isAnonymous } = req.body;

    const newReport = new Report({
      submittedBy: req.user.id,
      title: title && title.trim() ? title : 'Untitled',
      description,
      location: location && location.trim() ? location : 'Not specified',
      dateOfIncident,
      type,
      otherType,
      isAnonymous,
    });

    const report = await newReport.save();
    // emit realtime event
    const io = req.app.get('io');
    if (io) {
      io.emit('report:new', report);
    }
    res.status(201).json(report);

  } catch (err) {
    console.error('POST /api/reports error:', err);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

// @route   DELETE api/reports/:id
// @desc    Delete a report (owner or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    const isOwner = report.submittedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await report.deleteOne();
    res.json({ msg: 'Report deleted' });
  } catch (err) {
    console.error('DELETE /api/reports/:id error:', err);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});
// @route   GET api/reports/my
// @desc    Get reports for the logged-in user
router.get('/my', auth, async (req, res) => {
  try {
    
    const reports = await Report.find({ submittedBy: req.user.id })
      .populate('submittedBy', ['name', 'email']) // ✅ ADD THIS LINE to fetch user details
      .sort({ createdAt: -1 });
      
    res.json(reports);
  } catch (err) {
    console.error("GET /api/reports/my error:", err);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

// @route   GET api/reports/:id
// @desc    Get a single report by id (owner or admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    const isOwner = report.submittedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(report);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid report id' });
    }
    console.error('GET /api/reports/:id error:', err);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

// @route   GET api/reports/admin/all
// @desc    Get all reports for an admin
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }

    const reports = await Report.find()
      .populate('submittedBy', ['name', 'email'])
      .sort({ createdAt: -1 });
      
    res.json(reports);
  } catch (err) {
    console.error('GET /api/reports/admin/all error:', err);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

// @route   PUT api/reports/admin/assign/:id
// @desc    Assign a counselor to a report
router.put('/admin/assign/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }

    let report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    report.assignedCounselor = req.body.counselorName;
    if (req.body.counselorId) {
      report.assignedCounselorId = req.body.counselorId;
    }
    report.status = 'Assigned';

    await report.save();
    const io = req.app.get('io');
    if (io) {
      io.emit('report:update', report);
    }
    res.json(report);

  } catch (err) {
    console.error('PUT /api/reports/admin/assign/:id error:', err);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

// @route   PUT api/reports/admin/status/:id
// @desc    Update report status (admin)
router.put('/admin/status/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admins only.' });
    }
    const { status } = req.body;
    const allowed = ['Submitted', 'In Review', 'Assigned', 'In Counselling', 'Resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!report) return res.status(404).json({ msg: 'Report not found' });
    const io = req.app.get('io');
    if (io) io.emit('report:update', report);
    res.json(report);
  } catch (err) {
    console.error('PUT /api/reports/admin/status/:id error:', err);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});
// ... (imports and other routes)

// @route   DELETE api/reports/admin/:id
// @desc    Delete a report (Admin only)
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied.' });
    }
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }
    await report.deleteOne();
    res.json({ msg: 'Report deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});



// @route   GET api/reports/counsellor/my
// @desc    Get reports assigned to the logged-in counsellor
router.get('/counsellor/my', auth, async (req, res) => {
  try {
    if (req.user.role !== 'counsellor') {
      return res.status(403).json({ msg: 'Access denied. Counsellors only.' });
    }
    const reports = await Report.find({ assignedCounselorId: req.user.id })
      .populate('submittedBy', ['name', 'email'])
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('GET /api/reports/counsellor/my error:', err);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

// @route   PUT api/reports/counsellor/status/:id
// @desc    Update status on an assigned report (counsellor)
router.put('/counsellor/status/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'counsellor') {
      return res.status(403).json({ msg: 'Access denied. Counsellors only.' });
    }
    const { status } = req.body;
    const allowed = ['In Counselling', 'Resolved'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status for counsellor' });
    }
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ msg: 'Report not found' });
    if (!report.assignedCounselorId || report.assignedCounselorId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized for this report' });
    }
    report.status = status;
    await report.save();
    const io = req.app.get('io');
    if (io) io.emit('report:update', report);
    res.json(report);
  } catch (err) {
    console.error('PUT /api/reports/counsellor/status/:id error:', err);
    res.status(500).json({ msg: err.message || 'Server Error' });
  }
});

module.exports = router;