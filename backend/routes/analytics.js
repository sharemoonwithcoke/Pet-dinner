const express = require('express');
const router = express.Router();
const db = require('../database');

// GET overview stats
router.get('/overview', (req, res) => {
  const totalRestaurants = db.prepare('SELECT COUNT(*) as count FROM restaurants').get().count;
  const totalReviews = db.prepare('SELECT COUNT(*) as count FROM reviews').get().count;
  const avgRating = db.prepare('SELECT ROUND(AVG(rating), 2) as avg FROM reviews').get().avg;
  const avgPetRating = db.prepare('SELECT ROUND(AVG(pet_rating), 2) as avg FROM reviews').get().avg;
  const totalCities = db.prepare('SELECT COUNT(DISTINCT city) as count FROM restaurants').get().count;

  const facilityCoverage = db.prepare(`
    SELECT
      ROUND(100.0 * SUM(has_pet_menu) / COUNT(*), 1) as menu_pct,
      ROUND(100.0 * SUM(has_pet_seats) / COUNT(*), 1) as seats_pct,
      ROUND(100.0 * SUM(has_pet_bowls) / COUNT(*), 1) as bowls_pct,
      ROUND(100.0 * SUM(has_pet_toys) / COUNT(*), 1) as toys_pct,
      ROUND(100.0 * SUM(has_pet_parking) / COUNT(*), 1) as parking_pct
    FROM restaurants
  `).get();

  res.json({ totalRestaurants, totalReviews, avgRating, avgPetRating, totalCities, facilityCoverage });
});

// GET city distribution
router.get('/by-city', (req, res) => {
  res.json(db.prepare(`
    SELECT city,
      COUNT(*) as restaurant_count,
      ROUND(AVG(rv.rating), 1) as avg_rating,
      COUNT(rv.id) as total_reviews
    FROM restaurants r
    LEFT JOIN reviews rv ON r.id = rv.restaurant_id
    GROUP BY city
    ORDER BY restaurant_count DESC
  `).all());
});

// GET cuisine distribution
router.get('/by-cuisine', (req, res) => {
  res.json(db.prepare(`
    SELECT cuisine,
      COUNT(*) as count,
      ROUND(AVG(rv.rating), 1) as avg_rating
    FROM restaurants r
    LEFT JOIN reviews rv ON r.id = rv.restaurant_id
    GROUP BY cuisine
    ORDER BY count DESC
  `).all());
});

// GET price distribution
router.get('/by-price', (req, res) => {
  res.json(db.prepare(`
    SELECT price_range,
      COUNT(*) as count,
      ROUND(AVG(rv.rating), 1) as avg_rating,
      ROUND(AVG(rv.pet_rating), 1) as avg_pet_rating
    FROM restaurants r
    LEFT JOIN reviews rv ON r.id = rv.restaurant_id
    GROUP BY price_range
    ORDER BY price_range ASC
  `).all());
});

// GET pet area distribution
router.get('/by-pet-area', (req, res) => {
  res.json(db.prepare(`
    SELECT pet_area, COUNT(*) as count FROM restaurants GROUP BY pet_area
  `).all());
});

// GET rating distribution
router.get('/rating-distribution', (req, res) => {
  res.json(db.prepare(`
    SELECT rating, COUNT(*) as count FROM reviews GROUP BY rating ORDER BY rating DESC
  `).all());
});

// GET top restaurants
router.get('/top-restaurants', (req, res) => {
  res.json(db.prepare(`
    SELECT r.id, r.name, r.city, r.cuisine, r.price_range,
      ROUND(AVG(rv.rating), 1) as avg_rating,
      ROUND(AVG(rv.pet_rating), 1) as avg_pet_rating,
      COUNT(rv.id) as review_count
    FROM restaurants r
    JOIN reviews rv ON r.id = rv.restaurant_id
    GROUP BY r.id
    HAVING review_count >= 1
    ORDER BY avg_rating DESC, avg_pet_rating DESC
    LIMIT 5
  `).all());
});

// GET facility analysis
router.get('/facilities', (req, res) => {
  res.json(db.prepare(`
    SELECT
      'pet_menu' as facility, SUM(has_pet_menu) as count FROM restaurants
    UNION ALL SELECT 'pet_seats', SUM(has_pet_seats) FROM restaurants
    UNION ALL SELECT 'pet_bowls', SUM(has_pet_bowls) FROM restaurants
    UNION ALL SELECT 'pet_toys', SUM(has_pet_toys) FROM restaurants
    UNION ALL SELECT 'pet_parking', SUM(has_pet_parking) FROM restaurants
  `).all());
});

// GET tips
router.get('/tips', (req, res) => {
  res.json(db.prepare('SELECT * FROM tips ORDER BY created_at DESC').all());
});

// GET market insights (data-driven recommendations)
router.get('/insights', (req, res) => {
  const insights = [];

  // City with most restaurants
  const topCity = db.prepare(`
    SELECT city, COUNT(*) as count FROM restaurants GROUP BY city ORDER BY count DESC LIMIT 1
  `).get();

  // City with fewest restaurants (potential market gap)
  const lowCity = db.prepare(`
    SELECT city, COUNT(*) as count FROM restaurants GROUP BY city ORDER BY count ASC LIMIT 1
  `).get();

  // Most demanded facility
  const facilities = db.prepare(`
    SELECT
      SUM(has_pet_menu) as menu, SUM(has_pet_seats) as seats,
      SUM(has_pet_bowls) as bowls, SUM(has_pet_toys) as toys,
      SUM(has_pet_parking) as parking, COUNT(*) as total
    FROM restaurants
  `).get();

  const facilityNames = { menu: '宠物菜单', seats: '宠物座椅', bowls: '宠物水碗', toys: '宠物玩具', parking: '宠物停车' };
  const leastFacility = Object.entries(facilityNames)
    .map(([k, v]) => ({ name: v, count: facilities[k], pct: Math.round(facilities[k] / facilities.total * 100) }))
    .sort((a, b) => a.count - b.count)[0];

  // Average pet rating vs food rating gap
  const ratingGap = db.prepare(`
    SELECT ROUND(AVG(rating) - AVG(pet_rating), 2) as gap FROM reviews
  `).get().gap;

  insights.push(
    { type: 'market', icon: '📍', title: '市场集中度', content: `${topCity.city}拥有最多宠物友好餐厅(${topCity.count}家)，市场相对成熟；${lowCity.city}仅有${lowCity.count}家，存在较大市场空白。` },
    { type: 'facility', icon: '🏪', title: '设施缺口', content: `仅${leastFacility.pct}%的餐厅提供${leastFacility.name}，这是目前宠物友好设施中最稀缺的，餐厅增设此设施可显著提升竞争力。` },
    { type: 'rating', icon: '⭐', title: '评分洞察', content: ratingGap > 0 ? `用户整体评分平均高于宠物友好评分${Math.abs(ratingGap)}分，说明宠物友好体验还有较大提升空间。` : `宠物友好评分与整体评分基本持平，说明宠物友好服务质量良好。` },
    { type: 'trend', icon: '📈', title: '发展建议', content: '建议餐厅增设宠物专区隔离设计，推出宠物主题活动，并在社交媒体加强宠物友好服务的宣传，吸引更多宠物主人群体。' },
  );

  res.json(insights);
});

module.exports = router;
