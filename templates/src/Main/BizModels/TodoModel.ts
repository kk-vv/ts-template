export interface TodoItem {
  name: string
  completed: boolean
}

export const TodoList: TodoItem[] = [
  {
    name: 'Shopping',
    completed: false
  },
  {
    name: 'Reading',
    completed: false
  },
  {
    name: 'Coding',
    completed: true
  },
  {
    name: 'Game',
    completed: true
  }
]
