import { getContext } from "./todo-plugin"

export const name = "Single Todo Page"
export const dynamic = true
export const slugName = "id"



export const actions = {
    edit({id, title, done}) {
        return Todos.update(id, {title, done})
    },
    remove({id}) {
        return Todos.remove(id)
    }
}

export async function load({ params }) {    
  const todo = await getContext().getModel("todos").get(+params.id);

  return {
    todo,
  };
}


export default TodoSingle
