# 📱 Pet Dinner — 移动端 App

基于 **React Native + Expo** 构建，支持 **iOS 和 Android** 双平台。

---

## 环境要求

- Node.js 18+
- Expo CLI：`npm install -g expo-cli`（可选，也可用 `npx expo`）
- **后端服务已启动**，并且手机/模拟器能访问到后端地址

---

## 启动方式

### 方式一：Expo Go（最快，推荐初次体验）

无需安装 Xcode 或 Android Studio，手机扫码即可运行。

```bash
# 1. 安装依赖
npm install

# 2. 启动 Expo 开发服务器
npx expo start
```

终端会显示一个二维码：
- **iOS**：打开系统相机扫描二维码，或在 Safari 打开链接
- **Android**：在 Expo Go App 内扫描二维码

> 手机需与开发机在**同一局域网**下。

---

### 方式二：iOS 模拟器（需 macOS + Xcode）

```bash
npx expo run:ios
```

或在 `npx expo start` 后按 `i` 键。

---

### 方式三：Android 模拟器（需 Android Studio）

```bash
npx expo run:android
```

或在 `npx expo start` 后按 `a` 键。

---

## 配置后端地址

打开 `src/api/client.js`，根据环境修改 `API_BASE`：

```js
// 开发环境 —— 根据实际情况选择：
// Web 浏览器 / iOS 模拟器：
export const API_BASE = 'http://localhost:3001';

// Android 模拟器：
export const API_BASE = 'http://10.0.2.2:3001';

// 真机调试（替换为你电脑的局域网 IP）：
export const API_BASE = 'http://192.168.1.100:3001';
```

---

## 页面说明

| 页面 | 功能 |
|------|------|
| **首页** | 渐变 Hero、关键词搜索、城市/价格/排序筛选、餐厅卡片列表、下拉刷新、添加餐厅 |
| **地图** | react-native-maps 交互地图、爪印 Marker、Callout 弹出详情、底部横向卡片、城市快跳 |
| **社区** | 最新评价动态流、可折叠外出指南卡片（标签页切换） |
| **数据分析** | 统计卡片、柱状图/饼图、评分分布条形图、设施覆盖竖柱图、排行榜、市场洞察 |
| **餐厅详情** | 双评分展示、宠物政策、设施列表、评价列表、写评价弹窗 |

---

## 目录结构

```
mobile/
├── App.js                        # 入口，挂载导航
├── app.json                      # Expo 配置（应用名、图标、权限等）
├── babel.config.js
└── src/
    ├── api/
    │   └── client.js             # Axios 封装，所有 API 调用
    ├── navigation/
    │   └── index.js              # 底部 Tab + Stack 导航配置
    ├── components/
    │   ├── StarRating.js         # StarDisplay（展示）/ StarPicker（可点击选星）
    │   ├── RestaurantCard.js     # 餐厅卡片（评分、设施 Tag、价格）
    │   ├── AddRestaurantModal.js # 添加餐厅表单（Switch、选项组、键盘适配）
    │   └── ReviewModal.js        # 写评价弹窗（双维度评分）
    └── screens/
        ├── HomeScreen.js
        ├── MapScreen.js
        ├── CommunityScreen.js
        ├── AnalyticsScreen.js
        └── RestaurantDetailScreen.js
```

---

## 技术依赖

| 库 | 用途 |
|----|------|
| Expo 51 | 应用框架，简化原生构建 |
| React Native 0.74 | 跨平台 UI |
| React Navigation v6 | 底部 Tab + Stack 导航 |
| react-native-maps | 原生地图组件 |
| react-native-chart-kit | BarChart / PieChart 图表 |
| react-native-svg | 图表依赖的 SVG 渲染 |
| expo-linear-gradient | 渐变色背景 |
| @expo/vector-icons | Ionicons 图标库 |
| Axios | HTTP 请求 |

---

## 打包发布

### 使用 EAS Build（推荐）

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login

# 配置 EAS
eas build:configure

# 构建 iOS .ipa（需 Apple 开发者账号）
eas build --platform ios

# 构建 Android .apk / .aab
eas build --platform android
```

### 本地构建

```bash
# iOS（需 macOS + Xcode 15+）
npx expo run:ios --configuration Release

# Android（需 Android Studio）
npx expo run:android --variant release
```

---

## 常见问题

**Q：扫码后显示"Network request failed"**
A：手机和电脑不在同一 Wi-Fi，或后端未启动。检查 `src/api/client.js` 中的 IP 地址，并确保后端运行中。

**Q：地图页空白**
A：Android 真机使用 Google Maps 需要配置 Google Maps API Key，在 `app.json` 的 `plugins` 中添加并重新 build。iOS 使用系统原生地图无此问题。

**Q：iOS 模拟器运行正常但真机报错**
A：真机需将 API 地址从 `localhost` 改为电脑的局域网 IP。
