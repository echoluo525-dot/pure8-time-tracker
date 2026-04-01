<template>
  <div class="grids-tab">
    <!-- 顶部标题栏 -->
    <div class="header">
      <div class="project-selector" @click="showProjectList = true">
        <span class="project-name">{{ currentProject?.name || '选择项目' }}</span>
        <span class="dropdown-arrow">▼</span>
      </div>
      <button class="settings-btn" @click="showProjectManage = true">⚙️</button>
    </div>

    <!-- 格子展示区域 -->
    <div class="grids-section" v-if="currentProject">
      <div class="progress-info">
        进度：{{ filledCount }}/{{ currentProject.totalGrids }} 格子
        ({{ progressPercentage }}%)
      </div>

      <div class="grids-container">
        <div
          v-for="(filled, index) in currentProject.grids"
          :key="index"
          class="grid-item"
          :class="{ filled }"
          @click="openGridModal(index)"
        >
          <div class="grid-content" v-if="filled">✓</div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">▦</div>
      <div class="empty-text">还没有项目</div>
      <button class="btn btn-primary" @click="showProjectManage = true">
        创建项目
      </button>
    </div>

    <!-- 项目列表弹窗 -->
    <ProjectListModal
      v-model:show="showProjectList"
      @select="switchProject"
    />

    <!-- 项目管理弹窗 -->
    <ProjectManageModal
      v-model:show="showProjectManage"
      @project-created="onProjectCreated"
      @project-deleted="onProjectDeleted"
    />

    <!-- 绘画弹窗 -->
    <GridDrawModal
      v-model:show="showDrawModal"
      @confirm="confirmFillGrid"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { dataManager } from '@/utils/dataManager';
import ProjectListModal from '@/components/ProjectListModal.vue';
import ProjectManageModal from '@/components/ProjectManageModal.vue';
import GridDrawModal from '@/components/GridDrawModal.vue';
import type { Project } from '@/types';

// UI状态
const showProjectList = ref(false);
const showProjectManage = ref(false);
const showDrawModal = ref(false);

// 当前项目
const currentProject = ref<Project | null>(dataManager.getCurrentProject());

// 当前操作的格子索引
let currentGridIndex = -1;

/**
 * 已填满的格子数
 */
const filledCount = computed(() => {
  if (!currentProject.value) return 0;
  return currentProject.value.grids.filter(g => g).length;
});

/**
 * 进度百分比
 */
const progressPercentage = computed(() => {
  if (!currentProject.value) return 0;
  return Math.round((filledCount.value / currentProject.value.totalGrids) * 100);
});

/**
 * 切换项目
 */
function switchProject(projectId: string): void {
  dataManager.setCurrentProject(projectId);
  currentProject.value = dataManager.getCurrentProject();
  showProjectList.value = false;
}

/**
 * 打开格子绘画弹窗
 */
function openGridModal(index: number): void {
  // 已填满的格子不可再画
  if (currentProject.value?.grids[index]) return;

  currentGridIndex = index;
  showDrawModal.value = true;
}

/**
 * 确认填满格子
 */
function confirmFillGrid(): void {
  if (currentProject.value && currentGridIndex >= 0) {
    dataManager.updateProjectGrid(currentProject.value.id, currentGridIndex, true);
    // 更新当前项目数据
    currentProject.value = dataManager.getCurrentProject();
  }
  showDrawModal.value = false;
}

/**
 * 项目创建后的回调
 */
function onProjectCreated(project: Project): void {
  currentProject.value = project;
  showProjectManage.value = false;
}

/**
 * 项目删除后的回调
 */
function onProjectDeleted(): void {
  currentProject.value = dataManager.getCurrentProject();
}
</script>

<style scoped>
.grids-tab {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.header {
  background: var(--color-white);
  padding: var(--spacing-lg) var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  margin: calc(-1 * var(--spacing-lg));
  margin-bottom: var(--spacing-lg);
}

.project-selector {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s ease;
}

.project-selector:hover {
  background: var(--color-bg);
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.dropdown-arrow {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.settings-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: var(--spacing-sm);
  color: var(--color-text-secondary);
}

/* 格子展示区域 */
.grids-section {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.progress-info {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

.grids-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-sm);
}

.grid-item {
  aspect-ratio: 1;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.grid-item:hover {
  border-color: var(--color-primary);
}

.grid-item.filled {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.grid-item.filled .grid-content {
  color: white;
  font-size: 20px;
  font-weight: 700;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl);
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: var(--color-border);
  margin-bottom: var(--spacing-lg);
}

.empty-text {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}

/* 响应式 */
@media (max-width: 480px) {
  .grids-container {
    grid-template-columns: repeat(5, 1fr);
    gap: var(--spacing-xs);
  }

  .grid-item {
    min-height: 50px;
  }
}
</style>
