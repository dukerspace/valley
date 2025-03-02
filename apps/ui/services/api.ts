import { localStorageName } from '@/hooks/store'
import { clearCookieAuth, getRefreshToken, setCookieAuth } from '@/lib/auth'
import { IAuthResponse, IErrorDto, IResponseData } from '@valley/utils'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { getRequest } from './request'

const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const api = () => {
  const storage = localStorage.getItem(localStorageName!)
  const parse = JSON.parse(storage!)
  const user = parse?.state?.user

  const baseUrl = `${url}`
  const instance = axios.create({
    baseURL: baseUrl,
    timeout: 40000,
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json; charset=utf-8'
    }
  })

  instance.interceptors.request.use(async (config) => {
    if (user) {
      const token = await getRequest()
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => {
      return response.data
    },
    async (error: AxiosError) => {
      const { response, config } = error
      if (response?.status === 401 || response?.status === undefined) {
        const refreshToken = await getRefreshToken()
        const res: AxiosResponse<IResponseData<IAuthResponse>> = await axios.post(
          `${baseUrl}/v1/auth/refresh_token`,
          { refreshToken: refreshToken }
        )

        if (res.data.success) {
          setCookieAuth(res.data.data!.accessToken, res.data.data!.refreshToken)
          return axios(config!)
        } else {
          localStorage.removeItem(localStorageName!)
          clearCookieAuth()
          window.location.href = '/'
        }
        return
      }
      const res = error.response?.data as IErrorDto
      console.log(`error`, res)
      return res
    }
  )

  return instance
}
