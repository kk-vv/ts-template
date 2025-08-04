import { Hex } from "viem"

export type GetLogsParams = {
  fromBlock: bigint
  toBlock: bigint
  address?: Hex
  events?: any[] //parseAbiItem('event Transfer(address from, address to, uint256 value)')[]
  blockHash?: Hex
}
