# 🌐 Pet Dinner — Web 端

基于 **React + Vite + Tailwind CSS** 构建的宠物友好餐厅 Web 应用。

---

## 环境要求

- Node.js 18+
- 后端服务已启动（默认 `http://localhost:3001`）

---

## 启动开发环境

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

访问 `http://localhost:5173`

Vite 已配置代理，所有 `/api` 请求自动转发到 `localhost:3001`，无需手动处理跨域。

---

## 构建生产版本

```bash
npm run build
```

产物输出到 `dist/` 目录。可用任意静态服务器托管，或配合后端直接 serve：

```bash
# 预览构建结果
npm run preview
```

---

## 页面说明

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 餐厅列表、搜索筛选、添加餐厅 |
| `/map` | 地图页 | Leaflet 交互地图，爪印标注餐厅位置 |
| `/community` | 社区页 | 最新评价动态流 + 外出指南 |
| `/analytics` | 数据分析 | 图表仪表盘 + 市场洞察建议 |
| `/restaurant/:id` | 餐厅详情 | 完整信息、评价列表、写评价 |

---

## 目录结构

```
frontend/
├── index.html
├── vite.config.js          # 开发代理配置
├── tailwind.config.js
└── src/
    ├── App.jsx             # 路由定义
    ├── index.css           # Tailwind 全局样式
    ├── main.jsx
    ├── components/
    │   ├── Navbar.jsx          # 顶部导航（响应式）
    │   ├── RestaurantCard.jsx  # 餐厅卡片组件
    │   ├── SearchFilter.jsx    # 搜索筛选栏
    │   ├── AddRestaurantModal.jsx  # 添加餐厅弹窗
    │   └── ReviewModal.jsx     # 写评价弹窗
    └── pages/
        ├── Home.jsx
        ├── MapPage.jsx
        ├── Community.jsx
        ├── Analytics.jsx
        └── RestaurantDetail.jsx
```

---

## 技术依赖

| 库 | 用途 |
|----|------|
| React 18 | UI 框架 |
| React Router v6 | 客户端路由 |
| Vite | 构建工具 |
| Tailwind CSS | 原子化样式 |
| Leaflet + react-leaflet | 交互地图（OpenStreetMap，免费无需 API Key） |
| Recharts | 数据可视化图表 |
| Axios | HTTP 请求 |

---

## 注意事项

- 地图使用 OpenStreetMap 底图，完全免费，无需申请任何 API Key。
- 所有数据请求通过 Vite 代理转发到后端，生产部署时需配置 Nginx 反向代理或修改 API 地址。
