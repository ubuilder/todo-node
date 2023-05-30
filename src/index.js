import { Button, ButtonGroup, Card, CardHeader, View } from "@ulibs/components";
import { renderScripts, renderTemplate } from "@ulibs/router";
import express from "express";

import connectLivereload from "connect-livereload";
import livereload from "livereload";
import {
  Icon,
  Input,
  Modal,
  ModalBody,
  Table,
  TableBody,
  TableCell,
  TableFoot,
  TableHead,
  TableRow,
} from "./Input.js";

let todos = [];

const app = express();

function render(component) {
  const script = renderScripts(component);
  const template = renderTemplate(component);

  return renderTemplate(
    View({ tag: "html" }, [
      View({ tag: "head" }, [
        View({ tag: "title" }, "Todo List"),
        View({
          tag: "link",
          rel: "stylesheet",
          href: "https://unpkg.com/@ulibs/components@next/src/styles.css",
        }),
        View({ tag: "link", rel: "stylesheet", href: "/styles.css" }),
      ]),
      View({ tag: "body", class: theme === "dark" ? "dark" : "" }, [
        template,
        View(
          { tag: "script" },
          `
        let $refs = {}
        `
        ),
        script && View({ tag: "script" }, script),
      ]),
    ])
  );
}

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 10);
});

app.use(express.urlencoded());
app.use(connectLivereload());

app.use(express.static("./public"));

let theme = "light";

function AddTodoForm($props) {
  const { mode, title, description, id } = $props;

  return View(
    {
      tag: "form",
      action: mode === "edit" ? "/todos/" + id : "/todos",
      method: "post",
      class: "add-todo-form",
    },
    [
      Input({
        name: "title",
        label: "Title:",
        ref: "title",
        value: title,
        placeholder: "Enter new todo...",
      }),
      Input({
        name: "description",
        label: "Description:",
        ref: "description",
        value: description,
        placeholder: "Enter todo description...",
      }),
      Button(
        {
          color: "primary",
        },
        mode === "edit" ? "Update" : "Add"
      ),
    ]
  );
}

function TodoTable({ todos }) {
  return Table({}, [
    TableHead({}, [
      TableCell({}, "#"),
      TableCell({}, "Title"),
      TableCell({}, "Description"),
      TableCell({ style: "width: 80px" }),
    ]),
    TableBody({}, [
      todos.map((todo) =>
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
    TableFoot({}),
  ]);
}

app.post("/todos", (req, res) => {
  console.log(req.body);
  todos.push({
    title: req.body.title,
    description: req.body.description,
    id: todos.length > 0 ? todos[todos.length - 1].id + 1 : 1,
  });

  res.redirect("/");
});

app.delete("/todos/:id", (req, res) => {
  todos = todos.filter((item) => item.id !== +req.params.id);
  console.log({ todos });
  res.send("success");
});

app.get("/", (req, res) => {
  const table = TodoTable({ todos });

  const container = Card(
    {
      m: "sm",
      class: "todo-container",
    },
    [
      CardHeader({}, [
        "Todo List",
        ButtonGroup({}, [
          Button({ href: "/add", color: "primary" }, "Add Todo"),
          Button(
            {
              class: "u-hide-light",
              onClick() {
                fetch("/toggle-theme").then((res) => {
                  document.body.classList.toggle("dark");
                });
              },
            },
            Icon({ name: "sun" })
          ),
          Button(
            {
              class: "u-hide-dark",
              onClick() {
                fetch("/toggle-theme").then((res) => {
                  document.body.classList.toggle("dark");
                });
              },
            },
            Icon({ name: "moon" })
          ),
        ]),
      ]),
      table,
    ]
  );

  const html = render(container);

  res.send(html);
});

app.get("/add", (req, res) => {
  const component = View({}, [
    Modal({ open: true, persistent: true, id: "add-todo-modal" }, [
      ModalBody({}, [AddTodoForm({})]),
    ]),
  ]);

  const html = render(component);

  res.send(html);
});

app.post("/todos/:id", (req, res) => {
  const body = req.body;

  todos = todos.map((todo) => {
    if (todo.id === +req.params.id) {
      return { ...todo, ...body };
    }
    return todo;
  });
  res.redirect("/");
});

app.get("/todos/:id", (req, res) => {
  const todo = todos.find((x) => x.id === +req.params.id);
  if (!todo) res.redirect("/");

  console.log(todo);
  const component = View({}, [
    Modal({ open: true, persistent: true, id: "add-todo-modal" }, [
      ModalBody({}, [
        AddTodoForm({
          mode: "edit",
          title: todo.title,
          description: todo.description,
          id: todo.id,
        }),
      ]),
    ]),
  ]);

  const html = render(component);

  res.send(html);
});

app.get("/toggle-theme", (req, res) => {
  theme === "dark" ? "light" : "dark";

  res.redirect("/");
});

app.listen(3004, () => console.log("URL: http://localhost:3004"));
