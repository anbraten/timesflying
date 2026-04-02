<template>
  <div class="flex justify-center">
    <div class="w-full max-w-lg space-y-5">

      <ExportData />

      <!-- Projects Card -->
      <div class="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900">Projects</h3>
          <Button variant="primary" size="sm" @click="openCreateForm">
            <Icon name="plus" class="w-3.5 h-3.5 mr-1" />
            New
          </Button>
        </div>

        <!-- Projects List -->
        <ul v-if="projects && projects.length > 0" class="divide-y divide-gray-50">
          <li
            v-for="project in projects"
            :key="project.id"
            class="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: project.color }" />
              <span class="text-sm font-medium text-gray-800">{{ project.name }}</span>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <IconButton variant="ghost" name="edit" @click="editProject(project)" title="Edit project" />
              <IconButton variant="error" name="trash" @click="deleteProject(project.id)" title="Delete project" />
            </div>
          </li>
        </ul>

        <!-- Empty State -->
        <div v-else class="py-12 text-center">
          <p class="text-sm text-gray-400 mb-2">No projects yet</p>
          <button class="text-sm text-blue-600 hover:text-blue-700" @click="openCreateForm">Create one</button>
        </div>
      </div>

      <!-- Project Form Modal -->
      <div
        v-if="showForm"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click="closeForm"
      >
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" @click.stop>
          <h3 class="text-base font-semibold text-gray-900 mb-5">
            {{ editingProject ? 'Edit Project' : 'New Project' }}
          </h3>

          <form @submit.prevent="saveProject" class="space-y-5">
            <div>
              <label for="projectName" class="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Name</label>
              <input
                id="projectName"
                v-model="formData.name"
                type="text"
                required
                autofocus
                class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Project name"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Color</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in availableColors"
                  :key="color.value"
                  type="button"
                  :title="color.name"
                  @click="formData.color = color.value"
                  class="w-7 h-7 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  :class="formData.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'"
                  :style="{ backgroundColor: color.value }"
                />
              </div>
            </div>

            <div class="flex gap-2 pt-1">
              <Button type="button" variant="ghost" @click="closeForm" class="flex-1">Cancel</Button>
              <Button type="submit" variant="primary" class="flex-1" :disabled="!formData.name || !formData.color">
                {{ editingProject ? 'Save' : 'Create' }}
              </Button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useDb } from '../composables/useDb';
import type { Project } from '../types';
import IconButton from '../components/ui/IconButton.vue';
import Button from '../components/ui/Button.vue';
import Icon from '../components/ui/Icon.vue';
import ExportData from '../components/ExportData.vue';

const db = useDb();

const { data: projects } = db.getProjects();

// Form state
const showForm = ref(false);
const editingProject = ref<Project | null>(null);
const formData = reactive({
  name: '',
  color: '',
});

// Available colors for projects
const availableColors = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#F43F5E' },
  { name: 'Violet', value: '#7C3AED' },
  { name: 'Amber', value: '#D97706' },
  { name: 'Sky', value: '#0EA5E9' },
];

function openCreateForm() {
  editingProject.value = null;
  formData.name = '';
  formData.color = '';
  showForm.value = true;
}

function editProject(project: Project) {
  editingProject.value = project;
  formData.name = project.name;
  formData.color = project.color;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingProject.value = null;
  formData.name = '';
  formData.color = '';
}

async function saveProject() {
  if (!formData.name.trim() || !formData.color) {
    return;
  }

  try {
    if (editingProject.value) {
      // Update existing project
      await db.updateProject(editingProject.value.id, {
        name: formData.name.trim(),
        color: formData.color,
      });
    } else {
      // Create new project
      await db.createProject(formData.name.trim(), formData.color);
    }

    closeForm();
  } catch (error) {
    console.error('Error saving project:', error);
    alert('Failed to save project. Please try again.');
  }
}

async function deleteProject(projectId: number) {
  if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
    return;
  }

  try {
    await db.deleteProject(projectId);
  } catch (error) {
    console.error('Error deleting project:', error);
    alert('Failed to delete project. Please try again.');
  }
}
</script>
