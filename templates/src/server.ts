import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { LogPrefix } from './Utils/LogPrefix'
import logger from './Utils/Logger'
import { APIErrorResponse } from './Main/APIModels/APIResponse'
import MainRoutes from './Main/Routes/MainRoutes'
import ETHRPCRoutes from './Main/Routes/ETHRPCRoutes'
import { bizError } from './Main/Errors/BizError'

const app = express()
const port = parseInt(process.env.PORT || "8899", 10)
const dev = process.env.NODE_ENV !== "production"

// CORS middle ware
app.use(cors())

// JSON middleware
app.use(express.json())

// mount routes
app.use('/', MainRoutes)
app.use('/eth', ETHRPCRoutes)

app.get('/', (req: Request, res: Response) => {
  res.send('Hyper sign api service!')
})

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
  logger.error(`${LogPrefix.error} ${req.method} ${req.url}:`, err)
  const error = bizError(err)
  res.json(APIErrorResponse(error.errorMessage(), error.code))
}

app.use(errorHandler)

async function startServer() {
  try {
    app.listen(port, (error) => {
      logger.info(
        `> Server listening at http://localhost:${port} as ${dev ? "development" : process.env.NODE_ENV
        }`,
      )
      if (error) {
        logger.info(`${LogPrefix.error} start server failed. ${error}`)
      }
    })
  } catch (error) {
    logger.info(`${LogPrefix.error} start server failed. ${error}`)
  }
}

startServer()

