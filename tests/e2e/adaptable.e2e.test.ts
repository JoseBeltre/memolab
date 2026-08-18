import type { ChildProcess } from 'node:child_process'
import { until, type WebDriver } from 'selenium-webdriver'
import { abrirNavegador, arrancarServidor, correoDePrueba, esperarHidratacion, guardarEvidencia, URL_BASE } from './soporte'
import { PaginaRegistro } from './paginas/registro'

// RNF-07: la interfaz debe adaptarse a pantallas desde 360 px hasta 1920 px de ancho.
const RESOLUCIONES = [
  { nombre: 'celular', ancho: 360, alto: 740 },
  { nombre: 'tableta', ancho: 768, alto: 1024 },
  { nombre: 'escritorio', ancho: 1920, alto: 1080 }
]

const PANTALLAS = ['/', '/mazos', '/pomodoro', '/notas']

let servidor: ChildProcess
let driver: WebDriver

async function seDesbordaALoAncho(): Promise<boolean> {
  return driver.executeScript(
    'return document.documentElement.scrollWidth > window.innerWidth + 1'
  )
}

beforeAll(async () => {
  servidor = await arrancarServidor()
  driver = await abrirNavegador()

  const registro = new PaginaRegistro(driver)
  await registro.abrir()
  await registro.llenar(correoDePrueba(), 'MemoLab2026')
  await registro.crearCuenta()
  await driver.wait(until.urlIs(`${URL_BASE}/`), 30000)
})

afterAll(async () => {
  await driver?.quit()
  servidor?.kill()
})

describe('RNF-07 · Diseño adaptable', () => {
  for (const resolucion of RESOLUCIONES) {
    test(`las pantallas principales caben a ${resolucion.ancho} px de ancho`, async () => {
      await driver.manage().window().setRect({ width: resolucion.ancho, height: resolucion.alto })

      for (const pantalla of PANTALLAS) {
        await driver.get(`${URL_BASE}${pantalla}`)
        await esperarHidratacion(driver)

        expect(await seDesbordaALoAncho()).toBe(false)
      }

      await driver.get(`${URL_BASE}/mazos`)
      await esperarHidratacion(driver)
      await guardarEvidencia(driver, 'adaptable', `mazos-${resolucion.nombre}-${resolucion.ancho}px`)
    })
  }
})
