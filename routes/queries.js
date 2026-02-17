  const express = require('express');
  const router = express.Router();
  const auth = require('../middleware/auth');
  const Query = require('../models/Query');
  const transporter = require('../utils/mailer'); // 👈 Import the transporter

  // @route   POST api/queries
  // @desc    A user sends a new query (Contact or Mentorship)
  router.post('/', async (req, res) => {
    const { name, email, message, type } = req.body;
    if (!name || !email || !message || !type) {
      return res.status(400).json({ msg: 'All fields are required.' });
    }
    try {
      const newQuery = new Query({ name, email, message, type });
      await newQuery.save();
      res.status(201).json({ msg: 'Query submitted successfully.' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  });

  // @route   GET api/queries/admin/all
  // @desc    Get all queries (Admin only)
  router.get('/admin/all', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admins only.' });
      }
      const queries = await Query.find().sort({ timestamp: -1 });
      res.json(queries);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  });
  // ... (imports and other routes)

  // @route   DELETE api/queries/admin/:id
  // @desc    Delete a query (Admin only)
  router.delete('/admin/:id', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied.' });
      }
      const query = await Query.findById(req.params.id);
      if (!query) {
        return res.status(404).json({ msg: 'Query not found' });
      }
      await query.deleteOne();
      res.json({ msg: 'Query deleted successfully' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  });


  // @route   POST api/queries/admin/reply/:id
  // @desc    Admin replies to a query via email
  router.post('/admin/reply/:id', auth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admins only.' });
      }

      let query = await Query.findById(req.params.id);
      if (!query) {
        return res.status(404).json({ msg: 'Query not found' });
      }

      const { replyMessage } = req.body;
      if (!replyMessage) {
        return res.status(400).json({ msg: 'Reply message is required.' });
      }

      // Set up the email to be sent using the imported transporter
      await transporter.sendMail({
        from: `Suraksha Support <${process.env.EMAIL_USER}>`,
        to: query.email,
        subject: `Re: Your ${query.type} Request from Suraksha`,
        html: `
          <p>Hello ${query.name},</p>
          <p>Thank you for reaching out. Here is a response to your recent query:</p>
          <blockquote style="border-left: 2px solid #ccc; padding-left: 1rem; margin-left: 1rem; font-style: italic;">
            ${replyMessage}
          </blockquote>
          <p>Sincerely,<br/>The Suraksha Team</p>
        `,
      });

      // Mark the query as resolved and save it
      query.isResolved = true;
      await query.save();
      
      res.json(query); // Send back the updated query
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  });

  module.exports = router;