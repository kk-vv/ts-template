import { Router, Request, Response, NextFunction } from 'express'
import { APISuccessResponse } from '../APIModels/APIResponse'

const router = Router()

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.send(APISuccessResponse('Service online'))
  } catch (error) {
    next(error)
  }
})


export default router

