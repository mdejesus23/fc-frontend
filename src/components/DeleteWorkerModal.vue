<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; workerName: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
}>()

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40" @click="close"></div>

    <div class="relative bg-white rounded shadow-lg w-full max-w-md mx-4 p-4">
      <h4 class="font-semibold mb-2">Delete worker</h4>
      <p class="mb-4">Are you sure you want to delete "{{ workerName }}" and their shifts?</p>
      <div class="flex justify-end gap-2">
        <button class="px-3 py-2 bg-gray-200 rounded" @click="close">Cancel</button>
        <button class="px-3 py-2 bg-red-600 text-white rounded" @click="confirm">Delete</button>
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
