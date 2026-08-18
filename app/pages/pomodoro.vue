<script setup lang="ts">
import { formatearTiempo, MINUTOS_MAXIMOS, MINUTOS_MINIMOS } from '~/utils/pomodoro'
import { usePomodoroStore } from '~/stores/pomodoro'

definePageMeta({
  middleware: 'auth'
})

const pomodoro = usePomodoroStore()

const confirmarReinicio = ref(false)
const configuracionAbierta = ref(false)
const enfoque = ref(pomodoro.minutosEnfoque)
const descanso = ref(pomodoro.minutosDescanso)
const errorDuracion = ref<string | null>(null)

const etiquetaModo = computed(() => (pomodoro.modo === 'enfoque' ? 'Enfoque' : 'Descanso'))

function abrirConfiguracion() {
  enfoque.value = pomodoro.minutosEnfoque
  descanso.value = pomodoro.minutosDescanso
  errorDuracion.value = null
  configuracionAbierta.value = true
}

function guardarConfiguracion() {
  errorDuracion.value = pomodoro.guardarDuraciones(Number(enfoque.value), Number(descanso.value))

  if (!errorDuracion.value) {
    configuracionAbierta.value = false
  }
}

function reiniciar() {
  pomodoro.reiniciar()
  confirmarReinicio.value = false
}

onMounted(() => {
  pomodoro.cargarDuraciones()
})
</script>

<template>
  <div class="mx-auto max-w-xl px-4 py-10 text-center">
    <h1 class="text-2xl font-bold">
      Pomodoro
    </h1>
    <p class="text-sm text-muted mt-1">
      Estudia en bloques de enfoque y descansa entre uno y otro.
    </p>

    <UBadge
      :color="pomodoro.modo === 'enfoque' ? 'primary' : 'info'"
      variant="subtle"
      size="lg"
      class="mt-8"
    >
      {{ etiquetaModo }}
    </UBadge>

    <p
      id="tiempo"
      class="mt-4 text-7xl font-bold tabular-nums"
    >
      {{ formatearTiempo(pomodoro.segundosRestantes) }}
    </p>

    <p class="text-sm text-muted mt-2">
      Ciclos completados: {{ pomodoro.ciclosCompletados }}
    </p>

    <div class="mt-8 flex items-center justify-center gap-3">
      <UButton
        v-if="!pomodoro.corriendo"
        icon="i-lucide-play"
        size="lg"
        @click="pomodoro.iniciar()"
      >
        Iniciar
      </UButton>
      <UButton
        v-else
        icon="i-lucide-pause"
        size="lg"
        @click="pomodoro.pausar()"
      >
        Pausar
      </UButton>

      <UButton
        icon="i-lucide-rotate-ccw"
        size="lg"
        color="neutral"
        variant="subtle"
        @click="confirmarReinicio = true"
      >
        Reiniciar
      </UButton>

      <UButton
        icon="i-lucide-settings"
        size="lg"
        color="neutral"
        variant="ghost"
        aria-label="Configuración"
        @click="abrirConfiguracion"
      />
    </div>

    <UModal
      v-model:open="confirmarReinicio"
      title="Reiniciar temporizador"
      :description="`El tiempo volverá a ${pomodoro.modo === 'enfoque' ? pomodoro.minutosEnfoque : pomodoro.minutosDescanso} minutos y quedará detenido.`"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          @click="confirmarReinicio = false"
        >
          Cancelar
        </UButton>
        <UButton
          color="error"
          @click="reiniciar"
        >
          Reiniciar
        </UButton>
      </template>
    </UModal>

    <UModal
      v-model:open="configuracionAbierta"
      title="Duraciones"
      description="Los cambios se aplican cuando el temporizador está detenido."
    >
      <template #body>
        <div class="text-left">
          <UFormField label="Minutos de enfoque">
            <UInput
              v-model.number="enfoque"
              type="number"
              :min="MINUTOS_MINIMOS"
              :max="MINUTOS_MAXIMOS"
              :ui="{ root: 'w-full' }"
            />
          </UFormField>

          <UFormField
            label="Minutos de descanso"
            class="mt-4"
          >
            <UInput
              v-model.number="descanso"
              type="number"
              :min="MINUTOS_MINIMOS"
              :max="MINUTOS_MAXIMOS"
              :ui="{ root: 'w-full' }"
            />
          </UFormField>

          <p
            v-if="errorDuracion"
            class="text-sm text-error mt-3"
          >
            {{ errorDuracion }}
          </p>
        </div>
      </template>

      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          @click="configuracionAbierta = false"
        >
          Cancelar
        </UButton>
        <UButton @click="guardarConfiguracion">
          Guardar
        </UButton>
      </template>
    </UModal>
  </div>
</template>
