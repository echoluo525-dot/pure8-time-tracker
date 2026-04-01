import type { AppData, TimeRecord, Project, UserGoal } from '@/types';

/**
 * 数据管理器
 * 负责数据的持久化存储和读取
 */
class DataManager {
  private static readonly STORAGE_KEY = 'pure8plus_data';

  /**
   * 读取数据
   * 如果读取失败或无数据，返回空数据结构
   */
  load(): AppData {
    try {
      const raw = localStorage.getItem(DataManager.STORAGE_KEY);
      if (!raw) {
        return this.getEmptyData();
      }
      const data = JSON.parse(raw) as AppData;
      // 数据结构验证，确保字段完整
      return this.validateAndFix(data);
    } catch (error) {
      console.error('数据读取失败，使用空数据:', error);
      return this.getEmptyData();
    }
  }

  /**
   * 保存数据
   * 原子写入：先序列化，再一次性存储
   */
  save(data: AppData): void {
    try {
      const json = JSON.stringify(data);
      localStorage.setItem(DataManager.STORAGE_KEY, json);
    } catch (error) {
      console.error('数据保存失败:', error);
      throw new Error('数据保存失败，请检查存储空间');
    }
  }

  /**
   * 获取空数据结构
   */
  private getEmptyData(): AppData {
    return {
      timeRecords: [],
      projects: [],
      currentProjectId: null,
      userGoal: {}
    };
  }

  /**
   * 数据结构验证和修复
   * 确保数据结构完整，避免字段缺失导致的错误
   */
  private validateAndFix(data: any): AppData {
    const fixed: AppData = {
      timeRecords: Array.isArray(data.timeRecords) ? data.timeRecords : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      currentProjectId: data.currentProjectId || null,
      userGoal: data.userGoal || {}
    };
    return fixed;
  }

  /**
   * 添加时间记录
   */
  addTimeRecord(record: TimeRecord): void {
    const data = this.load();
    data.timeRecords.push(record);
    this.save(data);
  }

  /**
   * 获取今日所有记录
   */
  getTodayRecords(): TimeRecord[] {
    const data = this.load();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    return data.timeRecords.filter(record => record.start >= todayTimestamp);
  }

  /**
   * 获取最近N天的记录
   */
  getRecentRecords(days: number): TimeRecord[] {
    const data = this.load();
    const now = Date.now();
    const daysAgo = now - (days * 24 * 60 * 60 * 1000);

    return data.timeRecords.filter(record => record.start >= daysAgo);
  }

  /**
   * 创建项目
   */
  createProject(name: string, totalGrids: number): Project {
    const data = this.load();
    const project: Project = {
      id: this.generateId(),
      name,
      totalGrids,
      grids: new Array(totalGrids).fill(false),
      createdAt: Date.now()
    };
    data.projects.push(project);
    data.currentProjectId = project.id;
    this.save(data);
    return project;
  }

  /**
   * 更新项目格子状态
   */
  updateProjectGrid(projectId: string, gridIndex: number, filled: boolean): void {
    const data = this.load();
    const project = data.projects.find(p => p.id === projectId);
    if (project && gridIndex >= 0 && gridIndex < project.grids.length) {
      project.grids[gridIndex] = filled;
      this.save(data);
    }
  }

  /**
   * 删除项目
   */
  deleteProject(projectId: string): void {
    const data = this.load();
    data.projects = data.projects.filter(p => p.id !== projectId);
    if (data.currentProjectId === projectId) {
      data.currentProjectId = data.projects.length > 0 ? data.projects[0].id : null;
    }
    this.save(data);
  }

  /**
   * 切换当前项目
   */
  setCurrentProject(projectId: string): void {
    const data = this.load();
    const project = data.projects.find(p => p.id === projectId);
    if (project) {
      data.currentProjectId = projectId;
      this.save(data);
    }
  }

  /**
   * 获取当前项目
   */
  getCurrentProject(): Project | null {
    const data = this.load();
    if (!data.currentProjectId) return null;
    return data.projects.find(p => p.id === data.currentProjectId) || null;
  }

  /**
   * 获取所有项目
   */
  getAllProjects(): Project[] {
    const data = this.load();
    return data.projects;
  }

  /**
   * 设置用户目标
   */
  setUserGoal(dailyTargetSeconds: number): void {
    const data = this.load();
    data.userGoal.dailyTargetSeconds = dailyTargetSeconds;
    this.save(data);
  }

  /**
   * 获取用户目标
   */
  getUserGoal(): number | undefined {
    const data = this.load();
    return data.userGoal.dailyTargetSeconds;
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例
export const dataManager = new DataManager();
