const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { create, list, update, remove } = require("../controllers/noteController");

const router = express.Router();
router.use(authenticate);
router.route("/").get(list).post(create);
router.route("/:id").patch(update).delete(remove);

module.exports = router;
