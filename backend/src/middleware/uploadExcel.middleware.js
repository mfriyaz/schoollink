const multer = require("multer");

const allowedMimeTypes = [

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel"

];

function fileFilter(req, file, cb) {

    if (allowedMimeTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(new Error("Only Excel files (.xlsx, .xls) are allowed"));

    }

}

const uploadExcel = multer({

    storage: multer.memoryStorage(),

    fileFilter,

    limits: {

        fileSize: 5 * 1024 * 1024 // 5MB

    }

});

module.exports = uploadExcel;
