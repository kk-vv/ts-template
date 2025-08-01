import { APIRequest, RequestMethod } from './src/DataService/APIRequest'
export async function test() {
  const todos = await APIRequest.jsonRequest({
    url: 'https://688c9affcd9d22dda5cdc459.mockapi.io/api/v2/todo',
    method: RequestMethod.GET
  })
  console.log(await todos.json())
}

test()