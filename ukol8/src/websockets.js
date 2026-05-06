import { createNodeWebSocket } from '@hono/node-ws'
import { WSContext } from 'hono/ws'
import db from './db.js'
import { todosTable } from './schema.js'
import { eq } from 'drizzle-orm'
import ejs from 'ejs'
/**
 * @type {Set<WSContext<WebSocket>>}
 */
export let webSockets = new Set()

export const sendTodosToAllWebsockets = async () => {
  try {
    // Z databáze vybereme všechny todos
    // (fragment je potřebuje na vykreslení tabulky)
    const todos = await db.select().from(todosTable).all()

    // pomocí ejs vykreslíme fragment do HTML
    // (pozor zde je nutná přípona .html)
    const html = await ejs.renderFile('views/_todos.html', {
      todos: todos
    })

    // objekt převedený na text
    const message = JSON.stringify({
      type: 'list-update',
      html: html
    })
    for (const webSocket of webSockets) {
      webSocket.send(message)
    }
  } catch (e) {
    console.error(e)
  }
}

export const sendTodoDetailToAllWebsockets = async (id) => {
  try {
    const todo = await db.select().from(todosTable).where(eq(todosTable.id, id)).get()
    
    // když úkol neexistuje (byl smazán) -> info o smazání
    if (!todo) {
      const deleteMessage = JSON.stringify({ type: 'todo-deleted', id })
      for (const ws of webSockets) ws.send(deleteMessage)
      return
    }

    // jinak vyrenderuju vnitřek detailu (vytvořím si pro to nový fragment)
    const html = await ejs.renderFile('views/_detail_content.html', { todo })
    const message = JSON.stringify({ type: 'detail-update', id, html })

    for (const ws of webSockets) ws.send(message)
  } catch (e) { console.error(e) }
}

