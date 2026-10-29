<script setup>
import { useToast } from './services/ui/toast'
import { CheckCircle2, AlertCircle } from 'lucide-vue-next'

const { toastState } = useToast()
</script>

<template>
  <router-view />

  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform -translate-y-4 opacity-0 scale-95"
    enter-to-class="transform translate-y-0 opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100 scale-100"
    leave-to-class="transform -translate-y-4 opacity-0 scale-95"
  >
    <div
      v-if="toastState.show"
      class="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 pl-3 pr-5 py-3 rounded-2xl shadow-lg shadow-slate-900/10 border w-max max-w-[95vw]"
      :class="toastState.type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
        : 'bg-red-50 border-red-200 text-red-900'"
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        :class="toastState.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'"
      >
        <component
          :is="toastState.type === 'success' ? CheckCircle2 : AlertCircle"
          class="w-5 h-5"
          :class="toastState.type === 'success' ? 'text-emerald-600' : 'text-red-600'"
        />
      </div>

      <div class="flex-1 text-[13.5px] font-medium tracking-wide whitespace-nowrap">
        {{ toastState.message }}
      </div>
    </div>
  </transition>
</template>