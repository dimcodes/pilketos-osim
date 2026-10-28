<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  widthClass: { type: String, default: 'max-w-[460px]' },
})

defineEmits(['close'])
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
    @click.self="$emit('close')"
  >
    <section
      role="dialog"
      aria-modal="true"
      class="max-h-[90vh] w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
      :class="widthClass"
    >
      <div class="flex items-start justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 class="text-[17px] font-extrabold text-slate-800">{{ title }}</h2>
          <p v-if="subtitle" class="mt-1 text-[12px] font-medium text-slate-400">
            {{ subtitle }}
          </p>
        </div>

        <button
          type="button"
          title="Tutup"
          class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          @click="$emit('close')"
        >
          <X :size="19" />
        </button>
      </div>

      <slot />
    </section>
  </div>
</template>
