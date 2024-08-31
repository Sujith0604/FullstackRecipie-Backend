import express from "express";
import {
  createRecipie,
  deleteSingleRecipie,
  getRecipies,
  getSingleRecipie,
  updateSingleRecipie,
} from "../controller/recipieController.js";

const router = express.Router();

router.route("/").get(getRecipies);
router.route("/:id").get(getSingleRecipie).post(createRecipie);
router
  .route("/:blogId/:id")
  .delete(deleteSingleRecipie)
  .put(updateSingleRecipie);

// router.route("/user/:id").get(getBlogsByUser);

export default router;
