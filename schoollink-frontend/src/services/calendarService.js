import api from "./api";

/**
 * School calendar: weekly off days + holidays / working days.
 * Readable by every logged-in user, editable by the School Admin.
 */
export async function getCalendar(from, to) {
    const response = await api.get("/calendar", { params: { from, to } });
    return response.data;
}

export async function getDayStatus(date) {
    const response = await api.get(`/calendar/day/${date}`);
    return response.data;
}

export async function updateWeeklyOff(weeklyOffDays) {
    const response = await api.put("/calendar/weekly-off", { weekly_off_days: weeklyOffDays });
    return response.data;
}

export async function createCalendarDay(data) {
    const response = await api.post("/calendar/days", data);
    return response.data;
}

export async function updateCalendarDay(id, data) {
    const response = await api.put(`/calendar/days/${id}`, data);
    return response.data;
}

export async function deleteCalendarDay(id) {
    const response = await api.delete(`/calendar/days/${id}`);
    return response.data;
}
