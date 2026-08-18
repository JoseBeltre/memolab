<script setup lang="ts">
const user = useSupabaseUser()
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16 text-center">
    <h1 class="text-4xl font-bold tracking-tight">
      MemoLab
    </h1>
    <p class="mt-4 text-lg text-muted">
      Plataforma web de estudio con repetición espaciada, enfoque Pomodoro y notas.
    </p>

    <p
      v-if="user"
      class="mt-8 text-muted"
    >
      Bienvenido de vuelta, {{ user.email }}.
    </p>

    <div
      v-else
      class="mt-8 flex justify-center gap-3"
    >
      <UButton
        to="/registro"
        size="lg"
      >
        Crear cuenta
      </UButton>
      <UButton
        to="/login"
        size="lg"
        color="neutral"
        variant="subtle"
      >
        Iniciar sesión
      </UButton>
    </div>
  </div>
</template>
