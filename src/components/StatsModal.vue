<template>
  <div class="modal-mask" v-if="show" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>📊 数据统计</h2>
        <button class="close-btn" @click="close">✕</button>
      </div>

      <div class="modal-body">
        <!-- 今日统计 -->
        <div class="stat-section">
          <h3 class="stat-section-title">今日统计</h3>
          <div class="stat-card">
            <div class="stat-label">今日累计</div>
            <div class="stat-value">{{ formatDuration(todayTotal) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">计时次数</div>
            <div class="stat-value">{{ todayCount }}次</div>
          </div>
        </div>

        <!-- 本周统计 -->
        <div class="stat-section">
          <h3 class="stat-section-title">本周统计</h3>
          <div class="stat-card">
            <div class="stat-label">本周累计</div>
            <div class="stat-value">{{ formatDuration(weekTotal) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">日均</div>
            <div class="stat-value">{{ formatDuration(weekAverage) }}</div>
          </div>
        </div>

        <!-- 累计统计 -->
        <div class="stat-section">
          <h3 class="stat-section-title">累计统计</h3>
          <div class="stat-card">
            <div class="stat-label">从开始到现在</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">总时间</div>
            <div class="stat-value">{{ formatDuration(totalTime) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">总天数</div>
            <div class="stat-value">{{ totalDays }}天</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">日均</div>
            <div class="stat-value">{{ formatDuration(overallAverage) }}</div>
          </div>
        </div>

        <!-- "我的数字" -->
        <div class="stat-section" v-if="myNumber !== null">
          <h3 class="stat-section-title">我的数字</h3>
          <div class="my-number-card">
            <div class="my-number-label">基于最近7天的数据</div>
            <div class="my-number-value">{{ formatDuration(myNumber) }}</div>
            <div class="my-number-desc">这是你能稳定输出的平均水平</div>
          </div>
        </div>

        <!-- 设置目标 -->
        <div class="goal-setting" v-if="myNumber !== null">
          <button class="btn btn-primary" @click="showGoalInput = true">
            {{ hasGoal ? '修改目标' : '设置目标' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 目标设置弹窗 -->
    <div class="modal-mask" v-if="showGoalInput" @click.self="showGoalInput = false">
      <div class="modal-content small">
        <div class="modal-header">
          <h2>设置每日目标</h2>
          <button class="close-btn" @click="showGoalInput = false">✕</button>
        </div>

        <div class="modal-body">
          <p class="goal-hint">根据你的数字，建议设置为 {{ formatDuration(myNumber || 0) }}</p>

          <div class="goal-input-group">
            <label>目标时长（小时）</label>
            <input
              type="number"
              v-model.number="goalHours"
              class="input"
              step="0.5"
              min="0.5"
              max="24"
            >
          </div>

          <div class="goal-actions">
            <button class="btn btn-ghost" @click="showGoalInput = false">取消</button>
            <button class="btn btn-primary" @click="saveGoal">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { dataManager } from '@/utils/dataManager';
import { formatDuration } from '@/utils/timeFormat';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 目标输入状态
const showGoalInput = ref(false);
const goalHours = ref(2);

// 计算统计数据
const todayRecords = dataManager.getTodayRecords();
const weekRecords = dataManager.getRecentRecords(7);
const allRecords = dataManager.load().timeRecords;

// 今日统计
const todayTotal = computed(() => {
  return todayRecords.reduce((sum, r) => sum + r.duration, 0);
});

const todayCount = computed(() => todayRecords.length);

// 本周统计
const weekTotal = computed(() => {
  return weekRecords.reduce((sum, r) => sum + r.duration, 0);
});

const weekAverage = computed(() => {
  const days = getDaysInRange(7);
  return days > 0 ? weekTotal.value / days : 0;
});

// 累计统计
const totalTime = computed(() => {
  return allRecords.reduce((sum, r) => sum + r.duration, 0);
});

const totalDays = computed(() => {
  if (allRecords.length === 0) return 0;
  const firstRecord = allRecords[0];
  const days = Math.ceil((Date.now() - firstRecord.start) / (24 * 60 * 60 * 1000));
  return Math.max(days, 1);
});

const overallAverage = computed(() => {
  return totalDays.value > 0 ? totalTime.value / totalDays.value : 0;
});

// 我的数字（7天平均）
const myNumber = computed(() => {
  if (weekRecords.length === 0) return null;
  // 过滤掉异常数据（<1小时或>12小时）
  const validRecords = weekRecords.filter(r => r.duration >= 3600 && r.duration <= 43200);
  if (validRecords.length === 0) return null;

  const total = validRecords.reduce((sum, r) => sum + r.duration, 0);
  const days = getDaysInRange(7);
  return days > 0 ? total / days : null;
});

// 是否已设置目标
const hasGoal = computed(() => {
  return dataManager.getUserGoal() !== undefined;
});

/**
 * 计算范围内的实际天数
 */
function getDaysInRange(days: number): number {
  const records = dataManager.getRecentRecords(days);
  if (records.length === 0) return 0;

  const uniqueDays = new Set(
    records.map(r => {
      const date = new Date(r.start);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    })
  );

  return uniqueDays.size;
}

/**
 * 关闭弹窗
 */
function close(): void {
  emit('update:show', false);
}

/**
 * 保存目标
 */
function saveGoal(): void {
  const targetSeconds = goalHours.value * 3600;
  if (targetSeconds > 0) {
    dataManager.setUserGoal(targetSeconds);
    showGoalInput.value = false;
  }
}

// 监听弹窗打开，更新数据
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 重新加载数据
    const currentGoal = dataManager.getUserGoal();
    if (currentGoal) {
      goalHours.value = currentGoal / 3600;
    } else if (myNumber.value) {
      goalHours.value = Math.round((myNumber.value / 3600) * 10) / 10;
    }
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

.stat-section {
  margin-bottom: var(--spacing-xl);
}

.stat-section:last-child {
  margin-bottom: 0;
}

.stat-section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.stat-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--color-bg);
}

.stat-card:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.my-number-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  text-align: center;
}

.my-number-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: var(--spacing-sm);
}

.my-number-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.my-number-desc {
  font-size: 12px;
  opacity: 0.8;
}

.goal-setting {
  margin-top: var(--spacing-xl);
}

.goal-setting .btn {
  width: 100%;
}

.modal-content.small {
  max-width: 320px;
}

.goal-hint {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

.goal-input-group {
  margin-bottom: var(--spacing-xl);
}

.goal-input-group label {
  display: block;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.goal-input-group .input {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.goal-actions {
  display: flex;
  gap: var(--spacing-md);
}

.goal-actions .btn {
  flex: 1;
}
</style>
