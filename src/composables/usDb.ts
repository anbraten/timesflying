import Dexie, { liveQuery, type Observable } from 'dexie';
import { onUnmounted, ref } from 'vue';
import { Project, TimeEntry } from '../types';

type LiveToRefOptions<T> = {
  default?: () => T | null;
};

function liveToRef<T>(observable: Observable<T>, options?: LiveToRefOptions<T>) {
  const defaultValue = typeof options?.default === 'function' ? options.default() : null;
  const data = ref<T | null>(defaultValue);
  const loading = ref(false);
  const error = ref<Error>();

  const subscription = observable.subscribe({
    start() {
      loading.value = true;
    },
    next(value) {
      data.value = value;
    },
    error(err) {
      error.value = err as Error;
    },
    complete() {
      loading.value = false;
    },
  });

  onUnmounted(() => {
    subscription.unsubscribe();
  });

  return { data, loading, error };
}

class Database extends Dexie {
  timeEntries!: Dexie.Table<TimeEntry, number>;
  projects!: Dexie.Table<Project, number>;

  constructor() {
    super('timesflying');

    //
    // Define tables and indexes
    // (Here's where the implicit table props are dynamically created)
    //
    this.version(1).stores({
      timeEntries: '++id, startTime, endTime, description, project, isPinned',
      projects: '++id, name, color',
    });
  }

  getAllEntries(page = 0, perPage = 20) {
    return liveToRef(
      liveQuery(() => db.timeEntries.orderBy('startTime').reverse().offset(page).limit(perPage).toArray()),
      {
        default: () => [] as TimeEntry[],
      },
    );
  }

  getPinnedEntries() {
    return liveToRef(
      liveQuery(() =>
        db.timeEntries
          .filter((e) => e.isPinned)
          .reverse()
          .sortBy('startTime'),
      ),
      {
        default: () => [] as TimeEntry[],
      },
    );
  }

  getActiveEntry() {
    return liveToRef(liveQuery(() => db.timeEntries.filter((e) => e.endTime === undefined).first()));
  }

  searchEntries(query: string, limit = 50) {
    return liveToRef(
      liveQuery(() =>
        db.timeEntries
          .filter((entry) => entry.description.toLowerCase().includes(query.toLowerCase()))
          .reverse()
          .limit(limit)
          .sortBy('createdAt')
          .then((entries) => entries.map((entry) => entry.description)),
      ),
      {
        default: () => [] as string[],
      },
    );
  }

  lastProject() {
    return liveToRef(
      liveQuery(() =>
        db.timeEntries
          .orderBy('startTime')
          .last()
          .then((e) => e?.project),
      ),
      {
        default: () => null as string | null,
      },
    );
  }
}

let db: Database;

export function useDb() {
  if (!db) {
    db = new Database();
  }
  return db;
}
