"use client";

// ─── Simple Toaster Utility ─────────────────────────────────────
// Lightweight toast notifications without additional dependencies

type ToastType = "success" | "error" | "info";

interface ToastOptions {
  title: string;
  type?: ToastType;
  duration?: number;
}

function createToastElement(options: ToastOptions): HTMLDivElement {
  const { title, type = "info", duration = 2000 } = options;

  const toast = document.createElement("div");
  toast.className = "vanjet-toast";
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "polite");

  // Background color based on type
  const bgColor =
    type === "success"
      ? "#059669"
      : type === "error"
        ? "#DC2626"
        : "#2563EB";

  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${bgColor};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    animation: slideUp 0.3s ease-out;
  `;

  toast.textContent = title;

  // Add animation keyframes if not already present
  if (!document.getElementById("vanjet-toast-styles")) {
    const style = document.createElement("style");
    style.id = "vanjet-toast-styles";
    style.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
      @keyframes slideDown {
        from {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.style.animation = "slideDown 0.3s ease-out forwards";
    setTimeout(() => toast.remove(), 300);
  }, duration);

  return toast;
}

export const toaster = {
  create: (options: ToastOptions) => {
    if (typeof window !== "undefined") {
      createToastElement(options);
    }
  },
};
