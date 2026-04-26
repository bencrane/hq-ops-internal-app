import { backendProxy } from "./backend-proxy";

const DEFAULT_ORG_ID = "b39badc2-d706-40d4-8bd6-5404f0af6269";
const DEFAULT_USER_ID = "60b81a1c-ad07-401f-a4d8-bf8e05434cef";

export const SERX_ORG_COOKIE = "ops_org_id";
export const SERX_USER_COOKIE = "ops_user_id";

export type OrgSummary = {
  id: string;
  name: string;
  slug?: string | null;
  domain?: string | null;
};

export type UserSummary = {
  id: string;
  email: string;
  name_f?: string | null;
  name_l?: string | null;
  org_id?: string | null;
};

export function serxDefaults() {
  return { orgId: DEFAULT_ORG_ID, userId: DEFAULT_USER_ID };
}

export async function serxProxy(
  path: string,
  search: string,
  init?: RequestInit
): Promise<Response> {
  return backendProxy(process.env.SERX_API_BASE_URL, `${path}${search}`, init);
}
