### Create

- npx @move.box/ts-gc-express create

### Start

#### Dev

- npm run dev

- [view status](http://localhost:8899)
- [view todo list](http://localhost:8899/todo/list)


- Use APIService check

```
import { RequestMethod } from './src/DataService/APIRequest'
import { APIService, APIServiceError } from './src/DataService/APIService'
import { TodoItem } from './src/Main/BizModels/TodoModel'
import { LogPrefix } from './src/Utils/LogPrefix'

async function test() {
  try {
    const list = await APIService.fetch<TodoItem[]>({
      url: 'http://localhost:8899/todo/all',
      method: RequestMethod.GET
    })
    console.log(list)

    const filterList = await APIService.fetch<TodoItem[]>({
      url: 'http://localhost:8899/todo/filter',
      method: RequestMethod.POST,
      params: {
        name: 'ing'
      }
    })
    console.log(filterList)

    const filterList2 = await APIService.fetch<TodoItem[]>({
      url: 'http://localhost:8899/todo/filter',
      method: RequestMethod.POST,
      params: {
        name: 'ing',
        completed: true
      }
    })
    console.log(filterList2)

  } catch (error) {
    if (error instanceof APIServiceError) {
      console.log(`${LogPrefix.error}Response error`, error.code, error.message)
    } else {
      console.error(error)
    }
  }
}

test()
```

#### Pro

- npm run start