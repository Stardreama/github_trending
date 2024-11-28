const express = require('express');
const router = express.Router();
const fetchTrending = require('../utils/fetchTrending');

router.get('/', async (req, res) => {
  try {
    const trendingRepos = await fetchTrending();
    res.json(trendingRepos);
  } catch (error) {
    console.error('Error fetching trending repositories:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

module.exports = router;
