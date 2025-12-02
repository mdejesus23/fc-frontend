<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  initial: { workerId: string; start: string; end: string; tzStr: string }
  workers: Array<{ id: string; name: string }>
  timezones: Array<{ key: string; timezone: string }>
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', payload: { workerId: string; start: string; end: string; tzStr: string }): void
}>()

const form = ref({ workerId: '', start: '', end: '', tzStr: '' })

watch(
  () => props.initial,
  (v) => {
    form.value = {
      workerId: v?.workerId || '',
      start: v?.start || '',
      end: v?.end || '',
      tzStr: v?.tzStr || '',
    }
  },
  { immediate: true },
)

watch(
  () => props.modelValue,
  (open) => {
    if (open)
      form.value = {
        workerId: props.initial?.workerId || '',
        start: props.initial?.start || '',
        end: props.initial?.end || '',
        tzStr: props.initial?.tzStr || '',
      }
  },
)

function close() {
  emit('update:modelValue', false)
}

function save() {
  const trimmedWorker = form.value.workerId
  if (!trimmedWorker) return
  // basic validation
  if (!form.value.start || !form.value.end) return
  emit('save', { ...form.value })
  emit('update:modelValue', false)
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="close"></div>

    <div class="relative bg-white rounded shadow-lg w-full max-w-xl mx-4 p-4">
      <h4 class="font-semibold mb-2">Edit shift</h4>

      <div class="grid grid-cols-1 gap-3">
        <select v-model="form.workerId" class="px-3 py-2 border rounded">
          <option value="">-- select worker --</option>
          <option v-for="w in props.workers" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>

        <input type="datetime-local" v-model="form.start" class="px-3 py-2 border rounded" />
        <input type="datetime-local" v-model="form.end" class="px-3 py-2 border rounded" />

        <select v-model="form.tzStr" class="px-3 py-2 border rounded">
          <option value="">-- select timezone --</option>
          <option v-for="t in props.timezones" :key="t.key" :value="t.timezone">
            {{ t.timezone }}
          </option>
        </select>

        <div class="flex justify-end gap-2">
          <button class="px-3 py-2 bg-gray-200 rounded" @click="close">Cancel</button>
          <button class="px-3 py-2 bg-blue-600 text-white rounded" @click="save">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
