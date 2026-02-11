export type User = {
  id: number;
  name?: string | null;
  email: string;
  role?: number | null;
};

export type ApiError = {
  status: number;
  message: string;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

const buildUrl = (path: string) => {
  if (!API_BASE_URL) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
};

const getCookie = (name: string) => {
  if (typeof document === "undefined") {
    return null;
  }
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  if (!match) {
    return null;
  }
  return decodeURIComponent(match.split("=")[1]);
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (method !== "GET" && method !== "HEAD") {
    const token = getCookie("XSRF-TOKEN");
    if (token) {
      headers.set("X-XSRF-TOKEN", token);
    }
  }

  return fetch(buildUrl(path), {
    credentials: "include",
    ...options,
    headers,
  });
};

const parseErrorMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  try {
    const data = (await response.json()) as { message?: string };
    if (data?.message) {
      return data.message;
    }
  } catch {
    // ignore JSON parse errors
  }
  return fallback;
};

export const getCsrfCookie = async () => {
  await apiFetch("/sanctum/csrf-cookie", { method: "GET" });
};

export const login = async (email: string, password: string) => {
  await getCsrfCookie();

  const response = await apiFetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const fallback =
      response.status === 401 || response.status === 422
        ? "Email hoặc mật khẩu không đúng."
        : response.status === 403
          ? "Tài khoản không có quyền admin."
          : "Đăng nhập thất bại. Vui lòng thử lại.";
    const message = await parseErrorMessage(response, fallback);
    throw { status: response.status, message } as ApiError;
  }

  return response;
};

export const logout = async () => {
  const response = await apiFetch("/logout", { method: "POST" });
  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      "Đăng xuất thất bại. Vui lòng thử lại.",
    );
    throw { status: response.status, message } as ApiError;
  }
  return response;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiFetch("/api/user", { method: "GET" });
  if (!response.ok) {
    throw { status: response.status, message: "Unauthorized" } as ApiError;
  }
  return (await response.json()) as User;
};
