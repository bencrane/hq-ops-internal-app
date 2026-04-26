import { cookies } from "next/headers";
import { SERX_ORG_COOKIE, SERX_USER_COOKIE, serxDefaults } from "./serx";

export async function getSelection(): Promise<{
  orgId: string;
  userId: string;
  fromCookie: { org: boolean; user: boolean };
}> {
  const jar = await cookies();
  const orgCookie = jar.get(SERX_ORG_COOKIE)?.value;
  const userCookie = jar.get(SERX_USER_COOKIE)?.value;
  const defaults = serxDefaults();
  return {
    orgId: orgCookie || defaults.orgId,
    userId: userCookie || defaults.userId,
    fromCookie: { org: Boolean(orgCookie), user: Boolean(userCookie) },
  };
}
