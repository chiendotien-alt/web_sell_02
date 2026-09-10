"use client";

export default function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/login", { method: "DELETE" });
        window.location.href = "/admin";
      }}
      className="hover:text-red-400"
    >
      Đăng xuất
    </button>
  );
}
