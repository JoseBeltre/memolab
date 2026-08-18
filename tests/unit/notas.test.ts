import { filtrarPorTitulo, TITULO_REQUERIDO, validarTitulo } from '../../app/utils/notas'

const NOTAS = [
  { titulo: 'Cálculo Integral' },
  { titulo: 'Programación III' },
  { titulo: 'Base de datos' }
]

describe('HU-12 · criterio: el título es obligatorio', () => {
  it('acepta un título con texto', () => {
    expect(validarTitulo('Resumen de la clase')).toBeNull()
  })

  it('muestra «El título es obligatorio» cuando queda vacío', () => {
    expect(validarTitulo('')).toBe(TITULO_REQUERIDO)
    expect(validarTitulo('   ')).toBe(TITULO_REQUERIDO)
  })
})

describe('HU-12 · criterio: búsqueda por título', () => {
  it('CP-013: encuentra «Cálculo Integral» escribiendo «cálculo» en minúsculas', () => {
    expect(filtrarPorTitulo(NOTAS, 'cálculo')).toEqual([{ titulo: 'Cálculo Integral' }])
  })

  it('tampoco importa si se escribe en mayúsculas', () => {
    expect(filtrarPorTitulo(NOTAS, 'BASE')).toEqual([{ titulo: 'Base de datos' }])
  })

  it('devuelve todas las notas cuando el campo de búsqueda está vacío', () => {
    expect(filtrarPorTitulo(NOTAS, '')).toHaveLength(3)
    expect(filtrarPorTitulo(NOTAS, '   ')).toHaveLength(3)
  })

  it('devuelve una lista vacía cuando ningún título contiene el texto', () => {
    expect(filtrarPorTitulo(NOTAS, 'química')).toEqual([])
  })

  it('busca por una parte del título, no solo por el inicio', () => {
    expect(filtrarPorTitulo(NOTAS, 'datos')).toEqual([{ titulo: 'Base de datos' }])
  })
})
