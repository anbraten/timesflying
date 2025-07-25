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
        v-model="newProjectId"
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
import { useDb } from '../composables/useDb';

const db = useDb();
const { startNewTimeEntry } = useTimeTracking();

const newDescription = ref('');
const newProjectId = ref<number>();

const { data: projects } = db.getProjects();
const { data: recentDescriptions } = db.searchTimeEntries('', 10);
const { data: lastProject } = db.lastUsedProject();

watch(lastProject, (value) => {
  if (newProjectId.value === undefined && value != null) {
    newProjectId.value = value;
  }
});

const isValid = computed(() => newDescription.value.trim() !== '' && newProjectId.value !== undefined);

function handleStartTimer() {
  if (newDescription.value.trim() === '' || newProjectId.value == null) {
    return;
  }

  startNewTimeEntry(newDescription.value, newProjectId.value);

  // Reset form
  newDescription.value = '';
  newProjectId.value = undefined;
}
</script>
