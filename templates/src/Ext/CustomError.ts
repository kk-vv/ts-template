
export enum CustomErrorCode {
  paramsError = 10001,
  unknowError = 20001,
  internalError = 30001,
  bizError = 40001
}

export namespace CustomErrorCode {
  export function messageBy(code: | number) {
    switch (code) {
      case CustomErrorCode.paramsError:
        return 'Params error'
      case CustomErrorCode.unknowError:
        return 'Unknow error'
      case CustomErrorCode.internalError:
        return 'System internal error'
      case CustomErrorCode.bizError:
        return 'Biz error'
      default:
        return 'Unknow error'
    }
  }
}

export class CustomError extends Error {
  code: number
  reason?: string

  constructor(code: CustomErrorCode | number, option?: { name?: string, reason?: string, cause?: unknown }) {
    let reason = option?.reason
    if (!reason && option?.cause) {
      reason = (option.cause as any).message || (option.cause as any).msg || `${option.cause}`
    }
    super(reason ?? CustomErrorCode.messageBy(code))
    this.cause = option?.cause
    this.code = code
    this.name = option?.name || CustomErrorCode.messageBy(code)
    this.reason = reason
  }

  errorMessage() {
    return `${this.name}|${this.reason}`
  }
}