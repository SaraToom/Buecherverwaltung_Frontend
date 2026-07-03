import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import BooksView from '../views/BooksView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: BooksView, meta: { requiresAuth: true } },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
  ],
})

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth()
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return '/login'
  }
  if ((to.path === '/login' || to.path === '/register') && isAuthenticated.value) {
    return '/'
  }
})

export default router
