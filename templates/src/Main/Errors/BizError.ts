import { BaseError, ContractFunctionExecutionError, ContractFunctionRevertedError, ContractFunctionZeroDataError, custom } from "viem"
import z from "zod"
import { CustomError, CustomErrorCode } from "../../Ext/CustomError"
import { RPCErrorCode } from "./CustomRPCError"

export function isABICallNotFatalError(error: any) {
  if (error instanceof ContractFunctionExecutionError) {
    if (error.cause) {
      // call success but not right response
      if (error.cause instanceof ContractFunctionRevertedError || error.cause instanceof ContractFunctionZeroDataError) {
        return true
      }
      //BaseError:
      // else InvalidInputError AbiError (inputs error)
      // CallExecutionError (chai status  or rpc or others error)
      //OutOfGasError
      //ChainDoesNotSupportContract
      //HttpRequestError
      //InvalidAddressError
      //ChainMismatchError 
      //...
    }
  }
  return false
}

export function errorMessage(error: any) {
  if (error instanceof CustomError) {
    return error.name
  } else if (error instanceof BaseError) {
    return error.name
  } else {
    return error.message || error.msg || error.reason || `${error}`
  }
}


export function bizError(error: any) {
  if (error instanceof CustomError) {
    return error
  } else if (error instanceof z.ZodError) {
    return new CustomError(CustomErrorCode.paramsError, { name: 'ParamsError', reason: error.message, cause: error })
  } else if (error instanceof BaseError) {
    console.error('BaseError=====', error)
    console.error('CauseError=====', error.cause)
    if (error.cause instanceof ContractFunctionRevertedError) {
      return new CustomError(RPCErrorCode.reverted, { name: error.cause.name, reason: error.cause.reason })
    } else if (error.cause instanceof ContractFunctionZeroDataError) {
      return new CustomError(RPCErrorCode.nodata, { name: error.cause.name })
    }
    return new CustomError(RPCErrorCode.baseError, { name: (error.cause as any).name ?? error.name, reason: (error.cause as any).reason || undefined })
  } else {
    return new CustomError(CustomErrorCode.unknowError, { cause: error })
  }
}
