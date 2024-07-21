<script setup>
import { ref, watch } from 'vue'
import { marked } from 'marked'
import { defineProps } from 'vue'

// 定义传入的props
const props = defineProps({
  content: String
})

// 创建一个响应式变量来存储HTML内容
const htmlContent = ref('')

// 监听传入的Markdown内容，并在内容变化时更新htmlContent
watch(
  () => props.content,
  (newContent) => {
    htmlContent.value = marked(newContent)
  },
  { immediate: true }
)
</script>

<template>
  <div v-html="htmlContent" class="markdown-content"></div>
</template>

<style scoped>
.markdown-content {
  font-family: Arial, sans-serif;
  line-height: 1.8; /* 增加行高 */
  color: #333;
  margin: 20px; /* 增加外边距 */
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 1.5em; /* 增加顶部边距 */
  margin-bottom: 0.75em; /* 增加底部边距 */
  font-weight: bold;
}

.markdown-content p {
  margin: 1em 0; /* 增加段落间距 */
}

.markdown-content a {
  color: #1e90ff;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content ul,
.markdown-content ol {
  margin: 1em 0; /* 增加列表间距 */
  padding-left: 1.5em;
}

.markdown-content li {
  margin: 0.7em 0; /* 增加列表项间距 */
}
.markdown-content code {
  background-color: #f4f4f4;
  padding: 3px 5px;
  border-radius: 4px;
  font-family: monospace;
}
.markdown-content pre {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  margin: 1em 0; /* 增加代码块间距 */
}
.markdown-content blockquote {
  margin: 1em 0; /* 增加引用块间距 */
  padding: 0.5em 10px;
  color: #666;
  border-left: 3px solid #ccc;
  background-color: #f9f9f9;
}
</style>
