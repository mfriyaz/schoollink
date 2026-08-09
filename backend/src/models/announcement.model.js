const db = require("../config/database");

/**
 * Create Announcement
 */
async function createAnnouncement(data) {

    const query = `
        INSERT INTO announcements
        (
            school_id,
            title,
            description,
            target_audience,
            publish_date,
            expiry_date,
            is_active
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7
        )
        RETURNING *;
    `;

    const values = [

        data.school_id,
        data.title,
        data.description,
        data.target_audience,
        data.publish_date,
        data.expiry_date,
        data.is_active

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get All Announcements
 */
async function getAllAnnouncements(schoolId) {

    const result = await db.query(
        `
        SELECT *
        FROM announcements
        WHERE school_id = $1
        ORDER BY publish_date DESC;
        `,
        [schoolId]
    );

    return result.rows;

}

/**
 * Get Announcement By ID
 */
async function getAnnouncementById(id) {

    const result = await db.query(
        `
        SELECT *
        FROM announcements
        WHERE id = $1;
        `,
        [id]
    );

    return result.rows[0];

}

/**
 * Update Announcement
 */
async function updateAnnouncement(id, data) {

    const query = `
        UPDATE announcements
        SET
            title = $1,
            description = $2,
            target_audience = $3,
            publish_date = $4,
            expiry_date = $5,
            is_active = $6,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *;
    `;

    const values = [

        data.title,
        data.description,
        data.target_audience,
        data.publish_date,
        data.expiry_date,
        data.is_active,
        id

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Delete Announcement
 */
async function deleteAnnouncement(id) {

    const result = await db.query(
        `
        DELETE FROM announcements
        WHERE id = $1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];

}

/**
 * Get Active Announcements
 */
async function getActiveAnnouncements(schoolId, targetAudience) {

    const result = await db.query(
        `
        SELECT *
        FROM announcements
        WHERE
            school_id = $1
            AND is_active = true
            AND publish_date <= CURRENT_DATE
            AND
            (
                expiry_date IS NULL
                OR expiry_date >= CURRENT_DATE
            )
            AND
            (
                target_audience = 'All'
                OR target_audience = $2
            )
        ORDER BY publish_date DESC;
        `,
        [schoolId, targetAudience]
    );

    return result.rows;

}

module.exports = {

    createAnnouncement,

    getAllAnnouncements,

    getAnnouncementById,

    updateAnnouncement,

    deleteAnnouncement,

    getActiveAnnouncements

};