import { createPublicClient, http } from "viem";
import { mainnet } from 'viem/chains'

export namespace PublicClient {
  export const eth = createPublicClient({
    chain: mainnet,
    transport: http('https://ethereum-rpc.publicnode.com')
  })
}