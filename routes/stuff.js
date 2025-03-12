const express = require("express");

const router = express.Router();

const stuffCtrl = require("../controllers/stuff");

const auth = require("../middleware/auth");

router.post("/", auth, stuffCtrl.createBook);
router.put("/:id", auth, stuffCtrl.modifyBook);
router.delete("/:id", auth, stuffCtrl.deleteBook);
router.get("/:id", auth, stuffCtrl.getOneBook);
router.get("/", auth, stuffCtrl.getAllBooks);

module.exports = router;
