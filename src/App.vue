<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import axios from 'axios'
</script>

<template>
  <div class="min-h-screen mx-auto flex flex-col bg-gray-50">
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">App</h1>

          <nav class="flex gap-1 sm:gap-2">
            <RouterLink
              to="/"
              class="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150"
              active-class="!bg-blue-100 !text-blue-700 shadow-sm"
            >
              Home
            </RouterLink>

            <RouterLink
              to="/about"
              class="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150"
              active-class="!bg-blue-100 !text-blue-700 shadow-sm"
            >
              About
            </RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main -->
    <main class="flex-1 w-full">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <RouterView />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-500">
        © 2025 App. All rights reserved.
      </div>
    </footer>
  </div>
</template>
