/**
 * Adapter-Schicht.
 *
 * Stellt exakt die Befehle bereit, die der bestehende Code vom Base44-SDK
 * gewohnt ist (entities / auth / integrations), setzt sie intern aber auf
 * Supabase um. Dadurch muessen die rund 119 Aufrufstellen in der App nicht
 * angefasst werden.
 *
 * Fehler werden bewusst geworfen, damit safeCall() sie abfangen und dem
 * Nutzer eine verstaendliche Meldung zeigen kann.
 */
import { supabase, tableName, parseSort } from "./supabaseClient";

const STORAGE_BUCKET = "uploads";

function unwrap({ data, error }) {
  if (error) throw new Error(error.message || "Backend-Fehler");
  return data;
}

/* ------------------------------------------------------------------ */
/* Datensaetze                                                         */
/* ------------------------------------------------------------------ */

function entityApi(entity) {
  const table = tableName(entity);

  return {
    /** list("-created_date") */
    async list(sort, limit) {
      let q = supabase.from(table).select("*");
      const s = parseSort(sort);
      if (s) q = q.order(s.column, { ascending: s.ascending });
      if (limit) q = q.limit(limit);
      return unwrap(await q) ?? [];
    },

    /** filter({ project_id: "..." }, "-created_date") */
    async filter(where = {}, sort, limit) {
      let q = supabase.from(table).select("*");
      for (const [key, value] of Object.entries(where)) {
        q = Array.isArray(value) ? q.in(key, value) : q.eq(key, value);
      }
      const s = parseSort(sort);
      if (s) q = q.order(s.column, { ascending: s.ascending });
      if (limit) q = q.limit(limit);
      return unwrap(await q) ?? [];
    },

    /** get(id) */
    async get(id) {
      return unwrap(await supabase.from(table).select("*").eq("id", id).single());
    },

    /** create(payload) -> angelegter Datensatz */
    async create(payload) {
      const { data: userData } = await supabase.auth.getUser();
      const row = { ...payload, created_by: userData?.user?.email ?? null };
      return unwrap(await supabase.from(table).insert(row).select().single());
    },

    /** update(id, payload) -> aktualisierter Datensatz */
    async update(id, payload) {
      return unwrap(
        await supabase.from(table).update(payload).eq("id", id).select().single()
      );
    },

    /** delete(id) */
    async delete(id) {
      unwrap(await supabase.from(table).delete().eq("id", id));
      return { id };
    },
  };
}

// Beliebige Entity-Namen werden bei Bedarf erzeugt und gemerkt.
const entityCache = new Map();
const entities = new Proxy(
  {},
  {
    get(_target, name) {
      if (typeof name !== "string") return undefined;
      if (!entityCache.has(name)) entityCache.set(name, entityApi(name));
      return entityCache.get(name);
    },
  }
);

/* ------------------------------------------------------------------ */
/* Anmeldung                                                           */
/* ------------------------------------------------------------------ */

const auth = {
  /** Aktuell angemeldeter Benutzer inkl. Rolle, oder null */
  async me() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;
    const user = data.user;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "",
      role: profile?.role ?? "monteur",
    };
  },

  async isAuthenticated() {
    const { data } = await supabase.auth.getSession();
    return Boolean(data?.session);
  },

  async loginViaEmailPassword(email, password) {
    return unwrap(await supabase.auth.signInWithPassword({ email, password }));
  },

  async register({ email, password, full_name }) {
    return unwrap(
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: full_name ?? "" },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
    );
  },

  /** loginWithProvider("google", "/dashboard") */
  async loginWithProvider(provider, redirectPath = "/dashboard") {
    return unwrap(
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}${redirectPath}` },
      })
    );
  },

  /** logout("/") bzw. logout(window.location.href) */
  async logout(redirectTo = "/") {
    await supabase.auth.signOut();
    const target = redirectTo.startsWith("http")
      ? redirectTo
      : `${window.location.origin}${redirectTo}`;
    window.location.href = target;
  },

  redirectToLogin(fromUrl) {
    const from = fromUrl ? `?from=${encodeURIComponent(fromUrl)}` : "";
    window.location.href = `/login${from}`;
  },

  async resetPasswordRequest(email) {
    return unwrap(
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
    );
  },

  /** resetPassword({ resetToken, newPassword }) */
  async resetPassword({ newPassword }) {
    // Supabase stellt die Sitzung ueber den Link aus der E-Mail bereit,
    // der resetToken wird daher nicht separat gebraucht.
    return unwrap(await supabase.auth.updateUser({ password: newPassword }));
  },

  /** verifyOtp({ email, otpCode }) */
  async verifyOtp({ email, otpCode }) {
    const data = unwrap(
      await supabase.auth.verifyOtp({ email, token: otpCode, type: "email" })
    );
    return { ...data, access_token: data?.session?.access_token ?? null };
  },

  async resendOtp(email) {
    return unwrap(await supabase.auth.resend({ type: "signup", email }));
  },

  /** Wird nach verifyOtp aufgerufen; Supabase setzt die Sitzung bereits selbst. */
  async setToken() {
    return true;
  },
};

/* ------------------------------------------------------------------ */
/* Dateien und E-Mail                                                  */
/* ------------------------------------------------------------------ */

const integrations = {
  Core: {
    /** UploadFile({ file }) -> { file_url } */
    async UploadFile({ file }) {
      const safeName = file.name.replace(/[^\w.\-]/g, "_");
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw new Error(error.message);

      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      return { file_url: data.publicUrl };
    },

    /** SendEmail({ to, subject, body }) — laeuft ueber die Edge Function */
    async SendEmail({ to, subject, body }) {
      return unwrap(
        await supabase.functions.invoke("send-email", {
          body: { to, subject, body },
        })
      );
    },
  },
};

export const backend = { entities, auth, integrations };
export default backend;
