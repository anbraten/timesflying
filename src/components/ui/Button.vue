<template>
  <button
    :type="type || 'button'"
    :disabled="disabled"
    :class="{
      'inline-flex items-center justify-center cursor-pointer font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed': true,
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-2.5 text-sm': !size || size === 'md',
      'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500': variant === 'success',
      'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500': variant === 'error',
      'text-gray-600 hover:bg-gray-100 focus:ring-gray-500': variant === 'ghost',
      'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500': !variant || variant === 'primary',
    }"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'success' | 'error' | 'ghost';
  size?: 'sm' | 'md';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}>();

defineEmits<{ click: [event: MouseEvent] }>();
</script>
