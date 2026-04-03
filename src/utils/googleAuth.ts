/**
 * Google OAuth 登录工具
 * 使用 Google Identity Services (GIS) 纯前端方案
 */
import type { GoogleUser } from '@/types';

const GOOGLE_CLIENT_ID = '780048286767-11i2f9mci9fsr5u5iirhrc2obap61hg5.apps.googleusercontent.com';

// localStorage key
const USER_STORAGE_KEY = 'pure8plus_google_user';

/**
 * 解析 JWT token（纯前端，不需要后端）
 */
function parseJwt(token: string): GoogleUser {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

/**
 * 从 localStorage 读取已登录用户
 */
export function getStoredUser(): GoogleUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * 保存用户到 localStorage
 */
function storeUser(user: GoogleUser): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

/**
 * 清除已登录用户
 */
export function clearStoredUser(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * 初始化 Google Identity Services
 * 返回 Promise，resolve 时说明 GIS 已就绪（或超时）
 */
export function initGoogleAuth(): Promise<boolean> {
  return new Promise((resolve) => {
    // 如果已经加载过，直接返回
    if (window.google?.accounts?.id) {
      resolve(true);
      return;
    }

    let resolved = false;
    const done = (ok: boolean) => {
      if (resolved) return;
      resolved = true;
      clearInterval(checkInterval);
      clearTimeout(timeout);
      resolve(ok);
    };

    // 等待 GIS SDK 加载
    const checkInterval = setInterval(() => {
      if (window.google?.accounts?.id) {
        done(true);
      }
    }, 200);

    // 超时 5 秒
    const timeout = setTimeout(() => {
      done(false);
    }, 5000);
  });
}

/**
 * 渲染 Google 登录按钮并初始化 One Tap
 * @param containerId 放置按钮的 DOM 容器 ID
 * @param onLogin 登录成功回调
 */
export function renderGoogleButton(
  containerId: string,
  onLogin: (user: GoogleUser) => void
): void {
  if (!window.google?.accounts?.id) {
    console.warn('Google Identity Services 未加载');
    return;
  }

  // 初始化
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response: { credential: string }) => {
      const user = parseJwt(response.credential);
      storeUser(user);
      onLogin(user);
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  // 渲染按钮
  window.google.accounts.id.renderButton(
    document.getElementById(containerId)!,
    {
      theme: 'outline',
      size: 'large',
      width: 280,
      text: 'signin_with',
      locale: 'zh-CN',
    }
  );
}

/**
 * 触发 One Tap 登录（弹窗式）
 */
export function showOneTap(onLogin: (user: GoogleUser) => void): void {
  if (!window.google?.accounts?.id) return;

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response: { credential: string }) => {
      const user = parseJwt(response.credential);
      storeUser(user);
      onLogin(user);
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  window.google.accounts.id.prompt();
}

/**
 * 退出登录
 */
export function googleLogout(): void {
  clearStoredUser();
  // 通知 Google 取消自动选择
  try {
    window.google?.accounts?.id?.disableAutoSelect();
  } catch {
    // 忽略
  }
}

/**
 * Google GIS SDK 类型声明
 */
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
