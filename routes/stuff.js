const express = require("express");

const router = express.Router();

const stuffCtrl = require("../controllers/stuff");

const auth = require("../middleware/auth");
// const multer = require("../middleware/multer-config");
const { upload, optimisationImage } = require("../middleware/multer-config");

router.get("/bestrating", stuffCtrl.meilleuresMoyennes);
router.post("/", auth, upload, optimisationImage, stuffCtrl.createBook);
router.put("/:id", auth, upload, optimisationImage, stuffCtrl.modifyBook);
router.delete("/:id", auth, stuffCtrl.deleteBook);
router.get("/:id", stuffCtrl.getOneBook);
router.get("/", stuffCtrl.getAllBooks);
router.post("/:id/rating", auth, stuffCtrl.ajoutNote);

module.exports = router;
