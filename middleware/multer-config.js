const multer = require("multer");

const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "images");
    },
    filename: (req, file, callback) => {
        // const name = file.originalname.split(" ").join("_");

        // const name = file.originalname.split(/[ .]/).join("_");
        // const extension = MIME_TYPES[file.mimetype];
        // callback(null, name + Date.now() + "." + extension);
        const extension = "." + MIME_TYPES[file.mimetype];
        const name = file.originalname.split(" ").join("_");
        const name_final = name.split(extension);
        callback(null, name_final[0] + Date.now() + extension);
    },
});

module.exports = multer({ storage: storage }).single("image");
