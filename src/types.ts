export interface TimeEntry {
  id: number;
  startTime: Date;
  endTime?: Date;
  description: string;
  project: string;
  isPinned: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}
