import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';

/**
 * 统一域名：把 www 重定向到 non-www
 * 避免 localStorage 因不同 origin 而数据丢失
 *（pure8-time-tracker.online 和 www.pure8-time-tracker.online 是两个独立的 localStorage）
 */
if (typeof window !== 'undefined' && window.location.hostname.startsWith('www.')) {
  const newUrl = window.location.href.replace('//www.', '//');
  window.location.replace(newUrl);
  // 阻止应用初始化，等待重定向
  throw new Error('Redirecting to canonical domain...');
}

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount('#app');
