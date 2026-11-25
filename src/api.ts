import type {
  ApiError,
  CatalogList,
  CatalogPreview,
  DownloadResult,
  FolderListing,
  ProjectGroup,
  ProjectView,
  StartInfo,
} from './shared/types.ts';

export class ApiProblem extends Error {
  status: number;
  suggestion: string | undefined;
  constructor(message: string, status: number, suggestion?: string) {
    super(message);
    this.status = status;
    this.suggestion = suggestion;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new Error("Can't reach Skill Studio. Check that it's still running in the terminal, then try again.");
  }
  const data = (await response.json().catch(() => ({}))) as T | ApiError;
  if (!response.ok) {
    const problem = data as ApiError;
    throw new ApiProblem(problem.error || 'Something went wrong. Try again.', response.status, problem.suggestion);
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
  catalog: (refresh = false) => request<CatalogList>(`/api/catalog${refresh ? '?refresh=1' : ''}`),
  preview: (id: string) => request<CatalogPreview>(`/api/catalog/skill?id=${encodeURIComponent(id)}`),
  download: (body: { id: string; projectPath: string; agent: string | null; newName?: string }) =>
    post<DownloadResult>('/api/download', body),
};
