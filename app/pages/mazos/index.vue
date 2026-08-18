<script setup lang="ts">
import { DECK_NAME_MAX_LENGTH, validateDeckName } from '~/utils/validation'

definePageMeta({
  middleware: 'auth'
})

interface MazoConTarjetas {
  id: string
  nombre: string
  descripcion: string
  tarjetas: number
}

const client = useSupabaseClient()
const user = useSupabaseUser()

const mazos = ref<MazoConTarjetas[]>([])
const cargando = ref(true)

const formularioAbierto = ref(false)
const mazoEditado = ref<MazoConTarjetas | null>(null)
const nombre = ref('')
const descripcion = ref('')
const errorNombre = ref<string | null>(null)
const guardando = ref(false)

const mazoPorEliminar = ref<MazoConTarjetas | null>(null)

const tituloFormulario = computed(() => (mazoEditado.value ? 'Editar mazo' : 'Nuevo mazo'))

async function cargarMazos() {
  cargando.value = true

  const { data: lista } = await client
    .from('mazos')
    .select('id, nombre, descripcion')
    .order('creado_en', { ascending: true })

  const { data: tarjetas } = await client
    .from('tarjetas')
    .select('mazo_id')

  mazos.value = (lista ?? []).map(mazo => ({
    ...mazo,
    tarjetas: (tarjetas ?? []).filter(tarjeta => tarjeta.mazo_id === mazo.id).length
  }))

  cargando.value = false
}

function abrirNuevo() {
  mazoEditado.value = null
  nombre.value = ''
  descripcion.value = ''
  errorNombre.value = null
  formularioAbierto.value = true
}

function abrirEdicion(mazo: MazoConTarjetas) {
  mazoEditado.value = mazo
  nombre.value = mazo.nombre
  descripcion.value = mazo.descripcion
  errorNombre.value = null
  formularioAbierto.value = true
}

async function guardar() {
  errorNombre.value = validateDeckName(nombre.value)

  if (errorNombre.value) {
    return
  }

  guardando.value = true

  if (mazoEditado.value) {
    await client
      .from('mazos')
      .update({ nombre: nombre.value.trim(), descripcion: descripcion.value.trim() })
      .eq('id', mazoEditado.value.id)
  } else {
    await client
      .from('mazos')
      .insert({
        usuario_id: user.value!.sub,
        nombre: nombre.value.trim(),
        descripcion: descripcion.value.trim()
      })
  }

  guardando.value = false
  formularioAbierto.value = false
  await cargarMazos()
}

async function eliminar() {
  const mazo = mazoPorEliminar.value

  if (!mazo) {
    return
  }

  await client.from('mazos').delete().eq('id', mazo.id)
  mazoPorEliminar.value = null
  await cargarMazos()
}

onMounted(cargarMazos)
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">
          Mis mazos
        </h1>
        <p class="text-sm text-muted mt-1">
          Organiza tus tarjetas por asignatura o por tema.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        @click="abrirNuevo"
      >
        Nuevo mazo
      </UButton>
    </div>

    <div
      v-if="cargando"
      class="mt-8 space-y-3"
    >
      <USkeleton class="h-20 w-full" />
      <USkeleton class="h-20 w-full" />
    </div>

    <div
      v-else-if="mazos.length === 0"
      class="mt-10 text-center border border-dashed border-default rounded-lg py-14"
    >
      <UIcon
        name="i-lucide-layers"
        class="size-8 text-muted"
      />
      <p class="mt-3 font-medium">
        Todavía no tienes mazos
      </p>
      <p class="text-sm text-muted mt-1">
        Crea el primero para empezar a guardar tus tarjetas.
      </p>
    </div>

    <div
      v-else
      class="mt-8 grid gap-4 sm:grid-cols-2"
    >
      <UCard
        v-for="mazo in mazos"
        :key="mazo.id"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <NuxtLink
              :to="`/mazos/${mazo.id}`"
              class="font-semibold hover:text-primary"
            >
              {{ mazo.nombre }}
            </NuxtLink>
            <p class="text-sm text-muted mt-1 break-words">
              {{ mazo.descripcion || 'Sin descripción' }}
            </p>
            <UBadge
              variant="subtle"
              color="neutral"
              class="mt-3"
            >
              {{ mazo.tarjetas }} tarjetas
            </UBadge>
          </div>

          <div class="flex gap-1 shrink-0">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              :aria-label="`Editar ${mazo.nombre}`"
              @click="abrirEdicion(mazo)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              :aria-label="`Eliminar ${mazo.nombre}`"
              @click="mazoPorEliminar = mazo"
            />
          </div>
        </div>
      </UCard>
    </div>

    <UModal
      v-model:open="formularioAbierto"
      :title="tituloFormulario"
    >
      <template #body>
        <UFormField
          label="Nombre"
          :error="errorNombre ?? undefined"
        >
          <UInput
            v-model="nombre"
            :maxlength="DECK_NAME_MAX_LENGTH"
            placeholder="Programación III"
            :ui="{ root: 'w-full' }"
          />
        </UFormField>

        <UFormField
          label="Descripción"
          class="mt-4"
        >
          <UTextarea
            v-model="descripcion"
            :rows="3"
            placeholder="Qué vas a estudiar en este mazo"
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
          Cancelar
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
      :open="mazoPorEliminar !== null"
      title="Eliminar mazo"
      :description="`Se eliminará «${mazoPorEliminar?.nombre}» junto con sus tarjetas. Esta acción no se puede deshacer.`"
      @update:open="mazoPorEliminar = null"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          @click="mazoPorEliminar = null"
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
