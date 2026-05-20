const express = require('express');
const router = express.Router();
const db = require('../database');

// GET reviews for a restaurant
router.get('/restaurant/:restaurantId', (req, res) => {
  const reviews = db.prepare(
    'SELECT * FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC'
  ).all(req.params.restaurantId);
  res.json(reviews);
});

// POST create review
router.post('/', (req, res) => {
  const { restaurant_id, author, rating, pet_rating, content, pet_name, pet_type } = req.body;

  if (!restaurant_id || !author || !rating || !pet_rating || !content) {
    return res.status(400).json({ error: '缺少必填字段' });
  }

  const exists = db.prepare('SELECT id FROM restaurants WHERE id = ?').get(restaurant_id);
  if (!exists) return res.status(404).json({ error: '餐厅不存在' });

  const result = db.prepare(`
    INSERT INTO reviews (restaurant_id, author, rating, pet_rating, content, pet_name, pet_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(restaurant_id, author, rating, pet_rating, content, pet_name || null, pet_type || null);

  res.status(201).json({ id: result.lastInsertRowid, message: '评价提交成功' });
});

// GET recent reviews (community feed)
router.get('/recent', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const reviews = db.prepare(`
    SELECT rv.*, r.name as restaurant_name, r.city, r.cuisine
    FROM reviews rv
    JOIN restaurants r ON rv.restaurant_id = r.id
    ORDER BY rv.created_at DESC
    LIMIT ?
  `).all(limit);
  res.json(reviews);
});

module.exports = router;
