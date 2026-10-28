<script setup>
import { ref } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import PageHeader from '../../components/admin/PageHeader.vue'
import PaslonFormModal from '../../components/admin/PaslonFormModal.vue'
import { useAdminData } from '../../composables/useAdminData'
import { savePaslon, deletePaslon, paslonFotoUrl } from '../../services/admin/admin.api'
import { confirmAction } from '../../services/confirm'
import { useToast } from '../../services/toast'

const { paslons, ready, refresh } = useAdminData({ paslons: true })
const { showToast } = useToast()

const modal = ref({ open: false, data: null })
const saving = ref(false)

const openAdd = () => {
  modal.value = { open: true, data: { nomor_urut: paslons.value.length + 1 } }
}

const openEdit = (paslon) => {
  modal.value = { open: true, data: paslon }
}

const closeModal = () => {
  modal.value = { open: false, data: null }
}

const handleSubmit = async (form) => {
  if (saving.value) return

  const isEdit = form.id != null
  saving.value = true
  const { error } = await savePaslon(form)
  saving.value = false

  if (error) {
    showToast('Gagal menyimpan data paslon.', 'error')
    return
  }

  showToast(
    isEdit ? 'Data paslon berhasil diperbarui.' : 'Paslon baru berhasil ditambahkan.',
    'success',
  )
  closeModal()
  await refresh({ force: true })
}

const handleDelete = async (id) => {
  const confirmed = await confirmAction({
    title: 'Hapus Paslon?',
    text: 'Data kandidat paslon akan dihapus.',
    confirmText: 'Ya, Hapus',
  })

  if (!confirmed) return

  const { error } = await deletePaslon(id)

  if (error) {
    showToast('Gagal menghapus paslon.', 'error')
    return
  }

  showToast('Paslon berhasil dihapus.', 'success')
  await refresh({ force: true })
}
</script>

<template>
  <section class="space-y-5">
    <PageHeader
      title="Manajemen Paslon"
      subtitle="Kelola informasi kandidat, nomor urut, dan visi misi."
    >
      <button
        type="button"
        class="inline-flex h-10 items-center gap-2 rounded-lg border border-[#a9c9b1] bg-[#e6f0e7] px-4 text-[12px] font-bold text-[#326345] transition hover:bg-[#d8e9db]"
        @click="openAdd"
      >
        <Plus :size="16" />
        Tambah Paslon
      </button>
    </PageHeader>

    <div v-if="paslons.length" class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="p in paslons"
        :key="p.id"
        class="overflow-hidden rounded-xl border border-[#dce5dd] bg-white shadow-[0_3px_18px_rgba(30,60,40,0.045)]"
      >
        <div class="relative aspect-[16/9] overflow-hidden bg-[#e9eeea]">
          <img
            :src="paslonFotoUrl(p.nomor_urut)"
            :alt="p.nama"
            class="h-full w-full object-cover"
            loading="lazy"
            @error="$event.target.style.display = 'none'"
          />

          <span class="absolute bottom-3 left-3 rounded-lg border border-white/60 bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-[#345a40]">
            No. {{ p.nomor_urut }}
          </span>
        </div>

        <div class="p-5">
          <p class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8ca093]">
            Pasangan Calon
          </p>

          <h3 class="mt-1.5 text-[16px] font-extrabold text-slate-800">{{ p.nama }}</h3>

          <p class="mt-3 line-clamp-3 min-h-[60px] text-[12px] font-medium leading-5 text-slate-500">
            {{ p.visi || 'Visi belum ditambahkan.' }}
          </p>

          <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span class="text-[12px] font-bold text-[#558164]">{{ p.suara || 0 }} Suara</span>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-3.5 py-2.5 text-[12px] font-bold text-slate-600 transition hover:border-[#a9c9b1] hover:text-[#326345]"
                @click="openEdit(p)"
              >
                Edit Detail
              </button>

              <button
                type="button"
                title="Hapus paslon"
                class="rounded-lg p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                @click="handleDelete(p.id)"
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
      {{ ready ? 'Belum ada pasangan calon.' : 'Memuat data...' }}
    </div>

    <PaslonFormModal
      v-if="modal.open"
      :initial="modal.data"
      :saving="saving"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </section>
</template>
