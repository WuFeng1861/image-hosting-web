import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Gallery from '../views/Gallery.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory('/imgweb/'),
  // history: createWebHistory(''),
  routes
})

export default router
