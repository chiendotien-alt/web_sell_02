"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-brand hover:bg-brand-dark text-white rounded-lg px-4 py-2 text-sm font-medium"
    >
      🖨️ In hóa đơn
    </button>
  );
}
