/**
 * 秒表类
 * 使用 performance.now() 实现高精度计时
 * 不受系统时间调整影响
 */
export class Stopwatch {
  private startTime: number = 0;
  private elapsedBeforePause: number = 0;
  private isRunning: boolean = false;

  /**
   * 开始计时
   */
  start(): void {
    if (!this.isRunning) {
      this.startTime = performance.now();
      this.isRunning = true;
    }
  }

  /**
   * 暂停计时
   */
  pause(): void {
    if (this.isRunning) {
      this.elapsedBeforePause += performance.now() - this.startTime;
      this.isRunning = false;
    }
  }

  /**
   * 重置计时
   */
  reset(): void {
    this.startTime = 0;
    this.elapsedBeforePause = 0;
    this.isRunning = false;
  }

  /**
   * 获取已过时间（秒）
   */
  get elapsedSeconds(): number {
    if (this.isRunning) {
      return (this.elapsedBeforePause + (performance.now() - this.startTime)) / 1000;
    }
    return this.elapsedBeforePause / 1000;
  }

  /**
   * 获取计时状态
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * 格式化时间显示
   * @param seconds 秒数
   * @returns 格式化的时间字符串 HH:MM:SS
   */
  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * 格式化时长显示
   * @param seconds 秒数
   * @returns 格式化的时长字符串 XhYm
   */
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h${minutes}m`;
    }
    return `${minutes}m`;
  }
}
