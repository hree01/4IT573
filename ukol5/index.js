import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import ejs from 'ejs'

const app = new Hono()

let todos = [
  {
    id: 1,
    title: 'Zajít na pivo',
    done: true,
  },
  {
    id: 2,
    title: 'Jít učit Node.js',
    done: false,
  },
]

app.get(async (c, next) => {
  console.log(c.req.method, c.req.url)
  await next()
})

app.get('/', async (c) => {
  const html = await ejs.renderFile('views/index.html', {
    name: 'Pepa',
    todos,
  })

  return c.html(html)
})

// zobrazeni detailu todo
app.get('/todo/:id', async (c) => { // dynamicky parametr id
  // vytazeni cisla z odkazu a ze stringu na cislo
  const id = Number(c.req.param('id'))
  // hledani todocka v poli todocek - takovy prvek t, ktery se rovna id v requestu
  const todo = todos.find((t) => t.id === id)

  // osetrim vstup na neexistujici todocko
  if (!todo) {
    return c.html(`
    <h1>Úkol nenalezen</h1>
    <a href="/">Zpět na seznam úkolů</a>
  `, 404)
  }

  // vykresleni sablony todocka
  const html = await ejs.renderFile('views/detail.html', {todo})
  return c.html(html)
})

// uprava nazvu todo
app.post('todo/:id/edit', async (c) => {
  const id = Number(c.req.param('id'))
  // ziskani dat z formulare
  const body = await c.req.formData()
  // ziskani nazvu
  const newTitle = body.get('title')

  const todo = todos.find((t) => t.id === id)
  if (todo) {
    // kdyz todo existuje, prepise se nazev
    todo.title = newTitle
  }
  // zpet na detail todo
  return c.redirect(`/todo/${id}`)

})

app.post('/add-todo', async (c) => {
  const body = await c.req.formData()
  const title = body.get('title')

  todos.push({
    id: Date.now(), // unikatni id pro kazde nove todo (kvuli kolizim)
    title,
    done: false,
  })

  return c.redirect('/')
})

app.get('/remove-todo/:id', async (c) => {
  const id = Number(c.req.param('id'))

  todos = todos.filter((todo) => todo.id !== id)

  return c.redirect('/')
})

app.get('/toggle-todo/:id', async (c) => {
  const id = Number(c.req.param('id'))

  const todo = todos.find((todo) => todo.id === id)
  todo.done = !todo.done

  return c.redirect('/')
})

app.get('/hello/:name', async (c) => {
  const name = c.req.param('name')
  return c.html(`<h1>Hello, ${name}</h1>`)
})

app.use(async (c) => {
  c.status(404)
  return c.html('<h1>Page not found!</h1>')
})

serve({
  fetch: app.fetch,
  port: 8000,
})
