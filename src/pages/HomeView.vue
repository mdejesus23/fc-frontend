<script setup lang="ts">
import TimezoneSettings from '@/components/TimezoneSettings.vue'
import WorkerList from '../components/WorkerList.vue'
import ShiftList from '../components/ShiftList.vue'
</script>

<template>
  <main class="max-w-6xl mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="flex flex-col gap-6">
        <TimezoneSettings />
      </div>
      <div class="flex flex-col gap-6">
        <WorkerList />
      </div>
      <div class="flex flex-col gap-6">
        <ShiftList />
      </div>
    </div>
  </main>
</template>
