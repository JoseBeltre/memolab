import { By, until, type WebDriver } from 'selenium-webdriver'
import { esperarHidratacion, esperarTexto, URL_BASE } from '../soporte'

export class PaginaNotas {
  driver: WebDriver

  constructor(driver: WebDriver) {
    this.driver = driver
  }

  async abrir(): Promise<void> {
    await this.driver.get(`${URL_BASE}/notas`)
    await esperarHidratacion(this.driver)
    await this.driver.wait(until.elementLocated(By.xpath('//button[contains(., "Nueva nota")]')), 25000)
  }

  async nuevaNota(): Promise<void> {
    await this.driver.findElement(By.xpath('//button[contains(., "Nueva nota")]')).click()
    await this.driver.wait(until.elementLocated(By.css('div[role="dialog"] input')), 25000)
  }

  async llenar(titulo: string, contenido: string): Promise<void> {
    if (titulo !== '') {
      await this.driver.findElement(By.css('div[role="dialog"] input')).sendKeys(titulo)
    }

    if (contenido !== '') {
      await this.driver.findElement(By.css('div[role="dialog"] textarea')).sendKeys(contenido)
    }
  }

  async limpiarCampos(): Promise<void> {
    await this.driver.findElement(By.css('div[role="dialog"] input')).clear()
    await this.driver.findElement(By.css('div[role="dialog"] textarea')).clear()
  }

  async guardar(): Promise<void> {
    await this.driver.findElement(By.xpath('//div[@role="dialog"]//button[contains(., "Guardar")]')).click()
  }

  async buscar(texto: string): Promise<void> {
    await this.driver.wait(async () => {
      const dialogos = await this.driver.findElements(By.css('div[role="dialog"]'))
      return dialogos.length === 0
    }, 25000)

    const campo = this.driver.findElement(By.css('input[placeholder="Buscar por título"]'))
    await campo.clear()
    await campo.sendKeys(texto)
  }

  async editar(titulo: string): Promise<void> {
    await this.driver.findElement(By.css(`button[aria-label="Editar ${titulo}"]`)).click()
    await this.driver.wait(until.elementLocated(By.css('div[role="dialog"] input')), 25000)
  }

  async eliminar(titulo: string): Promise<void> {
    await this.driver.findElement(By.css(`button[aria-label="Eliminar ${titulo}"]`)).click()
    const confirmar = await this.driver.wait(
      until.elementLocated(By.xpath('//div[@role="dialog"]//button[contains(., "Eliminar")]')),
      15000
    )
    await confirmar.click()

    await this.driver.wait(async () => {
      const restantes = await this.driver.findElements(By.css(`button[aria-label="Eliminar ${titulo}"]`))
      return restantes.length === 0
    }, 25000)
  }

  async esperarMensaje(texto: string): Promise<void> {
    await esperarTexto(this.driver, texto)
  }

  async titulosVisibles(): Promise<string[]> {
    const botones = await this.driver.findElements(By.css('button[aria-label^="Editar "]'))
    const etiquetas = await Promise.all(botones.map(boton => boton.getAttribute('aria-label')))
    return etiquetas.map(etiqueta => (etiqueta ?? '').replace('Editar ', ''))
  }
}
