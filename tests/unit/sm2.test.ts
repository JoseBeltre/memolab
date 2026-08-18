import { calcularSm2, FACTOR_MINIMO } from '../../app/utils/sm2'

const TARJETA_NUEVA = { repeticiones: 0, intervalo: 0, factorFacilidad: 2.5 }

describe('HU-08 · criterio: primera calificación correcta', () => {
  it('deja el intervalo en un día', () => {
    const resultado = calcularSm2(TARJETA_NUEVA, 4)
    expect(resultado.repeticiones).toBe(1)
    expect(resultado.intervalo).toBe(1)
  })

  it('deja el intervalo en un día también con «Difícil» y con «Fácil»', () => {
    expect(calcularSm2(TARJETA_NUEVA, 3).intervalo).toBe(1)
    expect(calcularSm2(TARJETA_NUEVA, 5).intervalo).toBe(1)
  })
})

describe('HU-08 · criterio: segunda calificación correcta', () => {
  it('CP-009: deja el intervalo en seis días', () => {
    const resultado = calcularSm2({ repeticiones: 1, intervalo: 1, factorFacilidad: 2.5 }, 4)
    expect(resultado.repeticiones).toBe(2)
    expect(resultado.intervalo).toBe(6)
  })
})

describe('HU-08 · criterio: tercera calificación correcta o más', () => {
  it('multiplica el intervalo anterior por el factor de facilidad y redondea hacia arriba', () => {
    const resultado = calcularSm2({ repeticiones: 2, intervalo: 6, factorFacilidad: 2.5 }, 4)
    expect(resultado.repeticiones).toBe(3)
    expect(resultado.intervalo).toBe(Math.ceil(6 * resultado.factorFacilidad))
  })

  it('el intervalo sigue creciendo en los repasos siguientes', () => {
    const tercero = calcularSm2({ repeticiones: 2, intervalo: 6, factorFacilidad: 2.5 }, 4)
    const cuarto = calcularSm2(tercero, 4)
    expect(cuarto.intervalo).toBeGreaterThan(tercero.intervalo)
  })
})

describe('HU-08 · criterio: calificación «Otra vez»', () => {
  it('CP-010: pone el contador de repeticiones en cero y el intervalo en un día', () => {
    const resultado = calcularSm2({ repeticiones: 3, intervalo: 15, factorFacilidad: 2.5 }, 0)
    expect(resultado.repeticiones).toBe(0)
    expect(resultado.intervalo).toBe(1)
  })

  it('baja el factor de facilidad', () => {
    const resultado = calcularSm2({ repeticiones: 3, intervalo: 15, factorFacilidad: 2.5 }, 0)
    expect(resultado.factorFacilidad).toBeLessThan(2.5)
  })
})

describe('HU-08 · criterio: factor de facilidad mínimo', () => {
  it('nunca baja de 1.3 por más que se falle la tarjeta', () => {
    let estado = { repeticiones: 0, intervalo: 0, factorFacilidad: 1.4 }
    for (let i = 0; i < 10; i++) {
      estado = calcularSm2(estado, 0)
    }
    expect(estado.factorFacilidad).toBe(FACTOR_MINIMO)
  })

  it('«Bien» sube el factor menos que «Fácil»', () => {
    const bien = calcularSm2(TARJETA_NUEVA, 4)
    const facil = calcularSm2(TARJETA_NUEVA, 5)
    expect(facil.factorFacilidad).toBeGreaterThan(bien.factorFacilidad)
  })

  it('«Difícil» baja el factor aunque la respuesta cuente como correcta', () => {
    expect(calcularSm2(TARJETA_NUEVA, 3).factorFacilidad).toBeLessThan(2.5)
  })
})
