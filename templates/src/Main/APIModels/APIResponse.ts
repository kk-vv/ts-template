export interface ApiResponse<T> {
  code: number;
  message: string | null
  data: T
}

export interface ApiResponse<T> {
  code: number;
  message: string | null
  data: T
}

export function APIErrorResponse(message: string, code: number = 10001): ApiResponse<null> {
  return {
    code: code,
    message,
    data: null,
  }
}

export function APISuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    code: 0,
    message: null,
    data
  }
}

export const InternalServerErrorResponse: ApiResponse<null> = {
  code: 500,
  message: 'Internal server error',
  data: null,
} 