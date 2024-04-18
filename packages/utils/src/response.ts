export interface IResponsePaginate<T> {
  success: boolean
  data: T
  currentPage: number
  perPage: number
  total: number
}

export interface IResponseData<T> {
  success: boolean
  data?: T | null
  message?: T | null
}

export interface IErrorMessage {
  property?: string
  message: string
}

export interface IErrorDto {
  success: boolean
  message?: IErrorMessage[]
}
