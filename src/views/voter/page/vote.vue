<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import {
  ChevronDown,
  Target,
  CheckCircle2,
  BookOpen,
  RefreshCw
} from 'lucide-vue-next'

import VoterHeader from '../../../components/voter/header.vue'
import Footer from '../../../components/common/footer.vue'
import { useSession } from '../../../services/voter/session'
import { useToast } from '../../../services/ui/toast'
import { supabase } from '../../../lib/supabase'
import { paslonFoto } from '../../../lib/storage'
import { getPaslons } from '../../../services/voter/paslon'
import { confirmAction, warmConfirm } from '../../../services/ui/confirm'

const router = useRouter()
const { voter: sessionState, clearVoter } = useSession()
const { showToast } = useToast()

const root = ref(null)
const panels = {}
const voter = ref({
  nama: '',
  kelas: '',
  username: '',
  id: null
})

const paslons = ref([])
const loadingPaslons = ref(true)
const loadError = ref(false)
const retrying = ref(false)
const voting = ref(false)

let ctx = null

onMounted(async () => {
  if (!sessionState.voter?.token) {
    loadingPaslons.value = false
    showToast('Akses ditolak! Silakan login terlebih dahulu.', 'error')
    router.replace('/login')
    return
  }

  voter.value = { ...sessionState.voter }

  warmConfirm()

  await nextTick()

  if (root.value) {
    ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-anim="title"]',
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.55,
          ease: 'power3.out',
          clearProps: 'opacity,visibility,transform'
        }
      )
    }, root.value)
  }

  await loadPaslons()
})

async function loadPaslons() {
  loadingPaslons.value = true
  loadError.value = false

  try {
    const { data, error } = await getPaslons(sessionState.voter?.token)

    if (error) {
      if (error.code === '28000') {
        clearVoter()
        showToast('Sesi berakhir. Silakan login kembali.', 'error')
        router.replace('/login')
        return
      }
      throw error
    }

    paslons.value = (data || []).map((p) => ({
      id: p.id,
      no_urut: p.nomor_urut,
      nama_paslon: p.nama,
      foto: paslonFoto(p.nomor_urut),
      visi: p.visi || '',
      misi: Array.isArray(p.misi) ? p.misi : [],
      isOpen: false
    }))
  } catch (error) {
    console.error('Gagal memuat paslon:', error)
    loadError.value = true
    showToast('Gagal memuat data kandidat dari database.', 'error')
  } finally {
    loadingPaslons.value = false
  }

  await nextTick()

  if (!root.value || !paslons.value.length || loadError.value) return

  ctx?.add(() => {
    const cards = gsap.utils.toArray(
      '[data-anim="card"]',
      root.value
    )

    gsap.fromTo(
      cards,
      { y: 24, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.45,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'opacity,visibility,transform'
      }
    )
  })
}

async function retryLoad() {
  if (retrying.value) return

  retrying.value = true

  try {
    await loadPaslons()
  } finally {
    retrying.value = false
  }
}

onBeforeUnmount(() => {
  ctx?.revert()
  Object.values(panels).forEach((el) => {
    if (el) gsap.killTweensOf(el)
  })
})

function animatePanel(id, open) {
  const el = panels[id]

  if (!el) return

  gsap.killTweensOf(el)

  if (open) {
    gsap.fromTo(
      el,
      { height: 0, opacity: 0 },
      {
        height: 'auto',
        opacity: 1,
        duration: 0.35,
        ease: 'power3.out'
      }
    )

    gsap.fromTo(
      el.querySelectorAll('[data-reveal]'),
      { y: 8, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.25,
        stagger: 0.05,
        delay: 0.05,
        ease: 'power2.out',
        clearProps: 'all'
      }
    )
  } else {
    gsap.to(el, {
      height: 0,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.inOut'
    })
  }
}

function toggleVisiMisi(id) {
  const selected = paslons.value.find((p) => p.id === id)

  if (!selected) return

  const willOpen = !selected.isOpen

  paslons.value.forEach((p) => {
    p.isOpen = false
  })

  selected.isOpen = willOpen

  nextTick(() => {
    animatePanel(id, willOpen)
  })
}

async function handleVote(paslon) {
  if (!sessionState.voter?.token) {
    showToast('Sesi pemilih tidak ditemukan. Silakan login kembali.', 'error')
    router.replace('/login')
    return
  }

  const confirmed = await confirmAction({
    title: `Pilih Paslon No. ${paslon.no_urut}?`,
    text: `Anda akan memilih ${paslon.nama_paslon}. Pilihan tidak dapat diubah setelah dikonfirmasi!`,
    confirmText: 'Ya, Coblos!',
    confirmColor: '#05ad53',
    cancelColor: '#ef4444',
    reverse: true
  })

  if (!confirmed || voting.value) return
  voting.value = true

  try {
    const { data, error } = await supabase.rpc('cast_vote', {
      p_token: sessionState.voter.token,
      p_paslon_id: paslon.id
    })

    if (error || !data?.ok) {
      console.error(error)
      showToast(data?.message || 'Gagal menyimpan pilihan. Coba lagi.', 'error')
      if (data && !data.ok) {
        clearVoter()
        router.replace('/login')
      }
      return
    }

    await router.replace('/')
    showToast('Berhasil! Terima kasih telah menggunakan hak suara.', 'success')
    clearVoter()
  } finally {
    voting.value = false
  }
}
</script>

<template>
  <div ref="root" class="min-h-screen bg-[#F7F9F8] text-slate-900">
    <VoterHeader :voter="voter" />

    <main class="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <section
        data-anim="title"
        class="mb-10 text-center sm:mb-12"
      >
        <h1 class="text-2xl font-extrabold tracking-tight text-[#172D28] sm:text-3xl lg:text-4xl">
          Daftar Kandidat Calon Ketua OSIM
        </h1>

        <p class="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
          Kenali setiap pasangan calon, pelajari visi dan misinya, lalu tentukan pilihanmu dengan bijak.
        </p>
      </section>

      <section
        v-if="loadingPaslons"
        aria-label="Memuat kandidat"
        aria-busy="true"
        class="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="n in 3"
          :key="n"
          class="animate-pulse self-start rounded-[26px] border border-[#E1E8E4] bg-white p-3"
        >
          <div class="h-[290px] rounded-[19px] bg-[#EAF2EE] sm:h-[310px]"></div>

          <div class="mt-5 h-12 rounded-2xl bg-[#EAF2EE]"></div>

          <div class="mt-4 h-12 rounded-2xl bg-[#EAF2EE]"></div>
        </div>
      </section>

      <section
        v-else-if="loadError"
        class="rounded-[26px] border border-dashed border-[#C7DDD1] bg-white px-5 py-16 text-center"
      >
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2EE] text-[#376B55]">
          <RefreshCw :size="24" />
        </div>

        <h2 class="mt-5 text-lg font-bold text-[#172D28]">
          Gagal Memuat Kandidat
        </h2>

        <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Periksa koneksi internet lalu coba muat ulang data kandidat.
        </p>

        <button
          type="button"
          :disabled="retrying"
          @click="retryLoad"
          class="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#193F34] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#285847] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw :size="16" :class="retrying ? 'animate-spin' : ''" />
          {{ retrying ? 'Memuat...' : 'Coba Lagi' }}
        </button>
      </section>

      <section
        v-else-if="paslons.length"
        class="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="paslon in paslons"
          :key="paslon.id"
          data-anim="card"
          class="group self-start overflow-hidden rounded-[26px] border border-[#E1E8E4] bg-white p-3 shadow-[0_8px_30px_rgba(28,60,46,0.04)] transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:border-[#A9C7B7] hover:shadow-[0_18px_40px_rgba(28,60,46,0.13)] active:translate-y-0 active:scale-[0.99] active:border-[#8EAF9D] active:shadow-[0_4px_14px_rgba(28,60,46,0.10)]"
        >
          <div class="relative h-[290px] overflow-hidden rounded-[19px] bg-[#EAF2EE] sm:h-[310px]">
            <img
  :src="paslon.foto"
  :alt="`Foto ${paslon.nama_paslon}`"
  width="600"
  height="750"
  :loading="paslon.no_urut === 1 ? 'eager' : 'lazy'"
  decoding="async"
  :fetchpriority="paslon.no_urut === 1 ? 'high' : 'auto'"
  class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
/>

            <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/25 via-50% to-transparent"></div>

            <div class="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-white/50 bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Paslon
              </span>

              <span class="text-lg font-extrabold leading-none text-[#204C3D]">
                {{ paslon.no_urut }}
              </span>
            </div>

            <div class="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <h2 class="text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">
                {{ paslon.nama_paslon }}
              </h2>
            </div>
          </div>

          <div class="px-1 pb-1 pt-4">
            <button
              type="button"
              :aria-expanded="paslon.isOpen"
              :aria-controls="`panel-${paslon.id}`"
              @click="toggleVisiMisi(paslon.id)"
              class="flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors duration-200"
              :class="paslon.isOpen
                ? 'border-[#C7DDD1] bg-[#EDF5F0] text-[#24533F]'
                : 'border-[#E5EBE7] bg-[#F8FAF9] text-[#344B40] hover:border-[#C7DDD1] hover:bg-[#F0F6F2]'"
            >
              <span class="flex items-center gap-3">
                <span
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  :class="paslon.isOpen ? 'bg-white' : 'bg-[#EAF2EE]'"
                >
                  <BookOpen :size="18" :stroke-width="1.8" />
                </span>

                <span class="text-sm font-bold">Visi &amp; Misi</span>
              </span>

              <ChevronDown
                :size="18"
                class="shrink-0 transition-transform duration-300"
                :class="paslon.isOpen ? 'rotate-180' : ''"
              />
            </button>

            <div
              :id="`panel-${paslon.id}`"
              :ref="(el) => { if (el) panels[paslon.id] = el }"
              class="overflow-hidden"
              style="height: 0; opacity: 0"
            >
              <div class="space-y-5 px-2 pb-3 pt-5">
                <div data-reveal>
                  <h3 class="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#376B55]">
                    <Target :size="15" />
                    Visi
                  </h3>

                  <p class="text-sm leading-6 text-slate-600">
                    {{ paslon.visi || 'Visi belum tersedia.' }}
                  </p>
                </div>

                <div data-reveal>
                  <h3 class="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#376B55]">
                    <CheckCircle2 :size="15" />
                    Misi
                  </h3>

                  <ul v-if="paslon.misi.length" class="space-y-3">
                    <li
                      v-for="(misi, index) in paslon.misi"
                      :key="index"
                      class="flex items-start gap-3"
                    >
                      <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#EAF2ED] text-[11px] font-extrabold text-[#376B55]">
                        {{ index + 1 }}
                      </span>

                      <p class="pt-0.5 text-sm leading-6 text-slate-600">
                        {{ misi }}
                      </p>
                    </li>
                  </ul>

                  <p v-else class="text-sm leading-6 text-slate-500">
                    Misi belum tersedia.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="handleVote(paslon)"
              class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#193F34] px-4 py-3.5 text-sm font-bold text-white transition duration-200 hover:bg-[#285847] focus:outline-none focus:ring-4 focus:ring-[#193F34]/15 active:scale-[0.98]"
            >
              Coblos Kandidat Ini
              <CheckCircle2 :size="17" />
            </button>
          </div>
        </article>
      </section>

      <section
        v-else
        class="rounded-[26px] border border-dashed border-[#C7DDD1] bg-white px-5 py-16 text-center"
      >
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2EE] text-[#376B55]">
          <BookOpen :size="25" />
        </div>

        <h2 class="mt-5 text-lg font-bold text-[#172D28]">
          Belum Ada Kandidat
        </h2>

        <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Data pasangan calon belum tersedia. Silakan hubungi panitia pemilihan.
        </p>
      </section>
    </main>

    <Footer />
  </div>
</template>