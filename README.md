# 纯8+ 时间记录工具

> **让时间努力看得见**

一款简洁的时间记录和格子可视化工具，帮助你看见自己的时间投入，对抗虚无感。

---

## 📖 项目简介

**纯8+ 时间记录工具**包含两个核心功能：

1. **⏱ 时间记录** - 纯粹的秒表计时，精确记录你投入的时间
2. **▦ 画格子** - 可视化进度追踪，完成任务后填满格子获得成就感

### 核心理念

- **简单胜过聪明** - 数据结构扁平，避免过度抽象
- **对自己诚实** - 不可修改历史记录，不鼓励补记录
- **尊重事实** - 不预设"纯8"、"纯6"，先记录再认识自己

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

在浏览器中打开 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
```

---

## 📁 项目结构

```
pure8-plus-app/
├── src/
│   ├── components/     # 可复用组件
│   │   ├── StatsModal.vue          # 统计页弹窗
│   │   ├── ProjectListModal.vue    # 项目列表弹窗
│   │   ├── ProjectManageModal.vue  # 项目管理弹窗
│   │   └── GridDrawModal.vue       # 格子绘画弹窗
│   ├── views/          # 页面组件
│   │   ├── TimerTab.vue            # 时间记录Tab
│   │   └── GridsTab.vue            # 画格子Tab
│   ├── utils/          # 工具函数
│   │   ├── dataManager.ts          # 数据管理
│   │   ├── stopwatch.ts            # 秒表类
│   │   └── timeFormat.ts           # 时间格式化
│   ├── types/          # TypeScript类型定义
│   │   └── index.ts
│   ├── App.vue         # 根组件
│   ├── main.ts         # 入口文件
│   └── style.css       # 全局样式
├── public/             # 静态资源
│   └── manifest.json   # PWA配置
├── index.html          # HTML模板
├── vite.config.ts      # Vite配置
└── tsconfig.json       # TypeScript配置
```

---

## 🎯 功能说明

### 时间记录（Tab 1）

- **大圆圈计时器** - 精确到秒的实时显示
- **开始/停止按钮** - 控制计时
- **今日记录列表** - 显示所有计时片段
- **今日累计** - 统计今日总时长
- **详细统计** - 查看本周、累计数据，设置每日目标

**技术实现**：
- 使用 `performance.now()` 实现高精度计时
- 不受系统时间调整影响
- 数据存储在 localStorage

### 画格子（Tab 2）

- **项目管理** - 创建、切换、删除项目
- **格子展示** - 50个格子（可自定义）
- **Canvas绘画** - 点击空格子弹出大格子，用手指/鼠标绘画
- **进度统计** - 显示完成进度

**技术实现**：
- 使用原生 Canvas API
- 支持触摸事件（移动端）和鼠标事件（桌面端）
- 统一处理逻辑，一套代码跨平台

### 统计页

- **今日统计** - 今日累计时间、计时次数
- **本周统计** - 本周累计、日均
- **累计统计** - 从开始使用到现在
- **"我的数字"** - 记录7天后，计算你的平均每天时间
- **目标设置** - 基于真实数据设置每日目标

---

## 📱 移动端适配

### 已实现的适配

✅ 触摸事件支持（`{ passive: false }` + `preventDefault()`）
✅ 视口配置（禁止缩放）
✅ iOS 安全区域适配（`env(safe-area-inset-*)`）
✅ 橡皮筋滚动禁用（`overscroll-behavior: none`）
✅ 触摸反馈动画（点击缩放效果）
✅ Canvas 高清屏适配（`devicePixelRatio`）

### 测试建议

- iOS Safari（iPhone 14+）
- Android Chrome
- 桌面浏览器（Chrome/Firefox/Safari）

---

## 🔧 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **存储**: localStorage + JSON
- **PWA**: manifest.json + iOS meta标签

---

## 📊 数据结构

```typescript
interface TimeRecord {
  start: number;        // Unix timestamp (毫秒)
  duration: number;     // 秒数
}

interface Project {
  id: string;           // UUID
  name: string;         // 项目名称
  totalGrids: number;   // 总格子数
  grids: boolean[];     // 格子状态数组
  createdAt: number;    // 创建时间
}

interface AppData {
  timeRecords: TimeRecord[];
  projects: Project[];
  currentProjectId: string | null;
  userGoal: {
    dailyTargetSeconds?: number;
  };
}
```

---

## 🎨 设计原则

基于 Linus Torvalds 的工程建议：

1. **简单胜过聪明** - 数据结构扁平，避免过度抽象
2. **显式胜过隐式** - 状态变化显式触发，不用魔法响应
3. **无聊的代码是好代码** - 五分钟后还能看懂的代码

---

## 🚧 开发中

当前版本为 MVP，后续计划：

- [ ] 时间轮功能（输入输出配比、轮次概念）
- [ ] 数据导出功能
- [ ] 图表可视化
- [ ] 提醒通知

---

## 📝 许可证

MIT

---

> **"记录，就是自己给自己留下的证据。"**
>
> **"我攒下的时间，就永永远远的属于自己，谁也偷不走。"**
