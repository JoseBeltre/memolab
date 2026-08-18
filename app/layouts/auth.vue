<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-12">
    <NuxtLink
      to="/"
      class="flex items-center gap-2 font-semibold text-lg mb-8"
    >
      <UIcon
        name="i-lucide-brain-circuit"
        class="size-6 text-primary"
      />
      MemoLab
    </NuxtLink>

    <slot />
  </div>
</template>
