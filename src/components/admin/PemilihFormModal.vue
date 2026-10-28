<script setup>
import { ref, computed } from 'vue'
import ModalShell from './ModalShell.vue'

const props = defineProps({
  initial: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

defineEmits(['close', 'submit'])

const FIELDS = [
  { key: 'nama', label: 'Nama Lengkap', type: 'text' },
  { key: 'kelas', label: 'Kelas', type: 'text' },
  { key: 'username', label: 'Username', type: 'text' },
  { key: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date' },
]

const isEdit = computed(() => props.initial?.id != null)

const form = ref({
  id: props.initial?.id ?? null,
  nama: props.initial?.nama ?? '',
  kelas: props.initial?.kelas ?? '',
  username: props.initial?.username ?? '',
  tanggal_lahir: props.initial?.tanggal_lahir ?? '',
  sudah_memilih: !!props.initial?.sudah_memilih,
  pilih_paslon: props.initial?.pilih_paslon ?? null,
})
</script>

<template>
  <ModalShell
    :title="isEdit ? 'Edit Pemilih' : 'Tambah Pemilih'"
    subtitle="Lengkapi data pemilih di bawah ini."
    @close="$emit('close')"
  >
    <form class="space-y-4 p-6" @submit.prevent="$emit('submit', { ...form })">
      <label v-for="field in FIELDS" :key="field.key" class="block">
        <span class="mb-1.5 block text-[12px] font-bold text-slate-600">
          {{ field.label }}
        </span>
        <input
          v-model="form[field.key]"
          :type="field.type"
          required
          class="form-input"
        />
      </label>

      <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <label class="flex cursor-pointer items-center gap-2.5">
          <input
            v-model="form.sudah_memilih"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-[#467a55] focus:ring-[#467a55]"
          />
          <span class="text-[12px] font-bold text-slate-700">Sudah Memilih</span>
        </label>
      </div>

      <div class="flex justify-end gap-2 border-t border-slate-100 pt-5">
        <button
          type="button"
          class="rounded-lg border border-slate-200 px-4 py-2.5 text-[12px] font-bold text-slate-600 hover:bg-slate-50"
          @click="$emit('close')"
        >
          Batal
        </button>

        <button
          type="submit"
          :disabled="saving"
          class="rounded-lg bg-[#467a55] px-4 py-2.5 text-[12px] font-bold text-white transition hover:bg-[#376546] disabled:opacity-60"
        >
          {{ saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Pemilih' }}
        </button>
      </div>
    </form>
  </ModalShell>
</template>
