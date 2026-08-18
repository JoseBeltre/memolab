<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()

const confirmarSalida = ref(false)

async function handleLogout() {
  confirmarSalida.value = false
  await client.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="font-display text-xl tracking-wide"
        >
          MemoLab
        </NuxtLink>
      </template>

      <template #right>
        <span
          v-if="user"
          class="hidden sm:block text-sm text-muted"
        >
          {{ user.email }}
        </span>

        <UButton
          v-if="user"
          icon="i-lucide-log-out"
          color="neutral"
          variant="ghost"
          aria-label="Cerrar sesión"
          @click="confirmarSalida = true"
        />
        <UButton
          v-else
          to="/login"
          color="neutral"
          variant="ghost"
        >
          Iniciar sesión
        </UButton>
      </template>
    </UHeader>

    <UMain class="flex flex-1 flex-col">
      <slot />
    </UMain>

    <PomodoroFlotante />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          MemoLab • © {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>

    <UModal
      v-model:open="confirmarSalida"
      title="Cerrar sesión"
      description="¿Seguro que quieres salir de tu cuenta?"
    >
      <template #footer>
        <UButton
          color="neutral"
          variant="ghost"
          @click="confirmarSalida = false"
        >
          Cancelar
        </UButton>
        <UButton
          color="error"
          @click="handleLogout"
        >
          Cerrar sesión
        </UButton>
      </template>
    </UModal>
  </div>
</template>
