// Auth utility functions for client-side state management

export function getUserEmail(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userEmail");
  }
  return null;
}

export function setUserEmail(email: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("userEmail", email);
  }
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userEmail");
  }
}

export function isAuthenticated(): boolean {
  return getUserEmail() !== null;
}
