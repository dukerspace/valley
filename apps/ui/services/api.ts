import { clearCookieAuth, getRefreshToken, setCookieAuth } from '@/lib/auth'
import { IAuthResponse, IResponseData } from '@valley/utils'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { getRequest } from './request'

const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const prefix = process.env.NEXT_PUBLIC_API_PREFIX || ''

export const api = () => {
  const baseUrl = `${url}${prefix}`
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 40000,
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json; charset=utf-8'
    }
  })

  instance.interceptors.request.use(async (config) => {
    const { lang } = await getRequest()
    if (lang) {
      config.headers['x-lang'] = lang
    }

    const { token } = await getRequest()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => {
      return response
    },
    async (error: AxiosError) => {
      const { response, config } = error
      if (response?.status === 401 || response?.status === undefined) {
        try {
          const refreshToken = await getRefreshToken()
          if (refreshToken?.length === 0) {
            clearCookieAuth()
            return
          }
          const res: AxiosResponse<IResponseData<IAuthResponse>> = await axios.post(
            `${baseUrl}/v1/auth/refresh_token`,
            { refreshToken: refreshToken }
          )

          if (res.data.success) {
            setCookieAuth(
              res.data.data!.accessToken,
              res.data.data!.refreshToken,
              res.data.data?.user
            )
            return axios(config!)
          }
        } catch {
          clearCookieAuth()
        }
      }
      const res = error.response
      throw res?.data
    }
  )

  return instance
}
