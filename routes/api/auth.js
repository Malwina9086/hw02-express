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

router.get("/verify/:verificationToken", async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    if (!verificationToken) {
      return res.status(400).json({ message: "Missing verification token" });
    }

    const result = await userController.verifyUser(verificationToken);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Ścieżka do ponownego wysłania wiadomości weryfikacyjnej
router.post("/verify/resend", async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Missing required field email" });
    }

    const result = await userController.resendVerificationEmail(email);

    return res.status(200).json(result);
  } catch (error) {
    if (
      error.message === "User not found" ||
      error.message === "Verification has already been passed"
    ) {
      return res.status(400).json({ message: error.message });
    }
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
