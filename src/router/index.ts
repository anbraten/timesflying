import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Reports from '../pages/Reports.vue';
import Settings from '../pages/Settings.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/reports', component: Reports },
    { path: '/settings', component: Settings },
  ],
});
