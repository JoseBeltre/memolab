import { By, type WebDriver } from 'selenium-webdriver'
import { esperarHidratacion, esperarTexto, URL_BASE } from '../soporte'

export class PaginaRegistro {
  driver: WebDriver

  constructor(driver: WebDriver) {
    this.driver = driver
  }

  async abrir(): Promise<void> {
    await this.driver.get(`${URL_BASE}/registro`)
    await esperarHidratacion(this.driver)
  }

  async llenar(correo: string, contrasena: string): Promise<void> {
    await this.driver.findElement(By.css('input[type="email"]')).sendKeys(correo)
    await this.driver.findElement(By.css('input[type="password"]')).sendKeys(contrasena)
  }

  async salirDelCampo(): Promise<void> {
    await this.driver.executeScript('document.activeElement.blur()')
  }

  async crearCuenta(): Promise<void> {
    await this.driver.findElement(By.css('button[type="submit"]')).click()
  }

  async botonHabilitado(): Promise<boolean> {
    return this.driver.findElement(By.css('button[type="submit"]')).isEnabled()
  }

  async esperarMensaje(texto: string): Promise<void> {
    await esperarTexto(this.driver, texto)
  }
}
