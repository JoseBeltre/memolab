import {
  MENSAJE_DURACION_INVALIDA,
  MINUTOS_MAXIMOS,
  MINUTOS_MINIMOS,
  formatearTiempo,
  validarDuracion
} from '../../app/utils/pomodoro'

describe('HU-09 · criterio: al entrar a la sección el temporizador muestra 25:00 en modo enfoque', () => {
  it('muestra los 25 minutos de enfoque como 25:00', () => {
    expect(formatearTiempo(25 * 60)).toBe('25:00')
  })

  it('muestra los 5 minutos de descanso como 05:00', () => {
    expect(formatearTiempo(5 * 60)).toBe('05:00')
  })
})

describe('HU-09 · criterio: la cuenta regresiva baja un segundo por segundo', () => {
  it.each([
    [1499, '24:59'],
    [1441, '24:01'],
    [1440, '24:00'],
    [61, '01:01'],
    [59, '00:59'],
    [9, '00:09']
  ])('con %i segundos restantes muestra «%s»', (segundos, texto) => {
    expect(formatearTiempo(segundos)).toBe(texto)
  })
})

describe('HU-09 · criterio: cuando el tiempo llega a cero cambia de modo', () => {
  it('muestra 00:00 al llegar al final del período', () => {
    expect(formatearTiempo(0)).toBe('00:00')
  })
})

describe('HU-11 · criterio: una duración válida entre 1 y 90 minutos se aplica', () => {
  it('acepta los 25 minutos de enfoque y los 5 de descanso que trae por defecto', () => {
    expect(validarDuracion(25)).toBeNull()
    expect(validarDuracion(5)).toBeNull()
  })

  it('acepta los valores de los extremos del rango', () => {
    expect(validarDuracion(MINUTOS_MINIMOS)).toBeNull()
    expect(validarDuracion(MINUTOS_MAXIMOS)).toBeNull()
  })
})

describe('HU-11 · criterio: un valor fuera del rango muestra un mensaje de validación', () => {
  it.each([0, -5, 91, 120])('rechaza %i minutos', (minutos) => {
    expect(validarDuracion(minutos)).toBe(MENSAJE_DURACION_INVALIDA)
  })

  it('avisa el rango permitido en el mensaje', () => {
    expect(MENSAJE_DURACION_INVALIDA).toBe('La duración debe estar entre 1 y 90 minutos')
  })

  it('rechaza los minutos con decimales y los valores que no son número', () => {
    expect(validarDuracion(12.5)).toBe(MENSAJE_DURACION_INVALIDA)
    expect(validarDuracion(Number.NaN)).toBe(MENSAJE_DURACION_INVALIDA)
  })
})
