<script setup>
import { ref, computed } from 'vue'
import { Plus, Edit3, Trash2, Search } from 'lucide-vue-next'
import PageHeader from '../../components/admin/PageHeader.vue'
import PemilihFormModal from '../../components/admin/PemilihFormModal.vue'
import { useAdminData } from '../../composables/useAdminData'
import { savePemilih, deletePemilih } from '../../services/admin/admin.api'
import { confirmAction } from '../../services/confirm'
import { useToast } from '../../services/toast'

const { pemilihs, ready, refresh } = useAdminData({ pemilihs: true })
const { showToast } = useToast()

const searchQuery = ref('')
const modal = ref({ open: false, data: null })
const saving = ref(false)

const filteredPemilih = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return pemilihs.value

  return pemilihs.value.filter((p) =>
    [p.nama, p.username, p.kelas].some((value) =>
      (value ?? '').toLowerCase().includes(query),
    ),
  )
})

const openAdd = () => {
  modal.value = { open: true, data: null }
}

const openEdit = (pemilih) => {
  modal.value = { open: true, data: pemilih }
}

const closeModal = () => {
  modal.value = { open: false, data: null }
}

const handleSubmit = async (form) => {
  if (saving.value) return

  const isEdit = form.id != null
  saving.value = true
  const { error } = await savePemilih(form)
  saving.value = false

  if (error) {
    showToast('Gagal menyimpan data pemilih.', 'error')
    return
  }

  showToast(
    isEdit ? 'Data pemilih berhasil diperbarui.' : 'Pemilih baru berhasil ditambahkan.',
    'success',
  )
  closeModal()
  await refresh({ force: true })
}

const handleDelete = async (id) => {
  const confirmed = await confirmAction({
    title: 'Hapus Pemilih?',
    text: 'Data pemilih akan dihapus permanen.',
    confirmText: 'Ya, Hapus',
  })

  if (!confirmed) return

  const { error } = await deletePemilih(id)

  if (error) {
    showToast('Gagal menghapus pemilih.', 'error')
    return
  }

  showToast('Pemilih berhasil dihapus.', 'success')
  await refresh({ force: true })
}
</script>

<template>
  <section class="space-y-5">
    <PageHeader title="Daftar Pemilih" subtitle="Kelola seluruh data pemilih yang terdaftar.">
      <button
        type="button"
        class="inline-flex h-10 items-center gap-2 rounded-lg border border-[#a9c9b1] bg-[#e6f0e7] px-4 text-[12px] font-bold text-[#326345] transition hover:bg-[#d8e9db]"
        @click="openAdd"
      >
        <Plus :size="16" />
        Tambah Pemilih
      </button>
    </PageHeader>

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
              class="text-[12px] transition-colors hover:bg-[#fafbf9]"
            >
              <td class="px-5 py-4 text-slate-400">{{ index + 1 }}</td>
              <td class="px-5 py-4 font-bold text-slate-800">{{ p.nama }}</td>
              <td class="px-5 py-4 font-medium text-slate-600">{{ p.kelas }}</td>
              <td class="px-5 py-4 font-medium text-slate-500">{{ p.username }}</td>
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
                  {{ p.sudah_memilih ? 'Sudah memilih' : 'Belum memilih' }}
                </span>
              </td>

              <td class="px-5 py-4">
                <div class="flex justify-end gap-1">
                  <button
                    type="button"
                    title="Edit pemilih"
                    class="rounded-lg p-2 text-slate-500 transition hover:bg-[#eaf1ea] hover:text-[#326345]"
                    @click="openEdit(p)"
                  >
                    <Edit3 :size="16" />
                  </button>
                  <button
                    type="button"
                    title="Hapus pemilih"
                    class="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    @click="handleDelete(p.id)"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!filteredPemilih.length">
              <td colspan="7" class="px-5 py-16 text-center text-[12px] text-slate-400">
                {{ ready ? 'Tidak ada data pemilih yang ditemukan.' : 'Memuat data...' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="border-t border-slate-100 px-5 py-4 text-[11px] font-medium text-slate-400">
        Menampilkan {{ filteredPemilih.length }} data
      </div>
    </div>

    <PemilihFormModal
      v-if="modal.open"
      :initial="modal.data"
      :saving="saving"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </section>
</template>
