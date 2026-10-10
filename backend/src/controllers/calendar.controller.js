const calendarService = require("../services/calendar.service");
const auditService = require("../services/audit.service");

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const CALENDAR_FIELDS = {
    name: "Name",
    kind: "Type",
    start_date: "Start date",
    end_date: "End date"
};

function fail(res, error, status = 400) {

    return res.status(status).json({ success: false, message: error.message });

}

async function getCalendar(req, res) {

    try {

        const data = await calendarService.getCalendar(
            req.user.school_id,
            req.query.from,
            req.query.to
        );

        return res.status(200).json({ success: true, data });

    } catch (error) {

        return fail(res, error);

    }

}

async function getDayStatus(req, res) {

    try {

        const data = await calendarService.getDayStatus(
            req.user.school_id,
            req.params.date
        );

        return res.status(200).json({ success: true, data });

    } catch (error) {

        return fail(res, error);

    }

}

async function updateWeeklyOff(req, res) {

    try {

        const before = await calendarService.getWeeklyOffDays(req.user.school_id);

        const days = await calendarService.updateWeeklyOff(
            req.user.school_id,
            req.body.weekly_off_days
        );

        const names = (list) =>
            list.length > 0 ? list.map((d) => DAY_LABELS[d]).join(", ") : "None";

        await auditService.logAudit(req, {
            action: "Edited",
            entityType: "holiday",
            entityTitle: "Weekly off days",
            summary: "Weekly off days changed",
            changes: [{ field: "Weekly off", from: names(before), to: names(days) }]
        });

        return res.status(200).json({ success: true, data: { weekly_off_days: days } });

    } catch (error) {

        return fail(res, error);

    }

}

async function createDay(req, res) {

    try {

        const day = await calendarService.createDay(
            req.user.school_id,
            req.user.id,
            req.body
        );

        await auditService.logAudit(req, {
            action: "Created",
            entityType: "holiday",
            entityId: day.id,
            entityTitle: day.name,
            summary: `${day.kind}: ${day.start_date}${day.end_date !== day.start_date ? " to " + day.end_date : ""}`
        });

        return res.status(201).json({ success: true, data: day });

    } catch (error) {

        return fail(res, error);

    }

}

async function updateDay(req, res) {

    try {

        const { before, after } = await calendarService.updateDay(
            req.params.id,
            req.user.school_id,
            req.body
        );

        await auditService.logAudit(req, {
            action: "Edited",
            entityType: "holiday",
            entityId: after.id,
            entityTitle: after.name,
            summary: "Calendar entry edited",
            changes: auditService.diffFields(before, after, CALENDAR_FIELDS)
        });

        return res.status(200).json({ success: true, data: after });

    } catch (error) {

        return fail(res, error);

    }

}

async function deleteDay(req, res) {

    try {

        const existing = await calendarService.deleteDay(
            req.params.id,
            req.user.school_id
        );

        await auditService.logAudit(req, {
            action: "Deleted",
            entityType: "holiday",
            entityId: existing.id,
            entityTitle: existing.name,
            summary: `${existing.kind} removed`
        });

        return res.status(200).json({ success: true, data: existing });

    } catch (error) {

        return fail(res, error, 404);

    }

}

module.exports = {
    getCalendar,
    getDayStatus,
    updateWeeklyOff,
    createDay,
    updateDay,
    deleteDay
};
