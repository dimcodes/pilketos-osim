<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  caption: { type: String, default: '' },
  captionClass: { type: String, default: 'font-medium text-slate-400' },
  iconClass: { type: String, default: '' },
  icon: { type: [Object, Function], required: true },
})
</script>

<template>
  <article
    class="rounded-xl border border-[#dce5dd] bg-white p-6 shadow-[0_3px_18px_rgba(30,60,40,0.045)] transition-[border-color,box-shadow] duration-200 hover:border-[#b8d0bd] hover:shadow-[0_6px_22px_rgba(30,60,40,0.07)]"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-[12px] font-bold text-slate-500">{{ label }}</p>
        <h3 class="mt-4 text-[38px] font-extrabold leading-none tracking-tight text-[#263b30]">
          {{ value }}
        </h3>
        <p class="mt-3 text-[12px]" :class="captionClass">{{ caption }}</p>
      </div>

      <div
        class="flex h-11 w-11 items-center justify-center rounded-lg"
        :class="iconClass"
      >
        <component :is="icon" :size="22" :stroke-width="2.1" />
      </div>
    </div>
  </article>
</template>
