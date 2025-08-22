<template>
  <div
    v-if="activeTimeEntry"
    class="bg-gradient-to-r from-blue-50/80 to-blue-100/60 border-2 border-blue-200/60 rounded-xl p-4 shadow-lg shadow-blue-500/10 mb-4 transition-all duration-300"
  >
    <div class="flex items-center gap-4">
      <div class="flex flex-1 min-w-0 items-center">
        <p class="font-semibold text-gray-900 truncate">{{ activeTimeEntry.description }}</p>

        <div
          class="w-2.5 h-2.5 rounded-full flex-shrink-0 ml-3 mr-1"
          :style="{ backgroundColor: getProjectColor(activeTimeEntry.project) }"
        ></div>
        <span class="text-sm font-medium text-gray-600">{{ getProjectName(activeTimeEntry.project) }}</span>
      </div>

      <div v-if="editingStart" class="flex gap-2 items-center">
        <span>Start:</span>
        <InlineEditingField
          :model-value="activeTimeEntry.startTime"
          type="time"
          is-editing
          @save="updateStart($event as Date)"
        />
      </div>

      <div
        v-else
        class="text-xl font-mono font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent"
        @click="editingStart = true"
      >
        {{ formatDuration(getElapsedTime(activeTimeEntry)) }}
      </div>

      <div class="flex items-center gap-2">
        <Button variant="error" @click="stopActiveTimeEntry" class="px-6 py-3 flex items-center gap-2" title="Stop">
          <Icon name="stop" class="w-5 h-5" />
          <span class="hidden md:block ml-1">Stop</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useTimer } from '../composables/useTimer';
import { useTimeTracking } from '../composables/useTimeTracking';
import { useProjectHelpers } from '../composables/utils';
import { TimeEntry } from '../types';
import Button from './ui/Button.vue';
import Icon from './ui/Icon.vue';
import InlineEditingField from './ui/InlineEditingField.vue';

const props = defineProps<{
  activeTimeEntry: TimeEntry;
}>();

const editingStart = ref(false);

const { formatDuration, getElapsedTime } = useTimer();
const { stopActiveTimeEntry, updateTimeEntry } = useTimeTracking();
const { getProjectName, getProjectColor } = useProjectHelpers();

async function updateStart(value: Date) {
  await updateTimeEntry(props.activeTimeEntry.id, {
    startTime: value,
  });

  editingStart.value = false;
}
</script>
