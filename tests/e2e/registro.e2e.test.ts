import type { ChildProcess } from 'node:child_process'
import { until, type WebDriver } from 'selenium-webdriver'
import { abrirNavegador, arrancarServidor, correoDePrueba, guardarEvidencia, URL_BASE } from './soporte'
import { PaginaRegistro } from './paginas/registro'

let servidor: ChildProcess
let driver: WebDriver
let pagina: PaginaRegistro

beforeAll(async () => {
  servidor = await arrancarServidor()
  driver = await abrirNavegador()
  pagina = new PaginaRegistro(driver)
})

afterAll(async () => {
  await driver?.quit()
  servidor?.kill()
})

describe('HU-01 · Registro de usuario', () => {
  test('CP-002: un correo mal escrito muestra «Ingresa un correo electrónico válido» y no deja crear la cuenta', async () => {
    await pagina.abrir()
    await pagina.llenar('estudiante01itla', 'MemoLab2026')
    await pagina.salirDelCampo()

    await pagina.esperarMensaje('Ingresa un correo electrónico válido')
    expect(await pagina.botonHabilitado()).toBe(false)

    await guardarEvidencia(driver, 'HU-01', 'CP-002-correo-invalido')
  })

  test('una contraseña de menos de ocho caracteres deja el botón de guardar deshabilitado', async () => {
    await pagina.abrir()
    await pagina.llenar('estudiante01@itla.edu.do', '1234567')
    await pagina.salirDelCampo()

    await pagina.esperarMensaje('La contraseña debe tener al menos 8 caracteres')
    expect(await pagina.botonHabilitado()).toBe(false)

    await guardarEvidencia(driver, 'HU-01', 'HU-01-contrasena-corta')
  })

  test('CP-001: con un correo válido y una contraseña de ocho caracteres o más se crea la cuenta', async () => {
    await pagina.abrir()
    await pagina.llenar(correoDePrueba(), 'MemoLab2026')

    expect(await pagina.botonHabilitado()).toBe(true)
    await guardarEvidencia(driver, 'HU-01', 'HU-01-formulario-valido')

    await pagina.crearCuenta()
    await driver.wait(until.urlIs(`${URL_BASE}/`), 20000)

    await guardarEvidencia(driver, 'HU-01', 'CP-001-registro-exitoso')
  })

  test('un correo que ya está registrado muestra «Este correo ya está registrado»', async () => {
    const correo = correoDePrueba()

    await pagina.abrir()
    await pagina.llenar(correo, 'MemoLab2026')
    await pagina.crearCuenta()
    await driver.wait(until.urlIs(`${URL_BASE}/`), 20000)

    await pagina.abrir()
    await pagina.llenar(correo, 'MemoLab2026')
    await pagina.crearCuenta()

    await pagina.esperarMensaje('Este correo ya está registrado')

    await guardarEvidencia(driver, 'HU-01', 'HU-01-correo-duplicado')
  })
})
