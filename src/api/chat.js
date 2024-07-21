// src/api.js
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_MOONSHOT_API_KEY}`,
    'Content-Type': 'application/json'
  }
})
let history = [
  {
    role: 'system',
    content:
      '你是HH，一个中国天气网站上的人工智能助手，你更擅长与处理中国地理，省份信息，天气情况。你会为用户提供安全，有帮助，准确的回答。你的回答字数为800字左右，结构清晰，语言流畅得体，富有文学色彩。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。'
  }
]

export const chat = async (prompt) => {
  history.push({
    role: 'user',
    content: prompt
  })

  try {
    const response = await client.post('/chat/completions', {
      model: 'moonshot-v1-8k',
      messages: history
    })

    const completion = response.data
    history = history.concat(completion.choices[0].message)

    return completion.choices[0].message.content
  } catch (error) {
    console.error('Error calling Moonshot API:', error)
    throw error
  }
}
