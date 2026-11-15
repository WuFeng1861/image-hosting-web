import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Gallery from '../views/Gallery.vue'
import Login from '../views/Login.vue'
import IpSecurity from '../views/IpSecurity.vue'
import Account from '../views/Account.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/gallery',
    name: 'gallery',
    component: Gallery
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/ip-security',
    name: 'ipSecurity',
    component: IpSecurity
  },
  {
    path: '/account',
    name: 'account',
    component: Account
  }
]

const router = createRouter({
  history: createWebHistory('/imgweb/'),
  // history: createWebHistory(''),
  routes
})

// 未登录一律回登录页
router.beforeEach((to) => {
  if (to.name === 'login') return true
  const auth = useAuthStore()
  if (auth.isLoggedIn) return true
  return { name: 'login' }
})

export default router
