<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Logo / 标题 -->
      <div class="login-header">
        <div class="login-logo">⏱</div>
        <h1 class="login-title">纯8+ 时间记录</h1>
        <p class="login-subtitle">让时间努力看得见</p>
      </div>

      <!-- Google 登录按钮容器 -->
      <div class="login-action">
        <div id="google-login-button"></div>
        <div v-if="loading" class="login-loading">加载登录组件...</div>
      </div>

      <!-- 或者跳过登录 -->
      <div class="login-skip" @click="$emit('skip')">
        暂不登录，直接使用 →
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { renderGoogleButton, initGoogleAuth } from '@/utils/googleAuth';
import type { GoogleUser } from '@/types';

defineEmits<{
  (e: 'login', user: GoogleUser): void;
  (e: 'skip'): void;
}>();

const loading = ref(true);

onMounted(async () => {
  await initGoogleAuth();
  loading.value = false;
  renderGoogleButton('google-login-button', (user) => {
    // 通过全局事件通知 App.vue
    window.dispatchEvent(
      new CustomEvent('google-login', { detail: user })
    );
  });
});
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: var(--color-white);
  border-radius: 20px;
  padding: 48px 32px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
  margin-bottom: 40px;
}

.login-logo {
  font-size: 64px;
  margin-bottom: 16px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.login-action {
  margin-bottom: 24px;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 让 Google 按钮居中 */
.login-action > div {
  width: 100%;
  display: flex;
  justify-content: center;
}

.login-loading {
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.login-skip {
  color: var(--color-text-tertiary);
  font-size: 14px;
  cursor: pointer;
  padding: var(--spacing-md);
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.login-skip:hover {
  color: var(--color-primary);
}
</style>
