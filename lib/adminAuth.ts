import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "shop_admin_token";

// Token đơn giản = hash(password + ngày) — đủ dùng cho shop cá nhân quy mô nhỏ.
// Nếu cần bảo mật cao hơn (nhiều nhân viên, phân quyền...), nên thay bằng NextAuth.
function expectedToken(): string {
  const password = process.env.ADMIN_PASSWORD || "";
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function isAdminAuthed(): boolean {
  const token = cookies().get(COOKIE_NAME)?.value;
  return !!token && token === expectedToken();
}

export function adminCookieName() {
  return COOKIE_NAME;
}

export function adminExpectedToken() {
  return expectedToken();
}
