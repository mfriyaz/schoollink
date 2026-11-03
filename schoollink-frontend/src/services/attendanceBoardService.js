import api from "./api";

export async function getAttendanceBoard(date) {

    const response = await api.get("/attendance/board", { params: date ? { date } : {} });

    return response.data;

}
