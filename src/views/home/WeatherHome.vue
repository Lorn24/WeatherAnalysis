<script setup>
import 'pixi-spine'
import { useRouter } from 'vue-router'
import * as PIXI from 'pixi.js'
import { Spine } from 'pixi-spine'
import { loadFull } from 'tsparticles'
import { onMounted, ref, nextTick } from 'vue'
import WeatherChat from './WeatherChat.vue'

const spineApp = new PIXI.Application({
  width: 800,
  height: 600,
  backgroundColor: 0x00000000,
  resolution: 2,
  antialias: true,
  transparent: true
})

const router = useRouter()
const showContainer = ref()
const drawer = ref(false)
const dialogueInput = ref('')
let spineChar

const particlesInit = async (engine) => {
  await loadFull(engine)
}

const navigate = (path) => {
  router.push(path)
}

const handlePointerDown = () => {
  console.log('spine:pointerDown')
  drawer.value = true
  // spineChar.state.setAnimation(0,'dance',true)
}

// 监测点击事件
const handleEnter = () => {
  // 检查弹出是否可见且表单是否有数据
  if (dialogueInput.value.trim() != '') {
    console.log('输入内容：', dialogueInput.value.trim())
    drawer.value = true
    // 在这里处理你的逻辑
  }
}

const loadSpine = async () => {
  console.log('start loadSpine')
  spineApp.loader
    .add('/public/spine/erdaimu/erdaimu.skel', (res) => {
      console.log('resInfo: ', res)
      spineChar?.destroy()
      spineChar = new Spine(res.spineData)
      spineChar.scale.set(0.4)
      spineChar.position.set(
        showContainer.value.offsetWidth / 4,
        showContainer.value.offsetHeight / 2 - 5
      )
      spineApp.stage.addChild(spineChar)
      spineChar.state.setAnimation(0, 'normal', true)

      // 设置 Spine 角色为交互元素
      spineChar.interactive = true
      // spineChar.on('pointerdown', handlePointerDown)
      spineChar.on('pointerover', () => {
        spineChar.state.setAnimation(0, 'dance', true)
      })
      spineChar.on('pointerout', () => {
        spineChar.state.setAnimation(0, 'normal', true)
      })
    })
    .load()
}

const createParticles = () => {
  const particlesContainer = new PIXI.Container()
  const particles = new PIXI.ParticleContainer(10000, {
    position: true,
    rotation: true,
    vertices: true,
    tint: true,
    alpha: true
  })
  particlesContainer.addChild(particles)

  // 在 Web Worker 中更新粒子系统
  const worker = new Worker(new URL('./worker.js', import.meta.url))
  const updateParticles = () => {
    worker.postMessage({ type: 'updateParticles', particles: particles.children })
    worker.onmessage = (event) => {
      if (event.data.type === 'particlesUpdated') {
        particles.children = event.data.particles
        requestAnimationFrame(updateParticles)
      }
    }
  }
  updateParticles()

  spineApp.stage.addChild(particlesContainer)
  return particlesContainer
}

onMounted(async () => {
  await nextTick()
  loadSpine()
  showContainer.value.appendChild(spineApp.view)
  spineApp.renderer.resize(showContainer.value.offsetWidth, showContainer.value.offsetHeight)
  spineChar.interactive = true
  spineChar.on('pointerdown', handlePointerDown)
  spineChar.state.data.defaultMix = 2

  // 创建粒子系统
  const particlesContainer = createParticles()
  particlesContainer.position.set(0, 0)
})
</script>

<template>
  <el-scrollbar height="100vh">
    <div class="home-layout">
      <div class="particles-background">
        <vue-particles
          id="tsparticles"
          :particlesInit="particlesInit"
          :particlesLoaded="particlesLoaded"
          :options="{
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: 'grab'
                },
                onHover: {
                  enable: true,
                  mode: 'repulse'
                },
                resize: true
              },
              modes: {
                bubble: {
                  distance: 400,
                  duration: 2,
                  opacity: 0.8,
                  size: 40
                },
                push: {
                  quantity: 4
                },
                repulse: {
                  distance: 200,
                  duration: 0.4
                },
                grab: {
                  distance: 500
                }
              }
            },
            particles: {
              color: {
                value: '#fff'
              },
              links: {
                color: '#fff',
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1
              },
              move: {
                direction: 'none',
                enable: true,
                outMode: 'bounce',
                random: false,
                speed: 6,
                straight: false
              },
              number: {
                density: {
                  enable: true,
                  area: 800
                },
                value: 120
              },
              opacity: {
                value: 0.5
              },
              shape: {
                type: 'circle'
              },
              size: {
                random: true,
                value: 5
              }
            },
            detectRetina: true
          }"
          class="particles-background"
        />
      </div>
      <el-container class="content">
        <el-header class="home-header"><span class="home-title">全国天气眼</span></el-header>
        <el-container>
          <el-aside class="home-aside">
            <ul class="select-container">
              <li class="select-li">
                <h3 justify="center" @click="navigate('dmap')">地图展示</h3>
              </li>
              <li class="select-li">
                <h3 justify="center" @click="navigate('graph')">图表展示</h3>
              </li>
              <li class="select-li">
                <h3 justify="center" @click="navigate('map')">百度地图</h3>
              </li>
              <li class="select-li">
                <h3 justify="center" @click="navigate('contrast')">对比展示</h3>
              </li>
              <li class="select-li">
                <h3 justify="center" @click="navigate('prediction')">天气预测</h3>
              </li>
              <li class="select-li">
                <h3 justify="center" @click="navigate('pm2.5')">空气监测</h3>
              </li>
            </ul>
          </el-aside>
          <el-main class="home-main">
            <div id="core-main">
              <router-view></router-view>
            </div>
            <div class="character-container">
              <el-popover placement="right" :width="400" trigger="click">
                <template #reference>
                  <div id="show-container" ref="showContainer"></div>
                </template>
                <el-input
                  v-model="dialogueInput"
                  placeholder="您好，我是天气精灵HH，有什么我可以帮助你的吗？"
                  @keyup.enter="handleEnter"
                />
              </el-popover>
            </div>
          </el-main>
        </el-container>
      </el-container>
      <el-drawer
        v-model="drawer"
        :with-header="false"
        direction="ltr"
        size="60%"
        :before-close="handleClose"
        @close="dialogueInput=''"
      >
        <weather-chat :dialogue="dialogueInput"></weather-chat>
      </el-drawer>
    </div>
  </el-scrollbar>
</template>

<style>
.home-layout {
  width: 100%;
  height: 100%;
  position: relative;
}

.particles-background {
  background-image: url('/public/background/homePage01.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0; /* 背景层 */
}
.content {
  position: relative;
  z-index: 1; /* 前景层，确保其内容在 particles 上方 */
  width: 100%;
  height: 100%;
}
.home-aside {
  width: 15vw;
  height: 90vh;
}
.home-header {
  height: 10vh;
  background-color: #3e8299;
  display: flex; /* 启用Flexbox布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  opacity: 0.8;
}
.home-title {
  font-size: 25px;
  color: #f9f9f9;
  font-weight: 400;
  text-align: center; /* 文本居中 */
}
.select-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.select-li {
  position: relative;
  background-color: #4a90a6;
  border-radius: 0 0 25px 0;
  height: 100%;
  border-top: 4px solid #9a9a9a;
  opacity: 0.7;
  z-index: 1;
  cursor: pointer;
}
.select-li h3 {
  font-size: 20px;
  color: #f9f9f9;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  transition: all 0.3s;
}
.select-li h3:hover {
  font-size: 28px;
  color: #e7e8eb;
}
.home-main {
  width: 85vw;
  height: 90vh;
  opacity: 0.9;
  display: flex;
  position: relative;
}
#core-main {
  width: 100%;
  height: 100%;
  z-index: 1;
}
#show-container {
  position: fixed;
  right: 0;
  bottom: 0;
  width: 15%;
  height: 35%;
  z-index: 2;
  /* background-color: pink; */
}
</style>
