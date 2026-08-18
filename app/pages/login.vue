<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const client = useSupabaseClient()

const email = ref('')
const password = ref('')
const loading = ref(false)
const submitError = ref('')

const canSubmit = computed(() => email.value.trim() !== '' && password.value !== '')

async function handleLogin() {
  submitError.value = ''
  loading.value = true

  const { error } = await client.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value
  })

  loading.value = false

  if (error) {
    submitError.value = 'Correo o contraseña incorrectos'
    return
  }

  await navigateTo('/')
}
</script>

<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <h1 class="text-xl font-semibold">
        Iniciar sesión
      </h1>
      <p class="text-sm text-muted mt-1">
        Entra para seguir con tus repasos.
      </p>
    </template>

    <form
      novalidate
      @submit.prevent="handleLogin"
    >
      <UFormField
        label="Correo electrónico"
        name="email"
      >
        <UInput
          v-model="email"
          type="email"
          placeholder="estudiante@itla.edu.do"
          :ui="{ root: 'w-full' }"
        />
      </UFormField>

      <UFormField
        label="Contraseña"
        name="password"
        class="mt-4"
      >
        <UInput
          v-model="password"
          type="password"
          :ui="{ root: 'w-full' }"
        />
      </UFormField>

      <p
        v-if="submitError"
        class="mt-4 text-sm text-error"
        role="alert"
      >
        {{ submitError }}
      </p>

      <UButton
        type="submit"
        block
        class="mt-6"
        :disabled="!canSubmit || loading"
        :loading="loading"
      >
        Iniciar sesión
      </UButton>
    </form>

    <template #footer>
      <p class="text-sm text-muted text-center">
        ¿No tienes cuenta?
        <ULink to="/registro">
          Crear cuenta
        </ULink>
      </p>
    </template>
  </UCard>
</template>
