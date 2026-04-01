<template>
  <div class="timer-tab">
    <!-- 顶部标题 -->
    <div class="header">
      ⏱ 时间记录
    </div>

    <!-- 计时器区域 -->
    <div class="timer-section">
      <div class="timer-circle" :class="{ paused: !isRunning, running: isRunning }">
        {{ formattedTime }}
      </div>
      <button
        class="timer-button"
        :class="isRunning ? 'stop' : 'start'"
        @click="toggleTimer"
      >
        {{ isRunning ? '停止计时' : '开始计时' }}
      </button>
    </div>

    <!-- 今日记录 -->
    <div class="records-section card" v-if="todayRecords.length > 0">
      <div class="section-title">今日记录</div>
      <div
        v-for="record in sortedTodayRecords"
        :key="record.start"
        class="record-item"
      >
        <span class="record-time">{{ formatTimeRange(record.start, record.duration) }}</span>
        <span class="record-duration">{{ formatDurationShort(record.duration) }}</span>
      </div>
    </div>

    <!-- 今日累计 -->
    <div class="summary-section card">
      <span class="summary-label">今日累计</span>
      <span class="summary-value">{{ formatDuration(todayTotalSeconds) }}</span>
    </div>

    <!-- 今日目标（如果设置了） -->
    <div class="goal-section card" v-if="userGoalSeconds">
      <div>
        <div class="goal-label">今日目标</div>
        <div class="goal-progress">完成度 {{ goalProgress }}%</div>
      </div>
      <span class="goal-value">{{ formatDuration(userGoalSeconds) }}</span>
    </div>

    <!-- 查看详细统计 -->
    <div class="stats-entry card clickable" @click="showStats = true">
      <div class="stats-entry-text">
        📊 查看详细统计
      </div>
      <span class="stats-entry-arrow">→</span>
    </div>

    <!-- 统计页弹窗 -->
    <StatsModal v-model:show="showStats" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { Stopwatch } from '@/utils/stopwatch';
import { dataManager } from '@/utils/dataManager';
import { formatTime, formatDurationShort, formatDuration, formatTimeRange } from '@/utils/timeFormat';
import StatsModal from '@/components/StatsModal.vue';
import type { TimeRecord } from '@/types';

// 秒表实例
const stopwatch = new Stopwatch();

// 用响应式 tick 计数器驱动 UI 更新
const tick = ref(0);

// UI状态
const showStats = ref(false);

// 今日记录
const todayRecords = ref<TimeRecord[]>(dataManager.getTodayRecords());

// 用户目标（秒）
const userGoalSeconds = computed(() => dataManager.getUserGoal());

// 是否正在计时（响应式）
const isRunning = ref(false);

/**
 * 格式化显示时间（依赖 tick 触发重新计算）
 */
const formattedTime = computed(() => {
  tick.value; // 依赖 tick，每次 tick 变化时重新计算
  return formatTime(stopwatch.elapsedSeconds);
});

/**
 * 今日记录按开始时间排序
 */
const sortedTodayRecords = computed(() => {
  return [...todayRecords.value].sort((a, b) => b.start - a.start);
});

/**
 * 今日总时长（秒）
 */
const todayTotalSeconds = computed(() => {
  return todayRecords.value.reduce((sum, record) => sum + record.duration, 0);
});

/**
 * 目标完成度百分比
 */
const goalProgress = computed(() => {
  if (!userGoalSeconds.value) return 0;
  return Math.round((todayTotalSeconds.value / userGoalSeconds.value) * 100);
});

/**
 * 切换计时器状态
 */
function toggleTimer(): void {
  if (isRunning.value) {
    // 停止计时
    stopwatch.pause();

    // 保存记录（至少5秒才保存，避免误触产生0m记录）
    const duration = Math.round(stopwatch.elapsedSeconds);
    if (duration >= 5) {
      const record: TimeRecord = {
        start: Date.now() - duration * 1000,
        duration
      };
      dataManager.addTimeRecord(record);

      // 更新今日记录
      todayRecords.value = dataManager.getTodayRecords();
    }

    // 重置秒表
    stopwatch.reset();
    isRunning.value = false;
  } else {
    // 开始计时
    stopwatch.start();
    isRunning.value = true;
  }
}

// 定时更新显示：每秒递增 tick 驱动 computed 重算
let updateInterval: number | null = null;

if (typeof window !== 'undefined') {
  updateInterval = window.setInterval(() => {
    if (stopwatch.running) {
      tick.value++;
    }
  }, 1000);
}

onUnmounted(() => {
  if (updateInterval !== null) {
    clearInterval(updateInterval);
  }
});
</script>

<style scoped>
.timer-tab {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.header {
  background: var(--color-white);
  padding: var(--spacing-lg) var(--spacing-xl);
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
  margin: calc(-1 * var(--spacing-lg));
  margin-bottom: var(--spacing-lg);
}

/* 计时器区域 */
.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-xxl);
}

.timer-circle {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  border: 8px solid var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  font-weight: 600;
  font-feature-settings: "tnum";
  color: var(--color-primary);
  margin-bottom: var(--spacing-xl);
}

.timer-circle.paused {
  border-color: var(--color-text-tertiary);
  color: var(--color-text-tertiary);
}

.timer-circle.running {
  border-color: var(--color-primary);
  color: var(--color-primary);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.2); }
  50% { box-shadow: 0 0 0 16px rgba(24, 144, 255, 0); }
}

.timer-button {
  padding: 14px 48px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.timer-button.start {
  background: var(--color-primary);
  color: var(--color-white);
}

.timer-button.start:hover {
  background: var(--color-primary-hover);
}

.timer-button.stop {
  background: var(--color-danger);
  color: var(--color-white);
}

.timer-button.stop:hover {
  background: #ff7875;
}

/* 记录列表 */
.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-bg);
}

.record-item:last-child {
  border-bottom: none;
}

.record-time {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.record-duration {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

/* 今日累计 */
.summary-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 16px;
  color: var(--color-text-secondary);
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
}

/* 今日目标 */
.goal-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid var(--color-success);
}

.goal-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.goal-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-success);
}

.goal-progress {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin-top: 4px;
}

/* 统计入口 */
.stats-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-entry-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 16px;
  color: var(--color-text);
}

.stats-entry-arrow {
  color: var(--color-text-tertiary);
}

/* 响应式 */
@media (max-width: 480px) {
  .timer-circle {
    width: 200px;
    height: 200px;
    font-size: 36px;
  }
}
</style>
