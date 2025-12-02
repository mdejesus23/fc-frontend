<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/apiConfig'
import EditWorkerModal from '@/components/EditWorkerModal.vue'
import DeleteWorkerModal from '@/components/DeleteWorkerModal.vue'

type Worker = { id: string; name: string }

const workers = ref<Worker[]>([])
const name = ref('')

const isEditing = ref(false)
const editWorkerId = ref<string | null>(null)
const editWorkerName = ref('')
const isDeleting = ref(false)
const deleteWorkerId = ref<string | null>(null)
const deleteWorkerName = ref('')

const load = async () => {
  const workersResponse = await api.get('/workers')
  workers.value = workersResponse.data
}

onMounted(load)

async function addWorker() {
  if (!name.value.trim()) return
  await api.post('workers', { name: name.value.trim() })
  name.value = ''
  await load()
}

function del(id: string) {
  const w = workers.value.find((x) => x.id === id)
  if (!w) return
  deleteWorkerId.value = id
  deleteWorkerName.value = w.name
  isDeleting.value = true
}

async function confirmDelete() {
  if (!deleteWorkerId.value) return
  await api.delete(`/workers/${deleteWorkerId.value}`)
  isDeleting.value = false
  deleteWorkerId.value = null
  deleteWorkerName.value = ''
  await load()
  window.dispatchEvent(new CustomEvent('data-changed'))
}

async function update(id: string) {
  const w = workers.value.find((x) => x.id === id)
  if (!w) return
  editWorkerId.value = id
  editWorkerName.value = w.name
  isEditing.value = true
}

async function saveEdit(newName: string) {
  if (!editWorkerId.value) return
  const trimmed = newName.trim()
  if (!trimmed) return
  await api.put(`/workers/${editWorkerId.value}`, { name: trimmed })
  isEditing.value = false
  editWorkerId.value = null
  editWorkerName.value = ''
  await load()
  window.dispatchEvent(new CustomEvent('data-changed'))
}
</script>

<template>
  <section class="p-6 bg-white rounded-xl shadow-md border border-gray-100">
    <!-- Modals -->
    <EditWorkerModal v-model="isEditing" :initial-name="editWorkerName" @save="saveEdit" />
    <DeleteWorkerModal
      v-model="isDeleting"
      :worker-name="deleteWorkerName"
      @confirm="confirmDelete"
    />

    <!-- Header -->
    <h3 class="text-xl font-bold mb-4 text-gray-800">Workers</h3>

    <!-- Add Worker -->
    <div class="flex gap-3 mb-5">
      <input
        v-model="name"
        placeholder="New worker name"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        @click="addWorker"
        class="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition-colors"
      >
        Add
      </button>
    </div>

    <!-- Worker List -->
    <ul class="space-y-3">
      <li
        v-for="w in workers"
        :key="w.id"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <span class="text-gray-700 font-medium">{{ w.name }}</span>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-colors"
            @click="update(w.id)"
          >
            Edit
          </button>
          <button
            class="px-3 py-1 border border-red-300 rounded-lg text-red-600 hover:text-red-800 hover:border-red-500 transition-colors"
            @click="del(w.id)"
          >
            Delete
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
