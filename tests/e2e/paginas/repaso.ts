import { By, until, type WebDriver } from 'selenium-webdriver'
import { esperarHidratacion, esperarTexto } from '../soporte'

export class PaginaRepaso {
  driver: WebDriver

  constructor(driver: WebDriver) {
    this.driver = driver
  }

  async abrir(): Promise<void> {
    await this.driver.findElement(By.xpath('//a[contains(., "Estudiar")]')).click()
    await esperarHidratacion(this.driver)
    await this.driver.wait(until.elementLocated(By.xpath('//h1[contains(., "Repaso de")]')), 15000)

    // La sesion carga las tarjetas vencidas despues de montar la pantalla.
    await this.driver.wait(async () => {
      return (await this.hayBotonDeRespuesta()) || (await this.sinPendientes())
    }, 15000)
  }

  async sinPendientes(): Promise<boolean> {
    const avisos = await this.driver.findElements(
      By.xpath('//*[contains(text(), "No tienes tarjetas pendientes para hoy")]')
    )
    return avisos.length > 0
  }

  async mostrarRespuesta(): Promise<void> {
    await this.driver.findElement(By.xpath('//button[contains(., "Mostrar respuesta")]')).click()
  }

  async calificar(etiqueta: string): Promise<void> {
    await this.driver.findElement(By.xpath(`//button[contains(., "${etiqueta}")]`)).click()
  }

  async hayBotonDeRespuesta(): Promise<boolean> {
    const botones = await this.driver.findElements(By.xpath('//button[contains(., "Mostrar respuesta")]'))
    return botones.length > 0
  }

  async hayCalificaciones(): Promise<boolean> {
    const botones = await this.driver.findElements(By.xpath('//button[contains(., "Otra vez")]'))
    return botones.length > 0
  }

  async textoEnPantalla(): Promise<string> {
    return this.driver.findElement(By.css('main')).getText()
  }

  async esperarMensaje(texto: string): Promise<void> {
    await esperarTexto(this.driver, texto)
  }
}
