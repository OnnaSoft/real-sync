import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import { Model, Sequelize } from "sequelize";

/**
 * @typedef {Object} UserAttributes
 * @property {number} id
 * @property {string} fullname
 * @property {string} username
 * @property {string} email
 * @property {string} password
 * @property {string | null} [resetToken]
 * @property {Date | null} [resetTokenExpiry]
 * @property {string | null} [stripeCustomerId]
 */

/**
 * @typedef {import("sequelize").ModelStatic<Model<UserAttributes, Omit<UserAttributes, 'id' | 'resetToken' | 'resetTokenExpiry' | 'stripeCustomerId'>>>} UserModel
 */

/**
 * @param {Sequelize} sequelize
 * @returns {UserModel}
 */
const UserModel = (sequelize) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      fullname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Full name is required" },
          len: {
            args: [2, 100],
            msg: "Full name must be between 2 and 100 characters long",
          },
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Username is required" },
          len: {
            args: [3, 50],
            msg: "Username must be between 3 and 50 characters long",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Email is required" },
          isEmail: { msg: "Invalid email address" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Password is required" },
          isStrongPassword: {
            args: {
              minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || "8"),
              minLowercase: parseInt(process.env.PASSWORD_MIN_LOWERCASE || "1"),
              minUppercase: parseInt(process.env.PASSWORD_MIN_UPPERCASE || "1"),
              minNumbers: parseInt(process.env.PASSWORD_MIN_NUMBERS || "1"),
              minSymbols: parseInt(process.env.PASSWORD_MIN_SYMBOLS || "1"),
            },
            msg: "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol",
          },
        },
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          if (user.getDataValue("password")) {
            const salt = await bcrypt.genSalt(
              parseInt(process.env.BCRYPT_SALT_ROUNDS || "10")
            );
            user.setDataValue(
              "password",
              await bcrypt.hash(user.getDataValue("password"), salt)
            );
          }
        },
        beforeUpdate: async (user) => {
          // @ts-ignore
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(
              parseInt(process.env.BCRYPT_SALT_ROUNDS || "10")
            );
            user.setDataValue(
              "password",
              await bcrypt.hash(user.getDataValue("password"), salt)
            );
          }
        },
      },
    }
  );

  return User;
};

export default UserModel;
