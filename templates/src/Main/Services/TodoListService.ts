import { TodoList } from "../BizModels/TodoModel"

export namespace TodoListService {

  export async function getAll() {
    return TodoList
  }

  export async function filter(name: string, completed: boolean | undefined | null) {
    if (completed !== undefined && completed !== null) {
      return TodoList.filter(t => t.name.toLowerCase().includes(name.toLowerCase()) && t.completed === completed)
    } else {
      return TodoList.filter(t => t.name.toLowerCase().includes(name.toLowerCase()))
    }
  }
}