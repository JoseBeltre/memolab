<script setup lang="ts">
import { validateRegistration, registrationErrorMessage, type RegistrationValidation } from '~/utils/validation'

definePageMeta({
  layout: 'auth'
})

const client = useSupabaseClient()

const email = ref('')
const password = ref('')
const loading = ref(false)
const submitError = ref('')
const fieldErrors = ref<Pick<RegistrationValidation, 'emailError' | 'passwordError'>>({
  emailError: null,
  passwordError: null
})

const canSubmit = computed(() => validateRegistration(email.value, password.value).valid)

function runValidation() {
  const result = validateRegistration(email.value, password.value)
  fieldErrors.value = {
    emailError: result.emailError,
    passwordError: result.passwordError
  }
}

async function handleRegister() {
  submitError.value = ''
  runValidation()

  if (!validateRegistration(email.value, password.value).valid) {
    return
  }

  loading.value = true
  try {
    const { data, error } = await client.auth.signUp({
      email: email.value.trim(),
      password: password.value
    })

    if (error) {
      submitError.value = registrationErrorMessage(error)
      return
    }

    if (data.session) {
      await navigateTo('/')
    } else {
      submitError.value = 'No se pudo crear la cuenta. Inténtalo de nuevo.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <h1 class="text-xl font-semibold">
        Crear cuenta
      </h1>
      <p class="text-sm text-muted mt-1">
        Guarda tu material de estudio de forma privada.
      </p>
    </template>

    <form
      novalidate
      @submit.prevent="handleRegister"
    >
      <UFormField
        label="Correo electrónico"
        name="email"
        :error="fieldErrors.emailError ?? undefined"
      >
        <UInput
          v-model="email"
          type="email"
          placeholder="estudiante@itla.edu.do"
          :ui="{ root: 'w-full' }"
          @blur="runValidation"
        />
      </UFormField>

      <UFormField
        label="Contraseña"
        name="password"
        :error="fieldErrors.passwordError ?? undefined"
        class="mt-4"
      >
        <UInput
          v-model="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          :ui="{ root: 'w-full' }"
          @blur="runValidation"
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
        Crear cuenta
      </UButton>
    </form>

    <template #footer>
      <p class="text-sm text-muted text-center">
        ¿Ya tienes cuenta?
        <ULink to="/login">
          Iniciar sesión
        </ULink>
      </p>
    </template>
  </UCard>
</template>
