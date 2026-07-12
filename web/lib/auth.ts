export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export function clearLegacyToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem("codearcade_token");
}
