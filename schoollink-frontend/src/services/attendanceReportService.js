import api from "./api";

export async function getAttendanceReport(params) {

    const response = await api.get("/attendance/report", { params });

    return response.data;

}

export async function downloadAttendanceReport(params) {

    const response = await api.get("/attendance/report", {

        params: { ...params, format: "xlsx" },

        responseType: "blob"

    });

    return response.data;

}
