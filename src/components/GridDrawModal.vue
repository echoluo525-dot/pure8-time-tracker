<template>
  <div class="modal-mask" v-if="show" @click.self="handleCancel">
    <div class="modal-content canvas-modal">
      <div class="modal-header">
        <h2>填满格子</h2>
        <button class="close-btn" @click="handleCancel">✕</button>
      </div>

      <div class="modal-body">
        <div class="canvas-container" ref="containerRef">
          <!-- 边框 -->
          <div class="canvas-border">
            <canvas
              ref="canvasRef"
              @mousedown="handleMouseDown"
              @mousemove="handleMouseMove"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseUp"
              @touchstart.prevent="handleTouchStart"
              @touchmove.prevent="handleTouchMove"
              @touchend="handleTouchEnd"
            ></canvas>
          </div>
        </div>

        <p class="hint-text">✏️ 在格子里画，填满后点击确定</p>

        <div class="canvas-actions">
          <button class="btn btn-ghost" @click="clearCanvas">清空</button>
          <button class="btn btn-ghost" @click="handleCancel">取消</button>
          <button class="btn btn-primary" @click="handleConfirm">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import type { Point } from '@/types';

interface Props {
  show: boolean;
}

interface Emits {
  (e: 'update:show', value: boolean): void;
  (e: 'confirm'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Canvas相关
const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

// 绘画状态
const isDrawing = ref(false);
const points = ref<Point[]>([]);
const maxPoints = 200; // 限制笔触数量

/**
 * 初始化Canvas
 */
async function initCanvas(): Promise<void> {
  await nextTick();
  const canvas = canvasRef.value;
  const container = containerRef.value;

  if (!canvas || !container) return;

  // 设置Canvas尺寸
  const size = Math.min(container.clientWidth - 40, 300);
  const dpr = window.devicePixelRatio || 1;

  // 设置实际像素大小（适配高清屏）
  canvas.width = size * dpr;
  canvas.height = size * dpr;

  // 设置CSS显示尺寸
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  // 获取绘图上下文
  const context = canvas.getContext('2d');
  if (!context) return;

  // 缩放上下文以适配设备像素比
  context.scale(dpr, dpr);

  // 设置线条样式
  context.strokeStyle = '#1890ff';
  context.lineWidth = 3;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  ctx.value = context;
}

/**
 * 获取触摸/鼠标坐标
 */
function getCoordinates(event: MouseEvent | Touch): Point {
  const canvas = canvasRef.value;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

/**
 * 开始绘画
 */
function startDrawing(x: number, y: number): void {
  if (points.value.length >= maxPoints) return;

  isDrawing.value = true;
  points.value.push({ x, y });

  const context = ctx.value;
  if (!context) return;

  context.beginPath();
  context.moveTo(x, y);
}

/**
 * 绘画中
 */
function draw(x: number, y: number): void {
  if (!isDrawing.value) return;
  if (points.value.length >= maxPoints) return;

  points.value.push({ x, y });

  const context = ctx.value;
  if (!context) return;

  context.lineTo(x, y);
  context.stroke();
}

/**
 * 停止绘画
 */
function stopDrawing(): void {
  isDrawing.value = false;
}

/**
 * 鼠标事件处理
 */
function handleMouseDown(event: MouseEvent): void {
  const coords = getCoordinates(event);
  startDrawing(coords.x, coords.y);
}

function handleMouseMove(event: MouseEvent): void {
  const coords = getCoordinates(event);
  draw(coords.x, coords.y);
}

function handleMouseUp(): void {
  stopDrawing();
}

/**
 * 触摸事件处理（移动端）
 * 关键：使用 preventDefault 阻止页面滚动
 */
function handleTouchStart(event: TouchEvent): void {
  const touch = event.touches[0];
  const coords = getCoordinates(touch);
  startDrawing(coords.x, coords.y);
}

function handleTouchMove(event: TouchEvent): void {
  const touch = event.touches[0];
  const coords = getCoordinates(touch);
  draw(coords.x, coords.y);
}

function handleTouchEnd(): void {
  stopDrawing();
}

/**
 * 清空画布
 */
function clearCanvas(): void {
  const canvas = canvasRef.value;
  const context = ctx.value;

  if (!canvas || !context) return;

  // 清空画布
  context.clearRect(0, 0, canvas.width, canvas.height);

  // 清空点数组
  points.value = [];
}

/**
 * 确认填满
 */
function handleConfirm(): void {
  if (points.value.length === 0) {
    // 如果没有画任何内容，也允许确认
  }
  emit('confirm');
}

/**
 * 取消
 */
function handleCancel(): void {
  clearCanvas();
  emit('update:show', false);
}

/**
 * 打开弹窗时，禁用背景滚动
 */
watch(() => props.show, async (newVal) => {
  if (newVal) {
    // 禁用背景滚动
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    // 初始化Canvas
    await initCanvas();
  } else {
    // 恢复背景滚动
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';

    // 清空画布
    clearCanvas();
  }
});
</script>

<style scoped>
.canvas-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.canvas-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
}

.canvas-border {
  border: 4px solid var(--color-primary);
  border-radius: var(--radius-md);
  display: inline-block;
  background: white;
}

canvas {
  display: block;
  touch-action: none; /* 禁用浏览器默认触摸行为 */
  cursor: crosshair;
}

.hint-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.canvas-actions {
  display: flex;
  gap: var(--spacing-md);
  width: 100%;
}

.canvas-actions .btn {
  flex: 1;
}
</style>
