<template>
  <button
    :type="type || 'button'"
    :disabled="disabled"
    :title="title"
    :class="{
      'p-2 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed': true,
      'text-amber-600 hover:bg-amber-50 hover:text-amber-700 focus:ring-amber-500': variant === 'warning',
      'text-red-600 hover:bg-red-50 hover:text-red-700 focus:ring-red-500': variant === 'error',
      'text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-gray-500': variant === 'ghost',
      'text-blue-600 hover:bg-blue-50 hover:text-blue-700 focus:ring-blue-500': !variant || variant === 'primary',
    }"
    @click="$emit('click', $event)"
  >
    <slot>
      <Icon :name="name" :class="`w-5 h-5 ${variant === 'ghost' ? 'text-gray-400' : ''}`" />
    </slot>
  </button>
</template>

<script setup lang="ts">
import Icon from './Icon.vue';

defineProps<{
  variant?: 'primary' | 'warning' | 'error' | 'ghost';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  title?: string;
  name: typeof Icon.props.name;
}>();

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>
