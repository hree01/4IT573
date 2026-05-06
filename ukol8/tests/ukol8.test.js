import test from 'ava'
import { migrate } from 'drizzle-orm/libsql/migrator'
import { app } from '../src/app.js'      
import db from '../src/db.js'
import { todosTable } from '../src/schema.js'
import { eq } from 'drizzle-orm'

test.before(async () => {
  await migrate(db, { migrationsFolder: './drizzle' })
})

let todoId;
// upravený KÓD ZE CVIČENÍ 8 (kvůli navázání dalších testů)
test.serial('it allows creating todos', async (t) => {
  const formData = new FormData()
  formData.set('title', 'Testovací todočko')
  formData.set('priority', 'medium')

  const response = await app.request('/add-todo', {
    method: 'POST',
    body: formData,
  })

  // Ověřím že proběhl redirect
  t.is(response.status, 302)

  // --- Získání ID pro další testy ---
  const todo = await db.select().from(todosTable).where(eq(todosTable.title, 'Testovací todočko')).get()
  todoId = todo.id

  // Získám si lokaci kam mě redirect posílá
  const location = response.headers.get('location')

  // Udělám druhý request
  const response2 = await app.request(location, {
    method: 'GET',
  })

  const text = await response2.text()

  // Ověřím že todočko z formuláře se nachází v HTML
  t.assert(text.includes('Testovací todočko'))
})

// TEST 1: Přejmenování todočka
test.serial('it allows renaming todos', async (t) => {
    t.truthy(todoId);
    const formData = new FormData()
    formData.set('title', 'Přejmenované todočko')
    formData.set('priority', 'medium')
    const response = await app.request(`/update-todo/${todoId}`, {
      method: 'POST',
      body: formData,
    })
    t.is(response.status, 302)
    const updatedTodo = await db.select().from(todosTable).where(eq(todosTable.id, todoId)).get()
    t.is(updatedTodo.title, 'Přejmenované todočko')
  })

  // TEST 2: Změna priority
  test.serial('it allows changing priority of todos', async (t) => {
    t.truthy(todoId);
    const formData = new FormData()
    formData.set('title', 'Přejmenované todočko')
    formData.set('priority', 'high')
    const response = await app.request(`/update-todo/${todoId}`, {
      method: 'POST',
      body: formData,
    })
    t.is(response.status, 302)
    const updatedTodo = await db.select().from(todosTable).where(eq(todosTable.id, todoId)).get()
    t.is(updatedTodo.priority, 'high')
  })

    // TEST 3: Přepnutí stavu  (Nehotové/Hotové)
  test.serial('it allows toggling done status of todos', async (t) => {
    t.truthy(todoId);

    const response = await app.request(`/toggle-todo/${todoId}`)
    t.is(response.status, 302)
    const updatedTodo = await db.select().from(todosTable).where(eq(todosTable.id, todoId)).get()
    t.is(updatedTodo.done, true)
  })

  //TEST 4: Smazání todočka
  test.serial('it allows deleting todos', async (t) => {
    t.truthy(todoId);
    const response = await app.request(`/remove-todo/${todoId}`)
    t.is(response.status, 302)
    const deletedTodo = await db.select().from(todosTable).where(eq(todosTable.id, todoId)).get()
    t.falsy(deletedTodo)
  })
  //TEST 5: Neexistující todočko
  test.serial('it returns 404 for non-existent todos', async (t) => {
    const response = await app.request('/update-todo/999')
    t.is(response.status, 404)
  })

