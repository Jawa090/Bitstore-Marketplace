export async function logAudit(_params: Record<string, any>) {
  console.log("[Audit]", _params);
}

export const logAuditEvent = logAudit;
