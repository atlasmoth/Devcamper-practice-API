const path = require("path");
const router = require("express").Router();
const { register, login, getMe, protect } = require(path.join(
  __dirname,
  "/../controllers/auth"
));

router.post("/register", register);
router.post("/login", login);
router.post("/me", protect, getMe);

module.exports = router;
