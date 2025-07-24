<template>
  <div class="bg-gray-50/30 border-2 border-dashed border-gray-200 rounded-xl p-4 transition-all duration-300 mb-4">
    <form @submit.prevent="handleStartTimer" class="flex items-center gap-4">
      <input
        v-model="newDescription"
        type="text"
        name="description"
        class="flex-1 min-w-0 px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
        placeholder="What are you working on?"
        list="descriptions"
        required
        autofocus
      />

      <datalist id="descriptions">
        <option v-for="desc in recentDescriptions" :key="desc" :value="desc" />
      </datalist>

      <select
        v-model="newProject"
        name="project"
        class="w-48 flex-shrink-0 px-4 py-3 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
        required
      >
        <option value="">Select project</option>
        <option v-for="project in projects" :key="project.id" :value="project.id">
          {{ project.name }}
        </option>
      </select>

      <Button type="submit" variant="success" class="px-6 py-3 flex items-center gap-2" :disabled="!isValid">
        <Icon name="play" class="w-5 h-5" />
        <span class="hidden md:block ml-1">Start</span>
      </Button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useTimeTracking } from '../composables/useTimeTracking';
import Button from './ui/Button.vue';
import Icon from './ui/Icon.vue';

const { projects, recentDescriptions, startNewTimeEntry, lastProject } = useTimeTracking();

const newDescription = ref('');
const newProject = ref('');

watch(lastProject, (value) => {
  if (newProject.value.trim() === '') {
    newProject.value = value || '';
  }
});

const isValid = computed(() => newDescription.value.trim() !== '' && newProject.value !== '');

function handleStartTimer() {
  startNewTimeEntry(newDescription.value, newProject.value);

  // Reset form
  newDescription.value = '';
  newProject.value = '';
}
</script>
