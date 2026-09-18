export const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001/api";

export const FORECAST_API_URL =
  import.meta.env.VITE_FORECAST_API_URL;

export const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

export const getAuthHeaders =
  (): HeadersInit => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    }
  );

  const data = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    }

    throw new Error(
      data?.message ||
      `Request failed (${response.status})`
    );
  }

  return data as T;
}