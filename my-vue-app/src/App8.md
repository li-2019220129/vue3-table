非常好 👍，你这个需求属于「前端完整安全通信方案」，我们来一次性整理成一个 **生产可直接使用的完整实现**。
要求包括：

* AES-256-CBC 加密（带随机 IV）
* 加密内容中包含时间戳（防止重放攻击）
* 自动处理 key 与 userSign
* 自动刷新、无感重试
* 并发请求只刷新一次

---

## ✅ 一、项目结构建议

```
src/
├── api/
│   ├── request.ts      # axios 封装
│   ├── authStore.ts    # 签名状态管理
│   └── crypto.ts       # AES 加密解密
```

---

## 🧱 二、crypto.ts — AES-256-CBC 加密模块（带时间戳）

```ts
// src/api/crypto.ts
import CryptoJS from 'crypto-js'

/**
 * AES-256-CBC 加密（带时间戳）
 * @param data 待加密对象或字符串
 * @param key AES 密钥
 */
export function aesEncrypt(data: any, key: string): string {
  try {
    const payload = {
      timestamp: Date.now(),
      data,
    }

    const text = JSON.stringify(payload)
    const iv = CryptoJS.lib.WordArray.random(16)
    const keyWordArray = CryptoJS.enc.Utf8.parse(padKey(key))

    const encrypted = CryptoJS.AES.encrypt(text, keyWordArray, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    // 拼接格式：IV:密文
    return iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString()
  } catch (err) {
    console.error('AES Encrypt Error:', err)
    return ''
  }
}

/**
 * AES-256-CBC 解密
 * @param ciphertext Base64 格式的密文
 * @param key AES 密钥
 */
export function aesDecrypt(ciphertext: string, key: string): any {
  try {
    const [ivBase64, cipherBase64] = ciphertext.split(':')
    const iv = CryptoJS.enc.Base64.parse(ivBase64)
    const keyWordArray = CryptoJS.enc.Utf8.parse(padKey(key))

    const decrypted = CryptoJS.AES.decrypt(cipherBase64, keyWordArray, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    const text = decrypted.toString(CryptoJS.enc.Utf8)
    const payload = JSON.parse(text)
    return payload
  } catch (err) {
    console.error('AES Decrypt Error:', err)
    return null
  }
}

/**
 * 保证 key 长度为 32 字节
 */
function padKey(key: string): string {
  if (key.length >= 32) return key.slice(0, 32)
  return key.padEnd(32, '0')
}
```

---

## 🧩 三、authStore.ts — 签名状态管理模块（含本地 TTL）

```ts
// src/api/authStore.ts
let apiKey = ''
let apiKeyExpire = 0
let userSign = ''

// 默认 key 5 分钟有效
const DEFAULT_KEY_TTL = 5 * 60 * 1000

export function setApiKey(key: string) {
  apiKey = key
  apiKeyExpire = Date.now() + DEFAULT_KEY_TTL
  localStorage.setItem('apiKey', key)
  localStorage.setItem('apiKeyExpire', apiKeyExpire.toString())
}

export function getApiKey() {
  if (!apiKey) {
    apiKey = localStorage.getItem('apiKey') || ''
    apiKeyExpire = Number(localStorage.getItem('apiKeyExpire') || 0)
  }
  return apiKey
}

export function isApiKeyExpired() {
  return !apiKey || Date.now() > apiKeyExpire
}

export function setUserSign(sign: string) {
  userSign = sign
  localStorage.setItem('userSign', sign)
}

export function getUserSign() {
  if (!userSign) {
    userSign = localStorage.getItem('userSign') || ''
  }
  return userSign
}

export function clearAuth() {
  apiKey = ''
  apiKeyExpire = 0
  userSign = ''
  localStorage.removeItem('apiKey')
  localStorage.removeItem('apiKeyExpire')
  localStorage.removeItem('userSign')
}
```

---

## 🚀 四、request.ts — axios 完整封装（含自动续期 + 重试）

```ts
// src/api/request.ts
import axios from 'axios'
import { aesEncrypt } from './crypto'
import {
  getApiKey,
  setApiKey,
  isApiKeyExpired,
  getUserSign,
  setUserSign,
  clearAuth,
} from './authStore'

let refreshingUserSign = false
let waitingQueue: (() => void)[] = []

const service = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

/** 获取新的 AES key */
async function fetchApiKey() {
  const { data } = await axios.get('/auth/getKey')
  if (data?.key) setApiKey(data.key)
  return data.key
}

/** 刷新 userSign */
async function refreshUserSign() {
  const { data } = await axios.post('/auth/refreshSign')
  if (data?.userSign) {
    setUserSign(data.userSign)
  }
  return data.userSign
}

/** 请求拦截器 */
service.interceptors.request.use(async (config) => {
  let key = getApiKey()

  if (isApiKeyExpired()) {
    key = await fetchApiKey()
  }

  // 加密请求体（带时间戳）
  if (config.data && key) {
    config.data = { encrypted: aesEncrypt(config.data, key) }
  }

  config.headers = config.headers || {}

  // x-key-sign: 使用 key + 时间戳加密
  if (key) {
    const ts = Date.now().toString()
    config.headers['x-key-sign'] = aesEncrypt(ts, key)
  }

  // user-sign
  const userSign = getUserSign()
  if (userSign) {
    config.headers['x-user-sign'] = userSign
  }

  return config
})
```

---

### 响应拦截器（自动刷新与重试）

```ts
service.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const code = error?.response?.data?.code
    const originalRequest = error.config

    /** userSign 过期自动刷新 */
    if ((code === 401 || code === 'USER_SIGN_EXPIRED') && !originalRequest._retry) {
      if (refreshingUserSign) {
        await new Promise<void>((resolve) => waitingQueue.push(resolve))
      } else {
        refreshingUserSign = true
        try {
          await refreshUserSign()
          waitingQueue.forEach((resolve) => resolve())
          waitingQueue = []
        } catch (e) {
          clearAuth()
          window.location.href = '/login'
          return Promise.reject(e)
        } finally {
          refreshingUserSign = false
        }
      }

      originalRequest._retry = true
      originalRequest.headers['x-user-sign'] = getUserSign()
      return service(originalRequest)
    }

    /** key 过期自动刷新 */
    if ((code === 'KEY_EXPIRED' || code === 403) && !originalRequest._retryKey) {
      const newKey = await fetchApiKey()
      originalRequest._retryKey = true
      originalRequest.headers['x-key-sign'] = aesEncrypt(Date.now().toString(), newKey)
      return service(originalRequest)
    }

    return Promise.reject(error)
  }
)

export default service
```

---

## 💬 五、调用示例

```ts
import service from '@/api/request'

// 登录示例
export async function login(params: { username: string; password: string }) {
  return service.post('/user/login', params)
}

// 普通接口调用
export async function getUserInfo() {
  return service.get('/user/info')
}
```

---

## 🧠 六、方案优点总结

| 功能                | 实现                                 |
| ------------------- | ------------------------------------ |
| 🔐 AES 加密          | CBC 模式 + 随机 IV + 时间戳          |
| 🧭 key 自动过期      | 本地 TTL + 403 响应触发刷新          |
| 🪄 userSign 自动刷新 | 401 响应触发刷新，无感重试           |
| 🚫 防并发重复刷新    | 队列机制，所有等待的请求共享一次刷新 |
| 💾 持久化            | localStorage 保存，刷新页面不丢      |
| ⚡ 安全              | 加密内容含 timestamp，防止重放攻击   |

---

是否希望我帮你再补上一个：

> ✅ 后端（Node.js + crypto 模块）对应的 AES 解密实现
> 这样你能在后端直接验证前端加密的数据。

是否需要我一并写上？
