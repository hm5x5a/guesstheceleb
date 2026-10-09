import { get, set, del, keys } from 'idb-keyval';
import { MAX_STORED_PROJECTS } from '../config';
import type { Project } from '../editor/types';

const PROJECT_PREFIX = 'gtc_project_';

// Request durable storage once on initialization
if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {
    // Graceful fallback for non-supporting browsers or denied permissions
  });
}

export async function saveProject(project: Project): Promise<void> {
  try {
    const key = `${PROJECT_PREFIX}${project.id}`;
    await set(key, project);
    await pruneOldProjects();
  } catch (err) {
    console.warn('Failed to save project to IndexedDB:', err);
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const allKeys = await keys();
    const projectKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(PROJECT_PREFIX));
    const projects: Project[] = [];

    for (const key of projectKeys) {
      const p = await get<Project>(key);
      if (p) {
        projects.push(p);
      }
    }

    // Sort descending by createdAt (newest first)
    return projects.sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.warn('Failed to load projects from IndexedDB:', err);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | undefined> {
  try {
    return await get<Project>(`${PROJECT_PREFIX}${id}`);
  } catch (err) {
    console.warn(`Failed to get project ${id}:`, err);
    return undefined;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await del(`${PROJECT_PREFIX}${id}`);
  } catch (err) {
    console.warn(`Failed to delete project ${id}:`, err);
  }
}

export async function clearAllProjects(): Promise<void> {
  try {
    const allKeys = await keys();
    const projectKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(PROJECT_PREFIX));
    for (const key of projectKeys) {
      await del(key);
    }
  } catch (err) {
    console.warn('Failed to clear projects from IndexedDB:', err);
  }
}

async function pruneOldProjects(): Promise<void> {
  try {
    const projects = await getProjects();
    if (projects.length > MAX_STORED_PROJECTS) {
      // Delete older projects beyond the limit
      const toDelete = projects.slice(MAX_STORED_PROJECTS);
      for (const p of toDelete) {
        await del(`${PROJECT_PREFIX}${p.id}`);
      }
    }
  } catch (err) {
    console.warn('Error during project pruning:', err);
  }
}
