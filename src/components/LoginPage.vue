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
        <!-- GIS 按钮容器（由 Google SDK 渲染） -->
        <div id="google-login-button" v-show="sdkReady"></div>

        <!-- SDK 加载中 -->
        <div v-if="!sdkReady && !sdkFailed" class="login-loading">
          <span class="loading-spinner"></span>
          正在加载 Google 登录...
        </div>

        <!-- SDK 加载失败，显示手动按钮 -->
        <button
          v-if="sdkFailed"
          class="manual-login-btn"
          @click="handleManualLogin"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" style="margin-right:8px">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          使用 Google 登录
        </button>
      </div>

      <!-- 分隔线 -->
      <div class="login-divider">
        <span>或者</span>
      </div>

      <!-- 跳过登录 -->
      <div class="login-skip" @click="$emit('skip')">
        暂不登录，直接使用
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

const sdkReady = ref(false);
const sdkFailed = ref(false);

function onLogin(user: GoogleUser) {
  window.dispatchEvent(
    new CustomEvent('google-login', { detail: user })
  );
}

/**
 * SDK 加载失败时的手动登录
 * 尝试触发 One Tap 或重新初始化
 */
function handleManualLogin() {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.prompt();
  } else {
    // 真的加载不了，提示用户
    alert('Google 登录组件加载失败，请检查网络或刷新页面重试。你也可以点击"暂不登录"直接使用。');
  }
}

onMounted(async () => {
  try {
    await initGoogleAuth();
    sdkReady.value = !!window.google?.accounts?.id;

    if (sdkReady.value) {
      renderGoogleButton('google-login-button', onLogin);
    } else {
      sdkFailed.value = true;
    }
  } catch {
    sdkFailed.value = true;
  }
});
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: #fff;
  border-radius: 20px;
  padding: 48px 32px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
  margin-bottom: 36px;
}

.login-logo {
  font-size: 64px;
  margin-bottom: 12px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #999;
}

/* Google 按钮区域 */
.login-action {
  margin-bottom: 20px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Google SDK 渲染的按钮居中 */
.login-action :deep(iframe) {
  margin: 0 auto;
}

#google-login-button {
  width: 100%;
  display: flex;
  justify-content: center;
}

.login-loading {
  color: #999;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #e8e8e8;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 手动 Google 登录按钮 */
.manual-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 280px;
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 auto;
}

.manual-login-btn:hover {
  background: #f8f8f8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.manual-login-btn:active {
  transform: scale(0.98);
}

/* 分隔线 */
.login-divider {
  display: flex;
  align-items: center;
  margin: 16px 0;
  color: #ccc;
  font-size: 12px;
}

.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e8e8e8;
}

.login-divider span {
  padding: 0 12px;
}

/* 跳过登录 */
.login-skip {
  color: #999;
  font-size: 14px;
  cursor: pointer;
  padding: 12px;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.login-skip:hover {
  color: #1890ff;
}
</style>
