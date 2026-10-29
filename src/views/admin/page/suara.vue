<script setup>
import { ref, computed, watch } from 'vue'
import PageHeader from '../../../components/admin/ui/header.vue'
import Pagination from '../../../components/admin/ui/pagination.vue'
import { useData } from '../../../composables/admin/data'

const PAGE_SIZE = 50

const { paslons, pemilihs, ready } = useData({ paslons: true, pemilihs: true })

const selectedNomor = ref(null)
const currentPage = ref(1)

const activeNomor = computed(() => {
  const exists = paslons.value.some((p) => p.nomor_urut === selectedNomor.value)
  return exists ? selectedNomor.value : (paslons.value[0]?.nomor_urut ?? null)
})

const countByNomor = computed(() => {
  const counts = new Map()

  for (const voter of pemilihs.value) {
    if (voter.pilih_paslon == null) continue
    counts.set(voter.pilih_paslon, (counts.get(voter.pilih_paslon) ?? 0) + 1)
  }

  return counts
})

const votersOfActive = computed(() =>
  pemilihs.value.filter((v) => v.pilih_paslon === activeNomor.value),
)

const totalPages = computed(() => Math.ceil(votersOfActive.value.length / PAGE_SIZE) || 1)

const pagedVoters = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return votersOfActive.value.slice(start, start + PAGE_SIZE)
})

const selectPaslon = (nomor) => {
  selectedNomor.value = nomor
  currentPage.value = 1
}

watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})
</script>

<template>
  <section class="space-y-5">
    <PageHeader
      title="Pemilih per Kandidat"
      subtitle="Daftar pemilih berdasarkan kandidat yang dipilih."
    />

    <div class="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-[0_3px_18px_rgba(30,60,40,0.045)]">
      <div class="border-b border-slate-100 p-5">
        <p class="mb-3 text-[12px] font-bold text-slate-700">Pilih Pasangan Calon</p>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="p in paslons"
            :key="p.id"
            type="button"
            class="flex items-center gap-2 rounded-lg border px-4 py-3 text-[12px] font-semibold transition"
            :class="activeNomor === p.nomor_urut
              ? 'border-[#a6c6ac] bg-[#e7f0e6] text-[#356a49]'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
            @click="selectPaslon(p.nomor_urut)"
          >
            <span class="font-extrabold">{{ p.nomor_urut }}.</span>
            <span>{{ p.nama }}</span>
            <span class="ml-1 rounded bg-black/5 px-2 py-0.5 text-[11px]">
              {{ countByNomor.get(p.nomor_urut) ?? 0 }}
            </span>
          </button>

          <p v-if="!paslons.length" class="text-[12px] text-slate-400">
            {{ ready ? 'Belum ada pasangan calon.' : 'Memuat data...' }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap justify-between gap-2 px-5 py-4">
        <p class="text-[12px] font-bold text-slate-600">Paslon Nomor {{ activeNomor }}</p>
        <p class="text-[12px] font-semibold text-slate-400">
          {{ votersOfActive.length }} Pemilih
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
            <tr v-for="(voter, idx) in pagedVoters" :key="voter.id" class="hover:bg-[#fafbf9]">
              <td class="px-5 py-4 text-slate-400">
                {{ (currentPage - 1) * PAGE_SIZE + idx + 1 }}
              </td>
              <td class="px-5 py-4 font-bold text-slate-800">{{ voter.nama }}</td>
              <td class="px-5 py-4 font-medium text-slate-600">{{ voter.kelas }}</td>
              <td class="px-5 py-4 font-medium text-slate-500">{{ voter.username }}</td>
              <td class="px-5 py-4 font-medium text-slate-600">{{ voter.tanggal_lahir }}</td>
            </tr>

            <tr v-if="!pagedVoters.length">
              <td colspan="5" class="py-16 text-center text-[12px] text-slate-400">
                {{ ready ? 'Belum ada pemilih untuk kandidat ini.' : 'Memuat data...' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination v-model="currentPage" :total-pages="totalPages" />
    </div>
  </section>
</template>
