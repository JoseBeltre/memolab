import type { ChildProcess } from 'node:child_process'
import { until, type WebDriver } from 'selenium-webdriver'
import { abrirNavegador, arrancarServidor, correoDePrueba, guardarEvidencia, URL_BASE } from './soporte'
import { PaginaRegistro } from './paginas/registro'
import { PaginaLogin } from './paginas/login'

const CONTRASENA = 'MemoLab2026'

let servidor: ChildProcess
let driver: WebDriver
let registro: PaginaRegistro
let login: PaginaLogin

async function crearCuenta(): Promise<string> {
  const correo = correoDePrueba()
  await registro.abrir()
  await registro.llenar(correo, CONTRASENA)
  await registro.crearCuenta()
  await driver.wait(until.urlIs(`${URL_BASE}/`), 30000)
  return correo
}

beforeAll(async () => {
  servidor = await arrancarServidor()
  driver = await abrirNavegador()
  registro = new PaginaRegistro(driver)
  login = new PaginaLogin(driver)
})

afterAll(async () => {
  await driver?.quit()
  servidor?.kill()
})

describe('HU-02 · Inicio y cierre de sesión', () => {
  test('con los datos correctos entro a la pantalla principal y veo mi correo en la barra de arriba', async () => {
    const correo = await crearCuenta()
    await login.cerrarSesion()
    await driver.wait(until.urlIs(`${URL_BASE}/login`), 30000)

    await login.abrir()
    await login.llenar(correo, CONTRASENA)
    await login.iniciarSesion()

    await driver.wait(until.urlIs(`${URL_BASE}/`), 30000)
    expect(await login.correoEnLaBarra()).toContain(correo)

    await guardarEvidencia(driver, 'HU-02', 'HU-02-sesion-iniciada')
  })

  test('CP-003: con una contraseña incorrecta muestra «Correo o contraseña incorrectos»', async () => {
    const correo = await crearCuenta()
    await login.cerrarSesion()
    await driver.wait(until.urlIs(`${URL_BASE}/login`), 30000)

    await login.abrir()
    await login.llenar(correo, 'claveIncorrecta')
    await login.iniciarSesion()

    await login.esperarMensaje('Correo o contraseña incorrectos')
    expect(await driver.getCurrentUrl()).toBe(`${URL_BASE}/login`)

    await guardarEvidencia(driver, 'HU-02', 'CP-003-contrasena-incorrecta')
  })

  test('al recargar la página sigo dentro de la aplicación', async () => {
    const correo = await crearCuenta()

    await driver.navigate().refresh()
    await driver.wait(until.urlIs(`${URL_BASE}/`), 30000)

    expect(await login.correoEnLaBarra()).toContain(correo)
  })

  test('al cerrar sesión y confirmar me lleva a la pantalla de inicio de sesión', async () => {
    await crearCuenta()

    await login.cerrarSesion()
    await driver.wait(until.urlIs(`${URL_BASE}/login`), 30000)

    expect(await driver.getCurrentUrl()).toBe(`${URL_BASE}/login`)

    await guardarEvidencia(driver, 'HU-02', 'HU-02-cierre-de-sesion')
  })
})
