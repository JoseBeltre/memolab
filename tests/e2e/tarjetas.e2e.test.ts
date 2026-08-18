import type { ChildProcess } from 'node:child_process'
import { until, type WebDriver } from 'selenium-webdriver'
import { abrirNavegador, arrancarServidor, correoDePrueba, guardarEvidencia, URL_BASE } from './soporte'
import { PaginaRegistro } from './paginas/registro'
import { PaginaMazos } from './paginas/mazos'
import { PaginaTarjetas } from './paginas/tarjetas'

let servidor: ChildProcess
let driver: WebDriver
let registro: PaginaRegistro
let mazos: PaginaMazos
let tarjetas: PaginaTarjetas

function fechaDeHoy(): string {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

async function entrarAUnMazo(): Promise<void> {
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
}

beforeAll(async () => {
  servidor = await arrancarServidor()
  driver = await abrirNavegador()
  registro = new PaginaRegistro(driver)
  mazos = new PaginaMazos(driver)
  tarjetas = new PaginaTarjetas(driver)
})

afterAll(async () => {
  await driver?.quit()
  servidor?.kill()
})

describe('HU-05 y HU-06 · Tarjetas', () => {
  test('un mazo recién creado muestra el mensaje de lista vacía', async () => {
    await entrarAUnMazo()

    await tarjetas.esperarMensaje('Este mazo no tiene tarjetas')
  })

  test('CP-007: la tarjeta nueva queda con fecha de vencimiento igual a la de hoy', async () => {
    await entrarAUnMazo()

    await tarjetas.nuevaTarjeta()
    await tarjetas.llenar('¿Qué es el algoritmo SM-2?', 'Un algoritmo de repetición espaciada')
    await tarjetas.guardar()
    await tarjetas.cerrarFormulario()

    await tarjetas.esperarMensaje('¿Qué es el algoritmo SM-2?')
    await tarjetas.esperarMensaje(`Próximo repaso: ${fechaDeHoy()}`)

    await guardarEvidencia(driver, 'HU-05', 'CP-007-tarjeta-lista-para-repaso')
  })

  test('dejar el anverso o el reverso vacío muestra el mensaje de validación y no crea la tarjeta', async () => {
    await entrarAUnMazo()

    await tarjetas.nuevaTarjeta()
    await tarjetas.llenar('Solo el anverso', '')
    await tarjetas.guardar()

    await tarjetas.esperarMensaje('El anverso y el reverso son obligatorios')
    await tarjetas.cerrarFormulario()

    await tarjetas.esperarMensaje('Este mazo no tiene tarjetas')

    await guardarEvidencia(driver, 'HU-05', 'HU-05-tarjeta-incompleta')
  })

  test('después de guardar el formulario se limpia para crear otra tarjeta enseguida', async () => {
    await entrarAUnMazo()

    await tarjetas.nuevaTarjeta()
    await tarjetas.llenar('Primera tarjeta', 'Su respuesta')
    await tarjetas.guardar()
    await tarjetas.esperarFormularioLimpio()

    expect(await tarjetas.camposVacios()).toBe(true)

    await tarjetas.llenar('Segunda tarjeta', 'Otra respuesta')
    await tarjetas.guardar()
    await tarjetas.esperarFormularioLimpio()
    await tarjetas.cerrarFormulario()

    await tarjetas.esperarMensaje('Primera tarjeta')
    await tarjetas.esperarMensaje('Segunda tarjeta')
  })

  test('CP-016: al editar una tarjeta se guarda el texto nuevo y se conserva la fecha de repaso', async () => {
    await entrarAUnMazo()

    await tarjetas.nuevaTarjeta()
    await tarjetas.llenar('Capital de Francia', 'Berlín')
    await tarjetas.guardar()
    await tarjetas.esperarFormularioLimpio()
    await tarjetas.llenar('Capital de Italia', 'Roma')
    await tarjetas.guardar()
    await tarjetas.esperarFormularioLimpio()
    await tarjetas.cerrarFormulario()
    await tarjetas.esperarMensaje('Capital de Francia')

    await tarjetas.editar('Capital de Francia')
    await tarjetas.limpiarCampos()
    await tarjetas.llenar('Capital de Francia', 'París')
    await tarjetas.guardar()

    await tarjetas.esperarMensaje('París')
    await tarjetas.esperarMensaje(`Próximo repaso: ${fechaDeHoy()}`)

    await tarjetas.eliminar('Capital de Italia')

    expect(await tarjetas.cantidadDeTarjetas()).toBe(1)

    await guardarEvidencia(driver, 'HU-06', 'CP-016-tarjeta-editada-y-eliminada')
  })
})
