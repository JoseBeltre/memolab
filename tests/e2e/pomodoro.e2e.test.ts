import type { ChildProcess } from 'node:child_process'
import { until, type WebDriver } from 'selenium-webdriver'
import { abrirNavegador, arrancarServidor, correoDePrueba, guardarEvidencia, URL_BASE } from './soporte'
import { PaginaRegistro } from './paginas/registro'
import { PaginaPomodoro } from './paginas/pomodoro'

let servidor: ChildProcess
let driver: WebDriver
let registro: PaginaRegistro
let pomodoro: PaginaPomodoro

beforeAll(async () => {
  servidor = await arrancarServidor()
  driver = await abrirNavegador()
  registro = new PaginaRegistro(driver)
  pomodoro = new PaginaPomodoro(driver)

  await registro.abrir()
  await registro.llenar(correoDePrueba(), 'MemoLab2026')
  await registro.crearCuenta()
  await driver.wait(until.urlIs(`${URL_BASE}/`), 30000)
})

afterAll(async () => {
  await driver?.quit()
  servidor?.kill()
})

describe('HU-09, HU-10 y HU-11 · Pomodoro', () => {
  test('CP-017: el temporizador arranca en 25:00, se pausa conservando el tiempo y se reinicia', async () => {
    await pomodoro.abrir()
    await pomodoro.esperarTemporizador()

    expect(await pomodoro.tiempo()).toBe('25:00')
    await pomodoro.esperarMensaje('Enfoque')
    await guardarEvidencia(driver, 'HU-09', 'HU-09-temporizador-inicial')

    await pomodoro.iniciar()
    await pomodoro.esperarQueBaje()

    await pomodoro.pausar()
    const pausado = await pomodoro.tiempo()
    await driver.sleep(2500)
    expect(await pomodoro.tiempo()).toBe(pausado)

    await pomodoro.reiniciar()
    await pomodoro.esperarTiempo('25:00')
    expect(await pomodoro.tiempo()).toBe('25:00')

    await guardarEvidencia(driver, 'HU-09', 'CP-017-iniciar-pausar-reiniciar')
  })

  test('CP-011: al cambiar de sección la cuenta sigue y aparece el indicador flotante', async () => {
    await pomodoro.abrir()
    await pomodoro.esperarTemporizador()
    await pomodoro.iniciar()
    await pomodoro.esperarQueBaje()

    await pomodoro.irAMazos()
    await pomodoro.esperarIndicador()

    const primero = await pomodoro.textoDelIndicador()
    expect(primero).toContain('Enfoque')
    expect(primero).not.toContain('25:00')

    await driver.sleep(2500)
    expect(await pomodoro.textoDelIndicador()).not.toBe(primero)

    await guardarEvidencia(driver, 'HU-10', 'CP-011-indicador-flotante')

    await pomodoro.abrirDesdeIndicador()
    await pomodoro.esperarSinIndicador()

    await pomodoro.pausar()
    await pomodoro.irAMazos()
    await pomodoro.esperarSinIndicador()
    expect(await pomodoro.hayIndicador()).toBe(false)
  })

  test('CP-012: una duración de enfoque de 120 minutos se rechaza y deja el valor anterior', async () => {
    await pomodoro.abrir()
    await pomodoro.esperarTemporizador()
    await pomodoro.reiniciar()
    await pomodoro.esperarTiempo('25:00')

    await pomodoro.abrirConfiguracion()
    await pomodoro.escribirDuraciones('120', '5')
    await pomodoro.guardarConfiguracion()

    await pomodoro.esperarMensaje('La duración debe estar entre 1 y 90 minutos')
    await guardarEvidencia(driver, 'HU-11', 'CP-012-duracion-invalida')

    await pomodoro.cancelarConfiguracion()
    expect(await pomodoro.tiempo()).toBe('25:00')

    await pomodoro.abrirConfiguracion()
    expect(await pomodoro.duracionDeEnfoque()).toBe('25')
    await pomodoro.cancelarConfiguracion()
  })

  test('una duración válida se aplica de inmediato y se mantiene al volver a la sección', async () => {
    await pomodoro.abrir()
    await pomodoro.esperarTemporizador()

    await pomodoro.abrirConfiguracion()
    await pomodoro.escribirDuraciones('30', '10')
    await pomodoro.guardarConfiguracion()

    await pomodoro.esperarTiempo('30:00')
    await guardarEvidencia(driver, 'HU-11', 'HU-11-duracion-guardada')

    await pomodoro.abrir()
    await pomodoro.esperarTemporizador()
    await pomodoro.esperarTiempo('30:00')
    expect(await pomodoro.tiempo()).toBe('30:00')
  })
})
