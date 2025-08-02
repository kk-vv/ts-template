import { Router, Request, Response, NextFunction } from 'express'
import { TodoListService } from '../Services/TodoListService'
import { APISuccessResponse } from '../APIModels/APIResponse'
import { z } from 'zod'

const router = Router()

router.get('/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const current = await TodoListService.getAll()
    res.send(APISuccessResponse(current))
  } catch (error) {
    next(error)
  }
})

const FilterParamsSchema = z.object({
  name: z.string().min(1, 'Invalid name length'),
  completed: z.boolean().optional()
})

router.post('/filter', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = FilterParamsSchema.parse(req.body)
    const list = await TodoListService.filter(params.name, params.completed)
    res.send(APISuccessResponse(list))
  } catch (error) {
    next(error)
  }
})


export default router

