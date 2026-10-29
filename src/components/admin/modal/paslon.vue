<script setup>
import { ref, computed } from 'vue'
import ModalShell from './shell.vue'

const props = defineProps({
  initial: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})

defineEmits(['close', 'submit'])

const isEdit = computed(() => props.initial?.id != null)

const form = ref({
  id: props.initial?.id ?? null,
  nama: props.initial?.nama ?? '',
  nomor_urut: props.initial?.nomor_urut ?? 1,
  visi: props.initial?.visi ?? '',
  misi: Array.isArray(props.initial?.misi)
    ? props.initial.misi.join('\n')
    : (props.initial?.misi ?? ''),
})
</script>

<template>
  <ModalShell
    :title="isEdit ? 'Edit Paslon' : 'Tambah Paslon'"
    subtitle="Lengkapi informasi pasangan calon."
    width-class="max-w-[540px]"
    @close="$emit('close')"
  >
    <form class="space-y-4 p-6" @submit.prevent="$emit('submit', { ...form })">
      <div class="grid grid-cols-[minmax(0,1fr)_100px] gap-3">
        <label class="block">
          <span class="mb-1.5 block text-[12px] font-bold text-slate-600">
            Nama Paslon
          </span>
          <input v-model="form.nama" type="text" required class="form-input" />
        </label>

        <label class="block">
          <span class="mb-1.5 block text-[12px] font-bold text-slate-600">
            Nomor Urut
          </span>
          <input
            v-model.number="form.nomor_urut"
            type="number"
            min="1"
            required
            class="form-input"
          />
        </label>
      </div>

      <label class="block">
        <span class="mb-1.5 block text-[12px] font-bold text-slate-600">Visi</span>
        <textarea v-model="form.visi" rows="3" required class="form-input resize-y" />
      </label>

      <label class="block">
        <span class="mb-1.5 block text-[12px] font-bold text-slate-600">Misi</span>
        <textarea
          v-model="form.misi"
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
          {{ saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Paslon' }}
        </button>
      </div>
    </form>
  </ModalShell>
</template>
