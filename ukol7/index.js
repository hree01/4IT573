import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import ejs from 'ejs'
import { drizzle } from 'drizzle-orm/libsql'
import { todosTable } from './src/schema.js'
import { eq } from 'drizzle-orm'
import { createNodeWebSocket } from '@hono/node-ws'
import { WSContext } from 'hono/ws'

/**
 * @type {Set<WSContext<WebSocket>>}
 */
let webSockets = new Set()

const db = drizzle({
  connection: 'file:db.sqlite',
  logger: true,
})

const app = new Hono()

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

const server = serve(app, (info) => {
  console.log(`Server started on http://localhost:${info.port}`)
})

injectWebSocket(server)

app.get(
  '/ws',
  upgradeWebSocket((c) => ({
    onOpen: (evt, ws) => {
      webSockets.add(ws) // Přidáme klienta do seznamu
      console.log('Nové spojení, celkem aktivních:', webSockets.size)
    },
    onMessage: (evt, ws) => {
      console.log('Zpráva od klienta:', evt.data)
    },
    onClose: (evt, ws) => {
      webSockets.delete(ws) // Odstraníme klienta
      console.log('Spojení ukončeno, zbývá:', webSockets.size)
    },
  })),
)

const sendTodosToAllWebsockets = async () => {
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

const sendTodoDetailToAllWebsockets = async (id) => {
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

app.get(async (c, next) => {
  console.log(c.req.method, c.req.url)

  await next()
})

app.get('/', async (c) => {
  const todos = await db.select().from(todosTable).all()

  const html = await ejs.renderFile('views/index.html', {
    name: 'Todos',
    todos,
  })

  return c.html(html)
})

app.get('/todo/:id', async (c, next) => {
  const id = Number(c.req.param('id'))

  const todo = await db.select().from(todosTable).where(eq(todosTable.id, id)).get()

  if (!todo) return await next()

  const html = await ejs.renderFile('views/todo-detail.html', {
    todo,
  })

  return c.html(html)
})

app.post('/add-todo', async (c) => {
  const body = await c.req.formData()
  const title = body.get('title')
  const priority = body.get('priority')

  await db.insert(todosTable).values({
    title,
    done: false,
    priority,
  })

  sendTodosToAllWebsockets()
  return c.redirect('/')
})

app.get('/remove-todo/:id', async (c) => {
  const id = Number(c.req.param('id'))

  await db.delete(todosTable).where(eq(todosTable.id, id))

  sendTodosToAllWebsockets()
  sendTodoDetailToAllWebsockets(id)
  return c.redirect('/')
})

app.get('/toggle-todo/:id', async (c) => {
  const id = Number(c.req.param('id'))

  const todo = await db.select().from(todosTable).where(eq(todosTable.id, id)).get()

  await db.update(todosTable).set({ done: !todo.done }).where(eq(todosTable.id, id))

   // Zde informujeme všechna spojení o změně
  // I přesto že funkce je asynchronní, nechceme ji awaitovat
  // protože čekat až všechna spojení se dozví o změně a teprve pak
  // poslat odpověď uživatelovi, který změnu inicioval.
  // Tím že zde není await stále informujeme všechny uživatele o změne,
  // ale nečekáme na a rovnou jdeme dál.
  sendTodosToAllWebsockets()
  sendTodoDetailToAllWebsockets(id) // aktualizace detailu

  return redirectBack(c, '/')
})

app.post('/update-todo/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.formData()
  const title = body.get('title')
  const priority = body.get('priority')

  await db.update(todosTable).set({ title, priority }).where(eq(todosTable.id, id))

  sendTodosToAllWebsockets() // aktualizace tabulky
  sendTodoDetailToAllWebsockets(id) // aktualizace detailu
  return redirectBack(c, '/')
})

app.notFound(async (c) => {
  const html = await ejs.renderFile('views/404.html')

  c.status(404)

  return c.html(html)
})

//serve(app, (info) => {
//  
//  console.log(`Server started on http://localhost:${info.port}`)
//})

const redirectBack = (c, fallbackUrl) => {
  const referer = c.req.header('Referer')
  return c.redirect(referer || fallbackUrl)
}
