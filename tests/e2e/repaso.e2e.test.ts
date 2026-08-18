import type { ChildProcess } from 'node:child_process'
import { until, type WebDriver } from 'selenium-webdriver'
import { abrirNavegador, arrancarServidor, correoDePrueba, guardarEvidencia, URL_BASE } from './soporte'
import { PaginaRegistro } from './paginas/registro'
import { PaginaMazos } from './paginas/mazos'
import { PaginaTarjetas } from './paginas/tarjetas'
import { PaginaRepaso } from './paginas/repaso'

let servidor: ChildProcess
let driver: WebDriver
let registro: PaginaRegistro
let mazos: PaginaMazos
let tarjetas: PaginaTarjetas
let repaso: PaginaRepaso

async function prepararMazoCon(...anversos: string[]): Promise<void> {
  await registro.abrir()
  await registro.llenar(correoDePrueba(), 'MemoLab2026')
  await registro.crearCuenta()
  await driver.wait(until.urlIs(`${URL_BASE}/`), 30000)

  await mazos.abrir()
  await mazos.esperarLista()
  await mazos.nuevoMazo()
  await mazos.llenar('Programación III', 'Repaso del proyecto final')
  await mazos.guardar()
  await mazos.esperarMazo('Programación III')

  await tarjetas.abrirDesdeLaLista('Programación III')
  await tarjetas.nuevaTarjeta()

  for (const anverso of anversos) {
    await tarjetas.llenar(anverso, `Respuesta de ${anverso}`)
    await tarjetas.guardar()
    await tarjetas.esperarFormularioLimpio()
  }

  await tarjetas.cerrarFormulario()
  await tarjetas.esperarMensaje(anversos[0]!)
}

beforeAll(async () => {
  servidor = await arrancarServidor()
  driver = await abrirNavegador()
  registro = new PaginaRegistro(driver)
  mazos = new PaginaMazos(driver)
  tarjetas = new PaginaTarjetas(driver)
  repaso = new PaginaRepaso(driver)
})

afterAll(async () => {
  await driver?.quit()
  servidor?.kill()
})

describe('HU-07 y HU-08 · Sesión de repaso', () => {
  test('la sesión muestra solo el anverso, el progreso y el botón para ver la respuesta', async () => {
    await prepararMazoCon('Primera pregunta', 'Segunda pregunta')

    await repaso.abrir()

    await repaso.esperarMensaje('Tarjeta 1 de 2')
    expect(await repaso.hayBotonDeRespuesta()).toBe(true)
    expect(await repaso.hayCalificaciones()).toBe(false)
    expect(await repaso.textoEnPantalla()).not.toContain('Respuesta de Primera pregunta')

    await guardarEvidencia(driver, 'HU-07', 'HU-07-sesion-de-repaso')
  })

  test('al mostrar la respuesta aparecen las cuatro calificaciones', async () => {
    await prepararMazoCon('Pregunta con respuesta')

    await repaso.abrir()
    await repaso.mostrarRespuesta()

    await repaso.esperarMensaje('Respuesta de Pregunta con respuesta')
    expect(await repaso.hayCalificaciones()).toBe(true)

    const texto = await repaso.textoEnPantalla()
    for (const etiqueta of ['Otra vez', 'Difícil', 'Bien', 'Fácil']) {
      expect(texto).toContain(etiqueta)
    }

    await guardarEvidencia(driver, 'HU-08', 'HU-08-calificaciones')
  })

  test('CP-010: al calificar con «Otra vez» la tarjeta se muestra otra vez en la misma sesión', async () => {
    await prepararMazoCon('Tarjeta que se olvida')

    await repaso.abrir()
    await repaso.esperarMensaje('Tarjeta 1 de 1')
    await repaso.mostrarRespuesta()
    await repaso.calificar('Otra vez')

    await repaso.esperarMensaje('Tarjeta 2 de 2')
    expect(await repaso.textoEnPantalla()).toContain('Tarjeta que se olvida')

    await guardarEvidencia(driver, 'HU-08', 'CP-010-otra-vez')
  })

  test('CP-008: cuando no quedan tarjetas vencidas avisa que no hay pendientes para hoy', async () => {
    await prepararMazoCon('Tarjeta que se aprende')

    await repaso.abrir()
    await repaso.mostrarRespuesta()
    await repaso.calificar('Bien')

    await repaso.esperarMensaje('No tienes tarjetas pendientes para hoy')

    await guardarEvidencia(driver, 'HU-07', 'CP-008-sin-tarjetas-vencidas')
  })
})
