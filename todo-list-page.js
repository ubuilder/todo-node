
export const name = "Todo List"

export async function laod(req) {
  // load todos from database based on req.query
  return {
    todos: {
      data: [], // from db
      total: 0,
      page: 1,
      perPage: 10,
    },
  };
}

export const actions = {
  async create(body) {
    return {};
  },
  async remove(body) {
    return {};
  },
  async addLabel(body) {
    return {};
  },
}

export default TodoList;
