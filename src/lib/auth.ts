const SESSION_KEY = "admin_authenticated";
const USERNAME_KEY = "admin_username";

export function login(username: string, password: string): boolean {
  const isValid =
    username === import.meta.env.VITE_ADMIN_USERNAME &&
    password === import.meta.env.VITE_ADMIN_PASSWORD;

  if (isValid) {
    sessionStorage.setItem(SESSION_KEY, "true");
    sessionStorage.setItem(USERNAME_KEY, username);
  }

  return isValid;
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

export function getUsername(): string {
  return sessionStorage.getItem(USERNAME_KEY) || "Admin";
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(USERNAME_KEY);
}
