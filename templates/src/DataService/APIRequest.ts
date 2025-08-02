export const JsonRequestHeaders = {
  'Content-Type': 'application/json',
}

export enum RequestMethod {
  GET = 'GET',
  POST = 'POST'
}

export interface APIRequestTarget {
  url: string
  method: RequestMethod
  headers?: Record<string, string> | undefined,
  params?: Record<string, any> | undefined
}

export namespace APIRequest {

  export async function jsonRequest(target: APIRequestTarget): Promise<Response> {
    const headers = { ...JsonRequestHeaders, ...target.headers }
    return await request({ ...target, headers })
  }

  export async function request(target: APIRequestTarget) {
    let path = target.url
    switch (target.method) {
      case RequestMethod.GET:
        if (target.params) {
          const query = new URLSearchParams(removeEmptyParams(target.params)).toString()
          path = `${path}?${query}`
        }
        const getResponse = await fetch(path,
          {
            method: target.method,
            headers: target.headers,
          }
        )
        return getResponse

      case RequestMethod.POST:
        const postResponse = await fetch(path,
          {
            method: target.method,
            headers: target.headers,
            body: target.params !== undefined ? JSON.stringify(removeEmptyParams(target.params)) : null
          }
        )
        return postResponse
    }
  }

  export function removeEmptyParams(params: Record<string, any>) {
    const finalParams = Object.keys(params).reduce((acc: Record<string, any>, key: string) => {
      if (params[key] !== undefined) {
        acc[key] = params[key]
      }
      return acc
    }, {})
    return finalParams
  }
}