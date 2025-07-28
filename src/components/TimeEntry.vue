<template>
  <div
    class="bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4 hover:bg-white/80 hover:shadow-gray-900/5 transition-all duration-300"
  >
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <div class="flex flex-1 min-w-0 items-center">
          <!-- Editable description -->
          <InlineEditingField
            v-model="entry.description"
            type="text"
            @save="saveEdit('description', $event as string)"
          />

          <InlineEditingField
            v-model="entry.project"
            type="select"
            :options="
              projects?.reduce(
                (acc, p) => ({
                  ...acc,
                  [p.id]: p.name,
                }),
                {},
              )
            "
            @save="saveEdit('project', parseInt($event as string, 10))"
          >
            <div class="flex items-center">
              <div
                class="w-2.5 h-2.5 rounded-full flex-shrink-0 ml-3 mr-1"
                :style="{ backgroundColor: projectColor }"
              ></div>
              <span class="text-sm font-medium text-gray-600">{{ projectName }}</span>
            </div>
          </InlineEditingField>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <!-- Editable start time -->
            <InlineEditingField v-model="entry.startTime" type="time" @save="saveEdit('startTime', $event as Date)" />

            <!-- Editable end time -->
            <InlineEditingField v-model="entry.endTime" type="time" @save="saveEdit('endTime', $event as Date)" />
          </div>
        </div>
      </div>

      <div class="font-bold text-gray-900 text-lg">
        {{ formatDuration(getElapsedTime(entry)) }}
      </div>

      <div class="flex items-center gap-1 ml-6">
        <IconButton variant="primary" name="play" @click="continueTimeEntry(entry.id)" title="Continue this task" />

        <IconButton
          :variant="entry.isPinned ? 'warning' : 'ghost'"
          @click="togglePinTimeEntry(entry.id)"
          :title="entry.isPinned ? 'Unpin task' : 'Pin task'"
          name="bookmark"
        />

        <IconButton variant="error" name="trash" @click="deleteTimeEntry(entry.id)" title="Delete entry" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTimeTracking } from '../composables/useTimeTracking';
import { useProjectHelpers } from '../composables/utils';
import { type TimeEntry } from '../types';
import { useTimer } from '../composables/useTimer';
import IconButton from './ui/IconButton.vue';
import InlineEditingField from './ui/InlineEditingField.vue';
import { useDb } from '../composables/useDb';
import { computed } from 'vue';

const props = defineProps<{
  entry: TimeEntry;
}>();

const db = useDb();
const { continueTimeEntry, togglePinTimeEntry, deleteTimeEntry, updateTimeEntry } = useTimeTracking();
const { getProjectName, getProjectColor } = useProjectHelpers();
const { formatDuration, getElapsedTime } = useTimer();
const { data: projects } = db.getProjects();

const projectName = computed(() => getProjectName(props.entry.project));
const projectColor = computed(() => getProjectColor(props.entry.project));

function checkIsValid(entry: TimeEntry): boolean {
  if (!entry.endTime || entry.startTime >= entry.endTime) {
    alert('Start time must be before end time');
    return false;
  }

  if (entry.description.trim() === '') {
    alert('Description cannot be empty');
    return false;
  }

  return true;
}

async function saveEdit<K extends keyof TimeEntry>(field: K, newValue: TimeEntry[K]) {
  if (!checkIsValid({ ...props.entry, [field]: newValue })) {
    return;
  }

  await updateTimeEntry(props.entry.id, {
    [field]: newValue,
  });
}
</script>
