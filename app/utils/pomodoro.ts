export const MINUTOS_MINIMOS = 1
export const MINUTOS_MAXIMOS = 90
export const MENSAJE_DURACION_INVALIDA = `La duración debe estar entre ${MINUTOS_MINIMOS} y ${MINUTOS_MAXIMOS} minutos`

export function formatearTiempo(segundos: number): string {
  const totales = Math.max(0, Math.floor(segundos))
  const minutos = Math.floor(totales / 60)
  const resto = totales % 60

  return `${String(minutos).padStart(2, '0')}:${String(resto).padStart(2, '0')}`
}

export function validarDuracion(minutos: number): string | null {
  if (!Number.isInteger(minutos) || minutos < MINUTOS_MINIMOS || minutos > MINUTOS_MAXIMOS) {
    return MENSAJE_DURACION_INVALIDA
  }

  return null
}
