import fs from 'node:fs'
import path from 'node:path'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// CP-014 / RNF-04: un usuario no puede ver ni modificar los registros de otro.
// Se prueba contra la base de datos real porque las politicas de Row Level Security
// no se pueden comprobar de forma confiable desde la pantalla.

const RAIZ = path.resolve(__dirname, '../..')

function variablesDelEntorno() {
  const contenido = fs.readFileSync(path.join(RAIZ, '.env'), 'utf-8')
  const url = contenido.match(/^NUXT_PUBLIC_SUPABASE_URL=(.+)$/m)
  const clave = contenido.match(/^NUXT_PUBLIC_SUPABASE_KEY=(.+)$/m)

  if (!url || !clave) {
    throw new Error('Faltan NUXT_PUBLIC_SUPABASE_URL o NUXT_PUBLIC_SUPABASE_KEY en el archivo .env')
  }

  return { url: url[1]!.trim(), clave: clave[1]!.trim() }
}

const { url, clave } = variablesDelEntorno()

// En la integracion continua solo hay valores de marcador, asi que ahi no se ejecutan.
const conBaseDeDatos = url.includes('placeholder') ? describe.skip : describe

async function crearUsuario(): Promise<{ cliente: SupabaseClient, id: string }> {
  const cliente = createClient(url, clave)
  const correo = `rls${Date.now()}${Math.floor(Math.random() * 1000)}@itla.edu.do`

  const { data, error } = await cliente.auth.signUp({ email: correo, password: 'MemoLab2026' })

  if (error || !data.user) {
    throw new Error(`No se pudo crear el usuario de prueba: ${error?.message}`)
  }

  return { cliente, id: data.user.id }
}

let usuarioA: { cliente: SupabaseClient, id: string }
let usuarioB: { cliente: SupabaseClient, id: string }
let mazoDeA: string

beforeAll(async () => {
  if (url.includes('placeholder')) {
    return
  }

  usuarioA = await crearUsuario()
  usuarioB = await crearUsuario()

  const { data, error } = await usuarioA.cliente
    .from('mazos')
    .insert({ usuario_id: usuarioA.id, nombre: 'Mazo privado de A', descripcion: 'Solo para A' })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(`El usuario A no pudo crear su mazo: ${error?.message}`)
  }

  mazoDeA = data.id
})

conBaseDeDatos('RNF-04 · Row Level Security', () => {
  test('CP-014: el usuario B no ve los mazos del usuario A', async () => {
    const { data, error } = await usuarioB.cliente.from('mazos').select('id, nombre')

    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  test('el usuario B no puede modificar un mazo del usuario A', async () => {
    await usuarioB.cliente.from('mazos').update({ nombre: 'Secuestrado' }).eq('id', mazoDeA)

    const { data } = await usuarioA.cliente.from('mazos').select('nombre').eq('id', mazoDeA).single()

    expect(data?.nombre).toBe('Mazo privado de A')
  })

  test('el usuario B no puede eliminar un mazo del usuario A', async () => {
    await usuarioB.cliente.from('mazos').delete().eq('id', mazoDeA)

    const { data } = await usuarioA.cliente.from('mazos').select('id').eq('id', mazoDeA)

    expect(data).toHaveLength(1)
  })

  test('el usuario B no puede crear un mazo a nombre del usuario A', async () => {
    const { error } = await usuarioB.cliente
      .from('mazos')
      .insert({ usuario_id: usuarioA.id, nombre: 'Mazo colado' })

    expect(error).not.toBeNull()
  })

  test('el usuario A sí ve su propio mazo', async () => {
    const { data } = await usuarioA.cliente.from('mazos').select('nombre')

    expect(data).toEqual([{ nombre: 'Mazo privado de A' }])
  })
})
