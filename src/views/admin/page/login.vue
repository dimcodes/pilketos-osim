<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ShieldCheck, AlertCircle, Lock } from 'lucide-vue-next'
import gsap from 'gsap'
import Footer from '../../../components/common/footer.vue'
import { validateAdminLogin } from '../../../services/admin/auth'
import { useAdminSession } from '../../../services/admin/session'
import { useToast } from '../../../services/ui/toast'

const router = useRouter()
const { admin: sessionState } = useAdminSession()
const { showToast } = useToast()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const cardRef = ref(null)
const badgeRef = ref(null)
const titleRef = ref(null)
const descRef = ref(null)
const formRef = ref(null)

onMounted(() => {
  if (sessionState.admin) {
    router.push('/admin/dashboard')
    return
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  tl.fromTo(cardRef.value, 
    { y: 40, opacity: 0, scale: 0.95 }, 
    { y: 0, opacity: 1, scale: 1, duration: 0.8 }
  )
  .fromTo(badgeRef.value, { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.4')
  .fromTo(titleRef.value, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3')
  .fromTo(descRef.value, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
  .fromTo(formRef.value.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, '-=0.3')
})

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  const result = await validateAdminLogin(username.value, password.value)

  if (!result.success) {
    errorMessage.value = result.message
    loading.value = false
    gsap.fromTo(cardRef.value, { x: -8 }, { x: 8, duration: 0.1, yoyo: true, repeat: 3, clearProps: 'x' })
    return
  }

  gsap.to(cardRef.value, { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1 })

  setTimeout(() => {
    loading.value = false
    showToast('Login Admin Berhasil!', 'success')
    router.push('/admin/dashboard')
  }, 250)
}
</script>

<template>
  <div class="bg-lap relative min-h-screen flex flex-col items-center justify-center p-6 bg-fixed bg-cover bg-center">
    <div class="absolute inset-0 bg-white/80 backdrop-blur-[3px]"></div>
    
    <div 
      ref="cardRef" 
      class="relative z-10 w-full max-w-md bg-white/95 border border-slate-300/80 rounded-3xl p-8 md:p-10 shadow-2xl shadow-slate-950/25 backdrop-blur-md opacity-0"
    >
      
      <div class="text-center mb-6">
        <div ref="badgeRef" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold mb-4 shadow-sm opacity-0">
          <ShieldCheck class="w-4 h-4" />
          <span>Panel Administrator</span>
        </div>
        <h1 ref="titleRef" class="text-3xl font-extrabold text-[var(--text-main)] tracking-tight opacity-0">
          Login Admin
        </h1>
        <p ref="descRef" class="text-[var(--text-muted)] text-sm mt-2 opacity-0">
          Masukkan username dan kata sandi pengelola sistem.
        </p>
      </div>

      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform -translate-y-2 opacity-0"
      >
        <div v-if="errorMessage" class="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 text-[13.4px] font-medium rounded-2xl flex items-center space-x-3 shadow-sm">
          <AlertCircle class="w-5 h-5 text-red-500 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>
      </transition>

      <form @submit.prevent="handleLogin" ref="formRef" class="space-y-4">
        
        <div class="opacity-0">
          <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Username Admin
          </label>
          <input 
            v-model="username"
            type="text"
            placeholder="Masukkan username"
            class="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-300 rounded-2xl text-[var(--text-main)] placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm font-medium"
            required
          />
        </div>

        <div class="opacity-0">
          <label class="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Password
          </label>
          <input 
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-300 rounded-2xl text-[var(--text-main)] placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm font-medium"
            required
          />
        </div>

        <div class="opacity-0 pt-2">
          <button 
            type="submit"
            :disabled="loading"
            class="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-950/25 transition-all duration-200 active:scale-95 flex items-center justify-center space-x-2 text-base cursor-pointer disabled:opacity-50"
          >
            <span v-if="loading">Memeriksa Kredensial...</span>
            <span v-else class="flex items-center space-x-2">
              <span>Masuk ke Dashboard</span>
              <Lock class="w-5 h-5 ml-1" />
            </span>
          </button>
        </div>

      </form>

    </div>

    <Footer class="absolute bottom-4 z-10 text-white/80" />

  </div>
</template>