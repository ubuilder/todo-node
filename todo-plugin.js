import * as TodoListPage from "./todo-list-page.js";
import * as TodoSingleItemPage from "./todo-single-item-page.js";
import { TodoSingle } from "./components/TodoSingle.js";

export const name = "Todo Plugin";
export const description = "Todo plugin for UBuilder CMS";

let ctx = {};
export function getContext() {
    return ctx;
}

export const pages = [
  TodoListPage,
  TodoSingleItemPage,
];

export default function (context) {
    ctx = context
}
