<script setup lang="ts">
import { filtrarPorTitulo, validarTitulo } from '~/utils/notas'

definePageMeta({
  middleware: 'auth'
})

interface Nota {
  id: string
  titulo: string
  contenido: string
  actualizado_en: string
}

const client = useSupabaseClient()
const user = useSupabaseUser()

const notas = ref<Nota[]>([])
const cargando = ref(true)
const busqueda = ref('')

const formularioAbierto = ref(false)
const notaEditada = ref<Nota | null>(null)
const titulo = ref('')
const contenido = ref('')
const errorTitulo = ref<string | null>(null)
const guardando = ref(false)

const notaPorEliminar = ref<Nota | null>(null)

const notasFiltradas = computed(() => filtrarPorTitulo(notas.value, busqueda.value))

function fechaLegible(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

async function cargar() {
  const { data } = await client
    .from('notas')
    .select('id, titulo, contenido, actualizado_en')
    .order('actualizado_en', { ascending: false })

  notas.value = data ?? []
  cargando.value = false
}

function abrirNueva() {
  notaEditada.value = null
  titulo.value = ''
  contenido.value = ''
  errorTitulo.value = null
  formularioAbierto.value = true
}

function abrirEdicion(nota: Nota) {
  notaEditada.value = nota
  titulo.value = nota.titulo
  contenido.value = nota.contenido
  errorTitulo.value = null
  formularioAbierto.value = true
}

async function guardar() {
  errorTitulo.value = validarTitulo(titulo.value)

  if (errorTitulo.value) {
    return
  }

  guardando.value = true

  if (notaEditada.value) {
    await client
      .from('notas')
      .update({
        titulo: titulo.value.trim(),
        contenido: contenido.value.trim(),
        actualizado_en: new Date().toISOString()
      })
      .eq('id', notaEditada.value.id)
  } else {
    await client
      .from('notas')
      .insert({
        usuario_id: user.value!.sub,
        titulo: titulo.value.trim(),
        contenido: contenido.value.trim()
      })
  }

  guardando.value = false
  formularioAbierto.value = false
  await cargar()
}

async function eliminar() {
  const nota = notaPorEliminar.value

  if (!nota) {
    return
  }

  await client.from('notas').delete().eq('id', nota.id)
  notaPorEliminar.value = null
  await cargar()
}

onMounted(cargar)
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-10">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">
          Mis notas
        </h1>
        <p class="text-sm text-muted mt-1">
          Los apuntes que acompañan tus repasos.
        </p>
      </div>

      <UButton
        icon="i-lucide-plus"
        @click="abrirNueva"
      >
        Nueva nota
      </UButton>
    </div>

    <UInput
      v-model="busqueda"
      icon="i-lucide-search"
      placeholder="Buscar por título"
      class="mt-6"
      :ui="{ root: 'w-full sm:max-w-sm' }"
    />

    <div
      v-if="cargando"
      class="mt-8 space-y-3"
    >
      <USkeleton class="h-20 w-full" />
      <USkeleton class="h-20 w-full" />
    </div>

    <div
      v-else-if="notas.length === 0"
      class="mt-10 text-center border border-dashed border-default rounded-lg py-14"
    >
      <UIcon
        name="i-lucide-notebook-pen"
        class="size-8 text-muted"
      />
      <p class="mt-3 font-medium">
        Todavía no tienes notas
      </p>
      <p class="text-sm text-muted mt-1">
        Crea la primera para guardar tus apuntes.
      </p>
    </div>

    <p
      v-else-if="notasFiltradas.length === 0"
      class="mt-10 text-center text-muted"
    >
      Ninguna nota coincide con la búsqueda
    </p>

    <div
      v-else
      class="mt-8 space-y-3"
    >
      <UCard
        v-for="nota in notasFiltradas"
        :key="nota.id"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-medium break-words">
              {{ nota.titulo }}
            </p>
            <p class="text-sm text-muted mt-1 break-words whitespace-pre-line">
              {{ nota.contenido }}
            </p>
            <p class="text-xs text-dimmed mt-2">
              Última modificación: {{ fechaLegible(nota.actualizado_en) }}
            </p>
          </div>

          <div class="flex gap-1 shrink-0">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              :aria-label="`Editar ${nota.titulo}`"
              @click="abrirEdicion(nota)"
            />
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              :aria-label="`Eliminar ${nota.titulo}`"
              @click="notaPorEliminar = nota"
            />
          </div>
        </div>
      </UCard>
    </div>

    <UModal
      v-model:open="formularioAbierto"
      :title="notaEditada ? 'Editar nota' : 'Nueva nota'"
    >
      <template #body>
        <UFormField
          label="Título"
          :error="errorTitulo ?? undefined"
        >
          <UInput
            v-model="titulo"
            placeholder="Resumen de la clase"
            :ui="{ root: 'w-full' }"
          />
        </UFormField>

        <UFormField
          label="Contenido"
          class="mt-4"
        >
          <UTextarea
            v-model="contenido"
            :rows="6"
            placeholder="Lo que quieres recordar"
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
      :open="notaPorEliminar !== null"
      title="Eliminar nota"
      description="La nota se elimina de forma definitiva."
      @update:open="notaPorEliminar = null"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          @click="notaPorEliminar = null"
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
