import { spawn, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { Builder, By, until, type WebDriver } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome'

export const RAIZ = path.resolve(__dirname, '../..')
export const PUERTO = 3100
export const URL_BASE = `http://localhost:${PUERTO}`

const SALIDA = path.join(RAIZ, '.output', 'server', 'index.mjs')

export async function arrancarServidor(): Promise<ChildProcess> {
  if (!fs.existsSync(SALIDA)) {
    throw new Error('Falta el build. Ejecuta "pnpm build" antes de las pruebas de extremo a extremo.')
  }

  const servidor = spawn(process.execPath, [SALIDA], {
    cwd: RAIZ,
    stdio: 'ignore',
    env: { ...process.env, PORT: String(PUERTO) }
  })

  const limite = Date.now() + 60000
  while (Date.now() < limite) {
    try {
      const respuesta = await fetch(URL_BASE)
      if (respuesta.status === 200) {
        return servidor
      }
    } catch {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  servidor.kill()
  throw new Error(`El servidor no respondió en ${URL_BASE}`)
}

export async function abrirNavegador(): Promise<WebDriver> {
  const opciones = new chrome.Options()
  opciones.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,800')

  return new Builder().forBrowser('chrome').setChromeOptions(opciones).build()
}

// Vue deja __vue_app__ en el contenedor cuando termina de hidratar. Sin esperar eso,
// lo que se escribe en un campo se pierde y las validaciones no reaccionan.
export async function esperarHidratacion(driver: WebDriver): Promise<void> {
  await driver.wait(
    () => driver.executeScript('return !!document.getElementById("__nuxt").__vue_app__'),
    20000
  )
}

export async function esperarTexto(driver: WebDriver, texto: string): Promise<void> {
  const xpath = `//*[not(*) and contains(normalize-space(.), "${texto}")]`
  await driver.wait(until.elementLocated(By.xpath(xpath)), 25000)
}

export async function guardarEvidencia(driver: WebDriver, historia: string, nombre: string): Promise<void> {
  const carpeta = path.join(RAIZ, 'docs', 'evidencias', historia)
  fs.mkdirSync(carpeta, { recursive: true })
  const imagen = await driver.takeScreenshot()
  fs.writeFileSync(path.join(carpeta, `${nombre}.png`), imagen, 'base64')
}

let contador = 0

export function correoDePrueba(): string {
  contador += 1
  return `e2e${Date.now()}${contador}@itla.edu.do`
}
