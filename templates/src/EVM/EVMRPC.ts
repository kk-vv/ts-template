import { Abi, Hex, PublicClient, RpcLog } from "viem";
import { isNotNil } from "../Utils/SafeGuard";
import { isABICallNotFatalError } from "../Main/Errors/BizError";
import { CustomError, CustomErrorCode } from "../Ext/CustomError";
import ERC20ABI from './ABI/erc20.abi.json'
import { TokenMetaData } from "./Models/TokenMetaData";
import { convertTo2DArray, uniqueArray } from "../Ext/ObjetExt";
import pLimit from "p-limit"
import { GetLogsParams } from "./Models/GetLogsParams";
import { RPCResponseItem } from "./Models/RPCResponseItem";

export class EVMRPC {
  publicClient: PublicClient
  constructor(publicClient: PublicClient) {
    this.publicClient = publicClient
  }

  public async getLastestBlock() {
    return this.publicClient.getBlockNumber()
  }

  public async batchGetTokenMetaDatas(tokens: Hex[]): Promise<Record<string, TokenMetaData>> {
    const records: Record<string, TokenMetaData> = {}
    try {
      tokens = uniqueArray(tokens)
      if (tokens.length > 0) {
        const limit = pLimit(10)
        const chunks = convertTo2DArray(tokens, 50)
        const inputs = chunks.map(chunk => {
          const task = this.publicClient.multicall({
            contracts: chunk.map(address => {
              return [
                {
                  address: address,
                  abi: ERC20ABI as Abi,
                  functionName: 'name',
                },
                {
                  address: address,
                  abi: ERC20ABI as Abi,
                  functionName: 'symbol',
                },
                {
                  address: address,
                  abi: ERC20ABI as Abi,
                  functionName: 'decimals',
                },
                {
                  address: address,
                  abi: ERC20ABI as Abi,
                  functionName: 'totalSupply',
                }
              ]
            })
              .flat()
          })
          return task
        }).map(task => {
          return limit(async () => {
            const result = await task
            return result
          })
        })
        const batcResults2DArray = await Promise.all(inputs)
        let batchResults = batcResults2DArray.flat()
        const hasPartitionSuccess = batchResults.filter(r => r.status === 'success').length > 0
        if (!hasPartitionSuccess) {
          const errorItem = batchResults.filter(r => r.status === 'failure') // same topic but not liquidswap or kittenswap will cause contract_call error
          if (errorItem.length > 0) {
            throw errorItem[0].error
          }
        }
        batchResults = batchResults.map(r => {
          // if (result.status === 'failure' && result.error instanceof ContractFunctionRevertedError) {
          if (r.status === 'failure') {
            return {
              error: undefined,
              result: undefined,
              status: "success"
            }
          } else {
            return r
          }
        })
        const dataList = batchResults.map(r => r.result as string)
        if (dataList.length / 4 !== tokens.length) {
          throw 'Token metadata list not pair'
        }
        for (let index = 0; index < tokens.length; index++) {
          const token = tokens[index].toLowerCase()
          const name = dataList[index * 4 + 0]
          const symbol = dataList[index * 4 + 1]
          const decimals = dataList[index * 4 + 2]
          const totalSupply = dataList[index * 4 + 3]

          if (isNotNil(name) && isNotNil(symbol) && isNotNil(decimals) && isNotNil(totalSupply)) {
            records[token] = {
              name,
              symbol,
              decimals: Number(decimals),
              totalSupply: BigInt(totalSupply),
              address: token
            }
          }
        }
        return records
      }
      return records
    } catch (error) {
      if (isABICallNotFatalError(error)) {
        return records
      }
      throw new CustomError(CustomErrorCode.bizError, { reason: 'Cannot batch fetch token metadatas', cause: error })
    }
  }

  public async getLogs(params: GetLogsParams) {
    try {
      const logs = await this.publicClient.getLogs({
        fromBlock: params.fromBlock,
        toBlock: params.toBlock,
        address: params.address,
        events: params.events
      })
      return logs as unknown as RpcLog[]
    } catch (error) {
      const errorCode = (error as any).cause.code
      const message = (error as any).cause.message
      if (errorCode && (errorCode === -32008 || errorCode === 'ERR_STRING_TOO_LONG' || message.toLowerCase() === 'Response is too big'.toLowerCase())) {
        throw new CustomError(CustomErrorCode.logsStringTooLong, {
          reason: `Error fetching logs from block ${params.fromBlock} to ${params.toBlock}`,
          cause: error
        })
      }
      throw new CustomError(CustomErrorCode.bizError, {
        reason: `Error fetching logs from block ${params.fromBlock} to ${params.toBlock}`,
        cause: error
      })
    }
  }


  public async batchFetchAddressIsContract(addrList: string[]): Promise<string[]> {
    addrList = addrList.map(addr => { return addr.toLowerCase() })
    try {

      addrList = uniqueArray(addrList)
      if (addrList.length > 0) {
        const limit = pLimit(10)
        const chunks = convertTo2DArray(addrList, 50)
        const inputs = chunks.map(chunk => {
          return this.batchGetCodeWithFetch(chunk)
        }).map(task => {
          return limit(async () => {
            const result = await task
            return result
          })
        })
        const batcResults2DArray = await Promise.all(inputs)
        let batchResults = batcResults2DArray.flat().map(item => {
          if (item.bytecode !== undefined) {
            return item.address.toLowerCase()
          } else {
            return undefined
          }
        }).filter(addr => addr !== undefined)
        return batchResults
      }
      return []
    } catch (error) {
      throw new CustomError(CustomErrorCode.bizError, { reason: 'Cannot batch fetch address is contract', cause: error })
    }
  }

  private async batchGetCodeWithFetch(addresses: string[]): Promise<{ address: string; bytecode: string | undefined }[]> {

    const requests = addresses.map((address, index) => ({
      jsonrpc: '2.0',
      id: index + 1,
      method: 'eth_getCode',
      params: [address, 'latest'],
    }))

    try {
      const response = await fetch(this.publicClient.transport.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requests),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const results = (await response.json()) as RPCResponseItem[]
      return results
        .sort((a, b) => a.id - b.id)
        .map((result, index: number) => {
          if (result.result && result.result.length > 0 && result.result.toLowerCase() != '0x') {
            return {
              address: addresses[index],
              bytecode: result.result || undefined,
            }
          } else {
            return {
              address: addresses[index],
              bytecode: undefined,
            }
          }
        })
    } catch (error) {
      throw new CustomError(CustomErrorCode.bizError, { cause: error })
    }
  }

  private async waitReceiptStatus(tx: Hex) { //success or reverted
    try {

      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: tx,
      });
      return receipt.status
    } catch (error) {
      throw new CustomError(CustomErrorCode.bizError, { cause: error })
    }
  }

  public async getTxStatus(tx: Hex) {// pending success reverted
    try {

      const transaction = await this.publicClient.getTransaction({
        hash: tx
      })
      if (transaction.blockHash === null && transaction.blockNumber === null) {
        return 'pending'
      } else {
        const status = await this.waitReceiptStatus(tx)
        return status
      }
    } catch (error) {
      throw new CustomError(CustomErrorCode.bizError, { cause: error })
    }
  }

}