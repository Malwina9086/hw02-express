const express = require("express");
const router = express.Router();
const userController = require("../../controller/user");
const authenticate = require("../../middleware/authenticate");
const upload = require("../../middleware/uploadAvatar");

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await userController.signup(email, password);
    res.status(201).json({
      user: {
        email,
        subscription: "starter",
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const loginResult = await userController.login(email, password);
    res.status(200).json(loginResult);
  } catch (error) {
    next(error);
  }
});

router.use(authenticate);

router.patch("/avatars", upload.single("avatar"), async (req, res, next) => {
  try {
    const updatedAvatar = await userController.updateAvatarUser(req);
    res.status(200).json(updatedAvatar);
  } catch (error) {
    next(error);
  }
});

router.get("/logout", async (req, res, next) => {
  try {
    await userController.logout(req.user);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get("/current", async (req, res, next) => {
  try {
    const currentUser = await userController.current(req.user);
    res.status(200).json(currentUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
