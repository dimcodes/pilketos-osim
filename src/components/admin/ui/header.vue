<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 class="text-[21px] font-extrabold tracking-tight text-[#263b30]">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mt-1 text-[13px] font-medium text-slate-500">
        {{ subtitle }}
      </p>
    </div>

    <slot />
  </div>
</template>
