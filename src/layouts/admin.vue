<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  Vote,
  LogOut,
  Award,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
} from 'lucide-vue-next'
import { gsap } from 'gsap'
import '../assets/css/admin.css'
import { useAdminSession } from '../services/admin/session'
import { useToast } from '../services/ui/toast'
import { confirmAction } from '../services/ui/confirm'

const navItems = [
  { to: { name: 'admin-dashboard' }, label: 'Dashboard', short: 'Dashboard', icon: LayoutDashboard },
  { to: { name: 'admin-paslon' }, label: 'Kelola Paslon', short: 'Paslon', icon: Award },
  { to: { name: 'admin-pemilih' }, label: 'Data Pemilih', short: 'Pemilih', icon: Users },
  { to: { name: 'admin-suara' }, label: 'Pemilih per Kandidat', short: 'Detail Suara', icon: ListOrdered },
]

const route = useRoute()
const router = useRouter()
const { admin: session, clearAdmin } = useAdminSession()
const { showToast } = useToast()

const sidebarRef = ref(null)
const isCollapsed = ref(false)

const pageTitle = computed(() => route.meta.title ?? 'Dashboard')
const adminName = computed(() => session.admin?.nama || 'Administrator')
const adminPhoto = computed(() => session.admin?.foto || '')
const adminInitial = computed(() => (session.admin?.nama || 'A').charAt(0).toUpperCase())

let ctx

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from(sidebarRef.value, {
      x: -40,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    })
  })
})

onBeforeUnmount(() => ctx?.revert())

const handleLogout = async () => {
  const confirmed = await confirmAction({
    title: 'Keluar dari Panel Admin?',
    text: 'Anda harus login kembali untuk mengakses panel.',
    confirmText: 'Ya, Keluar',
    confirmColor: '#059669',
  })

  if (!confirmed) return

  clearAdmin()
  showToast('Berhasil keluar dari sesi admin.', 'success')
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <div
    class="admin-shell min-h-screen bg-[#f5f7f4] text-slate-800 md:flex"
    style="font-family: 'Poppins', sans-serif;"
  >
    <aside
      ref="sidebarRef"
      class="sticky top-0 z-20 hidden h-screen shrink-0 flex-col border-r border-[#dce5dc] bg-[#edf2ec] transition-[width] duration-200 md:flex"
      :class="isCollapsed ? 'w-[78px]' : 'w-[260px]'"
    >
      <div class="flex h-[78px] items-center gap-3 border-b border-[#dce5dc] px-4">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d9e9dd] text-[#35734d]">
          <Vote :size="23" :stroke-width="2.1" />
        </div>

        <div v-if="!isCollapsed" class="min-w-0">
          <h2 class="truncate text-[15px] font-extrabold tracking-tight text-[#263c2e]">
            Ruang Pemilu
          </h2>
          <p class="mt-0.5 text-[11px] font-medium text-[#789081]">Dashboard Admin</p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-3 py-6">
        <p
          v-if="!isCollapsed"
          class="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8b9a8d]"
        >
          Menu Utama
        </p>

        <nav class="space-y-1.5">
          <RouterLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            custom
            v-slot="{ href, navigate, isActive }"
          >
            <a
              :href="href"
              :title="item.label"
              :aria-current="isActive ? 'page' : undefined"
              class="relative flex h-11 w-full items-center gap-3 rounded-lg px-3.5 text-left text-[13px] font-semibold transition-all"
              :class="[
                isActive
                  ? 'bg-[#d6e8d9] text-[#2f6844]'
                  : 'text-[#637568] hover:bg-[#e2eae1] hover:text-[#263c2e]',
                isCollapsed ? 'justify-center' : '',
              ]"
              @click="navigate"
            >
              <span
                v-if="isActive"
                class="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#43825a]"
              />
              <component :is="item.icon" :size="19" :stroke-width="2" class="shrink-0" />
              <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
            </a>
          </RouterLink>
        </nav>
      </div>

      <div class="space-y-2 border-t border-[#dce5dc] p-3">
        <div class="flex items-center gap-3 rounded-lg px-2 py-2">
          <img
            v-if="adminPhoto"
            :src="adminPhoto"
            alt="Profil admin"
            class="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
          <div
            v-else
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#d6e8d9] text-sm font-bold text-[#39704c]"
          >
            {{ adminInitial }}
          </div>

          <div v-if="!isCollapsed" class="min-w-0">
            <p class="truncate text-[12px] font-bold text-[#334b3a]">{{ adminName }}</p>
            <p class="mt-0.5 text-[11px] text-slate-500">Administrator</p>
          </div>
        </div>

        <button
          type="button"
          class="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#d6e0d5] bg-[#e6ede4] text-[12px] font-semibold text-[#617465] transition hover:bg-[#dce7dc]"
          @click="isCollapsed = !isCollapsed"
        >
          <component :is="isCollapsed ? ChevronRight : ChevronLeft" :size="16" />
          <span v-if="!isCollapsed">Perkecil Sidebar</span>
        </button>

        <button
          type="button"
          title="Keluar"
          class="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-[#b65a5a] transition hover:bg-red-50"
          :class="isCollapsed ? 'justify-center' : ''"
          @click="handleLogout"
        >
          <LogOut :size="18" />
          <span v-if="!isCollapsed">Keluar</span>
        </button>
      </div>
    </aside>

    <main class="min-w-0 flex-1">
      <header class="sticky top-0 z-30 border-b border-[#e2e8e0] bg-white/95 backdrop-blur-md">
        <div class="mx-auto flex min-h-[78px] max-w-[1600px] items-center justify-between gap-4 px-5 md:px-8">
          <div class="min-w-0">
            <p class="mb-1 text-[11px] font-semibold text-[#8b9a8d]">
              Admin / {{ pageTitle }}
            </p>
            <h1 class="truncate text-[20px] font-extrabold tracking-tight text-[#253a2d]">
              {{ pageTitle }}
            </h1>
          </div>

          <div class="flex items-center gap-3">
            <span class="hidden items-center gap-2 rounded-lg bg-[#edf5ee] px-3 py-2 text-[11px] font-semibold text-[#4e805c] sm:inline-flex">
              <span class="h-2 w-2 rounded-full bg-[#6ba77b]" />
              Admin aktif
            </span>

            <div class="flex items-center gap-2.5 border-l border-slate-200 pl-3">
              <img
                v-if="adminPhoto"
                :src="adminPhoto"
                alt="Profil admin"
                class="h-9 w-9 rounded-full object-cover"
              />
              <div
                v-else
                class="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcebdd] text-xs font-bold text-[#36704c]"
              >
                {{ adminInitial }}
              </div>

              <span class="hidden max-w-36 truncate text-[12px] font-bold text-slate-700 sm:block">
                {{ session.admin?.nama || 'Admin' }}
              </span>
            </div>
          </div>
        </div>

        <nav class="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 md:hidden">
          <RouterLink
            v-for="item in navItems"
            :key="item.label"
            :to="item.to"
            custom
            v-slot="{ href, navigate, isActive }"
          >
            <a
              :href="href"
              :aria-current="isActive ? 'page' : undefined"
              class="shrink-0 rounded-lg px-3 py-2 text-[12px] font-semibold"
              :class="isActive ? 'bg-[#dcebdd] text-[#36704c]' : 'text-slate-500'"
              @click="navigate"
            >
              {{ item.short }}
            </a>
          </RouterLink>

          <button
            type="button"
            title="Keluar"
            class="ml-auto shrink-0 px-3 text-red-500"
            @click="handleLogout"
          >
            <LogOut :size="18" />
          </button>
        </nav>
      </header>

      <div class="mx-auto max-w-[1600px] space-y-7 px-5 py-7 md:px-8 md:py-9">
        <RouterView v-slot="{ Component, route: current }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="current.path" />
          </Transition>
        </RouterView>

        <footer class="pt-3 text-center text-[11px] font-medium text-slate-400">
          Dashboard Pilketom - Created by Adhim
        </footer>
      </div>
    </main>
  </div>
</template>
