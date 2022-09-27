import Axios from 'axios'
import { ElNotification } from 'element-plus'

const http = Axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'content-type': 'application/json'
  }
})

http.interceptors.response.use(
  (res) => {
    if (res.data.code == 200) {
      return res.data.data
    } else {
      if (res.data.code) {
        ElNotification({
          title: res.data.msg,
          message: res.data.data,
          type: 'error'
        })
      } else {
        ElNotification({
          title: '服务器返回错误！',
          message: '无法获取正确的返回数据',
          type: 'error'
        })
      }
      return Promise.reject(res.data)
    }
  },
  (err) => {
    ElNotification({
      title: '服务器错误！',
      message: '无法链接服务器',
      type: 'error'
    })
    return Promise.reject(err)
  }
)

export default http
