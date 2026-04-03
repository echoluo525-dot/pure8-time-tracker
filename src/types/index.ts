/**
 * 时间记录
 * 使用 timestamp + duration 存储，避免存储结束时间
 */
export interface TimeRecord {
  start: number;        // Unix timestamp (毫秒)
  duration: number;     // 秒数
}

/**
 * 项目
 * 使用布尔数组存储格子状态，不存储图片
 */
export interface Project {
  id: string;           // UUID
  name: string;         // 项目名称
  totalGrids: number;   // 总格子数
  grids: boolean[];     // 格子状态数组 [false, true, false, ...]
  createdAt: number;    // 创建时间
}

/**
 * 用户目标
 */
export interface UserGoal {
  dailyTargetSeconds?: number;  // 每日目标秒数（可选）
}

/**
 * 全局数据结构
 * 扁平化设计，避免嵌套关联
 */
export interface AppData {
  timeRecords: TimeRecord[];
  projects: Project[];
  currentProjectId: string | null;
  userGoal: UserGoal;
  userId?: string;  // Google 用户 ID，用于区分用户数据
}

/**
 * Google 用户信息（从 JWT 解析）
 */
export interface GoogleUser {
  sub: string;        // Google 唯一用户 ID
  email: string;
  name: string;
  picture: string;    // 头像 URL
}

/**
 * Tab类型
 */
export type TabType = 'timer' | 'grids';

/**
 * 格子绘画点坐标
 */
export interface Point {
  x: number;
  y: number;
}
