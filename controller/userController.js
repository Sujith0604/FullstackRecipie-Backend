import User from "../model/userModel.js";
import { errorHandler } from "../utils/Error.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const userWithOutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUser = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      Allusers: userWithOutPassword,
      totalUser,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};
export const getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) next(errorHandler(404, "User not found."));
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateSingleUser = async (req, res, next) => {
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(
        errorHandler(400, "Password must be at least 6 characters long.")
      );
    }
    req.body.password = await bcrypt.hash(
      req.body.password,
      process.env.SALT_ROUND
    );

    if (req.body.username.length < 6 || req.body.password.length > 20) {
      return next(
        errorHandler(
          400,
          "Username must be at least 6 characters long and password must be at most 20 characters long."
        )
      );
    }

    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username cannot contain any spaces."));
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profileImage: req.body.profileImage,
        },
      },
      {
        new: true,
      }
    );

    const { password, ...rest } = updatedUser._doc;
    res.json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteSingleUser = async (req, res, next) => {
  const { id, userId } = req.params;

  try {
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return next(
        errorHandler(400, "User not found. Please provide a valid user ID.")
      );
    }
    if (!existingUser.isAdmin) {
      return next(errorHandler(403, "Unauthorized to delete blog."));
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) next(errorHandler(404, "User not found."));
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
