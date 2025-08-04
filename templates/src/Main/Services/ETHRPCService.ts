import { Hex } from "viem"
import { EVMRPC } from "../../EVM/EVMRPC"
import { PublicClient } from "../../EVM/PublicClient"
import { GetLogsParams } from "../../EVM/Models/GetLogsParams"

export namespace ETHRPCService {

  export const service = new EVMRPC(PublicClient.eth)

  export async function getLastestBlock() {
    return service.getLastestBlock()
  }

  export async function batchGetTokenMetaDatas(tokens: Hex[]) {
    return service.batchGetTokenMetaDatas(tokens)
  }

  export async function getLogs(params: GetLogsParams) {
    return service.getLogs(params)
  }

  export async function batchFetchAddressIsContract(addrList: string[]) {
    return service.batchFetchAddressIsContract(addrList)
  }

  export async function getTxStatus(tx: Hex) {// pending success reverted
    return service.getTxStatus(tx)
  }

}