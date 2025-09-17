<template>
  <div class="flex justify-center">
    <div class="w-full max-w-md space-y-6">
      <h2 class="text-2xl font-bold mb-4">Settings</h2>

      <!-- Export Data Section -->
      <ExportData />

      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-4">Projects</h3>

        <!-- Projects List -->
        <ul class="space-y-3" v-if="projects && projects.length > 0">
          <li
            v-for="project in projects"
            :key="project.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-4 h-4 rounded-full border border-gray-300"
                :style="{ backgroundColor: project.color }"
              ></div>
              <span class="text-gray-800 font-medium">{{ project.name }}</span>
            </div>
            <div class="flex items-center gap-2">
              <IconButton variant="ghost" name="edit" @click="editProject(project)" title="Edit project" />
              <IconButton variant="error" name="trash" @click="deleteProject(project.id)" title="Delete project" />
            </div>
          </li>
        </ul>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <p class="text-gray-500 mb-4">No projects yet</p>
        </div>

        <!-- Add Project Button -->
        <div class="mt-4">
          <Button variant="primary" @click="openCreateForm" class="w-full">
            <Icon name="plus" class="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      <!-- Project Form Modal -->
      <div
        v-if="showForm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="closeForm"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4" @click.stop>
          <h3 class="text-lg font-semibold mb-4">
            {{ editingProject ? 'Edit Project' : 'Create Project' }}
          </h3>

          <form @submit.prevent="saveProject" class="space-y-4">
            <!-- Project Name -->
            <div>
              <label for="projectName" class="block text-sm font-medium text-gray-700 mb-1"> Project Name </label>
              <input
                id="projectName"
                v-model="formData.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project name"
              />
            </div>

            <!-- Project Color -->
            <div>
              <label for="projectColor" class="block text-sm font-medium text-gray-700 mb-1"> Project Color </label>
              <select
                id="projectColor"
                v-model="formData.color"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a color</option>
                <option v-for="color in availableColors" :key="color.value" :value="color.value">
                  {{ color.name }}
                </option>
              </select>

              <!-- Color Preview -->
              <div v-if="formData.color" class="mt-2 flex items-center gap-2">
                <div
                  class="w-6 h-6 rounded-full border border-gray-300"
                  :style="{ backgroundColor: formData.color }"
                ></div>
                <span class="text-sm text-gray-600">Preview</span>
              </div>
            </div>

            <!-- Form Buttons -->
            <div class="flex gap-3 pt-4">
              <Button type="button" variant="ghost" @click="closeForm" class="flex-1"> Cancel </Button>
              <Button type="submit" variant="primary" class="flex-1" :disabled="!formData.name || !formData.color">
                {{ editingProject ? 'Update' : 'Create' }}
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
