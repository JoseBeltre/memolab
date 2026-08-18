import { fechaDeHoy, proximaFecha } from '../../app/utils/fechas'

function enTexto(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

describe('Fechas de repaso', () => {
  it('la fecha de hoy tiene el formato aaaa-mm-dd', () => {
    expect(fechaDeHoy()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('HU-05 · una tarjeta nueva vence hoy, así que el intervalo de cero días da la fecha de hoy', () => {
    expect(proximaFecha(0)).toBe(fechaDeHoy())
  })

  it('HU-08 · un intervalo de un día cae mañana', () => {
    const hoy = new Date()
    const manana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1)
    expect(proximaFecha(1)).toBe(enTexto(manana))
  })

  it('HU-08 · un intervalo de seis días cae seis días después de hoy', () => {
    const hoy = new Date()
    const esperada = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 6)
    expect(proximaFecha(6)).toBe(enTexto(esperada))
  })

  it('cambia de mes cuando el intervalo se pasa del último día', () => {
    const hoy = new Date()
    const dentroDeCuarenta = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 40)
    expect(proximaFecha(40)).toBe(enTexto(dentroDeCuarenta))
  })
})
