export function setAuth(token: string, user: any) {
  localStorage.setItem("holisticai_token", token);
  localStorage.setItem("holisticai_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("holisticai_token");
  localStorage.removeItem("holisticai_user");
}

export function getToken() {
  return localStorage.getItem("holisticai_token");
}

export function getUser() {
  const raw = localStorage.getItem("holisticai_user");
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return !!getToken();
}