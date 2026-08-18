import { defineStore } from 'pinia'
import { validarDuracion } from '~/utils/pomodoro'

const CLAVE = 'memolab-pomodoro'

type Modo = 'enfoque' | 'descanso'

export const usePomodoroStore = defineStore('pomodoro', () => {
  const minutosEnfoque = ref(25)
  const minutosDescanso = ref(5)
  const modo = ref<Modo>('enfoque')
  const segundosRestantes = ref(minutosEnfoque.value * 60)
  const corriendo = ref(false)
  const ciclosCompletados = ref(0)
  // Sube uno cada vez que termina un período, así el componente sabe cuándo avisar.
  const cambiosDeModo = ref(0)

  let intervalo: ReturnType<typeof setInterval> | null = null
  let cargado = false

  const segundosDelModo = computed(() => (modo.value === 'enfoque' ? minutosEnfoque.value : minutosDescanso.value) * 60)

  function cambiarDeModo() {
    if (modo.value === 'enfoque') {
      modo.value = 'descanso'
    } else {
      modo.value = 'enfoque'
      ciclosCompletados.value += 1
    }

    segundosRestantes.value = segundosDelModo.value
    cambiosDeModo.value += 1
  }

  function iniciar() {
    if (corriendo.value) {
      return
    }

    corriendo.value = true
    intervalo = setInterval(() => {
      segundosRestantes.value -= 1

      if (segundosRestantes.value <= 0) {
        cambiarDeModo()
      }
    }, 1000)
  }

  function pausar() {
    corriendo.value = false

    if (intervalo) {
      clearInterval(intervalo)
      intervalo = null
    }
  }

  function reiniciar() {
    pausar()
    segundosRestantes.value = segundosDelModo.value
  }

  function guardarDuraciones(enfoque: number, descanso: number): string | null {
    const error = validarDuracion(enfoque) ?? validarDuracion(descanso)

    if (error) {
      return error
    }

    minutosEnfoque.value = enfoque
    minutosDescanso.value = descanso
    localStorage.setItem(CLAVE, JSON.stringify({ enfoque, descanso }))

    if (!corriendo.value) {
      segundosRestantes.value = segundosDelModo.value
    }

    return null
  }

  function cargarDuraciones() {
    if (cargado) {
      return
    }

    cargado = true
    const guardado = localStorage.getItem(CLAVE)

    if (!guardado) {
      return
    }

    const datos = JSON.parse(guardado) as { enfoque: number, descanso: number }

    if (validarDuracion(datos.enfoque) === null) {
      minutosEnfoque.value = datos.enfoque
    }

    if (validarDuracion(datos.descanso) === null) {
      minutosDescanso.value = datos.descanso
    }

    if (!corriendo.value) {
      segundosRestantes.value = segundosDelModo.value
    }
  }

  return {
    minutosEnfoque,
    minutosDescanso,
    modo,
    segundosRestantes,
    corriendo,
    ciclosCompletados,
    cambiosDeModo,
    iniciar,
    pausar,
    reiniciar,
    guardarDuraciones,
    cargarDuraciones
  }
})
