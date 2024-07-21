import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dmap' },
    {
      path: '/city/:province/:city/:area',
      name: 'city',
      component: () => import('@/views/CityWeatherInfo.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/home/WeatherHome.vue'),
      children: [
        {
          path: '/graph',
          name: 'graph',
          component: () => import('@/views/WeatherTest.vue')
        },
        {
          path: '/map',
          name: 'map',
          component: () => import('@/views/WeatherMap.vue')
        },
        {
          path: '/dmap',
          name: 'dmap',
          component: () => import('@/views/DynamicMap.vue')
        },
        {
          path:'/contrast',
          name:'contrast',
          component: () => import('@/views/ContrastDisplay.vue')
        },
        {
          path:'/prediction',
          name:'prediction',
          component: () => import('@/views/WeatherPrediction.vue')
        },
        {
          path:'/pm2.5',
          name:'pm2.5',
          component:() => import('@/views/PMInfoShow.vue')
        }
      ]
    }
  ]
})

export default router
