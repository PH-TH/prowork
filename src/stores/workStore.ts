import { create } from 'zustand';
import { workService } from '../services/workService';
import type { WorkMember, WorkProject, WorkScheduleItem, WorkTask } from '../types/work';
import { uid } from '../lib/utils';

interface WorkState {
  members: WorkMember[];
  projects: WorkProject[];
  tasks: WorkTask[];
  schedule: WorkScheduleItem[];
  addProject: (project: Omit<WorkProject, 'id'>) => string;
  addTask: (task: Omit<WorkTask, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Omit<WorkProject, 'id'>>) => void;
  updateTask: (id: string, updates: Partial<Omit<WorkTask, 'id'>>) => void;
  deleteTask: (id: string) => void;
  updateTaskProgress: (id: string, progress: number) => void;
}

export const useWorkStore = create<WorkState>((set) => ({
  members: workService.getMembers(),
  projects: workService.getProjects(),
  tasks: workService.getTasks(),
  schedule: workService.getSchedule(),
  addProject: (project) => {
    const id = uid('project');
    set((state) => ({ projects: [{ id, ...project }, ...state.projects] }));
    return id;
  },
  addTask: (task) => set((state) => ({ tasks: [{ id: uid('task'), ...task }, ...state.tasks] })),
  updateProject: (id, updates) =>
    set((state) => ({ projects: state.projects.map((project) => (project.id === id ? { ...project, ...updates } : project)) })),
  updateTask: (id, updates) =>
    set((state) => ({ tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)) })),
  deleteTask: (id) =>
    set((state) => {
      const task = state.tasks.find((item) => item.id === id);
      const tasks = state.tasks.filter((item) => item.id !== id);
      if (!task) return { tasks };
      const hasLinkedTasks = tasks.some((item) => item.projectId === task.projectId);
      return {
        tasks,
        projects: hasLinkedTasks ? state.projects : state.projects.filter((project) => project.id !== task.projectId),
      };
    }),
  updateTaskProgress: (id, progress) =>
    set((state) => ({ tasks: state.tasks.map((task) => (task.id === id ? { ...task, progress } : task)) })),
}));
