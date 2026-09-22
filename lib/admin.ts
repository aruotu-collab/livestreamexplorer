export const PRIMARY_ADMIN_EMAIL = "aruotu@gmail.com";

export function isAdminEmail(email?: string | null) {
  return (email ?? "").trim().toLowerCase() === PRIMARY_ADMIN_EMAIL;
}
