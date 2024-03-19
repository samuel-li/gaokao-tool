import { createRouter, createWebHistory } from 'vue-router'
import QuerySchool from '../views/QuerySchool.vue'
import QuestionAnswer from '@/views/QuestionAnswer.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: QuerySchool
    },
    {
      path: '/qa',
      name: 'QA',
      component: QuestionAnswer
    }
  ]
})

export default router
