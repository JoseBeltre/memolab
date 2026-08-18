import { By, until, type WebDriver } from 'selenium-webdriver'
import { esperarHidratacion, esperarTexto } from '../soporte'

export class PaginaTarjetas {
  driver: WebDriver

  constructor(driver: WebDriver) {
    this.driver = driver
  }

  async abrirDesdeLaLista(nombreDelMazo: string): Promise<void> {
    await this.driver.findElement(By.xpath(`//a[contains(., "${nombreDelMazo}")]`)).click()
    await esperarHidratacion(this.driver)
    await this.driver.wait(until.elementLocated(By.xpath('//button[contains(., "Nueva tarjeta")]')), 15000)
  }

  async nuevaTarjeta(): Promise<void> {
    await this.driver.findElement(By.xpath('//button[contains(., "Nueva tarjeta")]')).click()
    await this.driver.wait(until.elementLocated(By.css('div[role="dialog"] textarea')), 15000)
  }

  async llenar(anverso: string, reverso: string): Promise<void> {
    const campos = await this.driver.findElements(By.css('div[role="dialog"] textarea'))

    if (anverso !== '') {
      await campos[0].sendKeys(anverso)
    }

    if (reverso !== '') {
      await campos[1].sendKeys(reverso)
    }
  }

  async limpiarCampos(): Promise<void> {
    const campos = await this.driver.findElements(By.css('div[role="dialog"] textarea'))
    for (const campo of campos) {
      await campo.clear()
    }
  }

  async guardar(): Promise<void> {
    await this.driver.findElement(By.xpath('//div[@role="dialog"]//button[contains(., "Guardar")]')).click()
  }

  async cerrarFormulario(): Promise<void> {
    await this.driver.findElement(By.xpath('//div[@role="dialog"]//button[contains(., "Cerrar")]')).click()
  }

  async esperarFormularioLimpio(): Promise<void> {
    await this.driver.wait(async () => this.camposVacios(), 15000)
  }

  async camposVacios(): Promise<boolean> {
    const campos = await this.driver.findElements(By.css('div[role="dialog"] textarea'))
    const valores = await Promise.all(campos.map(campo => campo.getAttribute('value')))
    return valores.every(valor => valor === '')
  }

  async editar(anverso: string): Promise<void> {
    await this.driver.findElement(By.css(`button[aria-label="Editar ${anverso}"]`)).click()
    await this.driver.wait(until.elementLocated(By.css('div[role="dialog"] textarea')), 15000)
  }

  async eliminar(anverso: string): Promise<void> {
    await this.driver.findElement(By.css(`button[aria-label="Eliminar ${anverso}"]`)).click()
    const confirmar = await this.driver.wait(
      until.elementLocated(By.xpath('//div[@role="dialog"]//button[contains(., "Eliminar")]')),
      15000
    )
    await confirmar.click()

    await this.driver.wait(async () => {
      const restantes = await this.driver.findElements(By.css(`button[aria-label="Eliminar ${anverso}"]`))
      return restantes.length === 0
    }, 15000)
  }

  async esperarMensaje(texto: string): Promise<void> {
    await esperarTexto(this.driver, texto)
  }

  async cantidadDeTarjetas(): Promise<number> {
    const botones = await this.driver.findElements(By.css('button[aria-label^="Eliminar "]'))
    return botones.length
  }
}
