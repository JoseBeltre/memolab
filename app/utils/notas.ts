export const TITULO_REQUERIDO = 'El título es obligatorio'

export interface NotaListada {
  titulo: string
}

export function validarTitulo(titulo: string): string | null {
  return titulo.trim() === '' ? TITULO_REQUERIDO : null
}

export function filtrarPorTitulo<T extends NotaListada>(notas: T[], busqueda: string): T[] {
  const texto = busqueda.trim().toLowerCase()

  if (texto === '') {
    return notas
  }

  return notas.filter(nota => nota.titulo.toLowerCase().includes(texto))
}
