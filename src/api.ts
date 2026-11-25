import type { ApiError, FolderListing, ProjectGroup, ProjectView, StartInfo } from './shared/types.ts';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new Error("Can't reach Skill Studio. Check that it's still running in the terminal, then try again.");
  }
  const data = (await response.json().catch(() => ({}))) as T | ApiError;
  if (!response.ok) {
    const message = (data as ApiError).error;
    throw new Error(message || 'Something went wrong. Try again.');
  }
  return data as T;
}

function post<T>(url: string, body: unknown): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const api = {
  start: () => request<StartInfo>('/api/start'),
  projects: (current?: string) =>
    request<ProjectGroup[]>(`/api/projects${current ? `?current=${encodeURIComponent(current)}` : ''}`),
  folders: (path?: string) => request<FolderListing>(`/api/folders${path ? `?path=${encodeURIComponent(path)}` : ''}`),
  connect: (target: { path: string } | { sample: true }, agent?: string) =>
    post<ProjectView>('/api/connect', agent ? { ...target, agent } : target),
  forget: (path: string) => post<{ ok: true }>('/api/forget', { path }),
};
