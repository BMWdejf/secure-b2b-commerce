import { supabase } from "@/integrations/supabase/client";

export const PASSWORD_RECOVERY_STORAGE_KEY = "password-recovery-ready";
export const PASSWORD_RECOVERY_PARAMS_KEY = "password-recovery-payload";

export interface RecoveryPayload {
  code: string | null;
  tokenHash: string | null;
  type: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export const getRecoveryPayloadFromUrl = (): RecoveryPayload => {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return {
    code: searchParams.get("code"),
    tokenHash: searchParams.get("token_hash") ?? hashParams.get("token_hash"),
    type: searchParams.get("type") ?? hashParams.get("type"),
    accessToken: hashParams.get("access_token"),
    refreshToken: hashParams.get("refresh_token"),
  };
};

export const hasRecoveryPayload = (payload: RecoveryPayload | null | undefined) =>
  Boolean(payload?.code || payload?.tokenHash || (payload?.accessToken && payload?.refreshToken));

export const storeRecoveryPayload = (payload: RecoveryPayload) => {
  if (!hasRecoveryPayload(payload)) return;
  window.sessionStorage.setItem(PASSWORD_RECOVERY_PARAMS_KEY, JSON.stringify(payload));
};

export const readStoredRecoveryPayload = (): RecoveryPayload | null => {
  const raw = window.sessionStorage.getItem(PASSWORD_RECOVERY_PARAMS_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as RecoveryPayload;
  } catch {
    window.sessionStorage.removeItem(PASSWORD_RECOVERY_PARAMS_KEY);
    return null;
  }
};

export const markRecoveryReady = () => {
  window.sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, "1");
};

export const isRecoveryReadyFlagSet = () => window.sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY) === "1";

export const clearRecoveryState = () => {
  window.sessionStorage.removeItem(PASSWORD_RECOVERY_STORAGE_KEY);
  window.sessionStorage.removeItem(PASSWORD_RECOVERY_PARAMS_KEY);
};

export const cleanupRecoveryUrl = (pathname = "/reset-password") => {
  const nextUrl = `${pathname}${window.location.search ? "" : ""}`;
  if (window.location.pathname !== pathname || window.location.search || window.location.hash) {
    window.history.replaceState({}, document.title, nextUrl);
  }
};

const waitForSession = async (attempts = 24, delayMs = 250) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session;

    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
  }

  return null;
};

export const establishRecoverySession = async (payload?: RecoveryPayload | null) => {
  const activePayload = payload && hasRecoveryPayload(payload) ? payload : readStoredRecoveryPayload();
  const { data: existingSessionData } = await supabase.auth.getSession();

  if (existingSessionData.session) {
    markRecoveryReady();
    return { ok: true as const, error: null };
  }

  const delayedSession = await waitForSession(12, 250);
  if (delayedSession) {
    markRecoveryReady();
    return { ok: true as const, error: null };
  }

  if (!activePayload || !hasRecoveryPayload(activePayload)) {
    return { ok: false as const, error: "missing_recovery_payload" };
  }

  let error: string | null = null;

  if (activePayload.accessToken && activePayload.refreshToken) {
    const { error: setSessionError } = await supabase.auth.setSession({
      access_token: activePayload.accessToken,
      refresh_token: activePayload.refreshToken,
    });
    error = setSessionError?.message ?? null;
  } else if (activePayload.tokenHash && activePayload.type === "recovery") {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: activePayload.tokenHash,
      type: "recovery",
    });
    error = verifyError?.message ?? null;
  } else if (activePayload.code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(activePayload.code);
    error = exchangeError?.message ?? null;
  }

  const session = await waitForSession();
  if (session) {
    markRecoveryReady();
    return { ok: true as const, error: null };
  }

  return { ok: false as const, error: error ?? "session_not_ready" };
};