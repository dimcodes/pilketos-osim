<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})

const emit = defineEmits(['update:modelValue'])

const go = (page) => {
  if (page < 1 || page > props.totalPages || page === props.modelValue) return
  emit('update:modelValue', page)
}
</script>

<template>
  <div
    v-if="totalPages > 1"
    class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4"
  >
    <span class="text-[12px] font-semibold text-slate-500">
      Halaman {{ modelValue }} dari {{ totalPages }}
    </span>

    <div class="flex flex-wrap items-center gap-1">
      <button
        type="button"
        :disabled="modelValue === 1"
        title="Sebelumnya"
        class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
        @click="go(modelValue - 1)"
      >
        <ChevronLeft :size="16" />
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        type="button"
        class="h-9 min-w-9 rounded-lg border px-2 text-[12px] font-bold"
        :class="modelValue === page
          ? 'border-[#a6c6ac] bg-[#e7f0e6] text-[#356a49]'
          : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
        @click="go(page)"
      >
        {{ page }}
      </button>

      <button
        type="button"
        :disabled="modelValue === totalPages"
        title="Selanjutnya"
        class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
        @click="go(modelValue + 1)"
      >
        <ChevronRight :size="16" />
      </button>
    </div>
  </div>
</template>
