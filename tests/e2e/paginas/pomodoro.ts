import { By, Key, until, type WebDriver } from 'selenium-webdriver'
import { esperarHidratacion, esperarTexto, URL_BASE } from '../soporte'

const INDICADOR = '[aria-label="Ver el temporizador"]'

export class PaginaPomodoro {
  driver: WebDriver

  constructor(driver: WebDriver) {
    this.driver = driver
  }

  async abrir(): Promise<void> {
    await this.driver.get(`${URL_BASE}/pomodoro`)
    await esperarHidratacion(this.driver)
  }

  async esperarTemporizador(): Promise<void> {
    await this.driver.wait(until.elementLocated(By.xpath('//button[contains(., "Iniciar")]')), 25000)
  }

  async tiempo(): Promise<string> {
    return this.driver.findElement(By.id('tiempo')).getText()
  }

  async esperarTiempo(texto: string): Promise<void> {
    await this.driver.wait(async () => (await this.tiempo()) === texto, 25000)
  }

  async esperarQueBaje(): Promise<void> {
    const inicial = await this.tiempo()
    await this.driver.wait(async () => (await this.tiempo()) !== inicial, 25000)
  }

  async iniciar(): Promise<void> {
    await this.driver.findElement(By.xpath('//button[contains(., "Iniciar")]')).click()
  }

  async pausar(): Promise<void> {
    await this.driver.findElement(By.xpath('//button[contains(., "Pausar")]')).click()
  }

  async reiniciar(): Promise<void> {
    await this.driver.findElement(By.xpath('//button[contains(., "Reiniciar")]')).click()
    const confirmar = await this.driver.wait(
      until.elementLocated(By.xpath('//div[@role="dialog"]//button[contains(., "Reiniciar")]')),
      15000
    )
    await confirmar.click()
  }

  async abrirConfiguracion(): Promise<void> {
    await this.driver.findElement(By.css('button[aria-label="Configuración"]')).click()
    await this.driver.wait(until.elementLocated(By.css('div[role="dialog"] input')), 25000)
  }

  async escribirDuraciones(enfoque: string, descanso: string): Promise<void> {
    const campos = await this.driver.findElements(By.css('div[role="dialog"] input'))
    await campos[0]!.sendKeys(Key.chord(Key.CONTROL, 'a'), enfoque)
    await campos[1]!.sendKeys(Key.chord(Key.CONTROL, 'a'), descanso)
  }

  async duracionDeEnfoque(): Promise<string> {
    const valor = await this.driver.executeScript('return document.querySelector(\'div[role="dialog"] input\').value')
    return String(valor)
  }

  async guardarConfiguracion(): Promise<void> {
    await this.driver.findElement(By.xpath('//div[@role="dialog"]//button[contains(., "Guardar")]')).click()
  }

  async cancelarConfiguracion(): Promise<void> {
    await this.driver.findElement(By.xpath('//div[@role="dialog"]//button[contains(., "Cancelar")]')).click()
    await this.driver.wait(async () => (await this.driver.findElements(By.css('div[role="dialog"]'))).length === 0, 25000)
  }

  async esperarMensaje(texto: string): Promise<void> {
    await esperarTexto(this.driver, texto)
  }

  // Se navega por dentro de la aplicación, sin recargar, que es lo que pide la historia.
  async irAMazos(): Promise<void> {
    await this.driver.findElement(By.xpath('//header//a[contains(., "MemoLab")]')).click()
    await this.driver.wait(until.urlIs(`${URL_BASE}/`), 30000)

    await this.driver.findElement(By.xpath('//a[contains(., "Mis mazos")]')).click()
    await this.driver.wait(until.urlIs(`${URL_BASE}/mazos`), 30000)
  }

  async esperarIndicador(): Promise<void> {
    await this.driver.wait(until.elementLocated(By.css(INDICADOR)), 25000)
  }

  async textoDelIndicador(): Promise<string> {
    return this.driver.findElement(By.css(INDICADOR)).getText()
  }

  async hayIndicador(): Promise<boolean> {
    const botones = await this.driver.findElements(By.css(INDICADOR))
    return botones.length > 0
  }

  async esperarSinIndicador(): Promise<void> {
    await this.driver.wait(async () => !(await this.hayIndicador()), 25000)
  }

  async abrirDesdeIndicador(): Promise<void> {
    await this.driver.findElement(By.css(INDICADOR)).click()
    await this.driver.wait(until.urlIs(`${URL_BASE}/pomodoro`), 30000)
  }
}
