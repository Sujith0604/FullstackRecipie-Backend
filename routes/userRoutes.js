import express from "express";
import {
  deleteSingleUser,
  getSingleUser,
  getUsers,
  updateSingleUser,
} from "../controller/userController.js";
import {
  createUsers,
  google,
  loginUsers,
  logout,
} from "../auth/authController.js";

const router = express.Router();

router.route("/").get(getUsers).post(createUsers);
router.route("/login").post(loginUsers);
router.route("/:id").get(getSingleUser).put(updateSingleUser);
router.route("/:userId/:id").delete(deleteSingleUser);
router.route("/google").post(google);
router.route("/logout").post(logout);

export default router;
