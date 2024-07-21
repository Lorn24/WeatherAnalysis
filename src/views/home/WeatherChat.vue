<script setup>
import { onMounted, ref, watch } from 'vue'
import { chat } from '@/api/chat'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { defineProps } from 'vue'

// 定义传入的props
const props = defineProps({
  dialogue: String
})

const markdownContent = ref('')
const loading = ref(true) // 定义加载状态
const content  = ref('')

const getChatInfo = async () => {
  console.log('重新渲染',props.dialogue)
  markdownContent.value = ''
  loading.value = true; // 设置加载状态为true
  try {
    let response = await chat(props.dialogue) // 使用props.dialogue
    markdownContent.value = response
    console.log(markdownContent.value)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false // 加载完成后隐藏加载指示器
  }
}

onMounted(() => {
  getChatInfo()
})

// 使用深度监听 props.dialogue
watch(
  () => props.dialogue,
  () => {
    getChatInfo()
  },
  { immediate: true } // 确保初始值也会触发
)

</script>

<template>
  <div class="main-drawer">
    <el-scrollbar>
      <div v-if="loading" class="loading-indicator">正在加载中...</div>
      <div v-else>
        <MarkdownRenderer :content="markdownContent" />
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
.main-drawer {
  width: 100%;
  height: 100%;
  border: 1px solid;
  opacity: 0.6;
  display: flex;
  justify-content: center;
  align-items: center;
}
.loading-indicator {
  font-size: 1.5em;
  color: #666;
}
</style>
