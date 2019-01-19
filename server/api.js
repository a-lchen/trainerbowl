// dependencies
const express = require('express');

const path = require('path')
const router = express.Router();

// api endpoints
router.get('/test', (req, res) => {
  res.send('hi');
});


router.get('/questions', (req, res) => {
  console.log("hit questions")
   

});




module.exports = router;
