const express = require('express');
const router = express.Router();

function generateReply(message) {
  const text = (message || '').toLowerCase();

  if (text.includes('report')) {
    return `Of course, here are the steps to file a secure report:\n
    1.  First, you need to be logged in to your account. This ensures your report is saved safely to your private dashboard.\n
    2.  Once logged in, click the "Report an Incident" button in the main menu.\n
    3.  Follow the simple, multi-step form to provide the details of the incident.\n
    I can take you through the login process now if you'd like.`;
      }
  if (text.includes('help') || text.includes('sos')) {
    return 'If you are in immediate danger, call local emergency services (112). I can also guide you to create an incident report.';
  }
  if (text.includes('counsel')) {
    return 'You  can contact our support team to request a mentor or counselor. Would you like me to take you to the contact page?';
  }
  if (text.includes('Safety tips')|| text.includes('Legal aid resources')){
    return 'The Resources page has information on safety planning, legal aid, and helplines. Here are some quick links.';
  }
  if (text.includes('friend') || text.includes('someone else')) {
    return 'It is brave of you to seek help for someone else. Our Resources page has information on how to support a friend or family member.';
  }
  // ... (rest of the function is the same)
  return "I'm here to help. You can ask about 'reporting an incident', 'safety tips', or how to 'contact a counsellor'.";
}

// The suggestedLinks function remains the same
function suggestedLinks(message) {
  const text = (message || '').toLowerCase();
  const links = [];
  if (text.includes('report')) {
    // This action link will appear below the new, detailed instructions
    links.push({ label: 'Log In & Report', action: 'LOGIN_THEN_REPORT' });
  }
  // ... (rest of the function is the same)
 
  if (text.includes('report')) {
    // This is a special action, not a URL
    links.push({ label: 'Log In & Report', action: 'LOGIN_THEN_REPORT' }); 
  }
  if (text.includes('counsel')) {
    links.push({ label: 'Go to Contact Page', url: '/contact' });
  }
  if (text.includes('friend') || text.includes('someone else') || text.includes('resources')) {
    links.push({ label: 'View All Resources', url: '/resources' });
  }
  return links;
}

// Public endpoint for the chat
router.post('/', async (req, res) => {
  const { message } = req.body || {};
  const reply = generateReply(message);
  const links = suggestedLinks(message);
  const suggestions = ['How to report', 'Safety tips', 'Contact a counsellor', 'Help a friend'];
  await new Promise(r => setTimeout(r, 450)); // Simulate typing
  res.json({ reply, links, suggestions });
});

module.exports = router;