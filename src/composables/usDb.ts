import Dexie, { liveQuery, Subscription, type Observable } from 'dexie';
import { isRef, type MaybeRef, onUnmounted, ref, watch, toRef } from 'vue';
import { Project, TimeEntry } from '../types';

type LiveToRefOptions<T> = {
  default?: () => T | null;
};

function liveToRef<T>(observable: MaybeRef<Observable<T>>, options?: LiveToRefOptions<T>) {
  const defaultValue = typeof options?.default === 'function' ? options.default() : null;
  const data = ref<T | null>(defaultValue);
  const loading = ref(false);
  const error = ref<Error>();

  let subscription: Subscription | undefined = undefined;
  function subscribe(_observable: Observable) {
    if (subscription) {
      subscription.unsubscribe();
    }

    subscription = _observable.subscribe({
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
  }

  if (isRef(observable)) {
    watch(observable, subscribe, { immediate: true });
  } else {
    subscribe(observable);
  }

  onUnmounted(() => {
    subscription?.unsubscribe();
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

  getAllTimeEntries(_page: MaybeRef<number> = 0, _perPage: MaybeRef<number> = 30) {
    const page = toRef(_page);
    const perPage = toRef(_perPage);

    const query = ref(
      liveQuery(() =>
        db.timeEntries
          .orderBy('startTime')
          .reverse()
          .offset(page.value * perPage.value)
          .limit(perPage.value)
          .toArray(),
      ),
    );

    // TODO: use computed instead of ref & watch
    // This is a workaround to ensure the query updates when page or perPage changes
    watch([page, perPage], ([_page, _perPage]) => {
      query.value = liveQuery(() =>
        db.timeEntries
          .orderBy('startTime')
          .reverse()
          .offset(_page * _perPage)
          .limit(_perPage)
          .toArray(),
      );
    });

    return liveToRef(query, {
      default: () => [] as TimeEntry[],
    });
  }

  getPinnedTimeEntries() {
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

  getActiveTimeEntry() {
    return liveToRef(liveQuery(() => db.timeEntries.filter((e) => e.endTime === undefined).first()));
  }

  searchTimeEntries(query: string, limit = 50) {
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
