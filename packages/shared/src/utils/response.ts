export interface IApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface IResponsePaginate<T> {
  success: boolean
  data: T
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface IResponseData<T> {
  success: boolean
  data?: T
  message?: string
}

export interface IErrorResponse {
  success: boolean
  errors?: IErrorMessage[]
}

export interface IErrorMessage {
  field?: string
  message: string
}
