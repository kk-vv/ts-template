import { Router, Request, Response, NextFunction, request, json } from 'express'
import { APIErrorResponse, APISuccessResponse } from '../APIModels/APIResponse'
import { ETHRPCService } from '../Services/ETHRPCService'
import { JSONSerialize } from '../../Ext/ObjetExt'
import z from 'zod'
import { Hex } from 'viem'
import { error } from 'winston'
import logger from '../../Utils/Logger'

const router = Router()

const HashParamsSchema = z.object({
  hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Ethereum address for pair'),
})

const BatchTokenParamsSchema = z.object({
  tokens: z.array(
    z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format")
  )
})

const BatchAddressParamsSchema = z.object({
  addresses: z.array(z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address for pair')),
})

router.get('/latest_block', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const latest_block = await ETHRPCService.getLastestBlock()
    res.send(JSONSerialize(APISuccessResponse(latest_block))) // JSONSerialize with bigint
  } catch (error) {
    next(error)
  }
})

router.post('/batch/metadata', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = BatchTokenParamsSchema.parse(req.body)
    logger.error(params)
    const metadatas = await ETHRPCService.batchGetTokenMetaDatas(params.tokens as Hex[])
    res.send(JSONSerialize(APISuccessResponse(metadatas))) // JSONSerialize with bigint
  } catch (error) {
    next(error)
  }
})

router.post('/batch/iscontract', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = BatchAddressParamsSchema.parse(req.body)
    const finalAddresses = await ETHRPCService.batchFetchAddressIsContract(params.addresses)
    res.send(APISuccessResponse(finalAddresses))
  } catch (error) {
    next(error)
  }
})


router.post('/tx/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = HashParamsSchema.parse(req.body)

    const finalAddresses = await ETHRPCService.getTxStatus(params.hash as Hex)
    res.send(APISuccessResponse(finalAddresses))
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.json(APIErrorResponse('Invalid params'))
    } else {
      next(error)
    }
  }
})

export default router

