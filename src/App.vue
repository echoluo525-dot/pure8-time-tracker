<template>
  <div id="app">
    <!-- 主内容区域 -->
    <component :is="currentTabComponent" class="main-content" />

    <!-- 底部Tab导航 -->
    <div class="tab-bar">
      <div
        class="tab-item"
        :class="{ active: currentTab === 'timer' }"
        @click="switchTab('timer')"
      >
        <div class="tab-icon">⏱</div>
        <div class="tab-label">时间记录</div>
      </div>
      <div
        class="tab-item"
        :class="{ active: currentTab === 'grids' }"
        @click="switchTab('grids')"
      >
        <div class="tab-icon">▦</div>
        <div class="tab-label">画格子</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue';
import TimerTab from './views/TimerTab.vue';
import GridsTab from './views/GridsTab.vue';
import type { TabType } from './types';

// 当前Tab
const currentTab = ref<TabType>('timer');

// Tab组件映射（使用markRaw避免深层响应式）
const tabComponents = {
  timer: markRaw(TimerTab),
  grids: markRaw(GridsTab)
};

// 计算当前显示的组件
const currentTabComponent = computed(() => {
  return tabComponents[currentTab.value];
});

/**
 * 切换Tab
 */
function switchTab(tab: TabType): void {
  currentTab.value = tab;
}
</script>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm);
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: color 0.2s ease;
}

.tab-item.active {
  color: var(--color-primary);
}

.tab-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.tab-label {
  font-size: 12px;
}
</style>
