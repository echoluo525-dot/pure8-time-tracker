/**
 * 时间格式化工具函数
 */

/**
 * 格式化时间显示（精确到秒）
 * @param seconds 秒数
 * @returns 格式化的时间字符串 HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * 格式化时长显示（精确到分钟）
 * @param seconds 秒数
 * @returns 格式化的时长字符串 X小时Y分钟
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}

/**
 * 格式化时长简写
 * @param seconds 秒数
 * @returns 格式化的时长字符串 XhYm 或 XmYs
 */
export function formatDurationShort(seconds: number): string {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * 格式化时间段显示
 * @param startTimestamp 开始时间戳（毫秒）
 * @param durationSeconds 持续时间（秒）
 * @returns 格式化的时间段字符串 HH:MM - HH:MM
 */
export function formatTimeRange(startTimestamp: number, durationSeconds: number): string {
  const startDate = new Date(startTimestamp);
  const endDate = new Date(startTimestamp + durationSeconds * 1000);

  const formatTime = (date: Date) => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return `${formatTime(startDate)} - ${formatTime(endDate)}`;
}

/**
 * 获取今日0点时间戳
 */
export function getTodayStart(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

/**
 * 获取本周一0点时间戳
 */
export function getWeekStart(): number {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}
