"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Org = { id: string; name: string };
type User = {
  id: string;
  email: string;
  name_f?: string | null;
  name_l?: string | null;
};

const ORG_COOKIE = "ops_org_id";
const USER_COOKIE = "ops_user_id";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${oneYear}; samesite=lax`;
}

export function OrgUserPicker({
  defaultOrgId,
  defaultUserId,
}: {
  defaultOrgId: string;
  defaultUserId: string;
}) {
  const router = useRouter();

  const [orgId, setOrgId] = useState<string>(defaultOrgId);
  const [userId, setUserId] = useState<string>(defaultUserId);

  const [orgs, setOrgs] = useState<Org[] | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [orgsError, setOrgsError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    const cookieOrg = readCookie(ORG_COOKIE);
    const cookieUser = readCookie(USER_COOKIE);
    if (cookieOrg) setOrgId(cookieOrg);
    if (cookieUser) setUserId(cookieUser);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/orgs", { cache: "no-store" });
        const text = await res.text();
        if (!res.ok) {
          if (!cancelled)
            setOrgsError(`${res.status}: ${text.slice(0, 160)}`);
          return;
        }
        const parsed: unknown = JSON.parse(text);
        if (!cancelled) {
          setOrgs(Array.isArray(parsed) ? (parsed as Org[]) : []);
          setOrgsError(null);
        }
      } catch (err) {
        if (!cancelled)
          setOrgsError(err instanceof Error ? err.message : "fetch failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadUsers = useCallback(async (targetOrgId: string) => {
    try {
      const res = await fetch(
        `/api/users?org_id=${encodeURIComponent(targetOrgId)}`,
        { cache: "no-store" }
      );
      const text = await res.text();
      if (!res.ok) {
        setUsersError(`${res.status}: ${text.slice(0, 160)}`);
        return;
      }
      const parsed: unknown = JSON.parse(text);
      setUsers(Array.isArray(parsed) ? (parsed as User[]) : []);
      setUsersError(null);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : "fetch failed");
    }
  }, []);

  useEffect(() => {
    if (orgId) loadUsers(orgId);
  }, [orgId, loadUsers]);

  function onOrgChange(next: string) {
    setOrgId(next);
    writeCookie(ORG_COOKIE, next);
    router.refresh();
  }

  function onUserChange(next: string) {
    setUserId(next);
    writeCookie(USER_COOKIE, next);
    router.refresh();
  }

  const userLabel = (u: User) => {
    const name = [u.name_f, u.name_l].filter(Boolean).join(" ").trim();
    return name ? `${name} — ${u.email}` : u.email;
  };

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-400">
      <label className="flex items-center gap-1.5">
        <span className="uppercase tracking-wide text-zinc-500">Org</span>
        <select
          value={orgId}
          onChange={(e) => onOrgChange(e.target.value)}
          className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-200 focus:border-zinc-600 focus:outline-none"
          title={orgsError ?? undefined}
        >
          {orgs === null && <option value={orgId}>{orgId.slice(0, 8)}…</option>}
          {orgs?.length === 0 && <option value={orgId}>(no orgs)</option>}
          {orgs?.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
          {orgs && !orgs.some((o) => o.id === orgId) && (
            <option value={orgId}>{orgId.slice(0, 8)}… (default)</option>
          )}
        </select>
      </label>

      <label className="flex items-center gap-1.5">
        <span className="uppercase tracking-wide text-zinc-500">User</span>
        <select
          value={userId}
          onChange={(e) => onUserChange(e.target.value)}
          className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-zinc-200 focus:border-zinc-600 focus:outline-none"
          title={usersError ?? undefined}
        >
          {users === null && (
            <option value={userId}>{userId.slice(0, 8)}…</option>
          )}
          {users?.length === 0 && <option value={userId}>(no users)</option>}
          {users?.map((u) => (
            <option key={u.id} value={u.id}>
              {userLabel(u)}
            </option>
          ))}
          {users && !users.some((u) => u.id === userId) && (
            <option value={userId}>{userId.slice(0, 8)}… (default)</option>
          )}
        </select>
      </label>

      {(orgsError || usersError) && (
        <span className="text-red-400" title={orgsError ?? usersError ?? ""}>
          ⚠
        </span>
      )}
    </div>
  );
}
