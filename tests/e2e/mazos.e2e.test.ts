import type { ChildProcess } from 'node:child_process'
import { until, type WebDriver } from 'selenium-webdriver'
import { abrirNavegador, arrancarServidor, correoDePrueba, guardarEvidencia, URL_BASE } from './soporte'
import { PaginaRegistro } from './paginas/registro'
import { PaginaMazos } from './paginas/mazos'

let servidor: ChildProcess
let driver: WebDriver
let registro: PaginaRegistro
let mazos: PaginaMazos

async function crearCuenta(): Promise<void> {
  await registro.abrir()
  await registro.llenar(correoDePrueba(), 'MemoLab2026')
  await registro.crearCuenta()
  await driver.wait(until.urlIs(`${URL_BASE}/`), 30000)
}

beforeAll(async () => {
  servidor = await arrancarServidor()
  driver = await abrirNavegador()
  registro = new PaginaRegistro(driver)
  mazos = new PaginaMazos(driver)
})

afterAll(async () => {
  await driver?.quit()
  servidor?.kill()
})

describe('HU-03 y HU-04 · Mazos', () => {
  test('CP-004: sin sesión iniciada la dirección /mazos lleva a la pantalla de inicio de sesión', async () => {
    await driver.manage().deleteAllCookies()
    await mazos.abrir()

    await driver.wait(until.urlIs(`${URL_BASE}/login`), 30000)
    expect(await driver.getCurrentUrl()).toBe(`${URL_BASE}/login`)

    await guardarEvidencia(driver, 'HU-02', 'CP-004-ruta-protegida')
  })

  test('un usuario nuevo ve el mensaje de lista vacía', async () => {
    await crearCuenta()
    await mazos.abrir()
    await mazos.esperarLista()

    await mazos.esperarMensaje('Todavía no tienes mazos')
  })

  test('CP-005: un mazo sin nombre muestra «El nombre del mazo es obligatorio» y no se crea', async () => {
    await crearCuenta()
    await mazos.abrir()
    await mazos.esperarLista()

    await mazos.nuevoMazo()
    await mazos.guardar()

    await mazos.esperarMensaje('El nombre del mazo es obligatorio')

    await guardarEvidencia(driver, 'HU-03', 'CP-005-mazo-sin-nombre')
  })

  test('un mazo con nombre válido aparece en la lista con cero tarjetas', async () => {
    await crearCuenta()
    await mazos.abrir()
    await mazos.esperarLista()

    await mazos.nuevoMazo()
    await mazos.llenar('Programación III', 'Repaso del proyecto final')
    await mazos.guardar()

    await mazos.esperarMazo('Programación III')
    await mazos.esperarMensaje('0 tarjetas')

    await guardarEvidencia(driver, 'HU-03', 'HU-03-mazo-creado')
  })

  test('CP-006: al eliminar un mazo y confirmar, desaparece de la lista', async () => {
    await crearCuenta()
    await mazos.abrir()
    await mazos.esperarLista()

    await mazos.nuevoMazo()
    await mazos.llenar('Base de Datos', 'Consultas SQL')
    await mazos.guardar()
    await mazos.esperarMazo('Base de Datos')

    await mazos.eliminarMazo('Base de Datos')

    await mazos.esperarMensaje('Todavía no tienes mazos')
    expect(await mazos.cantidadDeMazos()).toBe(0)

    await guardarEvidencia(driver, 'HU-04', 'CP-006-mazo-eliminado')
  })
})
