
import EventEmitter from 'events';
import { APIRequest, APIRequestTarget } from './APIRequest';
import { error } from 'console';

export interface APIDataResponse<T> {
  status: number
  code: number
  message: string | null
  data: T | null
}

export const eventBus = new EventEmitter();

export enum APIServiceErrorCode {
  tokenExpired = 401,
  invaliddata = -998,
  unknown = -999
}

export class APIServiceError extends Error {
  code: number
  message: string

  constructor(code: number, message?: string) {
    super(message ?? 'Invalid response')
    this.code = code
    this.message = message ?? 'Invalid response'
  }
}

export namespace APIService {

  async function request(target: APIRequestTarget, withToken: boolean = true) {
    let apiTarget = target
    let headers: Record<string, string> = apiTarget.headers ?? {}
    if (withToken === true) {
      const token = 'fix token here'
      if (token) {
        headers['token'] = token
      }
    }
    apiTarget.headers = headers
    try {
      const response = await APIRequest.jsonRequest(apiTarget)
      if (response.status === 401) {
        eventBus.emit('TokenExpired')
        throw new APIServiceError(APIServiceErrorCode.tokenExpired)
      }
      const result = await response.json()
      if (result.code === undefined) {
        throw new APIServiceError(result.code ?? APIServiceErrorCode.unknown, result.message ?? 'Invalid data response.')
      } else if (result.code === 0) {
        return result
      } else {
        throw new APIServiceError(result.code ?? APIServiceErrorCode.unknown, result.message ?? 'Invalid data response.')
      }
    } catch (error) {
      if (error instanceof APIServiceError) {
        throw error
      }
      throw new APIServiceError(APIServiceErrorCode.unknown, `${error}`)
    }
  }

  export async function fetch<T>(target: APIRequestTarget, withToken: boolean = true) {
    try {
      const result = (await request(target, withToken)) as APIDataResponse<T>
      if (result.data !== null) {
        return result.data as T
      } else {
        throw new APIServiceError(APIServiceErrorCode.invaliddata, 'Invalid data response.')
      }
    } catch (error) {
      throw error
    }
  }

  export async function fetchNullable<T>(target: APIRequestTarget, withToken: boolean = true) {
    try {
      const result = (await request(target, withToken)) as APIDataResponse<T>
      return result.data
    } catch (error) {
      throw error
    }
  }

}