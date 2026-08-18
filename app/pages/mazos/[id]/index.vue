<script setup lang="ts">
import { fechaDeHoy } from '~/utils/fechas'

definePageMeta({
  middleware: 'auth'
})

interface Tarjeta {
  id: string
  anverso: string
  reverso: string
  proximo_repaso: string
}

const route = useRoute()
const client = useSupabaseClient()
const user = useSupabaseUser()

const mazoId = route.params.id as string

const nombreMazo = ref('')
const tarjetas = ref<Tarjeta[]>([])
const cargando = ref(true)

const formularioAbierto = ref(false)
const tarjetaEditada = ref<Tarjeta | null>(null)
const anverso = ref('')
const reverso = ref('')
const errorCampos = ref('')
const guardando = ref(false)

const tarjetaPorEliminar = ref<Tarjeta | null>(null)

const vencidas = computed(() => tarjetas.value.filter(t => t.proximo_repaso <= fechaDeHoy()).length)

async function cargar() {
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
    .select('id, anverso, reverso, proximo_repaso')
    .eq('mazo_id', mazoId)
    .order('creado_en', { ascending: true })

  tarjetas.value = data ?? []
  cargando.value = false
}

function abrirNueva() {
  tarjetaEditada.value = null
  anverso.value = ''
  reverso.value = ''
  errorCampos.value = ''
  formularioAbierto.value = true
}

function abrirEdicion(tarjeta: Tarjeta) {
  tarjetaEditada.value = tarjeta
  anverso.value = tarjeta.anverso
  reverso.value = tarjeta.reverso
  errorCampos.value = ''
  formularioAbierto.value = true
}

async function guardar() {
  if (anverso.value.trim() === '' || reverso.value.trim() === '') {
    errorCampos.value = 'El anverso y el reverso son obligatorios'
    return
  }

  errorCampos.value = ''
  guardando.value = true

  if (tarjetaEditada.value) {
    await client
      .from('tarjetas')
      .update({ anverso: anverso.value.trim(), reverso: reverso.value.trim() })
      .eq('id', tarjetaEditada.value.id)
    formularioAbierto.value = false
  } else {
    await client
      .from('tarjetas')
      .insert({
        mazo_id: mazoId,
        usuario_id: user.value!.sub,
        anverso: anverso.value.trim(),
        reverso: reverso.value.trim(),
        proximo_repaso: fechaDeHoy()
      })
    anverso.value = ''
    reverso.value = ''
  }

  guardando.value = false
  await cargar()
}

async function eliminar() {
  const tarjeta = tarjetaPorEliminar.value

  if (!tarjeta) {
    return
  }

  await client.from('tarjetas').delete().eq('id', tarjeta.id)
  tarjetaPorEliminar.value = null
  await cargar()
}

onMounted(cargar)
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10">
    <ULink
      to="/mazos"
      class="text-sm text-muted"
    >
      Volver a mis mazos
    </ULink>

    <div class="mt-3 flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">
          {{ nombreMazo }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ tarjetas.length }} tarjetas · {{ vencidas }} para repasar hoy
        </p>
      </div>

      <div class="flex gap-2">
        <UButton
          :to="`/mazos/${mazoId}/estudiar`"
          icon="i-lucide-graduation-cap"
          color="neutral"
          variant="subtle"
        >
          Estudiar
        </UButton>
        <UButton
          icon="i-lucide-plus"
          @click="abrirNueva"
        >
          Nueva tarjeta
        </UButton>
      </div>
    </div>

    <div
      v-if="cargando"
      class="mt-8 space-y-3"
    >
      <USkeleton class="h-16 w-full" />
      <USkeleton class="h-16 w-full" />
    </div>

    <div
      v-else-if="tarjetas.length === 0"
      class="mt-10 text-center border border-dashed border-default rounded-lg py-14"
    >
      <UIcon
        name="i-lucide-file-question"
        class="size-8 text-muted"
      />
      <p class="mt-3 font-medium">
        Este mazo no tiene tarjetas
      </p>
      <p class="text-sm text-muted mt-1">
        Agrega la primera para empezar a repasar.
      </p>
    </div>

    <div
      v-else
      class="mt-8 space-y-3"
    >
      <UCard
        v-for="tarjeta in tarjetas"
        :key="tarjeta.id"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-medium break-words">
              {{ tarjeta.anverso }}
            </p>
            <p class="text-sm text-muted mt-1 break-words">
              {{ tarjeta.reverso }}
            </p>
            <p class="text-xs text-dimmed mt-2">
              Próximo repaso: {{ tarjeta.proximo_repaso }}
            </p>
          </div>

          <div class="flex gap-1 shrink-0">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              :aria-label="`Editar ${tarjeta.anverso}`"
              @click="abrirEdicion(tarjeta)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              :aria-label="`Eliminar ${tarjeta.anverso}`"
              @click="tarjetaPorEliminar = tarjeta"
            />
          </div>
        </div>
      </UCard>
    </div>

    <UModal
      v-model:open="formularioAbierto"
      :title="tarjetaEditada ? 'Editar tarjeta' : 'Nueva tarjeta'"
    >
      <template #body>
        <UFormField label="Anverso">
          <UTextarea
            v-model="anverso"
            :rows="3"
            placeholder="La pregunta o el concepto"
            :ui="{ root: 'w-full' }"
          />
        </UFormField>

        <UFormField
          label="Reverso"
          class="mt-4"
          :error="errorCampos || undefined"
        >
          <UTextarea
            v-model="reverso"
            :rows="3"
            placeholder="La respuesta"
            :ui="{ root: 'w-full' }"
          />
        </UFormField>
      </template>

      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          @click="formularioAbierto = false"
        >
          Cerrar
        </UButton>
        <UButton
          :loading="guardando"
          @click="guardar"
        >
          Guardar
        </UButton>
      </template>
    </UModal>

    <UModal
      :open="tarjetaPorEliminar !== null"
      title="Eliminar tarjeta"
      description="La tarjeta se elimina de forma definitiva."
      @update:open="tarjetaPorEliminar = null"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          @click="tarjetaPorEliminar = null"
        >
          Cancelar
        </UButton>
        <UButton
          color="error"
          @click="eliminar"
        >
          Eliminar
        </UButton>
      </template>
    </UModal>
  </div>
</template>
