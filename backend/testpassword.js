const bcrypt = require("bcrypt");

const password = "Admin@123";

// Paste the password_hash from the database here
const hash = "$2b$10$CcTBp7EbonVzxIKipDRESOf7/rpSgZnAEPpndn3FtLrLvq1IoxW0y";

bcrypt.compare(password, hash).then(result => {
    console.log("Password Match:", result);
});