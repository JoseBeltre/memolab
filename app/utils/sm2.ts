// Algoritmo SM-2 de repeticion espaciada (Wozniak, 1990).
// Recibe el estado de la tarjeta y la calificacion del estudiante, y devuelve el estado nuevo.
// No depende de la pantalla ni de la base de datos, por eso se puede probar completo con Jest.

export const FACTOR_MINIMO = 1.3

export const CALIFICACIONES = [
  { valor: 0, etiqueta: 'Otra vez', color: 'error' as const },
  { valor: 3, etiqueta: 'Difícil', color: 'warning' as const },
  { valor: 4, etiqueta: 'Bien', color: 'primary' as const },
  { valor: 5, etiqueta: 'Fácil', color: 'success' as const }
]

export interface EstadoSm2 {
  repeticiones: number
  intervalo: number
  factorFacilidad: number
}

export function calcularSm2(estado: EstadoSm2, calidad: number): EstadoSm2 {
  const diferencia = 5 - calidad
  const factorFacilidad = Math.max(
    FACTOR_MINIMO,
    estado.factorFacilidad + (0.1 - diferencia * (0.08 + diferencia * 0.02))
  )

  if (calidad < 3) {
    return { repeticiones: 0, intervalo: 1, factorFacilidad }
  }

  const repeticiones = estado.repeticiones + 1

  let intervalo = Math.ceil(estado.intervalo * factorFacilidad)
  if (repeticiones === 1) {
    intervalo = 1
  } else if (repeticiones === 2) {
    intervalo = 6
  }

  return { repeticiones, intervalo, factorFacilidad }
}
