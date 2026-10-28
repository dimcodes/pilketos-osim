<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home, AlertTriangle } from 'lucide-vue-next'
import gsap from 'gsap'
import Footer from '../components/Footer.vue'

const router = useRouter()
const cardRef = ref(null)
const badgeRef = ref(null)
const titleRef = ref(null)
const descRef = ref(null)
const btnRef = ref(null)

onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.fromTo(cardRef.value, 
    { y: 40, opacity: 0, scale: 0.95 }, 
    { y: 0, opacity: 1, scale: 1, duration: 0.8 }
  )
  .fromTo(badgeRef.value, { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.4')
  .fromTo(titleRef.value, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3')
  .fromTo(descRef.value, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
  .fromTo(btnRef.value, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3')
})

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="relative min-h-screen flex flex-col items-center justify-center p-6 bg-fixed bg-cover bg-center" style="background-image: url('../assets/lap.png');">
    
    <!-- Background overlay -->
    <div class="absolute inset-0 bg-white/90 backdrop-blur-[3px]"></div>

    <!-- Card Utama -->
    <div 
      ref="cardRef" 
      class="relative z-10 w-full max-w-md bg-white/95 border border-slate-300/80 rounded-3xl p-8 md:p-10 shadow-2xl shadow-slate-950/15 backdrop-blur-md text-center opacity-0"
    >
      
      <div ref="badgeRef" class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 mb-6 shadow-sm opacity-0 mx-auto">
        <AlertTriangle class="w-8 h-8" />
      </div>

      <h1 ref="titleRef" class="text-3xl font-extrabold text-[var(--text-main)] tracking-tight opacity-0">
        404 - Halaman Hilang
      </h1>

      <p ref="descRef" class="text-[var(--text-muted)] text-sm mt-3 mb-8 opacity-0">
        Maaf, halaman yang Anda akses tidak ditemukan atau tautan yang Anda buka salah.
      </p>

      <div ref="btnRef" class="opacity-0">
        <button 
          @click="goHome"
          class="w-full py-4 px-6 rounded-2xl bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white font-semibold shadow-lg shadow-emerald-950/25 transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 text-base cursor-pointer"
        >
          <Home class="w-5 h-5 mr-1" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

    </div>

    <Footer class="absolute bottom-4 z-10" />

  </div>
</template>