<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/apiConfig'
import { isValidTimezone } from '@/utils/timezoneValidator'

type TimezoneEntry = { key: string; timezone: string }

const timezones = ref<TimezoneEntry[]>([])
const orgName = ref('')
const newTimezone = ref('')
const error = ref('')
const success = ref('')

const isEditingTimezone = ref(false)
const editOrgName = ref('')
const editOrgTimezone = ref('')

const load = async () => {
  try {
    error.value = ''
    const response = await api.get('/timezones')
    timezones.value = response.data?.timezones || []
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message || 'Failed to load timezones'
  }
}

onMounted(load)

async function addTimezone() {
  error.value = ''
  success.value = ''
  try {
    if (!newTimezone.value.trim()) {
      return (error.value = 'Timezone is required')
    }
    if (!isValidTimezone(newTimezone.value.trim())) {
      return (error.value = 'Invalid IANA timezone string')
    }
    const org = orgName.value.trim() || 'default'
    const endpoint = `/timezone/${org}`
    await api.post(endpoint, { timezone: newTimezone.value.trim() })
    success.value = `Timezone set successfully${orgName.value.trim() ? ` for ${orgName.value.trim()}` : ''}`
    newTimezone.value = ''
    orgName.value = ''
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message || 'Failed to set timezone'
  }
}

function openEditModal(key: string, timezone: string) {
  editOrgName.value = key
  editOrgTimezone.value = timezone
  isEditingTimezone.value = true
}

async function saveEditTimezone() {
  error.value = ''
  success.value = ''
  try {
    if (!editOrgTimezone.value.trim()) {
      return (error.value = 'Timezone is required')
    }
    if (!isValidTimezone(editOrgTimezone.value.trim())) {
      return (error.value = 'Invalid IANA timezone string')
    }
    const org = editOrgName.value || 'default'
    const endpoint = `/timezone/${org}`
    await api.post(endpoint, { timezone: editOrgTimezone.value.trim() })
    success.value = `Timezone updated for ${editOrgName.value}`
    isEditingTimezone.value = false
    editOrgName.value = ''
    editOrgTimezone.value = ''
    await load()
  } catch (e: any) {
    error.value = e?.response?.data?.message || e.message || 'Failed to update timezone'
  }
}

function closeEditModal() {
  isEditingTimezone.value = false
  editOrgName.value = ''
  editOrgTimezone.value = ''
}
</script>

<template>
  <section class="p-6 bg-white rounded-xl shadow-md border border-gray-100">
    <!-- Edit Timezone Modal -->
    <div v-if="isEditingTimezone" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="closeEditModal"></div>
      <div class="relative bg-white rounded shadow-lg w-full max-w-md mx-4 p-4">
        <h4 class="font-semibold mb-3">Edit Timezone for {{ editOrgName }}</h4>
        <input
          v-model="editOrgTimezone"
          placeholder="e.g., America/Chicago"
          class="w-full px-3 py-2 border rounded mb-3"
        />
        <div class="flex justify-end gap-2">
          <button class="px-3 py-2 bg-gray-200 rounded" @click="closeEditModal">Cancel</button>
          <button class="px-3 py-2 bg-blue-600 text-white rounded" @click="saveEditTimezone">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <h3 class="text-xl font-bold mb-4 text-gray-800">Timezone Settings</h3>

    <!-- Success Message -->
    <div v-if="success" class="text-green-600 font-medium mb-3 p-3 bg-green-50 rounded-lg">
      {{ success }}
    </div>

    <!-- Error Message -->
    <div v-if="error" class="text-red-600 font-medium mb-3 p-3 bg-red-50 rounded-lg">
      {{ error }}
    </div>

    <!-- Add Timezone Form -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 class="font-semibold mb-3 text-gray-700">Add or Update Timezone</h4>
      <div class="grid grid-cols-1 gap-3 mb-3">
        <input
          v-model="orgName"
          placeholder="Organization/Company name (optional)"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          v-model="newTimezone"
          placeholder="Timezone (e.g., America/Chicago)"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <button
        @click="addTimezone"
        class="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition-colors"
      >
        Set Timezone
      </button>
    </div>

    <!-- Timezone List -->
    <div>
      <h4 class="font-semibold mb-3 text-gray-700">Configured Timezones</h4>
      <div v-if="timezones.length === 0" class="text-gray-500 italic p-3 bg-gray-50 rounded-lg">
        No timezones configured yet
      </div>
      <ul class="space-y-2">
        <li
          v-for="tz in timezones"
          :key="tz.key"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex flex-col">
            <span class="text-gray-700 font-medium">{{ tz.key }}</span>
            <span class="text-gray-500 text-sm">{{ tz.timezone }}</span>
          </div>
          <button
            class="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-colors"
            @click="openEditModal(tz.key, tz.timezone)"
          >
            Edit
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>
