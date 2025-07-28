<template>
  <div>
    <template v-if="isEditing">
      <input
        v-if="type === 'text'"
        v-model="innerModel"
        @blur="save"
        @keydown.enter="save"
        @keydown.escape="cancel"
        type="text"
        class="font-medium bg-transparent border-b-2 border-blue-500 outline-none"
        ref="editInput"
      />
      <input
        v-if="type === 'time'"
        v-model="innerModel"
        @blur="save"
        @keydown.enter="save"
        @keydown.escape="cancel"
        type="text"
        class="font-medium bg-transparent border-b-2 border-blue-500 outline-none"
        ref="editInput"
      />
      <select
        v-if="type === 'select'"
        v-model="innerModel"
        @change="save"
        @blur="save"
        @keydown.enter="save"
        @keydown.escape="cancel"
        class="font-medium bg-transparent border-b-2 border-blue-500 outline-none"
        ref="editInput"
      >
        <option v-for="(label, value) in options ?? []" :key="value" :value="value">{{ label }}</option>
      </select>
    </template>
    <div v-else class="cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded" @click="startEditing">
      <slot>
        <span class="font-medium">
          {{ displayValue }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { formatTime } from '../../composables/utils';

const props = defineProps<{
  type: 'text' | 'select' | 'duration' | 'time';
  modelValue?: string | Date | number;
  options?: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void;
  (e: 'save', value: unknown): void;
  (e: 'cancel'): void;
}>();

const isEditing = ref(false);
const editInput = ref<HTMLElement>();

// For select type, we store the actual value, not the formatted one
// For other types, we store the formatted value for editing
const innerModel = ref(getEditableValue(props.modelValue));

const displayValue = computed(() => {
  if (props.modelValue == null) {
    return '';
  }

  switch (props.type) {
    case 'duration':
      return props.modelValue;
    case 'text':
      return props.modelValue;
    case 'time':
      return formatTime(props.modelValue as Date);
    case 'select':
      return props.options?.[props.modelValue as string];
    default:
      return props.modelValue;
  }
});

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (value) => {
    innerModel.value = getEditableValue(value);
  },
);

function getEditableValue(value: unknown): string {
  if (value == null) {
    return '';
  }

  switch (props.type) {
    case 'duration':
    case 'text':
      return String(value);
    case 'time':
      return formatTime(value as Date);
    case 'select':
      // For select, we store the actual value, not the formatted one
      return String(value);
    default:
      return String(value);
  }
}

function parseValue(value: string): unknown {
  switch (props.type) {
    case 'duration':
    case 'text':
    case 'select':
      return value;
    case 'time':
      if (!(props.modelValue instanceof Date)) {
        throw new Error('Current value must be a Date for time type');
      }

      if (!value.match(/^\d{2}:\d{2}$/)) {
        throw new Error('Time must be in HH:MM format');
      }

      const newDate = new Date(props.modelValue);
      const [hours, minutes] = value.split(':').map(Number);
      newDate.setHours(hours, minutes);
      return newDate;
    default:
      return value;
  }
}

async function startEditing() {
  isEditing.value = true;
  await nextTick();
  editInput.value?.focus();
}

function cancel() {
  isEditing.value = false;
  innerModel.value = getEditableValue(props.modelValue);
  emit('cancel');
}

function save() {
  try {
    const parsedValue = parseValue(innerModel.value);
    emit('save', parsedValue);
    emit('update:modelValue', parsedValue);
    isEditing.value = false;
  } catch (e) {
    console.error('Error saving value:', e);
    // Reset to original value on error
    innerModel.value = getEditableValue(props.modelValue);
  }
}
</script>
