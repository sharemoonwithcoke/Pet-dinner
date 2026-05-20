const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'petdinner.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    cuisine TEXT NOT NULL,
    price_range INTEGER NOT NULL CHECK(price_range BETWEEN 1 AND 4),
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    pet_allowed INTEGER NOT NULL DEFAULT 1,
    pet_area TEXT DEFAULT 'outdoor',
    pet_size_limit TEXT DEFAULT 'all',
    has_pet_menu INTEGER DEFAULT 0,
    has_pet_seats INTEGER DEFAULT 0,
    has_pet_bowls INTEGER DEFAULT 0,
    has_pet_toys INTEGER DEFAULT 0,
    has_pet_parking INTEGER DEFAULT 0,
    pet_policy TEXT,
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    pet_rating INTEGER NOT NULL CHECK(pet_rating BETWEEN 1 AND 5),
    content TEXT NOT NULL,
    pet_name TEXT,
    pet_type TEXT,
    photo_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Seed data
const count = db.prepare('SELECT COUNT(*) as c FROM restaurants').get();
if (count.c === 0) {
  const insertRestaurant = db.prepare(`
    INSERT INTO restaurants (name, city, address, phone, website, cuisine, price_range,
      latitude, longitude, pet_area, pet_size_limit, has_pet_menu, has_pet_seats,
      has_pet_bowls, has_pet_toys, has_pet_parking, pet_policy, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const restaurants = [
    ['汪星人花园餐厅', '上海', '上海市静安区南京西路1号', '021-12345678', 'www.wangxing.com',
      '中式料理', 2, 31.2304, 121.4737, 'outdoor', 'small', 1, 1, 1, 1, 0,
      '欢迎小型犬入内，需提前告知，室外座位区宠物友好，提供宠物菜单和专用水碗。', null],
    ['毛孩子下午茶', '上海', '上海市徐汇区衡山路88号', '021-87654321', 'www.maohazi.com',
      '西式简餐', 2, 31.2100, 121.4510, 'both', 'all', 1, 1, 1, 1, 1,
      '所有体型宠物均欢迎，室内外均可带宠物，提供宠物下午茶套餐。', null],
    ['绿洲宠物友好咖啡', '北京', '北京市朝阳区三里屯路10号', '010-12345678', 'www.lvzhou.com',
      '咖啡简餐', 1, 39.9042, 116.4074, 'outdoor', 'small', 0, 1, 1, 0, 0,
      '室外区欢迎小型宠物，请保持宠物安静，自备宠物垫。', null],
    ['宠物友好牛排馆', '北京', '北京市海淀区中关村大街20号', '010-87654321', null,
      '西餐牛排', 4, 39.9800, 116.3100, 'outdoor', 'all', 0, 1, 1, 0, 1,
      '专设宠物友好区域，欢迎各类宠物，请保持文明用餐。', null],
    ['毛茸茸火锅店', '成都', '成都市锦江区春熙路5号', '028-12345678', null,
      '四川火锅', 2, 30.6573, 104.0657, 'outdoor', 'all', 0, 1, 1, 0, 0,
      '室外区欢迎所有宠物，请自备牵引绳，保持环境卫生。', null],
    ['花间集宠物餐厅', '成都', '成都市武侯区人民南路三段10号', '028-87654321', 'www.huajianji.com',
      '日式料理', 3, 30.6200, 104.0600, 'both', 'small', 1, 1, 1, 1, 0,
      '小型宠物可进入室内特定区域，大型犬限室外，提供宠物专属料理。', null],
    ['喵星球咖啡馆', '广州', '广州市天河区天河路385号', '020-12345678', 'www.miaoxingqiu.com',
      '咖啡甜品', 2, 23.1291, 113.2644, 'both', 'all', 1, 1, 1, 1, 0,
      '猫咖风格，欢迎携带各类宠物，店内有常驻猫咪，提供宠物友好甜品。', null],
    ['海边宠物餐吧', '深圳', '深圳市南山区海岸城购物中心旁', '0755-12345678', null,
      '海鲜料理', 3, 22.5371, 113.9346, 'outdoor', 'all', 0, 1, 1, 0, 1,
      '海景露台区域全面宠物友好，欢迎遛狗后来用餐，提供宠物系绳桩。', null],
    ['温馨小院宠物茶馆', '杭州', '杭州市西湖区西溪路100号', '0571-12345678', null,
      '中式茶饮', 2, 30.2741, 120.1551, 'outdoor', 'all', 0, 1, 1, 0, 0,
      '庭院式用餐，宠物可自由活动，请注意控制宠物行为。', null],
    ['汉堡狗狗乐', '杭州', '杭州市余杭区文一西路500号', '0571-87654321', null,
      '美式快餐', 1, 30.3000, 120.0600, 'both', 'small', 1, 1, 1, 1, 0,
      '专门为爱宠家庭设计的汉堡店，室内外均可带宠物，提供宠物汉堡套餐。', null],
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertRestaurant.run(...row);
  });
  insertMany(restaurants);

  const insertReview = db.prepare(`
    INSERT INTO reviews (restaurant_id, author, rating, pet_rating, content, pet_name, pet_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const reviews = [
    [1, '李小明', 5, 5, '环境非常好，工作人员对宠物很友善，我家柴犬很喜欢这里！食物也很美味。', '豆豆', '柴犬'],
    [1, '张晓华', 4, 4, '菜品不错，服务员主动给我的狗狗端来了水碗，细节做得很好。', '奶茶', '贵宾犬'],
    [2, '王芳', 5, 5, '宠物下午茶超级棒！我家主子第一次出门用餐，表现很好，餐厅氛围让它很放松。', '芝士', '英短猫'],
    [2, '陈磊', 4, 5, '环境优美，室内外都可以带宠物，特别推荐室外区域，很宽敞。', '黑豆', '拉布拉多'],
    [3, '刘梅', 3, 4, '咖啡味道不错，但室外区域稍小，建议提前预约宠物友好座位。', '小白', '比熊'],
    [4, '赵强', 5, 5, '牛排一流，宠物区域设施完善，有专门的狗狗系绳桩和水碗，非常贴心。', '旺财', '金毛'],
    [5, '孙丽', 4, 4, '火锅味道正宗，我的狗狗在室外区域玩得很开心，工作人员也很友善。', '辣椒', '哈士奇'],
    [6, '周涛', 5, 5, '日式料理很正宗，宠物菜单选项丰富，我家阿拉斯加特别喜欢这里。', '雪球', '阿拉斯加'],
    [7, '吴雪', 5, 5, '猫咖氛围超棒，我的猫咪和店里的猫玩得很好，甜品也很精致。', '橘子', '橘猫'],
    [8, '郑阳', 4, 5, '海景太美了！带着狗狗在露台用餐，海风轻抚，非常惬意。', '浪浪', '边境牧羊犬'],
    [9, '马欣', 4, 4, '茶馆庭院环境很好，宠物可以自由活动，但茶品选项可以更丰富。', '糯米', '柯基'],
    [10, '林晨', 5, 5, '专为宠物家庭设计，宠物汉堡很受欢迎，孩子和狗狗都很满意！', '薯条', '泰迪'],
  ];

  const insertReviewsMany = db.transaction((rows) => {
    for (const row of rows) insertReview.run(...row);
  });
  insertReviewsMany(reviews);

  const insertTip = db.prepare(`INSERT INTO tips (title, content, category) VALUES (?, ?, ?)`);
  const tips = [
    ['带宠物外出用餐基本礼仪', '1. 提前致电餐厅确认宠物政策\n2. 确保宠物打好疫苗\n3. 携带宠物零食保持其安静\n4. 准备宠物清洁用品\n5. 不要让宠物打扰其他顾客', '礼仪'],
    ['如何挑选适合宠物的餐厅', '选择宠物友好餐厅时，关注：室外座位是否充足、是否提供水碗、环境是否安全、工作人员态度、其他顾客的接受度。', '选择指南'],
    ['宠物用餐注意事项', '宠物在餐厅时需保持牵引，不要让宠物吃人类食物（部分食物对宠物有毒），随时准备清理宠物排泄物，保持宠物安静。', '安全须知'],
    ['带宠物出行准备清单', '必备物品：食物和水、便携水碗、清洁袋、宠物牵引绳、宠物零食、宠物急救包、宠物身份牌。', '准备清单'],
    ['如何让宠物在餐厅保持安静', '餐前适当运动让宠物消耗精力，携带喜爱的玩具，提供磨牙零食，训练宠物基本服从命令，保持冷静的态度安抚宠物。', '行为训练'],
  ];
  const insertTipsMany = db.transaction((rows) => {
    for (const row of rows) insertTip.run(...row);
  });
  insertTipsMany(tips);
}

module.exports = db;
