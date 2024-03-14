import { createRouter, createWebHistory } from 'vue-router'
import QuerySchool from '../views/QuerySchool.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: QuerySchool
    }
  ]
})

export default router
