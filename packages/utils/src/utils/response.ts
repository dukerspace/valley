export interface IResponsePaginate<T> {
  success: boolean
  data: T
  currentPage: number
  perPage: number
  total: number
}

export interface IResponseData<T> {
  success: boolean
  data?: T
  message?: T
}

export interface IErrorDto {
  success: boolean
  errors?: IErrorMessage[]
}

export interface IErrorMessage {
  field?: string
  message: string[]
}
