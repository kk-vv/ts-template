export enum RPCErrorCode {
  baseError = 90000,
  reverted = 90001,
  nodata = 90002
}

export namespace RPCErrorCode {
  export function messageBy(code: | number) {
    switch (code) {
      case RPCErrorCode.baseError:
        return "RPC error"
      case RPCErrorCode.reverted:
        return "Contract exec reverted"
      case RPCErrorCode.nodata:
        return "Contract function zero data"
      default:
        return 'Unknow error'
    }
  }
}
