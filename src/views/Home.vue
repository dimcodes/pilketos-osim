<script setup>
import { useRouter } from 'vue-router'
import Footer from '../components/Footer.vue'
import { ArrowRight } from 'lucide-vue-next'

const router = useRouter()

const keLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="relative min-h-screen flex flex-col items-center justify-center p-6 bg-cover bg-center" style="background-image: url('../assets/lap.png');">
    
    <div class="absolute inset-0 bg-white/75 backdrop-blur-[2px]"></div>

    <div class="relative z-10 w-full max-w-xl bg-[var(--card-bg)] border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-2xl text-center backdrop-blur-md">
    <div class="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-sm">
        OSIM Periode 2026/2027
      </div>

      <h1 class="text-3xl md:text-4xl font-extrabold text-[var(--text-main)] mb-4 tracking-tight">
        Selamat Datang
      </h1>

      <p class="text-[var(--text-muted)] text-sm md:text-base leading-relaxed mb-8 w-full">
        Di website Pemilihan Ketua OSIM <strong class="text-slate-900 font-semibold">MTS Sunan Muria Kelet</strong>.<br class="hidden sm:block" />
        Silakan login untuk menentukan hak pilih dan kandidat pilihanmu.
      </p>

      <button 
        @click="keLogin"
        class="w-full py-4 px-6 rounded-2xl bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white font-semibold shadow-lg shadow-emerald-950/25 transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 text-base cursor-pointer"
      >
        <span>Login untuk Memilih Kandidat</span>
        <ArrowRight class="w-5 h-5" />
      </button>

    </div>
    <Footer class="absolute bottom-4 z-10" />

  </div>
</template>