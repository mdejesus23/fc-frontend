<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DeleteWorkerModal from '@/components/DeleteWorkerModal.vue'
import EditShiftModal from '@/components/EditShiftModal.vue'
import api from '@/services/apiConfig'

type Shift = { id: string; worker_id: string; start: string; end: string; duration_hours: number }
type Worker = { id: string; name: string }
type TimezoneItem = { key: string; timezone: string }

const shifts = ref<Shift[]>([])
const workers = ref<Worker[]>([])
const timezones = ref<TimezoneItem[]>([])

const form = ref({ workerId: '', start: '', end: '', tzStr: '' })
const error = ref('')
const isDeleting = ref(false)
const deleteShiftId = ref<string | null>(null)
const deleteShiftLabel = ref('')
const isEditingShift = ref(false)
const editShiftId = ref<string | null>(null)
const editShiftPayload = ref({ workerId: '', start: '', end: '', tzStr: '' })

const load = async () => {
  const workersResponse = await api.get('/workers')
  workers.value = workersResponse.data

  const shiftsResponse = await api.get('/shifts')
  shifts.value = shiftsResponse.data

  const response = await api.get('/timezones')
  timezones.value = response.data?.timezones || []
}

onMounted(load)

window.addEventListener('data-changed', () => load())
window.addEventListener('timezone-changed', () => load())

async function addShift() {
  error.value = ''
  try {
    if (!form.value.workerId) return (error.value = 'Select worker')
    await api.post('shifts', {
      tz_str: form.value.tzStr,
      worker_id: form.value.workerId,
      start: form.value.start,
      end: form.value.end,
    })
    form.value.start = ''
    form.value.end = ''
    await load()
  } catch (e: any) {
    error.value = e.message || String(e)
  }
}

function del(id: string) {
  const s = shifts.value.find((x) => x.id === id)
  if (!s) return
  const workerName = workers.value.find((w: Worker) => w.id === s.worker_id)?.name || s.worker_id
  deleteShiftId.value = id
  deleteShiftLabel.value = `${workerName} — ${s.start} to ${s.end}`
  isDeleting.value = true
}

async function confirmDelete() {
  if (!deleteShiftId.value) return
  await api.delete(`/shifts/${deleteShiftId.value}`)
  isDeleting.value = false
  deleteShiftId.value = null
  deleteShiftLabel.value = ''
  await load()
}

function editShift(id: string) {
  const s = shifts.value.find((x) => x.id === id)
  if (!s) return
  editShiftId.value = id
  editShiftPayload.value = { workerId: s.worker_id, start: s.start, end: s.end, tzStr: '' }
  // attempt to use existing timezone selection if available
  isEditingShift.value = true
}

async function saveShift(payload: { workerId: string; start: string; end: string; tzStr: string }) {
  if (!editShiftId.value) return
  await api.put(`/shifts/${editShiftId.value}`, {
    tz_str: payload.tzStr,
    worker_id: payload.workerId,
    start: payload.start,
    end: payload.end,
  })
  isEditingShift.value = false
  editShiftId.value = null
  editShiftPayload.value = { workerId: '', start: '', end: '', tzStr: '' }
  await load()
}
</script>

<template>
  <section class="p-6 bg-white rounded-xl shadow-md border border-gray-100">
    <DeleteWorkerModal
      v-model="isDeleting"
      :worker-name="deleteShiftLabel"
      @confirm="confirmDelete"
    />
    <EditShiftModal
      v-model="isEditingShift"
      :initial="editShiftPayload"
      :workers="workers"
      :timezones="timezones"
      @save="saveShift"
    />

    <h3 class="text-xl font-bold mb-5 text-gray-800">Shifts</h3>

    <!-- Shift Form -->
    <div class="flex flex-wrap gap-4 mb-5 items-end lg:items-stretch">
      <!-- Timezone Select -->
      <select
        v-model="form.tzStr"
        class="flex-1 min-w-[220px] px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option disabled value="">Select Preferred Timezone</option>
        <option v-for="t in timezones" :key="t.key" :value="t.timezone">
          {{ t.timezone }}
        </option>
      </select>

      <!-- Worker Select -->
      <select
        v-model="form.workerId"
        class="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">-- select worker --</option>
        <option v-for="w in workers" :key="w.id" :value="w.id">{{ w.name }}</option>
      </select>

      <!-- Start & End Inputs -->
      <input
        type="datetime-local"
        v-model="form.start"
        class="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <input
        type="datetime-local"
        v-model="form.end"
        class="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      <!-- Add Shift Button -->
      <button
        @click="addShift"
        class="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition-colors"
      >
        Add Shift
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="text-red-600 font-medium mb-4">{{ error }}</div>

    <!-- Shift Table -->
    <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-100">
      <table class="w-full min-w-[600px] border-collapse">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="text-left p-3 text-gray-600 font-medium">Worker</th>
            <th class="text-left p-3 text-gray-600 font-medium">Start</th>
            <th class="text-left p-3 text-gray-600 font-medium">End</th>
            <th class="text-left p-3 text-gray-600 font-medium">Hours</th>
            <th class="p-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in shifts" :key="s.id" class="border-b hover:bg-gray-50 transition-colors">
            <td class="p-3 text-gray-700">
              {{ workers.find((w) => w.id === s.worker_id)?.name }}
            </td>
            <td class="p-3 text-gray-700">{{ s.start }}</td>
            <td class="p-3 text-gray-700">{{ s.end }}</td>
            <td class="p-3 text-gray-700">{{ s.duration_hours.toFixed(2) }}</td>
            <td class="p-3">
              <div class="flex gap-2">
                <button
                  class="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100 transition-colors"
                  @click="editShift(s.id)"
                >
                  Edit
                </button>
                <button
                  class="px-3 py-1 text-red-600 border border-red-200 rounded-lg hover:text-red-800 hover:border-red-400 transition-colors"
                  @click="del(s.id)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
