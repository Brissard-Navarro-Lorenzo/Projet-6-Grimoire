const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};

// Stocker l'image en mémoire avec Multer
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("image");

const optimisationImage = async (req, res, next) => {
    try {
        const extension = "." + MIME_TYPES[req.file.mimetype];
        const name = req.file.originalname.split(" ").join("_");
        const name_final = name.split(extension)[0];
        const filename = name_final + Date.now() + ".webp";

        fs.access(path.join(__dirname, "../images"), (error) => {
            if (error) {
                fs.mkdirSync(path.join(__dirname, "../images"));
            }
        });

        await sharp(req.file.buffer).webp({ quality: 20 }).toFile(path.join(__dirname, "../images", filename));
        req.file.filename = filename;
        next();
    } catch (error) {
        res.status(500).json({ error });
    }
};

module.exports = { upload, optimisationImage };
