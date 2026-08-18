export function fechaDeHoy(): string {
  return enTexto(new Date())
}

export function proximaFecha(dias: number): string {
  const hoy = new Date()
  return enTexto(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + dias))
}

function enTexto(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}
