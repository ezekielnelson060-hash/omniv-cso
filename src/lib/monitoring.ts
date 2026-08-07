/** Lightweight client error capture. Optional ERROR_WEBHOOK_URL for Slack/Discord/Logtail. */

export type ErrorPayload = {
  message: string;
  stack?: string;
  path?: string;
  component?: string;
  extra?: Record<string, unknown>;
};

export function captureClientError(payload: ErrorPayload) {
  if (typeof window === "undefined") return;
  try {
    void fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        path: payload.path || window.location.pathname,
        ua: navigator.userAgent,
        ts: new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch {
    /* never throw from monitoring */
  }
}

export function installGlobalErrorHandlers() {
  if (typeof window === "undefined") return;
  window.addEventListener("error", (e) => {
    captureClientError({
      message: e.message || "window.error",
      stack: e.error?.stack,
      component: "window",
    });
  });
  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    captureClientError({
      message:
        reason instanceof Error
          ? reason.message
          : typeof reason === "string"
            ? reason
            : "unhandledrejection",
      stack: reason instanceof Error ? reason.stack : undefined,
      component: "promise",
    });
  });
}
