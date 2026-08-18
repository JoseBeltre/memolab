<script setup lang="ts">
import { fechaDeHoy, proximaFecha } from '~/utils/fechas'
import { calcularSm2, CALIFICACIONES } from '~/utils/sm2'

definePageMeta({
  middleware: 'auth'
})

interface TarjetaRepaso {
  id: string
  anverso: string
  reverso: string
  repeticiones: number
  intervalo: number
  factor_facilidad: number
}

const route = useRoute()
const client = useSupabaseClient()

const mazoId = route.params.id as string

const nombreMazo = ref('')
const pendientes = ref<TarjetaRepaso[]>([])
const total = ref(0)
const cargando = ref(true)
const mostrandoReverso = ref(false)

const tarjeta = computed(() => pendientes.value[0] ?? null)
const numeroActual = computed(() => total.value - pendientes.value.length + 1)

async function cargar() {
  cargando.value = true

  const { data: mazo } = await client
    .from('mazos')
    .select('nombre')
    .eq('id', mazoId)
    .single()

  if (!mazo) {
    await navigateTo('/mazos')
    return
  }

  nombreMazo.value = mazo.nombre

  const { data } = await client
    .from('tarjetas')
    .select('id, anverso, reverso, repeticiones, intervalo, factor_facilidad')
    .eq('mazo_id', mazoId)
    .lte('proximo_repaso', fechaDeHoy())
    .order('proximo_repaso', { ascending: true })

  pendientes.value = data ?? []
  total.value = pendientes.value.length
  cargando.value = false
}

async function calificar(calidad: number) {
  const actual = tarjeta.value

  if (!actual) {
    return
  }

  const nuevo = calcularSm2({
    repeticiones: actual.repeticiones,
    intervalo: actual.intervalo,
    factorFacilidad: actual.factor_facilidad
  }, calidad)

  await client
    .from('tarjetas')
    .update({
      repeticiones: nuevo.repeticiones,
      intervalo: nuevo.intervalo,
      factor_facilidad: nuevo.factorFacilidad,
      proximo_repaso: proximaFecha(nuevo.intervalo)
    })
    .eq('id', actual.id)

  pendientes.value = pendientes.value.slice(1)

  // Con «Otra vez» la tarjeta vuelve al final de la misma sesion.
  if (calidad < 3) {
    pendientes.value = [...pendientes.value, { ...actual, repeticiones: nuevo.repeticiones, intervalo: nuevo.intervalo, factor_facilidad: nuevo.factorFacilidad }]
    total.value += 1
  }

  mostrandoReverso.value = false
}

onMounted(cargar)
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-10">
    <ULink
      :to="`/mazos/${mazoId}`"
      class="text-sm text-muted"
    >
      Volver al mazo
    </ULink>

    <h1 class="mt-3 text-2xl font-bold">
      Repaso de {{ nombreMazo }}
    </h1>

    <USkeleton
      v-if="cargando"
      class="mt-8 h-60 w-full"
    />

    <div
      v-else-if="!tarjeta"
      class="mt-10 text-center border border-dashed border-default rounded-lg py-14"
    >
      <UIcon
        name="i-lucide-party-popper"
        class="size-8 text-primary"
      />
      <p class="mt-3 font-medium">
        No tienes tarjetas pendientes para hoy
      </p>
      <p class="text-sm text-muted mt-1">
        Vuelve mañana o agrega tarjetas nuevas al mazo.
      </p>
    </div>

    <div v-else>
      <p class="mt-6 text-sm text-muted">
        Tarjeta {{ numeroActual }} de {{ total }}
      </p>

      <UCard class="mt-3">
        <p class="text-lg font-medium text-center py-6 break-words">
          {{ tarjeta.anverso }}
        </p>

        <template
          v-if="mostrandoReverso"
          #footer
        >
          <p class="text-center py-4 break-words">
            {{ tarjeta.reverso }}
          </p>
        </template>
      </UCard>

      <UButton
        v-if="!mostrandoReverso"
        block
        class="mt-6"
        @click="mostrandoReverso = true"
      >
        Mostrar respuesta
      </UButton>

      <div
        v-else
        class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        <UButton
          v-for="calificacion in CALIFICACIONES"
          :key="calificacion.valor"
          :color="calificacion.color"
          variant="subtle"
          block
          @click="calificar(calificacion.valor)"
        >
          {{ calificacion.etiqueta }}
        </UButton>
      </div>
    </div>
  </div>
</template>
