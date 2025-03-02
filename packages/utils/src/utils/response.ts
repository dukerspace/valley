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

export interface IErrorMessage {
  field?: string
  errors: string[]
}

export interface IErrorDto {
  success: boolean
  errors?: IErrorMessage[]
}
