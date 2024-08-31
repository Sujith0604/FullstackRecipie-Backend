import mongoose from "mongoose";
import Recipie from "../model/recipieModel.js";
import User from "../model/userModel.js";
import { errorHandler } from "../utils/Error.js";

export const getRecipies = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const recipies = await Recipie.find({
      ...(req.query.userId && {
        userId: req.query.userId,
      }),
      ...(req.query.ingrediant && {
        ingrediant: req.query.ingrediant,
      }),
      ...(req.query.slug && {
        slug: req.query.slug,
      }),
      ...(req.query.recipieId && {
        _id: req.query.recipieId,
      }),
      ...(req.query.searchterm && {
        $or: {
          title: { $regex: req.query.searchterm, $options: "i" },
          content: { $regex: req.query.searchterm, $options: "i" },
        },
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalRecipies = await Recipie.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthRecipies = await Recipie.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    if (!recipies) next(errorHandler(404, "No Recipie found."));
    return res.status(200).json({
      recipies,
      totalRecipies,
      lastMonthRecipies,
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleRecipie = async (req, res, next) => {
  const { id } = req.params;
  try {
    const recipie = await Recipie.findById(id);
    if (!recipie) next(errorHandler(404, "No Recipie found."));
    return res.status(200).json(recipie);
  } catch (error) {
    next(error);
  }
};

export const createRecipie = async (req, res, next) => {
  const { title, preparation, ingrediant, image } = req.body;

  const { id } = req.params;

  try {
    let existingUser = await User.findById(id);

    if (!existingUser)
      next(
        errorHandler(400, "User not found. Please provide a valid user ID.")
      );

    if (!existingUser.isAdmin) {
      return next(errorHandler(403, "Unauthorized to create blog."));
    }

    if (!title || !preparation) {
      return next(errorHandler(404, " Please provide title and content."));
    }

    const slug = req.body.title
      .split(" ")
      .join("-")
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-]/g, "");

    const newRecipie = await Recipie.create({
      title,
      preparation,
      ingrediant,
      image,
      userId: existingUser._id,
      slug,
    });

    if (!newRecipie) next(errorHandler(404, "Failed to create Recipie."));

    res.status(200).json(newRecipie);
  } catch (error) {
    next(error);
  }
};

export const updateSingleRecipie = async (req, res, next) => {
  const { id, recipeId } = req.params;
  const { title, preparation, ingrediant, image } = req.body;
  try {
    let existingUser = await User.findById(id);

    if (!existingUser)
      next(
        errorHandler(400, "User not found. Please provide a valid user ID.")
      );

    if (!existingUser.isAdmin) {
      return next(errorHandler(403, "Unauthorized to create Recipie."));
    }

    const recipie = await Recipie.findByIdAndUpdate(
      recipeId,
      {
        $set: {
          title,
          preparation,
          ingrediant,
          image,
        },
      },
      { new: true }
    );
    return res.status(200).json(recipie);
  } catch (error) {
    next(error);
  }
};
export const deleteSingleRecipie = async (req, res, next) => {
  const { id, recipieId } = req.params;
  try {
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return next(
        errorHandler(400, "User not found. Please provide a valid user ID.")
      );
    }
    if (!existingUser.isAdmin) {
      return next(errorHandler(403, "Unauthorized to delete Recipie."));
    }
    const recipie = await Recipie.findByIdAndDelete(recipieId);

    return res.status(200).json({ message: "Blog deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// export const getRecipiesByUser = async (req, res, next) => {
//   const { id } = req.params;
//   try {
//     const userRecipie = await User.findById(id).populate("recipies");
//     if (!userRecipie) next(errorHandler(404, "No Blog found."));
//     return res.status(200).json({
//       recipies: userRecipie,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
