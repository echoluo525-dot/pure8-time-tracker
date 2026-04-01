<template>
  <div class="modal-mask" v-if="show" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ mode === 'list' ? '项目管理' : '创建项目' }}</h2>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="modal-body">
        <!-- 列表模式 -->
        <template v-if="mode === 'list'">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-item"
          >
            <div class="project-info">
              <div class="project-name">{{ project.name }}</div>
              <div class="project-meta">
                {{ getFilledCount(project) }}/{{ project.totalGrids }} 格子 ·
                {{ formatDate(project.createdAt) }}
              </div>
            </div>
            <button
              class="btn-delete"
              @click="confirmDelete(project)"
            >
              删除
            </button>
          </div>

          <div class="empty-state" v-if="projects.length === 0">
            <div class="empty-text">还没有项目</div>
          </div>

          <button class="btn btn-primary" @click="mode = 'create'" style="width: 100%; margin-top: var(--spacing-lg);">
            + 创建新项目
          </button>
        </template>

        <!-- 创建模式 -->
        <template v-else>
          <div class="form-group">
            <label class="form-label">项目名称</label>
            <input
              v-model="formData.name"
              type="text"
              class="input"
              placeholder="如：写作练习、背单词"
            >
          </div>

          <div class="form-group">
            <label class="form-label">任务数</label>
            <input
              v-model.number="formData.totalGrids"
              type="number"
              class="input"
              placeholder="总共需要完成多少个任务？"
              min="1"
              max="1000"
            >
          </div>

          <div class="form-hint">
            💡 不知道怎么定任务数？
            <button class="btn-link" @click="showExamples = true">查看拆分示例</button>
          </div>

          <div class="form-actions">
            <button class="btn btn-ghost" @click="mode = 'list'">取消</button>
            <button class="btn btn-primary" @click="createProject">创建</button>
          </div>
        </template>
      </div>
    </div>

    <!-- 拆分示例弹窗 -->
    <div class="modal-mask" v-if="showExamples" @click.self="showExamples = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>如何拆分任务数？</h2>
          <button class="close-btn" @click="showExamples = false">✕</button>
        </div>

        <div class="modal-body">
          <p class="hint-text">用倒推法：从大目标倒推任务数</p>

          <div class="example-item">
            <div class="example-title">📚 备考英语</div>
            <div class="example-desc">目标：做50篇阅读理解</div>
            <div class="example-result">任务数：50个（1篇=1个格子）</div>
          </div>

          <div class="example-item">
            <div class="example-title">📖 背单词</div>
            <div class="example-desc">目标：背3000个单词，时间：100天</div>
            <div class="example-result">任务数：100个（每天30个=1个格子）</div>
          </div>

          <div class="example-item">
            <div class="example-title">📝 读书计划</div>
            <div class="example-desc">目标：读12本书</div>
            <div class="example-result">任务数：12个（1本=1个格子）</div>
          </div>

          <div class="tips-box">
            <div class="tips-title">💡 小技巧：</div>
            <ul class="tips-list">
              <li>先想清楚最终目标是什么</li>
              <li>再估算总共需要完成多少件事</li>
              <li>不知道也没关系，先填个大概的，后期可以调整</li>
            </ul>
          </div>

          <button class="btn btn-primary" @click="showExamples = false" style="width: 100%;">
            我知道了
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="modal-mask" v-if="showDeleteConfirm" @click.self="showDeleteConfirm = false">
      <div class="modal-content small">
        <div class="modal-header">
          <h2>确认删除</h2>
          <button class="close-btn" @click="showDeleteConfirm = false">✕</button>
        </div>

        <div class="modal-body">
          <p class="confirm-text">确定要删除"{{ projectToDelete?.name }}"吗？</p>

          <div class="warning-box">
            ⚠️ 删除后无法恢复
            <div class="warning-detail">已填满的 {{ getFilledCount(projectToDelete!) }} 个格子将丢失</div>
          </div>

          <div class="confirm-actions">
            <button class="btn btn-ghost" @click="showDeleteConfirm = false">取消</button>
            <button class="btn btn-danger" @click="executeDelete">确认删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import { dataManager } from '@/utils/dataManager';
import type { Project } from '@/types';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'project-created', project: Project): void;
  (e: 'project-deleted'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 模式：list-列表, create-创建
const mode = ref<'list' | 'create'>('list');

// 表单数据
const formData = reactive({
  name: '',
  totalGrids: 50
});

// UI状态
const showExamples = ref(false);
const showDeleteConfirm = ref(false);
const projectToDelete = ref<Project | null>(null);

// 项目列表
const projects = dataManager.getAllProjects();

/**
 * 获取已填满格子数
 */
function getFilledCount(project: Project): number {
  return project.grids.filter(g => g).length;
}

/**
 * 格式化日期
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * 关闭弹窗
 */
function close(): void {
  emit('update:show', false);
  // 延迟重置模式，避免动画时闪烁
  setTimeout(() => {
    mode.value = 'list';
    formData.name = '';
    formData.totalGrids = 50;
  }, 300);
}

/**
 * 创建项目
 */
function createProject(): void {
  if (!formData.name.trim()) {
    alert('请输入项目名称');
    return;
  }

  if (formData.totalGrids < 1) {
    alert('任务数至少为1');
    return;
  }

  try {
    const project = dataManager.createProject(
      formData.name.trim(),
      formData.totalGrids
    );
    emit('project-created', project);

    // 重置表单
    formData.name = '';
    formData.totalGrids = 50;
    mode.value = 'list';
  } catch (error) {
    alert('创建失败，请重试');
  }
}

/**
 * 确认删除
 */
function confirmDelete(project: Project): void {
  projectToDelete.value = project;
  showDeleteConfirm.value = true;
}

/**
 * 执行删除
 */
function executeDelete(): void {
  if (projectToDelete.value) {
    dataManager.deleteProject(projectToDelete.value.id);
    emit('project-deleted');
    showDeleteConfirm.value = false;
    projectToDelete.value = null;
  }
}

// 监听弹窗打开，重置状态
watch(() => props.show, (newVal) => {
  if (newVal) {
    mode.value = 'list';
    formData.name = '';
    formData.totalGrids = 50;
  }
});
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-tertiary);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  max-height: 60vh;
  overflow-y: auto;
}

/* 项目列表 */
.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}

.project-info {
  flex: 1;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.project-meta {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.btn-delete {
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
  padding: var(--spacing-sm);
}

/* 表单 */
.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-label {
  display: block;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.form-hint {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.btn-link {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
}

.form-actions .btn {
  flex: 1;
}

/* 拆分示例 */
.hint-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.example-item {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.example-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.example-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.example-result {
  font-size: 14px;
  color: var(--color-primary);
  font-weight: 600;
}

.tips-box {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.tips-title {
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
}

.tips-list li {
  margin-bottom: 4px;
}

/* 删除确认 */
.modal-content.small {
  max-width: 320px;
}

.confirm-text {
  font-size: 16px;
  margin-bottom: var(--spacing-lg);
}

.warning-box {
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  color: var(--color-danger);
}

.warning-detail {
  font-size: 14px;
  margin-top: 4px;
  opacity: 0.8;
}

.confirm-actions {
  display: flex;
  gap: var(--spacing-md);
}

.confirm-actions .btn {
  flex: 1;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: var(--spacing-xxl) 0;
}

.empty-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}
</style>
