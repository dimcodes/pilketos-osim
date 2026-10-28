<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  Users, 
  Vote, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  BarChart3, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ListOrdered
} from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
)
import { gsap } from 'gsap'
import { useAdminSession } from '../../services/admin/admin.session'
import { useToast } from '../../services/toast'
import { supabase } from '../../supabase'
import Swal from 'sweetalert2'

const router = useRouter()
const { admin: sessionState, clearAdmin } = useAdminSession()
const { showToast } = useToast()

const currentTab = ref('home')
const sidebarRef = ref(null)
const isSidebarCollapsed = ref(false)

const getPaslonFoto = (nomor) => {
  return supabase.storage
    .from('paslon')
    .getPublicUrl(`${nomor}.jpg`)
    .data.publicUrl
}

const chartData = computed(() => ({
  labels: paslons.value.map(p => `Paslon ${p.nomor_urut}`),
  datasets: [
    {
      label: 'Jumlah Suara',
      data: paslons.value.map(p => Number(p.suara) || 0),
      backgroundColor: [
        '#3b82f6', 
        '#10b981', 
        '#f59e0b', 
        '#8b5cf6', 
        '#ec4899', 
        '#06b6d4'  
      ],
      borderRadius: 12,
      borderSkipped: false,
      maxBarThickness: 110,
      barPercentage: 0.65,
      categoryPercentage: 0.75
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 450
  },
  layout: {
    padding: {
      top: 15,
      right: 15,
      bottom: 5
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1e293b',
      padding: 12,
      displayColors: false,
      titleFont: {
        family: "'Poppins', sans-serif",
        size: 13
      },
      bodyFont: {
        family: "'Poppins', sans-serif",
        size: 13
      },
      callbacks: {
        label: context => `${context.parsed.y} suara`
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#334155',
        font: {
          family: "'Poppins', sans-serif",
          size: 13,
          weight: 600
        }
      },
      grid: {
        display: true,
        color: '#e2e8f0',
        drawBorder: false
      }
    },
    y: {
      beginAtZero: true,
      suggestedMax: 3,
      ticks: {
        precision: 0,
        color: '#64748b',
        font: {
          family: "'Poppins', sans-serif",
          size: 12,
          weight: 500
        }
      },
      grid: {
        display: true,
        color: '#e2e8f0',
        drawBorder: false
      }
    }
  }
}

const stats = ref({
  totalPemilih: 0,
  sudahMemilih: 0,
  belumMemilih: 0,
})
const paslons = ref([])
const pemilihs = ref([])
const searchQuery = ref('')

const selectedPaslonFilter = ref(null)
const currentVoterPage = ref(1)
const pageSize = 50

const showPemilihModal = ref(false)
const isEditPemilih = ref(false)
const pemilihForm = ref({ id: null, nama: '', kelas: '', username: '', tanggal_lahir: '', sudah_memilih: false, pilih_paslon: null })

const showPaslonModal = ref(false)
const isEditPaslon = ref(false)
const paslonForm = ref({ id: null, nama: '', nomor_urut: 1, visi: '', misi: '' })

let intervalId = null

onMounted(async () => {
  if (!sessionState.admin) {
    showToast('Akses ditolak! Silakan login admin.', 'error')
    router.push('/admin')
    return
  }
  await fetchData()

  if (paslons.value.length > 0) {
    selectedPaslonFilter.value = paslons.value[0].nomor_urut
  }

  intervalId = setInterval(async () => {
    await fetchData()
  }, 3000)

  if (sidebarRef.value) {
    gsap.from(sidebarRef.value, {
      x: -40,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out'
    })
  }
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})

const fetchData = async () => {
  const { data: resPemilih } = await supabase.rpc('get_pemilihs')
  if (resPemilih) {
    pemilihs.value = resPemilih
    stats.value.totalPemilih = resPemilih.length
    stats.value.sudahMemilih = resPemilih.filter(p => p.sudah_memilih).length
    stats.value.belumMemilih = resPemilih.length - stats.value.sudahMemilih
  }

  const { data: resPaslon } = await supabase.rpc('get_paslons')
  if (resPaslon) {
    paslons.value = resPaslon
    if (!selectedPaslonFilter.value && resPaslon.length > 0) {
      selectedPaslonFilter.value = resPaslon[0].nomor_urut
    }
  }
}

const handleLogout = () => {
  Swal.fire({
    title: 'Keluar dari Panel Admin?',
    text: 'Anda harus login kembali untuk mengakses panel.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#059669',
    cancelButtonColor: '#64748b'
  }).then((result) => {
    if (result.isConfirmed) {
      clearAdmin()
      showToast('Berhasil keluar dari sesi admin.', 'success')
      router.push('/admin/login')
    }
  })
}

const openAddPemilih = () => {
  isEditPemilih.value = false
  pemilihForm.value = { 
    id: null, 
    nama: '', 
    kelas: '', 
    username: '', 
    tanggal_lahir: '', 
    sudah_memilih: false, 
    pilih_paslon: null 
  }
  showPemilihModal.value = true
}

const openEditPemilih = (p) => {
  isEditPemilih.value = true
  pemilihForm.value = { 
    id: p.id, 
    nama: p.nama, 
    kelas: p.kelas, 
    username: p.username, 
    tanggal_lahir: p.tanggal_lahir,
    sudah_memilih: !!p.sudah_memilih,
    pilih_paslon: p.pilih_paslon || null 
  }
  showPemilihModal.value = true
}

const savePemilih = async () => {
  const { error } = await supabase.rpc('save_pemilih', {
    p_id: pemilihForm.value.id,
    p_nama: pemilihForm.value.nama,
    p_kelas: pemilihForm.value.kelas,
    p_username: pemilihForm.value.username,
    p_tanggal_lahir: pemilihForm.value.tanggal_lahir,
    p_sudah_memilih: pemilihForm.value.sudah_memilih,
    p_pilih_paslon: pemilihForm.value.sudah_memilih ? pemilihForm.value.pilih_paslon : null
  })

  if (error) { 
    showToast('Gagal menyimpan data pemilih.', 'error')
    return 
  }

  showToast(isEditPemilih.value ? 'Data pemilih berhasil diperbarui.' : 'Pemilih baru berhasil ditambahkan.', 'success')
  showPemilihModal.value = false
  await fetchData()
}

const deletePemilih = async (id) => {
  Swal.fire({
    title: 'Hapus Pemilih?',
    text: 'Data pemilih akan dihapus permanen.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ef4444'
  }).then(async (res) => {
    if (res.isConfirmed) {
      const { error } = await supabase.rpc('delete_pemilih', { p_id: id })
      if (error) { 
        showToast('Gagal menghapus pemilih.', 'error')
        return 
      }
      showToast('Pemilih berhasil dihapus.', 'success')
      await fetchData()
    }
  })
}

const openAddPaslon = () => {
  isEditPaslon.value = false
  paslonForm.value = { id: null, nama: '', nomor_urut: paslons.value.length + 1, visi: '', misi: '' }
  showPaslonModal.value = true
}

const openEditPaslon = (p) => {
  isEditPaslon.value = true
  paslonForm.value = { 
    id: p.id, 
    nama: p.nama, 
    nomor_urut: p.nomor_urut, 
    visi: p.visi, 
    misi: Array.isArray(p.misi) ? p.misi.join('\n') : p.misi 
  }
  showPaslonModal.value = true
}

const savePaslon = async () => {
  const formattedMisi = typeof paslonForm.value.misi === 'string' 
    ? paslonForm.value.misi.split('\n').filter(m => m.trim() !== '') 
    : paslonForm.value.misi

  const { error } = await supabase.rpc('save_paslon', {
    p_id: paslonForm.value.id,
    p_nama: paslonForm.value.nama,
    p_nomor_urut: paslonForm.value.nomor_urut,
    p_visi: paslonForm.value.visi,
    p_misi: formattedMisi
  })

  if (error) { 
    showToast('Gagal menyimpan data paslon.', 'error')
    return 
  }

  showToast(isEditPaslon.value ? 'Data paslon berhasil diperbarui.' : 'Paslon baru berhasil ditambahkan.', 'success')
  showPaslonModal.value = false
  await fetchData()
}

const deletePaslon = async (id) => {
  Swal.fire({
    title: 'Hapus Paslon?',
    text: 'Data kandidat paslon akan dihapus.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ef4444'
  }).then(async (res) => {
    if (res.isConfirmed) {
      const { error } = await supabase.rpc('delete_paslon', { p_id: id })
      if (error) { 
        showToast('Gagal menghapus paslon.', 'error')
        return 
      }
      showToast('Paslon berhasil dihapus.', 'success')
      await fetchData()
    }
  })
}

const filteredPemilih = computed(() => {
  if (!searchQuery.value) return pemilihs.value
  return pemilihs.value.filter(p => 
    p.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.kelas.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredVotersByPaslon = computed(() => {
  return pemilihs.value.filter(p => p.pilih_paslon === selectedPaslonFilter.value)
})

const totalVoterPages = computed(() => {
  return Math.ceil(filteredVotersByPaslon.value.length / pageSize) || 1
})

const paginatedVoters = computed(() => {
  const start = (currentVoterPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredVotersByPaslon.value.slice(start, end)
})

const handlePaslonFilterChange = (nomorUrut) => {
  selectedPaslonFilter.value = nomorUrut
  currentVoterPage.value = 1
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f7f4] text-slate-800 md:flex" style="font-family: 'Poppins', sans-serif;">
    <aside
      ref="sidebarRef"
      class="hidden md:flex sticky top-0 z-20 h-screen shrink-0 flex-col border-r border-[#dce5dc] bg-[#edf2ec] transition-[width] duration-200"
      :class="isSidebarCollapsed ? 'w-[78px]' : 'w-[260px]'"
    >
      <div class="flex h-[78px] items-center gap-3 border-b border-[#dce5dc] px-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d9e9dd] text-[#35734d]">
          <Vote :size="23" :stroke-width="2.1" />
        </div>

        <div v-if="!isSidebarCollapsed" class="min-w-0">
          <h2 class="truncate text-[15px] font-extrabold tracking-tight text-[#263c2e]">
            Ruang Pemilu
          </h2>
          <p class="mt-0.5 text-[11px] font-medium text-[#789081]">
            Dashboard Admin
          </p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-3 py-6">
        <p
          v-if="!isSidebarCollapsed"
          class="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8b9a8d]"
        >
          Menu Utama
        </p>

        <nav class="space-y-1.5">
          <button
            v-for="item in [
              { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'paslon', label: 'Kelola Paslon', icon: Award },
              { id: 'pemilih', label: 'Data Pemilih', icon: Users },
              { id: 'detail-suara', label: 'Pemilih per Kandidat', icon: ListOrdered }
            ]"
            :key="item.id"
            :title="item.label"
            @click="currentTab = item.id"
            class="relative flex h-11 w-full items-center gap-3 rounded-lg px-3.5 text-left text-[13px] font-semibold transition-all"
            :class="[
              currentTab === item.id
                ? 'bg-[#d6e8d9] text-[#2f6844]'
                : 'text-[#637568] hover:bg-[#e2eae1] hover:text-[#263c2e]',
              isSidebarCollapsed ? 'justify-center' : ''
            ]"
          >
            <span
              v-if="currentTab === item.id"
              class="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#43825a]"
            />
            <component
              :is="item.icon"
              :size="19"
              :stroke-width="2"
              class="shrink-0"
            />
            <span v-if="!isSidebarCollapsed" class="truncate">
              {{ item.label }}
            </span>
          </button>
        </nav>
      </div>

      <div class="space-y-2 border-t border-[#dce5dc] p-3">
        <div class="flex items-center gap-3 rounded-lg px-2 py-2">
          <img
            v-if="sessionState.admin?.foto"
            :src="sessionState.admin.foto"
            alt="Profil admin"
            class="h-10 w-10 shrink-0 rounded-lg object-cover"
          />

          <div
            v-else
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d6e8d9] text-sm font-bold text-[#39704c]"
          >
            {{ (sessionState.admin?.nama || 'A').charAt(0).toUpperCase() }}
          </div>

          <div v-if="!isSidebarCollapsed" class="min-w-0">
            <p class="truncate text-[12px] font-bold text-[#334b3a]">
              {{ sessionState.admin?.nama || 'Administrator' }}
            </p>
            <p class="mt-0.5 text-[11px] text-slate-500">Administrator</p>
          </div>
        </div>

        <button
          @click="isSidebarCollapsed = !isSidebarCollapsed"
          class="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#d6e0d5] bg-[#e6ede4] text-[12px] font-semibold text-[#617465] transition hover:bg-[#dce7dc]"
        >
          <component
            :is="isSidebarCollapsed ? ChevronRight : ChevronLeft"
            :size="16"
          />
          <span v-if="!isSidebarCollapsed">Perkecil Sidebar</span>
        </button>

        <button
          @click="handleLogout"
          class="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-[#b65a5a] transition hover:bg-red-50"
          :class="isSidebarCollapsed ? 'justify-center' : ''"
          title="Keluar"
        >
          <LogOut :size="18" />
          <span v-if="!isSidebarCollapsed">Keluar</span>
        </button>
      </div>
    </aside>

    <main class="min-w-0 flex-1">
      <header class="sticky top-0 z-30 border-b border-[#e2e8e0] bg-white/95 backdrop-blur-md">
        <div class="mx-auto flex min-h-[78px] max-w-[1600px] items-center justify-between gap-4 px-5 md:px-8">
          <div class="min-w-0">
            <p class="mb-1 text-[11px] font-semibold text-[#8b9a8d]">
              Admin / Dashboard
            </p>

            <h1 class="truncate text-[20px] font-extrabold tracking-tight text-[#253a2d]">
              {{
                currentTab === 'home'
                  ? 'Dashboard'
                  : currentTab === 'paslon'
                    ? 'Manajemen Paslon'
                    : currentTab === 'pemilih'
                      ? 'Data Pemilih'
                      : 'Pemilih per Kandidat'
              }}
            </h1>
          </div>

          <div class="flex items-center gap-3">
            <span class="hidden items-center gap-2 rounded-lg bg-[#edf5ee] px-3 py-2 text-[11px] font-semibold text-[#4e805c] sm:inline-flex">
              <span class="h-2 w-2 rounded-full bg-[#6ba77b]" />
              Admin aktif
            </span>

            <div class="flex items-center gap-2.5 border-l border-slate-200 pl-3">
              <img
                v-if="sessionState.admin?.foto"
                :src="sessionState.admin.foto"
                alt="Profil admin"
                class="h-9 w-9 rounded-full object-cover"
              />
              <div
                v-else
                class="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcebdd] text-xs font-bold text-[#36704c]"
              >
                {{ (sessionState.admin?.nama || 'A').charAt(0).toUpperCase() }}
              </div>

              <span class="hidden max-w-36 truncate text-[12px] font-bold text-slate-700 sm:block">
                {{ sessionState.admin?.nama || 'Admin' }}
              </span>
            </div>
          </div>
        </div>

        <nav class="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 md:hidden">
          <button
            v-for="item in [
              { id: 'home', label: 'Dashboard' },
              { id: 'paslon', label: 'Paslon' },
              { id: 'pemilih', label: 'Pemilih' },
              { id: 'detail-suara', label: 'Detail Suara' }
            ]"
            :key="item.id"
            @click="currentTab = item.id"
            class="shrink-0 rounded-lg px-3 py-2 text-[12px] font-semibold"
            :class="currentTab === item.id
              ? 'bg-[#dcebdd] text-[#36704c]'
              : 'text-slate-500'"
          >
            {{ item.label }}
          </button>

          <button
            @click="handleLogout"
            class="ml-auto shrink-0 px-3 text-red-500"
            title="Keluar"
          >
            <LogOut :size="18" />
          </button>
        </nav>
      </header>

      <div class="mx-auto max-w-[1600px] space-y-7 px-5 py-7 md:px-8 md:py-9">
        <section v-if="currentTab === 'home'" class="space-y-7">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 class="text-[21px] font-extrabold tracking-tight text-[#263b30]">
                Statistik Pemilihan
              </h2>
              <p class="mt-1 text-[13px] font-medium text-slate-500">
                Pantau partisipasi pemilih dan perolehan suara secara langsung.
              </p>
            </div>

           
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <article class="stat-card rounded-xl border border-[#dce5dd] bg-white p-6 shadow-[0_3px_18px_rgba(30,60,40,0.045)]">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[12px] font-bold text-slate-500">Total Pemilih</p>
                  <h3 class="mt-4 text-[38px] font-extrabold leading-none tracking-tight text-[#263b30]">
                    {{ stats.totalPemilih }}
                  </h3>
                  <p class="mt-3 text-[12px] font-medium text-slate-400">
                    Pemilih terdaftar
                  </p>
                </div>

                <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-[#edf2ee] text-[#568367]">
                  <Users :size="22" :stroke-width="2.1" />
                </div>
              </div>
            </article>

            <article class="stat-card rounded-xl border border-[#dce5dd] bg-white p-6 shadow-[0_3px_18px_rgba(30,60,40,0.045)]">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[12px] font-bold text-slate-500">Sudah Memilih</p>
                  <h3 class="mt-4 text-[38px] font-extrabold leading-none tracking-tight text-[#263b30]">
                    {{ stats.sudahMemilih }}
                  </h3>
                  <p class="mt-3 text-[12px] font-semibold text-[#5a8a68]">
                    {{ stats.totalPemilih ? Math.round(stats.sudahMemilih / stats.totalPemilih * 100) : 0 }}% dari total pemilih
                  </p>
                </div>

                <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e6f0e8] text-[#4e8861]">
                  <CheckCircle2 :size="22" :stroke-width="2.1" />
                </div>
              </div>
            </article>

            <article class="stat-card rounded-xl border border-[#dce5dd] bg-white p-6 shadow-[0_3px_18px_rgba(30,60,40,0.045)]">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[12px] font-bold text-slate-500">Belum Memilih</p>
                  <h3 class="mt-4 text-[38px] font-extrabold leading-none tracking-tight text-[#263b30]">
                    {{ stats.belumMemilih }}
                  </h3>
                  <p class="mt-3 text-[12px] font-medium text-slate-400">
                    Belum memberikan suara
                  </p>
                </div>

                <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf2e5] text-[#bd9457]">
                  <AlertCircle :size="22" :stroke-width="2.1" />
                </div>
              </div>
            </article>
          </div>

          <div class="grid gap-6 lg:grid-cols-12">
            <article class="min-w-0 overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-[0_3px_18px_rgba(30,60,40,0.045)] lg:col-span-8">
              <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#edf0ed] px-6 py-5">
                <div>
                  <div class="flex items-center gap-2.5">
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5efe7] text-[#3e7953]">
                      <BarChart3 :size="19" :stroke-width="2.2" />
                    </div>
                    <h3 class="text-[16px] font-extrabold tracking-tight text-[#263b30]">
                      Perolehan Suara
                    </h3>
                  </div>
                  <p class="mt-2 text-[12px] font-medium text-slate-500">
                    Grafik batang vertikal perbandingan jumlah suara setiap pasangan calon
                  </p>
                </div>

                <span class="inline-flex items-center gap-2 rounded-md bg-[#edf4ee] px-3 py-1.5 text-[11px] font-semibold text-[#477554]">
                  <span class="h-1.5 w-1.5 rounded-full bg-[#65a078]" />
                  Data terkini
                </span>
              </div>

              <div class="px-5 py-6 md:px-7 md:py-8">
                <div v-if="paslons.length" class="h-[380px] w-full md:h-[430px]">
                  <Bar :data="chartData" :options="chartOptions" />
                </div>

                <div
                  v-else
                  class="flex h-[380px] flex-col items-center justify-center text-center"
                >
                  <BarChart3 :size="34" class="mb-3 text-slate-300" />
                  <p class="text-[13px] font-semibold text-slate-600">
                    Belum ada data perolehan suara
                  </p>
                  <p class="mt-1 text-[12px] text-slate-400">
                    Grafik akan muncul setelah kandidat tersedia.
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0ed] bg-[#fbfcfb] px-6 py-4">
                <span class="text-[12px] font-semibold text-slate-500">
                  Total suara tercatat
                </span>
                <strong class="text-[17px] font-extrabold text-[#346a49]">
                  {{ paslons.reduce((sum, p) => sum + (Number(p.suara) || 0), 0) }}
                  <span class="text-[11px] font-medium text-slate-400">suara</span>
                </strong>
              </div>
            </article>

            <article class="flex flex-col overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-[0_3px_18px_rgba(30,60,40,0.045)] lg:col-span-4">
              <div class="border-b border-[#edf0ed] px-6 py-5">
                <h3 class="text-[15px] font-extrabold text-[#263b30]">
                  Peringkat Paslon
                </h3>
                <p class="mt-1 text-[12px] font-medium text-slate-500">
                  Berdasarkan suara masuk
                </p>
              </div>

              <div class="flex-1 px-6 py-4 space-y-3">
                <div
                  v-for="(p, idx) in [...paslons].sort((a, b) => (b.suara || 0) - (a.suara || 0))"
                  :key="p.id"
                  class="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 bg-[#fafbfa]"
                >
                  <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-extrabold"
                    :class="idx === 0
                      ? 'bg-[#e0eee3] text-[#36724c]'
                      : 'bg-[#f0f2ef] text-slate-500'"
                  >
                    {{ idx + 1 }}
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[13px] font-bold text-slate-800">
                      Paslon {{ p.nomor_urut }}
                    </p>
                    <p class="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                      {{ p.nama }}
                    </p>
                  </div>

                  <span class="shrink-0 text-[15px] font-extrabold text-[#356d4b]">
                    {{ p.suara || 0 }}
                  </span>
                </div>

                <p
                  v-if="!paslons.length"
                  class="py-8 text-center text-[12px] text-slate-400"
                >
                  Belum ada data kandidat.
                </p>
              </div>

              <div class="border-t border-[#edf0ed] bg-[#fbfcfb] p-6">
                <div class="mb-3 flex items-center justify-between">
                  <span class="text-[12px] font-bold text-slate-600">
                    Partisipasi pemilih
                  </span>
                  <strong class="text-[14px] font-extrabold text-[#36724c]">
                    {{ stats.totalPemilih ? Math.round(stats.sudahMemilih / stats.totalPemilih * 100) : 0 }}%
                  </strong>
                </div>

                <div class="h-2.5 overflow-hidden rounded-full bg-[#e5ebe5]">
                  <div
                    class="h-full rounded-full bg-[#629773] transition-all duration-500"
                    :style="{
                      width: `${stats.totalPemilih
                        ? stats.sudahMemilih / stats.totalPemilih * 100
                        : 0}%`
                    }"
                  />
                </div>

                <p class="mt-3 text-[11px] font-medium text-slate-400">
                  {{ stats.sudahMemilih }} dari {{ stats.totalPemilih }} pemilih
                </p>
              </div>
            </article>
          </div>
        </section>

        <section v-if="currentTab === 'pemilih'" class="space-y-5">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 class="text-[21px] font-extrabold tracking-tight text-[#263b30]">
                Daftar Pemilih
              </h2>
              <p class="mt-1 text-[13px] font-medium text-slate-500">
                Kelola seluruh data pemilih yang terdaftar.
              </p>
            </div>

            <button
              @click="openAddPemilih"
              class="inline-flex h-10 items-center gap-2 rounded-lg border border-[#a9c9b1] bg-[#e6f0e7] px-4 text-[12px] font-bold text-[#326345] transition hover:bg-[#d8e9db]"
            >
              <Plus :size="16" />
              Tambah Pemilih
            </button>
          </div>

          <div class="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-[0_3px_18px_rgba(30,60,40,0.045)]">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
              <label class="flex h-11 w-full max-w-[380px] items-center gap-2.5 rounded-lg border border-slate-200 bg-[#fafbfa] px-3.5 focus-within:border-[#8aaf94]">
                <Search :size="17" class="shrink-0 text-slate-400" />
                <input
                  v-model="searchQuery"
                  type="search"
                  placeholder="Cari nama, username, atau kelas..."
                  class="w-full bg-transparent text-[12px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <span class="rounded-md bg-[#f1f4f0] px-3 py-2 text-[12px] font-bold text-[#637568]">
                {{ filteredPemilih.length }} Pemilih
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[850px] text-left">
                <thead class="border-b border-slate-200 bg-[#f6f8f5]">
                  <tr class="text-[11px] font-bold text-[#526357]">
                    <th class="px-5 py-4">No.</th>
                    <th class="px-5 py-4">Nama</th>
                    <th class="px-5 py-4">Kelas</th>
                    <th class="px-5 py-4">Username</th>
                    <th class="px-5 py-4">Tanggal Lahir</th>
                    <th class="px-5 py-4">Status</th>
                    <th class="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="(p, index) in filteredPemilih"
                    :key="p.id"
                    class="text-[12px] transition hover:bg-[#fafbf9]"
                  >
                    <td class="px-5 py-4 text-slate-400">{{ index + 1 }}</td>
                    <td class="px-5 py-4 font-bold text-slate-800">{{ p.nama }}</td>
                    <td class="px-5 py-4 font-medium text-slate-600">{{ p.kelas }}</td>
                    <td class="px-5 py-4 font-medium text-[12px] text-slate-500">{{ p.username }}</td>
                    <td class="px-5 py-4 font-medium text-slate-600">{{ p.tanggal_lahir }}</td>
                    <td class="px-5 py-4">
                      <span
                        class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-bold"
                        :class="p.sudah_memilih
                          ? 'bg-[#edf5ee] text-[#51805f]'
                          : 'bg-[#faf3e8] text-[#a27d46]'"
                      >
                        <span
                          class="h-1.5 w-1.5 rounded-full"
                          :class="p.sudah_memilih ? 'bg-[#78a584]' : 'bg-[#c6a16a]'"
                        />
                        {{ p.sudah_memilih ? `Sudah memilih` : 'Belum memilih' }}
                      </span>
                    </td>

                    <td class="px-5 py-4">
                      <div class="flex justify-end gap-1">
                        <button
                          @click="openEditPemilih(p)"
                          title="Edit pemilih"
                          class="rounded-lg p-2 text-slate-500 transition hover:bg-[#eaf1ea] hover:text-[#326345]"
                        >
                          <Edit3 :size="16" />
                        </button>
                        <button
                          @click="deletePemilih(p.id)"
                          title="Hapus pemilih"
                          class="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 :size="16" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="!filteredPemilih.length">
                    <td colspan="7" class="px-5 py-16 text-center text-[12px] text-slate-400">
                      Tidak ada data pemilih yang ditemukan.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="border-t border-slate-100 px-5 py-4 text-[11px] font-medium text-slate-400">
              Menampilkan {{ filteredPemilih.length }} data
            </div>
          </div>
        </section>

        <section v-if="currentTab === 'detail-suara'" class="space-y-5">
          <div>
            <h2 class="text-[21px] font-extrabold tracking-tight text-[#263b30]">
              Pemilih per Kandidat
            </h2>
            <p class="mt-1 text-[13px] font-medium text-slate-500">
              Daftar pemilih berdasarkan kandidat yang dipilih.
            </p>
          </div>

          <div class="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-[0_3px_18px_rgba(30,60,40,0.045)]">
            <div class="border-b border-slate-100 p-5">
              <p class="mb-3 text-[12px] font-bold text-slate-700">
                Pilih Pasangan Calon
              </p>

              <div class="flex flex-wrap gap-2">
                <button
                  v-for="p in paslons"
                  :key="p.id"
                  @click="handlePaslonFilterChange(p.nomor_urut)"
                  class="flex items-center gap-2 rounded-lg border px-4 py-3 text-[12px] font-semibold transition"
                  :class="selectedPaslonFilter === p.nomor_urut
                    ? 'border-[#a6c6ac] bg-[#e7f0e6] text-[#356a49]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
                >
                  <span class="font-extrabold">{{ p.nomor_urut }}.</span>
                  <span>{{ p.nama }}</span>
                  <span class="ml-1 rounded bg-black/5 px-2 py-0.5 text-[11px]">
                    {{ pemilihs.filter(v => v.pilih_paslon === p.nomor_urut).length }}
                  </span>
                </button>
              </div>
            </div>

            <div class="flex flex-wrap justify-between gap-2 px-5 py-4">
              <p class="text-[12px] font-bold text-slate-600">
                Paslon Nomor {{ selectedPaslonFilter }}
              </p>
              <p class="text-[12px] font-semibold text-slate-400">
                {{ filteredVotersByPaslon.length }} Pemilih
              </p>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[700px] text-left">
                <thead class="border-y border-slate-100 bg-[#f6f8f5]">
                  <tr class="text-[11px] font-bold text-[#526357]">
                    <th class="px-5 py-4">No.</th>
                    <th class="px-5 py-4">Nama Siswa</th>
                    <th class="px-5 py-4">Kelas</th>
                    <th class="px-5 py-4">Username</th>
                    <th class="px-5 py-4">Tanggal Lahir</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-slate-100 text-[12px]">
                  <tr
                    v-for="(voter, idx) in paginatedVoters"
                    :key="voter.id"
                    class="hover:bg-[#fafbf9]"
                  >
                    <td class="px-5 py-4 text-slate-400">
                      {{ (currentVoterPage - 1) * pageSize + idx + 1 }}
                    </td>
                    <td class="px-5 py-4 font-bold text-slate-800">{{ voter.nama }}</td>
                    <td class="px-5 py-4 font-medium text-slate-600">{{ voter.kelas }}</td>
                    <td class="px-5 py-4 font-medium text-[12px] text-slate-500">{{ voter.username }}</td>
                    <td class="px-5 py-4 font-medium text-slate-600">{{ voter.tanggal_lahir }}</td>
                  </tr>

                  <tr v-if="!paginatedVoters.length">
                    <td colspan="5" class="py-16 text-center text-[12px] text-slate-400">
                      Belum ada pemilih untuk kandidat ini.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              v-if="totalVoterPages > 1"
              class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4"
            >
              <span class="text-[12px] font-semibold text-slate-500">
                Halaman {{ currentVoterPage }} dari {{ totalVoterPages }}
              </span>

              <div class="flex flex-wrap items-center gap-1">
                <button
                  @click="currentVoterPage--"
                  :disabled="currentVoterPage === 1"
                  class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                  title="Sebelumnya"
                >
                  <ChevronLeft :size="16" />
                </button>

                <button
                  v-for="page in totalVoterPages"
                  :key="page"
                  @click="currentVoterPage = page"
                  class="h-9 min-w-9 rounded-lg border px-2 text-[12px] font-bold"
                  :class="currentVoterPage === page
                    ? 'border-[#a6c6ac] bg-[#e7f0e6] text-[#356a49]'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  {{ page }}
                </button>

                <button
                  @click="currentVoterPage++"
                  :disabled="currentVoterPage === totalVoterPages"
                  class="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                  title="Selanjutnya"
                >
                  <ChevronRight :size="16" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section v-if="currentTab === 'paslon'" class="space-y-5">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 class="text-[21px] font-extrabold tracking-tight text-[#263b30]">
                Manajemen Paslon
              </h2>
              <p class="mt-1 text-[13px] font-medium text-slate-500">
                Kelola informasi kandidat, nomor urut, dan visi misi.
              </p>
            </div>

            <button
              @click="openAddPaslon"
              class="inline-flex h-10 items-center gap-2 rounded-lg border border-[#a9c9b1] bg-[#e6f0e7] px-4 text-[12px] font-bold text-[#326345] transition hover:bg-[#d8e9db]"
            >
              <Plus :size="16" />
              Tambah Paslon
            </button>
          </div>

          <div v-if="paslons.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="p in paslons"
              :key="p.id"
              class="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-[0_3px_18px_rgba(30,60,40,0.045)]"
            >
              <div class="relative aspect-[16/9] overflow-hidden bg-[#e9eeea]">
                <img
                  :src="getPaslonFoto(p.nomor_urut)"
                  :alt="p.nama"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  @error="$event.target.style.display='none'"
                />

                <span class="absolute bottom-3 left-3 rounded-lg border border-white/60 bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-[#345a40]">
                  No. {{ p.nomor_urut }}
                </span>
              </div>

              <div class="p-5">
                <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8ca093]">
                  Pasangan Calon
                </p>

                <h3 class="mt-1.5 text-[16px] font-extrabold text-slate-800">
                  {{ p.nama }}
                </h3>

                <p class="mt-3 line-clamp-3 min-h-[60px] text-[12px] font-medium leading-5 text-slate-500">
                  {{ p.visi || 'Visi belum ditambahkan.' }}
                </p>

                <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span class="text-[12px] font-bold text-[#558164]">
                    {{ p.suara || 0 }} Suara
                  </span>

                  <div class="flex items-center gap-2">
                    <button
                      @click="openEditPaslon(p)"
                      class="rounded-lg border border-slate-200 px-3.5 py-2.5 text-[12px] font-bold text-slate-600 transition hover:border-[#a9c9b1] hover:text-[#326345]"
                    >
                      Edit Detail
                    </button>

                    <button
                      @click="deletePaslon(p.id)"
                      title="Hapus paslon"
                      class="rounded-lg p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div
            v-else
            class="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-[12px] text-slate-400"
          >
            Belum ada pasangan calon.
          </div>
        </section>

        <footer class="pt-3 text-center text-[11px] font-medium text-slate-400">
          Dashboard Pilketom - Created by Adhim
        </footer>
      </div>
    </main>

    <div
      v-if="showPemilihModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      @click.self="showPemilihModal = false"
    >
      <section class="w-full max-w-[460px] rounded-xl border border-slate-200 bg-white shadow-xl">
        <div class="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 class="text-[17px] font-extrabold text-slate-800">
              {{ isEditPemilih ? 'Edit Pemilih' : 'Tambah Pemilih' }}
            </h2>
            <p class="mt-1 text-[12px] font-medium text-slate-400">
              Lengkapi data pemilih di bawah ini.
            </p>
          </div>

          <button
            @click="showPemilihModal = false"
            class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X :size="19" />
          </button>
        </div>

        <form @submit.prevent="savePemilih" class="space-y-4 p-6">
          <label class="block">
            <span class="mb-1.5 block text-[12px] font-bold text-slate-600">
              Nama Lengkap
            </span>
            <input
              v-model="pemilihForm.nama"
              type="text"
              required
              class="form-input"
            />
          </label>

          <label class="block">
            <span class="mb-1.5 block text-[12px] font-bold text-slate-600">
              Kelas
            </span>
            <input
              v-model="pemilihForm.kelas"
              type="text"
              required
              class="form-input"
            />
          </label>

          <label class="block">
            <span class="mb-1.5 block text-[12px] font-bold text-slate-600">
              Username
            </span>
            <input
              v-model="pemilihForm.username"
              type="text"
              required
              class="form-input"
            />
          </label>

          <label class="block">
            <span class="mb-1.5 block text-[12px] font-bold text-slate-600">
              Tanggal Lahir
            </span>
            <input
              v-model="pemilihForm.tanggal_lahir"
              type="date"
              required
              class="form-input"
            />
          </label>

          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label class="flex items-center gap-2.5 cursor-pointer">
              <input
                v-model="pemilihForm.sudah_memilih"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-[#467a55] focus:ring-[#467a55]"
              />
              <span class="text-[12px] font-bold text-slate-700">Sudah Memilih</span>
            </label>
          </div>

          <div class="flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              @click="showPemilihModal = false"
              class="rounded-lg border border-slate-200 px-4 py-2.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="submit"
              class="rounded-lg bg-[#467a55] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#376546]"
            >
              {{ isEditPemilih ? 'Simpan Perubahan' : 'Simpan Pemilih' }}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div
      v-if="showPaslonModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      @click.self="showPaslonModal = false"
    >
      <section class="max-h-[90vh] w-full max-w-[540px] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
        <div class="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 class="text-[17px] font-extrabold text-slate-800">
              {{ isEditPaslon ? 'Edit Paslon' : 'Tambah Paslon' }}
            </h2>
            <p class="mt-1 text-[12px] font-medium text-slate-400">
              Lengkapi informasi pasangan calon.
            </p>
          </div>

          <button
            @click="showPaslonModal = false"
            class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X :size="19" />
          </button>
        </div>

        <form @submit.prevent="savePaslon" class="space-y-4 p-6">
          <div class="grid grid-cols-[minmax(0,1fr)_100px] gap-3">
            <label class="block">
              <span class="mb-1.5 block text-[12px] font-bold text-slate-600">
                Nama Paslon
              </span>
              <input
                v-model="paslonForm.nama"
                type="text"
                required
                class="form-input"
              />
            </label>

            <label class="block">
              <span class="mb-1.5 block text-[12px] font-bold text-slate-600">
                Nomor Urut
              </span>
              <input
                v-model.number="paslonForm.nomor_urut"
                type="number"
                min="1"
                required
                class="form-input"
              />
            </label>
          </div>

          <label class="block">
            <span class="mb-1.5 block text-[12px] font-bold text-slate-600">
              Visi
            </span>
            <textarea
              v-model="paslonForm.visi"
              rows="3"
              required
              class="form-input resize-y"
            />
          </label>

          <label class="block">
            <span class="mb-1.5 block text-[12px] font-bold text-slate-600">
              Misi
            </span>
            <textarea
              v-model="paslonForm.misi"
              rows="4"
              required
              placeholder="Satu poin per baris"
              class="form-input resize-y"
            />
            <span class="mt-1.5 block text-[11px] font-medium text-slate-400">
              Pisahkan setiap poin misi dengan baris baru.
            </span>
          </label>

          <div class="flex justify-end gap-2 border-t border-slate-100 pt-5">
            <button
              type="button"
              @click="showPaslonModal = false"
              class="rounded-lg border border-slate-200 px-4 py-2.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="submit"
              class="rounded-lg bg-[#467a55] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#376546]"
            >
              {{ isEditPaslon ? 'Simpan Perubahan' : 'Simpan Paslon' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

.form-input {
  display: block;
  width: 100%;
  border: 1px solid #dce5dd;
  border-radius: 8px;
  background: #fafbfa;
  padding: 11px 13px;
  color: #334155;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  transition: border-color 0.2s, background-color 0.2s;
}

.form-input:focus {
  border-color: #78a98a;
  background: #fff;
}

.form-input::placeholder {
  color: #a3afa5;
}

.stat-card {
  transition: border-color 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  border-color: #b8d0bd;
  box-shadow: 0 6px 22px rgba(30, 60, 40, 0.07);
}

table tbody tr {
  transition: background-color 0.15s;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>