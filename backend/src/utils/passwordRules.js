// One place for the password rules (used when someone chooses their own password).
const COMMON = new Set([
    "password", "password1", "password12", "password123", "passw0rd", "12345678", "123456789",
    "1234567890", "11111111", "00000000", "87654321", "qwertyui", "qwerty123", "qwertyuiop",
    "abc12345", "abcd1234", "iloveyou", "welcome1", "welcome123", "admin123", "admin1234",
    "letmein1", "school123", "schoollink", "changeme", "changeme1", "test1234", "asdfghjk",
    "mindseed", "mindseed1", "mindseed123"
]);

function checkNewPassword(newPassword, currentPassword) {
    const p = String(newPassword || "");
    if (p.length < 8) return "New password must be at least 8 characters";
    if (p.length > 72) return "New password is too long (maximum 72 characters)";
    if (/^(.)\1+$/.test(p)) return "Please choose a less obvious password";
    if (COMMON.has(p.toLowerCase())) return "That password is too common. Please choose a less obvious one";
    if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) return "Use at least one letter and one number";
    if (currentPassword && p === currentPassword) return "Your new password must be different from the current one";
    return null;
}

module.exports = { checkNewPassword };
