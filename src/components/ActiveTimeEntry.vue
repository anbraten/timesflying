<template>
  <div
    v-if="activeTimeEntry"
    class="bg-gradient-to-r from-blue-50/80 to-blue-100/60 border-2 border-blue-200/60 rounded-xl p-4 shadow-lg shadow-blue-500/10 mb-4 transition-all duration-300"
  >
    <div class="flex items-center gap-4">
      <div class="flex flex-1 min-w-0 items-center">
        <!-- Inline editable title/description -->
        <InlineEditingField
          type="text"
          :model-value="activeTimeEntry.description"
          @save="updateDescription($event as string)"
        />

        <!-- Project display / inline edit (show color + name in display slot) -->
        <div class="ml-3 flex items-center gap-2">
          <InlineEditingField
            type="select"
            :model-value="String(activeTimeEntry.project)"
            :options="projectOptions"
            @save="updateProject($event as string)"
          >
            <template #default>
              <div class="flex items-center gap-2">
                <div
                  class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: getProjectColor(activeTimeEntry.project) }"
                ></div>
                <span class="text-sm font-medium text-gray-600">{{ getProjectName(activeTimeEntry.project) }}</span>
              </div>
            </template>
          </InlineEditingField>
        </div>
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
import { ref, computed } from 'vue';
import { useTimer } from '../composables/useTimer';
import { useTimeTracking } from '../composables/useTimeTracking';
import { useProjectHelpers } from '../composables/utils';
import { TimeEntry } from '../types';
import Button from './ui/Button.vue';
import Icon from './ui/Icon.vue';
import InlineEditingField from './ui/InlineEditingField.vue';
import { useDb } from '../composables/useDb';

const props = defineProps<{
  activeTimeEntry: TimeEntry;
}>();

const editingStart = ref(false);

const { formatDuration, getElapsedTime } = useTimer();
const { stopActiveTimeEntry, updateTimeEntry } = useTimeTracking();
const { getProjectName, getProjectColor } = useProjectHelpers();
const { data: projects } = useDb().getProjects();

const projectOptions = computed(() => {
  const opts: Record<string, string> = {};
  (projects.value ?? []).forEach((p) => {
    opts[String(p.id)] = p.name;
  });
  return opts;
});

async function updateStart(value: Date) {
  await updateTimeEntry(props.activeTimeEntry.id, {
    startTime: value,
  });

  editingStart.value = false;
}

async function updateDescription(value: string) {
  await updateTimeEntry(props.activeTimeEntry.id, {
    description: value,
  });
}

async function updateProject(value: string) {
  const projectId = Number(value);
  if (Number.isNaN(projectId)) return;

  await updateTimeEntry(props.activeTimeEntry.id, {
    project: projectId,
  });
}
</script>
