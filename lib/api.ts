const API_BASE = "";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("eventinlatina-auth") : null;
  let parsedToken: string | null = null;
  if (token) {
    try {
      const parsed = JSON.parse(token);
      parsedToken = parsed.state?.token || null;
    } catch { /* ignore */ }
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (parsedToken) headers["Authorization"] = `Bearer ${parsedToken}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers: { ...headers, ...options?.headers } });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Errore sconosciuto" }));
    throw new Error(err.error || `Errore ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      request<{ user: any; token: string }>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<{ user: any; token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
    google: (data: { credential: string }) =>
      request<{ user: any; token: string }>("/api/auth/google", { method: "POST", body: JSON.stringify(data) }),
    me: () => request<{ user: any }>("/api/auth/me"),
  },
  events: {
    list: (params?: string) => request<any[]>(`/api/events${params ? `?${params}` : ""}`),
    get: (id: number) => request<any>(`/api/events/${id}`),
    create: (data: any) => request<any>("/api/events", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => request<any>(`/api/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/api/events/${id}`, { method: "DELETE" }),
    save: (id: number) => request<void>(`/api/events/${id}/save`, { method: "POST" }),
    unsave: (id: number) => request<void>(`/api/events/${id}/save`, { method: "DELETE" }),
    saved: () => request<any[]>("/api/events/saved/mine"),
  },
  users: {
    me: () => request<any>("/api/users/me"),
    update: (data: any) => request<any>("/api/users/me", { method: "PUT", body: JSON.stringify(data) }),
    avatar: (data: { dataUrl: string }) => request<any>("/api/users/avatar", { method: "POST", body: JSON.stringify(data) }),
    list: () => request<any[]>("/api/users"),
    updateRole: (id: string, role: string) => request<any>(`/api/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
    updateUser: (id: string, data: any) => request<any>(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteUser: (id: string) => request<void>(`/api/users/${id}`, { method: "DELETE" }),
  },
  searchConfig: {
    get: () => request<any>("/api/search-config"),
    update: (data: any) => request<any>("/api/search-config", { method: "PUT", body: JSON.stringify(data) }),
    createSource: (data: any) => request<any>("/api/search-config/source", { method: "POST", body: JSON.stringify(data) }),
    updateSource: (id: number, data: any) => request<any>(`/api/search-config/source/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteSource: (id: number) => request<void>(`/api/search-config/source/${id}`, { method: "DELETE" }),
  },
  scraper: {
    run: () => request<any>("/api/scraper/run", { method: "POST" }),
    sources: () => request<any>("/api/scraper/sources"),
    preview: (data: any) => request<any>("/api/scraper/preview", { method: "POST", body: JSON.stringify(data) }),
  },
  radio: {
    settings: () => request<any>("/api/radio/settings"),
    updateSettings: (data: any) => request<any>("/api/radio/settings", { method: "PUT", body: JSON.stringify(data) }),
    podcasts: () => request<any[]>("/api/radio/podcasts"),
    createPodcast: (data: any) => request<any>("/api/radio/podcasts", { method: "POST", body: JSON.stringify(data) }),
    deletePodcast: (id: number) => request<void>(`/api/radio/podcasts/${id}`, { method: "DELETE" }),
  },
  agent: {
    run: () => request<any>("/api/agent/run", { method: "POST" }),
  },
};
