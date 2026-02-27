/**
 * Centralised API client for the Lily Stoica platform.
 * JWT-based auth, typed responses, auto-refresh on 401.
 */

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" ? "http://localhost:8000/api" : "/api");

/* ── Token helpers ── */

export function getAccessToken(): string | null {
  return localStorage.getItem("lily_access_token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("lily_refresh_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("lily_access_token", access);
  localStorage.setItem("lily_refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("lily_access_token");
  localStorage.removeItem("lily_refresh_token");
}

/* ── Error class ── */

export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;
  constructor(status: number, data: Record<string, unknown>) {
    super(data.detail as string || `API error ${status}`);
    this.status = status;
    this.data = data;
  }
}

/* ── Core fetch wrapper ── */

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");
  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    clearTokens();
    throw new Error("Session expired");
  }
  const data = await res.json();
  setTokens(data.access, data.refresh || refresh);
  return data.access;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        refreshQueue.forEach((cb) => cb());
        refreshQueue = [];
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(url, { ...options, headers });
      } catch {
        isRefreshing = false;
        refreshQueue = [];
        clearTokens();
        window.location.href = "/login";
        throw new Error("Session expired");
      }
    } else {
      await new Promise<void>((resolve) => refreshQueue.push(resolve));
      const retryToken = getAccessToken();
      if (retryToken) headers["Authorization"] = `Bearer ${retryToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  if (!res.ok) {
    let data: Record<string, unknown> = {};
    try {
      data = await res.json();
    } catch {
      data = { detail: res.statusText };
    }
    throw new ApiError(res.status, data);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

/* ── Types ── */

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: UserData;
}

export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "client" | "admin";
  is_approved: boolean;
  phone?: string;
  concerns?: string;
  date_joined?: string;
  created_at: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  concerns?: string;
  how_heard?: string;
  consent_data: boolean;
  consent_terms: boolean;
}

export interface BookingSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  session_type: string;
}

export interface Booking {
  id: number;
  client: string;
  client_name: string;
  slot: BookingSlot;
  session_type: "discovery" | "standard" | "intensive" | "workshop";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string;
  video_room_id: string;
  created_at: string;
}

export interface Testimonial {
  id: number;
  client_name: string;
  content: string;
  rating: number;
  session_type: string;
  is_visible: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  tags: string[];
  author_name: string;
  is_published: boolean;
  is_pinned?: boolean;
  view_count: number;
  reading_time: number;
  seo_title?: string;
  seo_description?: string;
  published_at: string;
  created_at: string;
  updated_at?: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  ticket_url: string;
  capacity: number;
  spots_remaining: number;
  price: string;
  is_active: boolean;
}

export interface LeadMagnetSubmission {
  email: string;
  first_name: string;
  consent: boolean;
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  total_pages?: number;
}

export interface ResourceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order: number;
  resource_count: number;
}

export interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: number | null;
  category_name: string;
  resource_type: "pdf" | "audio" | "video" | "link" | "guide";
  file: string | null;
  external_url: string;
  thumbnail: string | null;
  content: string;
  is_published: boolean;
  is_premium: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "paused";
  progress: number;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionNote {
  id: string;
  title: string;
  content: string;
  booking: number | null;
  created_at: string;
  updated_at: string;
}

/* ── Auth endpoints ── */

export const apiLogin = (email: string, password: string) =>
  apiFetch<AuthResponse>("/token/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const apiRegister = (payload: RegisterPayload) =>
  apiFetch<AuthResponse>("/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const apiGetMe = () => apiFetch<UserData>("/auth/me/");

export const apiLogout = () =>
  apiFetch<void>("/auth/logout/", {
    method: "POST",
    body: JSON.stringify({ refresh: getRefreshToken() }),
  });

/* ── Booking endpoints ── */

export const apiGetAvailableSlots = (sessionType?: string) =>
  apiFetch<BookingSlot[]>(
    `/bookings/slots/${sessionType ? `?session_type=${sessionType}` : ""}`
  );

export const apiCreateBooking = (slotId: number, sessionType: string, notes?: string) =>
  apiFetch<Booking>("/bookings/create/", {
    method: "POST",
    body: JSON.stringify({ slot: slotId, session_type: sessionType, notes }),
  });

export const apiGetMyBookings = () =>
  apiFetch<PaginatedResponse<Booking>>("/bookings/mine/");

export const apiCancelBooking = (id: number) =>
  apiFetch<void>(`/bookings/${id}/cancel/`, { method: "POST" });

/* ── Admin booking management ── */

export const apiGetAllBookings = () =>
  apiFetch<PaginatedResponse<Booking>>("/admin/bookings/");

export const apiConfirmBooking = (id: number) =>
  apiFetch<Booking>(`/admin/bookings/${id}/confirm/`, { method: "POST" });

export const apiCreateSlot = (data: Partial<BookingSlot>) =>
  apiFetch<BookingSlot>("/admin/bookings/slots/create/", {
    method: "POST",
    body: JSON.stringify(data),
  });

/* ── Testimonials ── */

export const apiGetTestimonials = () =>
  apiFetch<Testimonial[]>("/testimonials/");

export const apiSubmitTestimonial = (data: Partial<Testimonial>) =>
  apiFetch<Testimonial>("/testimonials/", {
    method: "POST",
    body: JSON.stringify(data),
  });

/* ── Blog ── */

export const apiGetBlogPosts = (page = 1, tag?: string, search?: string) => {
  const params = new URLSearchParams({ page: String(page) });
  if (tag) params.set("tag", tag);
  if (search) params.set("search", search);
  return apiFetch<PaginatedResponse<BlogPost>>(`/blog/?${params.toString()}`);
};

export const apiGetBlogPost = (slug: string) =>
  apiFetch<BlogPost>(`/blog/${slug}/`);

export const apiGetBlogTags = () =>
  apiFetch<string[]>("/blog/tags/");

export const apiGetPinnedPosts = () =>
  apiFetch<BlogPost[]>("/blog/pinned/");

/* ── Blog admin ── */

export const apiAdminGetBlogPosts = () =>
  apiFetch<PaginatedResponse<BlogPost>>("/admin/blog/");

export const apiAdminCreateBlogPost = (data: FormData) =>
  apiFetch<BlogPost>("/admin/blog/create/", {
    method: "POST",
    body: data,
  });

export const apiAdminUpdateBlogPost = (id: string, data: FormData) =>
  apiFetch<BlogPost>(`/admin/blog/${id}/`, {
    method: "PATCH",
    body: data,
  });

export const apiAdminDeleteBlogPost = (id: string) =>
  apiFetch<void>(`/admin/blog/${id}/`, { method: "DELETE" });

export const apiAdminToggleBlogPost = (id: string) =>
  apiFetch<{ is_published: boolean }>(`/admin/blog/${id}/toggle/`, { method: "POST" });

export const apiAdminUploadBlogImage = (data: FormData) =>
  apiFetch<{ url: string }>("/admin/blog/upload-image/", {
    method: "POST",
    body: data,
  });

/* ── Events ── */

export const apiGetEvents = () =>
  apiFetch<Event[]>("/events/");

export const apiGetEvent = (id: number) =>
  apiFetch<Event>(`/events/${id}/`);

/* ── Events admin ── */

export const apiAdminGetEvents = () =>
  apiFetch<Event[]>("/admin/events/");

export const apiAdminCreateEvent = (data: Record<string, unknown>) =>
  apiFetch<Event>("/admin/events/create/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiAdminUpdateEvent = (id: number, data: Record<string, unknown>) =>
  apiFetch<Event>(`/admin/events/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const apiAdminDeleteEvent = (id: number) =>
  apiFetch<void>(`/admin/events/${id}/`, { method: "DELETE" });

/* ── Resources ── */

export const apiGetResourceCategories = () =>
  apiFetch<ResourceCategory[]>("/resources/categories/");

export const apiGetResources = (category?: string, search?: string) => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search) params.set("search", search);
  const qs = params.toString();
  return apiFetch<Resource[]>(`/resources/${qs ? `?${qs}` : ""}`);
};

export const apiGetResource = (slug: string) =>
  apiFetch<Resource>(`/resources/${slug}/`);

export const apiTrackResourceDownload = (slug: string) =>
  apiFetch<{ status: string }>(`/resources/${slug}/download/`, { method: "POST" });

/* ── Lead magnet ── */

export const apiSubmitLeadMagnet = (data: LeadMagnetSubmission) =>
  apiFetch<{ message: string }>("/lead-magnet/", {
    method: "POST",
    body: JSON.stringify(data),
  });

/* ── AI assistant ── */

export const apiAIChat = (message: string, conversationId?: string) =>
  apiFetch<{ message: string; tokens_used: number }>("/ai/chat/", {
    method: "POST",
    body: JSON.stringify({ message, conversation_id: conversationId || "" }),
  });

export const apiAIStatus = () =>
  apiFetch<{ enabled: boolean }>("/ai/status/");

/* ── Video conferencing ── */

export const apiGetVideoRoom = (bookingId: string) =>
  apiFetch<{ room_id: string; booking_id: number; session_type: string }>(
    `/video/room/${bookingId}/`
  );

export const apiLogVideoEvent = (roomId: string, eventType: string) =>
  apiFetch<void>(`/video/${roomId}/event/`, {
    method: "POST",
    body: JSON.stringify({ event_type: eventType }),
  });

export const apiSignalSend = (roomId: string, data: Record<string, unknown>) =>
  apiFetch<void>(`/video/${roomId}/signal/send/`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiSignalPoll = (roomId: string) =>
  apiFetch<Array<{ id: number; signal_type: string; payload: string; created_at: string }>>(
    `/video/${roomId}/signal/poll/`
  );

/* ── Contact ── */

export const apiSubmitContact = (data: { name: string; email: string; message: string; phone?: string }) =>
  apiFetch<{ message: string }>("/contact/", {
    method: "POST",
    body: JSON.stringify(data),
  });

/* ── Admin settings ── */

export const apiGetSettings = () =>
  apiFetch<Record<string, unknown>>("/settings/");

export const apiUpdateSettings = (data: Record<string, unknown>) =>
  apiFetch<Record<string, unknown>>("/settings/update/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const apiTestGemini = () =>
  apiFetch<{ status: string; message: string }>("/ai/test/");

/* ── Profile ── */

export const apiUpdateProfile = (data: { first_name?: string; last_name?: string; phone?: string; concerns?: string }) =>
  apiFetch<UserData>("/profile/update/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const apiChangePassword = (currentPassword: string, newPassword: string) =>
  apiFetch<{ detail: string }>("/profile/change-password/", {
    method: "POST",
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });

/* ── Goals (client) ── */

export const apiGetMyGoals = () =>
  apiFetch<Goal[]>("/goals/");

export const apiCreateGoal = (data: Partial<Goal>) =>
  apiFetch<Goal>("/goals/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiUpdateGoal = (id: string, data: Partial<Goal>) =>
  apiFetch<Goal>(`/goals/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const apiDeleteGoal = (id: string) =>
  apiFetch<void>(`/goals/${id}/`, { method: "DELETE" });

/* ── Session Notes (client) ── */

export const apiGetMyNotes = () =>
  apiFetch<SessionNote[]>("/notes/");

export const apiCreateNote = (data: { title?: string; content: string; booking?: number }) =>
  apiFetch<SessionNote>("/notes/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiUpdateNote = (id: string, data: Partial<SessionNote>) =>
  apiFetch<SessionNote>(`/notes/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const apiDeleteNote = (id: string) =>
  apiFetch<void>(`/notes/${id}/`, { method: "DELETE" });

/* ── Admin resources ── */

export const apiAdminGetResources = () =>
  apiFetch<Resource[]>("/admin/resources/");

export const apiAdminCreateResource = (data: FormData) =>
  apiFetch<Resource>("/admin/resources/", {
    method: "POST",
    body: data,
  });

export const apiAdminUpdateResource = (id: string, data: FormData) =>
  apiFetch<Resource>(`/admin/resources/${id}/`, {
    method: "PATCH",
    body: data,
  });

export const apiAdminDeleteResource = (id: string) =>
  apiFetch<void>(`/admin/resources/${id}/`, { method: "DELETE" });

/* ── Admin goals ── */

export const apiAdminGetClientGoals = (clientId: string) =>
  apiFetch<Goal[]>(`/admin/goals/${clientId}/`);

export const apiAdminCreateGoal = (data: { client: string; title: string; description?: string; target_date?: string }) =>
  apiFetch<Goal>("/admin/goals/create/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const apiAdminUpdateGoal = (id: string, data: Partial<Goal>) =>
  apiFetch<Goal>(`/admin/goals/${id}/update/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
