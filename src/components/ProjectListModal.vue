<template>
  <div class="modal-mask" v-if="show" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>选择项目</h2>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="modal-body">
        <div
          v-for="project in projects"
          :key="project.id"
          class="project-item"
          :class="{ active: project.id === currentProjectId }"
          @click="selectProject(project.id)"
        >
          <div class="project-info">
            <div class="project-name">{{ project.name }}</div>
            <div class="project-progress">
              {{ getFilledCount(project) }}/{{ project.totalGrids }} 格子
            </div>
          </div>
          <div class="project-check" v-if="project.id === currentProjectId">✓</div>
        </div>

        <div class="empty-projects" v-if="projects.length === 0">
          <div class="empty-text">还没有项目</div>
          <button class="btn btn-primary" @click="goToCreate">
            创建项目
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { dataManager } from '@/utils/dataManager';
import type { Project } from '@/types';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'select', projectId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 项目列表
const projects = dataManager.getAllProjects();
const currentProjectId = dataManager.load().currentProjectId;

/**
 * 获取已填满格子数
 */
function getFilledCount(project: Project): number {
  return project.grids.filter(g => g).length;
}

/**
 * 选择项目
 */
function selectProject(projectId: string): void {
  emit('select', projectId);
  close();
}

/**
 * 关闭弹窗
 */
function close(): void {
  emit('update:show', false);
}

/**
 * 跳转到创建项目
 */
function goToCreate(): void {
  close();
  // 这里可以触发打开创建弹窗的事件
  // 通过父组件处理
}
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

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s ease;
  margin-bottom: var(--spacing-sm);
}

.project-item:hover {
  background: var(--color-bg);
}

.project-item.active {
  background: var(--color-primary);
  color: white;
}

.project-info {
  flex: 1;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.project-progress {
  font-size: 14px;
  opacity: 0.8;
}

.project-check {
  font-size: 20px;
  font-weight: 700;
}

.empty-projects {
  text-align: center;
  padding: var(--spacing-xxl) 0;
}

.empty-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}
</style>
