// Server/Routings/analyticsRoutes.js
const express = require('express');
const router = express.Router();

router.get('/track-visit', (req, res) => {
  const visitTime = new Date().toISOString();
//   console.log(`New user opened the app at: ${visitTime}`);
  
  return res.status(200).json({ 
    success: true, 
    message: 'Visit successfully recorded.' 
  });
});

module.exports = router;