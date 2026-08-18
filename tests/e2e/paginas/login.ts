import { By, until, type WebDriver } from 'selenium-webdriver'
import { esperarHidratacion, esperarTexto, URL_BASE } from '../soporte'

export class PaginaLogin {
  driver: WebDriver

  constructor(driver: WebDriver) {
    this.driver = driver
  }

  async abrir(): Promise<void> {
    await this.driver.get(`${URL_BASE}/login`)
    await esperarHidratacion(this.driver)
  }

  async llenar(correo: string, contrasena: string): Promise<void> {
    await this.driver.findElement(By.css('input[type="email"]')).sendKeys(correo)
    await this.driver.findElement(By.css('input[type="password"]')).sendKeys(contrasena)
  }

  async iniciarSesion(): Promise<void> {
    await this.driver.findElement(By.css('button[type="submit"]')).click()
  }

  async esperarMensaje(texto: string): Promise<void> {
    await esperarTexto(this.driver, texto)
  }

  async correoEnLaBarra(): Promise<string> {
    const elemento = await this.driver.wait(until.elementLocated(By.css('header')), 15000)
    return elemento.getText()
  }

  async cerrarSesion(): Promise<void> {
    await this.driver.findElement(By.css('button[aria-label="Cerrar sesión"]')).click()
    const confirmar = await this.driver.wait(
      until.elementLocated(By.xpath('//div[@role="dialog"]//button[contains(., "Cerrar sesión")]')),
      15000
    )
    await confirmar.click()
  }
}
