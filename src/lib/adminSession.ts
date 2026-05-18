const SESSION_KEY = 'lvp_admin_secure_v1';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

interface AdminSession {
  token: string;
  createdAt: number;
  expiresAt: number;
  entropy: string;
}

export function createAdminSession(): void {
  const now = Date.now();
  // Generate random tokens for additional security check
  const array = new Uint32Array(4);
  window.crypto.getRandomValues(array);
  const entropy = Array.from(array).map(b => b.toString(16)).join('');
  
  const session: AdminSession = {
    token: btoa(`${now}-${entropy}-${Math.random()}`),
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
    entropy: entropy
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function checkAdminSession(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session: AdminSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      destroyAdminSession();
      return false;
    }
    // Renew session on each check
    session.expiresAt = Date.now() + SESSION_DURATION;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch {
    destroyAdminSession();
    return false;
  }
}

export function destroyAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getSessionAge(): number {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return 0;
    const session: AdminSession = JSON.parse(raw);
    return Date.now() - session.createdAt;
  } catch {
    return 0;
  }
}

export function getSessionExpiry(): number {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return 0;
    const session: AdminSession = JSON.parse(raw);
    return Math.max(0, session.expiresAt - Date.now());
  } catch {
    return 0;
  }
}
