
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { UserRound, Vote } from 'lucide-vue-next'

defineProps({
  voter: {
    type: Object,
    required: true
  }
})

const bar = ref(null)
let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from(bar.value, {
      y: -40,
      opacity: 0,
      duration: 0.55,
      ease: 'power3.out',
      clearProps: 'transform,opacity'
    })
  })
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <header
    ref="bar"
    class="sticky top-0 z-20 border-b border-[#E5ECE7] bg-white/95 shadow-[0_4px_20px_rgba(25,63,52,0.04)] backdrop-blur-xl"
  >
    <div
      class="mx-auto flex min-h-[72px] max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8"
    >
      <!-- Brand -->
      <div class="flex min-w-0 items-center gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#193F34] text-white shadow-sm shadow-[#193F34]/15"
        >
          <Vote :size="21" :stroke-width="2" />
        </div>

        <div class="min-w-0">
          <p class="truncate text-sm font-extrabold tracking-tight text-[#172D28] sm:text-base">
            E-Voting OSIM
          </p>
          <p class="mt-0.5 text-[11px] font-medium text-slate-500 sm:text-xs">
            Pemilihan Ketua OSIM
          </p>
        </div>
      </div>

      <div
        class="flex min-w-0 max-w-[58%] items-center gap-3 rounded-2xl border border-[#E8EEEA] bg-[#F8FAF9] py-2 pl-3 pr-2 sm:max-w-none sm:gap-4 sm:pl-4 sm:pr-3"
      >
        <div class="min-w-0 text-right">
          <p class="truncate text-xs font-bold leading-5 text-[#172D28] sm:text-sm">
            {{ voter.nama || 'Pemilih' }}
          </p>

          <p class="mt-0.5 truncate text-[10px] leading-4 text-slate-500 sm:text-xs">
            {{ voter.kelas }}
            <span v-if="voter.kelas && voter.username" class="mx-1 text-slate-900 text-[17px]">·</span>
            {{ voter.username }}
          </p>
        </div>

        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E5F0E9] text-[#285847] sm:h-10 sm:w-10"
        >
          <UserRound :size="19" :stroke-width="1.8" />
        </div>
      </div>
    </div>
  </header>
</template>