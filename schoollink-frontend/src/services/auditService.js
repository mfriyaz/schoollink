import api from "./api";

/**
 * Activity log (School Admin only)
 */
export async function getAuditLogs(params) {

    const response = await api.get("/audit-logs", { params });

    return response.data;

}
