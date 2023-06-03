// import { createPlugin } from "@ulibs/plugin";
import { View, Table, TableBody, Button, ButtonGroup, Icon, TableCell, TableHead, TableFoot, TableRow } from "@ulibs/components";
import { connect } from "@ulibs/db";
import { renderTemplate } from "@ulibs/router";


class Plugin {

}

function createPlugin({
  onStart,
  onInstall,
  onRemove,
  name,
  description,
}) {
  return class TodoPlugin extends Plugin {
    constructor(options) {
      super({
        name,
        description,
      });
    }

    onStart(ctx) {
      onStart(ctx);
    }

    onInstall(ctx) {
      onInstall(ctx);
    }

    onRemove(ctx) {
      onRemove(ctx);
    }
  };
}


///////////////////////////////////////////////////////////////////////////////////

function AdminLayout(props, slots) {
    return View({});
  }
  
  function TodoPage({ todos }) {
    return Table({}, [
      TableHead({}, [
        TableCell({}, "#"),
        TableCell({}, "Title"),
        TableCell({}, "Description"),
        TableCell({ style: "width: 80px" }),
      ]),
      TableBody({}, [
        todos.data.map((todo) =>
          TableRow({}, [
            TableCell({}, todo.id),
            TableCell({}, todo.title),
            TableCell({}, todo.description),
            TableCell({}, [
              ButtonGroup({}, [
                Button(
                  { color: "info", href: "/todos/" + todo.id },
                  Icon({ name: "pencil" })
                ),
                Button(
                  {
                    color: "error",
                    "todo-id": todo.id,
                    onClick() {
                      fetch("/todos/" + this.getAttribute("todo-id"), {
                        method: "DELETE",
                      }).then((res) => {
                        window.location.reload();
                      });
                    },
                  },
                  Icon({ name: "trash" })
                ),
              ]),
            ]),
          ])
        ),
      ]),
      TableFoot([JSON.stringify({page: todos.page, perPage: todos.perPage, total: todos.total})]),
    ]);
  }
  
  

const plugin = createPlugin({
  onStart(ctx) {
    console.log(ctx)
    //
    const Todos = ctx.getModel("todos");
    const Labels = ctx.getModel("todo_labels");

    ctx.addPage("/todos", {
      actions: {
        create({title}) {
            return Todos.insert({title, done: false})
        },
        addLabel({todo_id, name}) {
            return Labels.insert({todo_id, name})
        },
        async remove({id}) {
            // remove all labels of the todo
            const labels = await Labels.query({where: {todo_id: id}, perPage: 10000}) // find betterWay
            labels.data.map(label => Labels.remove(label.id))
            
            // remove todo item
            return Todos.remove(id)
        },
        async edit({id, title, done}) {
            return Todos.update(id, {title, done})
        },
      },
      async page({ query }) {
        const todos = await Todos.query({
          page: query.page ?? 1,
          where: query.done ? { done: true } : {},
          perPage: query.perPage ?? 20,
        });

        // No need for this section after adding relationship to database
        for (let todo of todos.data) {
          todo.labels = (
            await Labels.query({
              where: {
                todo_id: todo.id,
              },
            })
          ).data.map((label) => label.name);
        }

        // Todo = {id: 1, title: 'First todo', done: false, labels: ["first", 'second']}
        // todos = {data: [Todo]}

        return TodoPage({ todos });
      },
      layout: [], // no layout needed
    });
  },

  async onInstall(ctx) {
    await ctx.createTable("todos", {
      title: "string|required",
      done: "boolean|required|default=false",
    });

    await ctx.createTable("todo_labels", {
      name: "string|required",
      todo_id: "number",
    });
  },
});

/////////////////////////////////////////////////////////////////////////////////////////




const {createTable, getModel} = connect({client: 'sqlite3', filename: ':memory:'})

const todos = new plugin()

async function runAction(action, input) {
    console.log('running action', action)

    console.log('input: ', input)
    const output = await action(input)
    console.log('output: ', output)
    return;
}

async function renderPage(page, props) {
    
    console.log('page content: ')

    console.log(renderTemplate(await page(props)))
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
}

const addPage = (slug, config) => {
    console.log('should add page', slug,  config)

    // Simulation of user interactions..
    async function runActions() {
        console.log('Will add New Todo item in 2 seconds...')
        await sleep(2000)
        const title = 'Todo random ' + Math.floor(Math.random() * 200)
        await runAction(config.actions.create, {title})

        console.log('will get list of todos in 2 seconds...')
        await sleep(2000)
        renderPage(config.page, {query: {}})
    
        console.log('Will edit Todo in 2 seconds...')
        await sleep(2000)
        const new_title = 'Todo random (edited) ' + Math.floor(Math.random() * 200)
        await runAction(config.actions.edit, {title: new_title, done: true, id: 1})


        console.log('will get list of todos in 2 seconds...')
        await sleep(2000)
        renderPage(config.page, {query: {}})
        

        console.log('Will add 2 labels in 2 seconds...')
        await sleep(2000)
        await runAction(config.actions.addLabel, { todo_id: 1, name: 'label'})
        await runAction(config.actions.addLabel, { todo_id: 1, name: 'label2'})


        console.log('will get list of todos in 2 seconds...')
        await sleep(2000)
        renderPage(config.page, {query: {}})
        

        console.log('Will remove Todo in 2 seconds...')
        await sleep(2000)
        await runAction(config.actions.remove, { id: 1})

        console.log('will get list of todos in 2 seconds...')
        await sleep(2000)
        renderPage(config.page, {query: {}})
    }
    runActions()
}

const ctx = {createTable, getModel, addPage}
todos.onInstall(ctx)
todos.onStart(ctx)



export default plugin;