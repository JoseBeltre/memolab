import { By, until, type WebDriver } from 'selenium-webdriver'
import { esperarHidratacion, esperarTexto, URL_BASE } from '../soporte'

export class PaginaMazos {
  driver: WebDriver

  constructor(driver: WebDriver) {
    this.driver = driver
  }

  async abrir(): Promise<void> {
    await this.driver.get(`${URL_BASE}/mazos`)
    await esperarHidratacion(this.driver)
  }

  async esperarLista(): Promise<void> {
    await this.driver.wait(until.elementLocated(By.xpath('//button[contains(., "Nuevo mazo")]')), 15000)
  }

  async nuevoMazo(): Promise<void> {
    await this.driver.findElement(By.xpath('//button[contains(., "Nuevo mazo")]')).click()
    await this.driver.wait(until.elementLocated(By.css('div[role="dialog"] input')), 15000)
  }

  async llenar(nombre: string, descripcion: string): Promise<void> {
    if (nombre !== '') {
      await this.driver.findElement(By.css('div[role="dialog"] input')).sendKeys(nombre)
    }
    if (descripcion !== '') {
      await this.driver.findElement(By.css('div[role="dialog"] textarea')).sendKeys(descripcion)
    }
  }

  async guardar(): Promise<void> {
    await this.driver.findElement(By.xpath('//div[@role="dialog"]//button[contains(., "Guardar")]')).click()
  }

  async esperarMensaje(texto: string): Promise<void> {
    await esperarTexto(this.driver, texto)
  }

  async esperarMazo(nombre: string): Promise<void> {
    await this.driver.wait(until.elementLocated(By.xpath(`//a[contains(., "${nombre}")]`)), 15000)
  }

  async eliminarMazo(nombre: string): Promise<void> {
    await this.driver.findElement(By.css(`button[aria-label="Eliminar ${nombre}"]`)).click()
    await this.driver.wait(
      until.elementLocated(By.xpath('//div[@role="dialog"]//button[contains(., "Eliminar")]')),
      15000
    )
    await this.driver.findElement(By.xpath('//div[@role="dialog"]//button[contains(., "Eliminar")]')).click()
  }

  async cantidadDeMazos(): Promise<number> {
    const tarjetas = await this.driver.findElements(By.css('a[href^="/mazos/"]'))
    return tarjetas.length
  }
}
