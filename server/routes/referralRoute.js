const express = require("express");

const {
  addReferral,
  updateReferral,
  getAllReferral,
} = require("../controller/referralController");

const router = express.Router();

router.post("/add", addReferral);
router.put("/update/:id", updateReferral);
router.get("/", getAllReferral);

module.exports = router;
