# 🐾 Pet Dinner — 宠物友好餐厅仪表盘

发现最适合您和毛孩子的友好餐厅。Pet Dinner 是一个全栈应用，包含 **Web 端**和 **移动端（iOS / Android）**，共享同一套后端 API。

---

## 项目结构

```
Pet-dinner/
├── backend/          # Node.js + Express + SQLite 后端 API
├── frontend/         # React + Vite Web 端
├── mobile/           # React Native + Expo 移动端
└── package.json      # 根目录脚本
```

---

## 快速启动

### 第一步：启动后端（必须先启动）

```bash
cd backend
npm install
node server.js
```

后端运行在 `http://localhost:3001`，首次启动会自动创建 SQLite 数据库并写入示例数据（10 家餐厅、12 条评价）。

### 第二步：启动 Web 端

```bash
cd frontend
npm install
npm run dev
```

打开浏览器访问 `http://localhost:5173`

### 第三步：启动移动端（可选）

```bash
cd mobile
npm install
npx expo start
```

用手机安装 **Expo Go** App，扫描终端中显示的二维码即可预览。

> **真机调试注意**：需将 `mobile/src/api/client.js` 中的 `localhost:3001` 改为电脑的局域网 IP（如 `192.168.1.100:3001`），否则手机无法连接后端。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Node.js · Express · SQLite (better-sqlite3) |
| Web 前端 | React 18 · Vite · Tailwind CSS · Recharts · Leaflet |
| 移动端 | React Native · Expo 51 · React Navigation · react-native-maps · react-native-chart-kit |

---

## 核心功能

- **餐厅搜索与筛选** — 按城市、菜系、价格区间、宠物体型、设施多维筛选
- **交互地图** — 地图标注所有餐厅位置，点击查看详情
- **用户评价系统** — 综合评分 + 宠物友好评分双维度
- **添加餐厅** — 任何用户可提交新餐厅信息
- **社区动态** — 最新评价流 + 带宠物外出指南
- **数据分析仪表盘** — 城市分布、菜系占比、价格评分对比、设施覆盖率、市场洞察建议

---

## API 接口概览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/restaurants` | 获取餐厅列表（支持筛选参数） |
| GET | `/api/restaurants/:id` | 获取餐厅详情（含评价） |
| POST | `/api/restaurants` | 添加新餐厅 |
| POST | `/api/reviews` | 提交评价 |
| GET | `/api/reviews/recent` | 获取最新评价流 |
| GET | `/api/analytics/overview` | 统计概览 |
| GET | `/api/analytics/insights` | 市场洞察建议 |

完整 API 文档见 [`backend/routes/`](./backend/routes/)。

---

## 子模块文档

- [后端说明](./backend/README.md)（内嵌在本文件，见上方 API 表格）
- [Web 端说明](./frontend/README.md)
- [移动端说明](./mobile/README.md)
