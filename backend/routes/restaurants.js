const express = require('express');
const router = express.Router();
const db = require('../database');

// GET all restaurants with filters
router.get('/', (req, res) => {
  const { city, cuisine, price_range, pet_area, pet_size_limit, has_pet_menu,
          has_pet_seats, has_pet_bowls, search, sort } = req.query;

  let sql = `
    SELECT r.*,
      ROUND(AVG(rv.rating), 1) as avg_rating,
      ROUND(AVG(rv.pet_rating), 1) as avg_pet_rating,
      COUNT(rv.id) as review_count
    FROM restaurants r
    LEFT JOIN reviews rv ON r.id = rv.restaurant_id
    WHERE r.pet_allowed = 1
  `;
  const params = [];

  if (city) { sql += ' AND r.city = ?'; params.push(city); }
  if (cuisine) { sql += ' AND r.cuisine = ?'; params.push(cuisine); }
  if (price_range) { sql += ' AND r.price_range = ?'; params.push(Number(price_range)); }
  if (pet_area) { sql += ' AND (r.pet_area = ? OR r.pet_area = "both")'; params.push(pet_area); }
  if (pet_size_limit && pet_size_limit !== 'all') {
    sql += ' AND (r.pet_size_limit = ? OR r.pet_size_limit = "all")';
    params.push(pet_size_limit);
  }
  if (has_pet_menu === '1') { sql += ' AND r.has_pet_menu = 1'; }
  if (has_pet_seats === '1') { sql += ' AND r.has_pet_seats = 1'; }
  if (has_pet_bowls === '1') { sql += ' AND r.has_pet_bowls = 1'; }
  if (search) {
    sql += ' AND (r.name LIKE ? OR r.address LIKE ? OR r.cuisine LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  sql += ' GROUP BY r.id';

  if (sort === 'rating') sql += ' ORDER BY avg_rating DESC';
  else if (sort === 'pet_rating') sql += ' ORDER BY avg_pet_rating DESC';
  else if (sort === 'price_asc') sql += ' ORDER BY r.price_range ASC';
  else if (sort === 'price_desc') sql += ' ORDER BY r.price_range DESC';
  else sql += ' ORDER BY review_count DESC, avg_rating DESC';

  res.json(db.prepare(sql).all(...params));
});

// GET single restaurant
router.get('/:id', (req, res) => {
  const restaurant = db.prepare(`
    SELECT r.*,
      ROUND(AVG(rv.rating), 1) as avg_rating,
      ROUND(AVG(rv.pet_rating), 1) as avg_pet_rating,
      COUNT(rv.id) as review_count
    FROM restaurants r
    LEFT JOIN reviews rv ON r.id = rv.restaurant_id
    WHERE r.id = ?
    GROUP BY r.id
  `).get(req.params.id);

  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

  const reviews = db.prepare('SELECT * FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ ...restaurant, reviews });
});

// POST create restaurant
router.post('/', (req, res) => {
  const {
    name, city, address, phone, website, cuisine, price_range,
    latitude, longitude, pet_area, pet_size_limit,
    has_pet_menu, has_pet_seats, has_pet_bowls, has_pet_toys,
    has_pet_parking, pet_policy
  } = req.body;

  if (!name || !city || !address || !cuisine || !price_range || !latitude || !longitude) {
    return res.status(400).json({ error: '缺少必填字段' });
  }

  const result = db.prepare(`
    INSERT INTO restaurants (name, city, address, phone, website, cuisine, price_range,
      latitude, longitude, pet_area, pet_size_limit, has_pet_menu, has_pet_seats,
      has_pet_bowls, has_pet_toys, has_pet_parking, pet_policy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    name, city, address, phone || null, website || null, cuisine, price_range,
    latitude, longitude, pet_area || 'outdoor', pet_size_limit || 'all',
    has_pet_menu ? 1 : 0, has_pet_seats ? 1 : 0, has_pet_bowls ? 1 : 0,
    has_pet_toys ? 1 : 0, has_pet_parking ? 1 : 0, pet_policy || null
  );

  res.status(201).json({ id: result.lastInsertRowid, message: '餐厅添加成功' });
});

// PUT update restaurant
router.put('/:id', (req, res) => {
  const exists = db.prepare('SELECT id FROM restaurants WHERE id = ?').get(req.params.id);
  if (!exists) return res.status(404).json({ error: 'Restaurant not found' });

  const {
    name, city, address, phone, website, cuisine, price_range,
    latitude, longitude, pet_area, pet_size_limit,
    has_pet_menu, has_pet_seats, has_pet_bowls, has_pet_toys,
    has_pet_parking, pet_policy
  } = req.body;

  db.prepare(`
    UPDATE restaurants SET name=?, city=?, address=?, phone=?, website=?, cuisine=?,
      price_range=?, latitude=?, longitude=?, pet_area=?, pet_size_limit=?,
      has_pet_menu=?, has_pet_seats=?, has_pet_bowls=?, has_pet_toys=?,
      has_pet_parking=?, pet_policy=?, updated_at=datetime('now')
    WHERE id=?
  `).run(
    name, city, address, phone, website, cuisine, price_range,
    latitude, longitude, pet_area, pet_size_limit,
    has_pet_menu ? 1 : 0, has_pet_seats ? 1 : 0, has_pet_bowls ? 1 : 0,
    has_pet_toys ? 1 : 0, has_pet_parking ? 1 : 0, pet_policy,
    req.params.id
  );

  res.json({ message: '更新成功' });
});

// DELETE restaurant
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM restaurants WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Restaurant not found' });
  res.json({ message: '删除成功' });
});

// GET cities list
router.get('/meta/cities', (req, res) => {
  res.json(db.prepare('SELECT DISTINCT city FROM restaurants ORDER BY city').all().map(r => r.city));
});

// GET cuisines list
router.get('/meta/cuisines', (req, res) => {
  res.json(db.prepare('SELECT DISTINCT cuisine FROM restaurants ORDER BY cuisine').all().map(r => r.cuisine));
});

module.exports = router;
