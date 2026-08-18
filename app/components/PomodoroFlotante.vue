<script setup lang="ts">
import { formatearTiempo } from '~/utils/pomodoro'
import { usePomodoroStore } from '~/stores/pomodoro'

const pomodoro = usePomodoroStore()
const route = useRoute()
const toast = useToast()

const visible = computed(() => pomodoro.corriendo && route.path !== '/pomodoro')

function sonar() {
  const audio = new AudioContext()
  const oscilador = audio.createOscillator()

  oscilador.type = 'sine'
  oscilador.frequency.value = 880
  oscilador.connect(audio.destination)
  oscilador.start()
  oscilador.stop(audio.currentTime + 0.4)
}

// El aviso se dispara aquí porque el componente está en el layout y se ve en cualquier sección.
watch(() => pomodoro.cambiosDeModo, () => {
  toast.add({
    title: pomodoro.modo === 'descanso' ? 'Terminó el enfoque' : 'Terminó el descanso',
    description: pomodoro.modo === 'descanso' ? 'Tómate un descanso.' : 'Vuelve a concentrarte.',
    icon: 'i-lucide-timer',
    color: 'primary'
  })

  sonar()
})
</script>

<template>
  <UButton
    v-if="visible"
    to="/pomodoro"
    icon="i-lucide-timer"
    size="lg"
    class="fixed bottom-6 right-6 z-50 shadow-lg tabular-nums"
    aria-label="Ver el temporizador"
  >
    {{ formatearTiempo(pomodoro.segundosRestantes) }} · {{ pomodoro.modo === 'enfoque' ? 'Enfoque' : 'Descanso' }}
  </UButton>
</template>
