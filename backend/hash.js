const bcrypt = require("bcrypt");

bcrypt.hash("global123456", 10).then(hash => {
    console.log(hash);
});