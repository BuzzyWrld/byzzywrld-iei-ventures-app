import { headers } from "next/headers";
import { resolveTenant, type Tenant } from "./tenants";

/** Server-side: read the tenant slug set by middleware and resolve. */
export async function currentTenant(): Promise<Tenant> {
  const h = await headers();
  const slug = h.get("x-iei-tenant");
  return await resolveTenant(slug);
}
