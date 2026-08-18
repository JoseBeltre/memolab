<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()

async function handleLogout() {
  await client.auth.signOut()
  await navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 font-semibold"
        >
          <UIcon
            name="i-lucide-brain-circuit"
            class="size-5 text-primary"
          />
          MemoLab
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />

        <UButton
          v-if="user"
          icon="i-lucide-log-out"
          color="neutral"
          variant="ghost"
          aria-label="Cerrar sesión"
          @click="handleLogout"
        />
        <UButton
          v-else
          to="/registro"
          color="neutral"
          variant="ghost"
        >
          Crear cuenta
        </UButton>
      </template>
    </UHeader>

    <UMain class="flex-1">
      <slot />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          MemoLab • © {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>
  </div>
</template>
