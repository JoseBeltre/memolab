import type { ChildProcess } from 'node:child_process'
import { until, type WebDriver } from 'selenium-webdriver'
import { abrirNavegador, arrancarServidor, correoDePrueba, guardarEvidencia, URL_BASE } from './soporte'
import { PaginaRegistro } from './paginas/registro'
import { PaginaNotas } from './paginas/notas'

let servidor: ChildProcess
let driver: WebDriver
let registro: PaginaRegistro
let notas: PaginaNotas

async function entrarANotas(): Promise<void> {
  await registro.abrir()
  await registro.llenar(correoDePrueba(), 'MemoLab2026')
  await registro.crearCuenta()
  await driver.wait(until.urlIs(`${URL_BASE}/`), 30000)

  await notas.abrir()
}

async function crearNota(titulo: string, contenido: string): Promise<void> {
  await notas.nuevaNota()
  await notas.llenar(titulo, contenido)
  await notas.guardar()
  await notas.esperarMensaje(titulo)
}

beforeAll(async () => {
  servidor = await arrancarServidor()
  driver = await abrirNavegador()
  registro = new PaginaRegistro(driver)
  notas = new PaginaNotas(driver)
})

afterAll(async () => {
  await driver?.quit()
  servidor?.kill()
})

describe('HU-12 · Notas de estudio', () => {
  test('una nota nueva aparece en la lista con su fecha de última modificación', async () => {
    await entrarANotas()

    await notas.esperarMensaje('Todavía no tienes notas')
    await crearNota('Curva del olvido', 'Ebbinghaus, 1885')

    await notas.esperarMensaje('Última modificación:')

    await guardarEvidencia(driver, 'HU-12', 'HU-12-nota-creada')
  })

  test('dejar el título vacío muestra «El título es obligatorio» y no crea la nota', async () => {
    await entrarANotas()

    await notas.nuevaNota()
    await notas.llenar('', 'Contenido sin título')
    await notas.guardar()

    await notas.esperarMensaje('El título es obligatorio')

    await guardarEvidencia(driver, 'HU-12', 'HU-12-titulo-obligatorio')
  })

  test('al editar una nota se actualiza el contenido', async () => {
    await entrarANotas()
    await crearNota('Algoritmo SM-2', 'Version vieja')

    await notas.editar('Algoritmo SM-2')
    await notas.limpiarCampos()
    await notas.llenar('Algoritmo SM-2', 'Calcula la próxima fecha de repaso')
    await notas.guardar()

    await notas.esperarMensaje('Calcula la próxima fecha de repaso')
  })

  test('al eliminar una nota y confirmar, desaparece de la lista', async () => {
    await entrarANotas()
    await crearNota('Nota para borrar', 'Sobra')

    await notas.eliminar('Nota para borrar')

    await notas.esperarMensaje('Todavía no tienes notas')
  })

  test('CP-013: la búsqueda encuentra la nota sin importar mayúsculas ni minúsculas', async () => {
    await entrarANotas()
    await crearNota('Cálculo Integral', 'Áreas bajo la curva')
    await crearNota('Programación III', 'Proyecto final')

    await notas.buscar('cálculo')

    await driver.wait(async () => (await notas.titulosVisibles()).length === 1, 15000)
    expect(await notas.titulosVisibles()).toEqual(['Cálculo Integral'])

    await guardarEvidencia(driver, 'HU-12', 'CP-013-busqueda-de-notas')
  })
})
