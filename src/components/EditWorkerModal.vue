<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ modelValue: boolean; initialName: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', name: string): void
}>()

const name = ref(props.initialName || '')

watch(
  () => props.initialName,
  (v) => {
    name.value = v || ''
  },
)

watch(
  () => props.modelValue,
  (open) => {
    if (open) name.value = props.initialName || ''
  },
)

function close() {
  emit('update:modelValue', false)
}

function save() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  emit('save', trimmed)
  emit('update:modelValue', false)
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="close"></div>

    <div class="relative bg-white rounded shadow-lg w-full max-w-md mx-4 p-4">
      <h4 class="font-semibold mb-2">Edit worker</h4>
      <input
        v-model="name"
        class="w-full px-3 py-2 border rounded mb-3"
        placeholder="Worker name"
        autofocus
      />
      <div class="flex justify-end gap-2">
        <button class="px-3 py-2 bg-gray-200 rounded" @click="close">Cancel</button>
        <button class="px-3 py-2 bg-blue-600 text-white rounded" @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* simple fade-in for modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
