import axios from 'axios'
import { ElMessage } from 'element-plus'

const baseURL = 'http://127.0.0.1:8080'

const instance = axios.create({
  //基础地址，超时时间
  baseURL,
  timeout:800000
})

instance.interceptors.request.use(
  (config) => {
    //携带token
    return config
  },
  (err) => Promise.reject(err)
)

instance.interceptors.response.use(
  (res) => {
    if(res.data.code === 1){
      return res.data
    }
    ElMessage.error(res.data.data.message || '服务异常')
    return Promise.reject(res.data)
  },
  (err) => {
    //处理401错误
    ElMessage.error(err.response.data.message || '服务异常')
    return Promise.reject(err)
  }
)
 
export default instance