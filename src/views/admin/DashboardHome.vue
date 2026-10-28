<script setup>
import { computed } from 'vue'
import { Users, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-vue-next'
import PageHeader from '../../components/admin/PageHeader.vue'
import StatCard from '../../components/admin/StatCard.vue'
import VoteChart from '../../components/admin/VoteChart.vue'
import { useAdminData } from '../../composables/useAdminData'

const { paslons, pemilihs, ready } = useAdminData({ paslons: true, pemilihs: true })

const stats = computed(() => {
  const total = pemilihs.value.length
  const sudah = pemilihs.value.reduce((count, p) => count + (p.sudah_memilih ? 1 : 0), 0)
  const ratio = total ? (sudah / total) * 100 : 0

  return { total, sudah, belum: total - sudah, ratio, percent: Math.round(ratio) }
})

const totalSuara = computed(() =>
  paslons.value.reduce((sum, p) => sum + (Number(p.suara) || 0), 0),
)

const ranking = computed(() =>
  [...paslons.value].sort(
    (a, b) => (Number(b.suara) || 0) - (Number(a.suara) || 0) || a.nomor_urut - b.nomor_urut,
  ),
)

const show = (value) => (ready.value ? value : '…')
</script>

<template>
  <section class="space-y-7">
    <PageHeader
      title="Statistik Pemilihan"
      subtitle="Pantau partisipasi pemilih dan perolehan suara secara langsung."
    />

    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Total Pemilih"
        :value="show(stats.total)"
        caption="Pemilih terdaftar"
        :icon="Users"
        icon-class="bg-[#edf2ee] text-[#568367]"
      />
      <StatCard
        label="Sudah Memilih"
        :value="show(stats.sudah)"
        :caption="`${stats.percent}% dari total pemilih`"
        caption-class="font-semibold text-[#5a8a68]"
        :icon="CheckCircle2"
        icon-class="bg-[#e6f0e8] text-[#4e8861]"
      />
      <StatCard
        label="Belum Memilih"
        :value="show(stats.belum)"
        caption="Belum memberikan suara"
        :icon="AlertCircle"
        icon-class="bg-[#faf2e5] text-[#bd9457]"
      />
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
          <div v-if="!ready" class="flex h-[380px] items-center justify-center text-[12px] text-slate-400">
            Memuat data...
          </div>

          <div v-else-if="paslons.length" class="h-[380px] w-full md:h-[430px]">
            <VoteChart :paslons="paslons" />
          </div>

          <div v-else class="flex h-[380px] flex-col items-center justify-center text-center">
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
          <span class="text-[12px] font-semibold text-slate-500">Total suara tercatat</span>
          <strong class="text-[17px] font-extrabold text-[#346a49]">
            {{ totalSuara }}
            <span class="text-[11px] font-medium text-slate-400">suara</span>
          </strong>
        </div>
      </article>

      <article class="flex flex-col overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-[0_3px_18px_rgba(30,60,40,0.045)] lg:col-span-4">
        <div class="border-b border-[#edf0ed] px-6 py-5">
          <h3 class="text-[15px] font-extrabold text-[#263b30]">Peringkat Paslon</h3>
          <p class="mt-1 text-[12px] font-medium text-slate-500">Berdasarkan suara masuk</p>
        </div>

        <div class="flex-1 space-y-3 px-6 py-4">
          <div
            v-for="(p, idx) in ranking"
            :key="p.id"
            class="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-[#fafbfa] p-3.5"
          >
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-extrabold"
              :class="idx === 0 ? 'bg-[#e0eee3] text-[#36724c]' : 'bg-[#f0f2ef] text-slate-500'"
            >
              {{ idx + 1 }}
            </div>

            <div class="min-w-0 flex-1">
              <p class="truncate text-[13px] font-bold text-slate-800">
                Paslon {{ p.nomor_urut }}
              </p>
              <p class="mt-0.5 truncate text-[11px] font-medium text-slate-400">{{ p.nama }}</p>
            </div>

            <span class="shrink-0 text-[15px] font-extrabold text-[#356d4b]">
              {{ p.suara || 0 }}
            </span>
          </div>

          <p v-if="ready && !paslons.length" class="py-8 text-center text-[12px] text-slate-400">
            Belum ada data kandidat.
          </p>
        </div>

        <div class="border-t border-[#edf0ed] bg-[#fbfcfb] p-6">
          <div class="mb-3 flex items-center justify-between">
            <span class="text-[12px] font-bold text-slate-600">Partisipasi pemilih</span>
            <strong class="text-[14px] font-extrabold text-[#36724c]">{{ stats.percent }}%</strong>
          </div>

          <div class="h-2.5 overflow-hidden rounded-full bg-[#e5ebe5]">
            <div
              class="h-full rounded-full bg-[#629773] transition-all duration-500"
              :style="{ width: `${stats.ratio}%` }"
            />
          </div>

          <p class="mt-3 text-[11px] font-medium text-slate-400">
            {{ stats.sudah }} dari {{ stats.total }} pemilih
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
