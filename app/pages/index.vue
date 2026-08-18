<script setup lang="ts">
const user = useSupabaseUser()

const secciones = [
  {
    titulo: 'Mis mazos',
    descripcion: 'Organiza tus tarjetas por asignatura y repásalas.',
    icono: 'i-lucide-layers',
    ruta: '/mazos'
  },
  {
    titulo: 'Pomodoro',
    descripcion: 'Estudia en bloques de enfoque con descansos entre uno y otro.',
    icono: 'i-lucide-timer',
    ruta: '/pomodoro'
  },
  {
    titulo: 'Notas',
    descripcion: 'Guarda y busca los apuntes que acompañan tus repasos.',
    icono: 'i-lucide-notebook-pen',
    ruta: '/notas'
  }
]
</script>

<template>
  <div
    v-if="user"
    class="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-12 text-center"
  >
    <h1 class="font-display text-5xl tracking-wide">
      MemoLab
    </h1>
    <p class="mt-3 text-muted">
      Elige por dónde quieres empezar.
    </p>

    <div class="mt-10 grid w-full gap-4 sm:grid-cols-3">
      <NuxtLink
        v-for="seccion in secciones"
        :key="seccion.ruta"
        :to="seccion.ruta"
        class="rounded-2xl border border-default bg-elevated/40 p-6 text-left transition-colors hover:border-primary"
      >
        <UIcon
          :name="seccion.icono"
          class="size-6 text-primary"
        />
        <p class="mt-3 font-medium">
          {{ seccion.titulo }}
        </p>
        <p class="mt-1 text-sm text-muted">
          {{ seccion.descripcion }}
        </p>
      </NuxtLink>
    </div>
  </div>

  <div
    v-else
    class="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 text-center"
  >
    <div
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <div class="h-52 w-36 translate-x-10 -rotate-6 rounded-2xl bg-primary/5 sm:h-60 sm:w-44 sm:translate-x-14" />
      <div class="relative z-10 h-60 w-40 rounded-2xl bg-secondary/5 sm:h-72 sm:w-52" />
      <div class="h-52 w-36 -translate-x-10 rotate-6 rounded-2xl bg-primary/5 sm:h-60 sm:w-44 sm:-translate-x-14" />
    </div>

    <div class="relative z-20">
      <h1 class="font-display text-6xl tracking-wide sm:text-7xl">
        MemoLab
      </h1>
      <p class="mx-auto mt-5 max-w-xl text-lg text-muted">
        Plataforma web de estudio con repetición espaciada, enfoque Pomodoro y notas.
      </p>

      <div class="mt-9 flex justify-center">
        <UButton
          to="/registro"
          size="xl"
          trailing-icon="i-lucide-arrow-right"
        >
          Crear cuenta
        </UButton>
      </div>
    </div>
  </div>
</template>
