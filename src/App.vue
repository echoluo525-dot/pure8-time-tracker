<template>
  <div id="app">
    <!-- 未登录：显示登录页 -->
    <LoginPage
      v-if="!isLoggedIn"
      @login="handleLogin"
      @skip="handleSkip"
    />

    <!-- 已登录：显示主界面 -->
    <template v-else>
      <!-- 顶部用户栏 -->
      <div class="user-bar" v-if="currentUser">
        <div class="user-info">
          <img v-if="currentUser.picture" :src="currentUser.picture" class="user-avatar" alt="avatar" />
          <span class="user-name">{{ currentUser.name }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </div>

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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw, onMounted } from 'vue';
import TimerTab from './views/TimerTab.vue';
import GridsTab from './views/GridsTab.vue';
import LoginPage from './components/LoginPage.vue';
import { getStoredUser, googleLogout } from './utils/googleAuth';
import type { TabType, GoogleUser } from './types';

// 用户状态
const currentUser = ref<GoogleUser | null>(null);
const isLoggedIn = ref(false);

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

/**
 * Google 登录成功
 */
function handleLogin(user: GoogleUser): void {
  currentUser.value = user;
  isLoggedIn.value = true;
}

/**
 * 跳过登录（直接使用）
 */
function handleSkip(): void {
  currentUser.value = null;
  isLoggedIn.value = true;
}

/**
 * 退出登录
 */
function handleLogout(): void {
  googleLogout();
  currentUser.value = null;
  isLoggedIn.value = false;
}

/**
 * 监听 LoginPage 发出的全局事件
 * （因为 Google 回调是全局的，通过 CustomEvent 传递）
 */
onMounted(() => {
  // 检查是否已登录
  const stored = getStoredUser();
  if (stored) {
    currentUser.value = stored;
    isLoggedIn.value = true;
  }

  // 监听登录事件
  window.addEventListener('google-login', ((e: CustomEvent) => {
    handleLogin(e.detail);
  }) as EventListener);
});
</script>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部用户栏 */
.user-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
}

.logout-btn {
  font-size: 12px;
  color: var(--color-text-tertiary);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 4px 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  color: var(--color-danger);
  border-color: var(--color-danger);
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
