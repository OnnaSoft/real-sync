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
 * @property {boolean} isActive
 * @property {Date} lastLoginAt
 */

/**
 * @typedef {import("sequelize").ModelStatic<Model<
 *  UserAttributes, Omit<UserAttributes, 'id' | 'resetToken' | 'resetTokenExpiry' | 'lastLoginAt'>
 * >>} UserModel
 */

/**
 * @param {Sequelize} sequelize
 * @returns {UserModel & {
 *   associate: (models: {[key: string]: import('sequelize').ModelStatic<import('sequelize').Model>}) => void,
 *   comparePassword: (candidatePassword: string) => Promise<boolean>
 * }}
 */
const UserModel = (sequelize) => {
  /**
   * @type {UserModel & {
   *   associate: (models: {[key: string]: import('sequelize').ModelStatic<import('sequelize').Model>}) => void,
   *   comparePassword: (candidatePassword: string) => Promise<boolean>
   * }}
   */
  // @ts-ignore
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
          is: {
            args: /^[a-zA-Z0-9_-]+$/,
            msg: "Username can only contain letters, numbers, underscores, and hyphens",
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
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
      defaultScope: {
        attributes: { exclude: ["password", "resetToken", "resetTokenExpiry"] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ["password"] },
        },
      },
    }
  );

  User.associate =
    /**
     * @param {{ [x:string]: import("sequelize").ModelStatic<Model> }} models
     */
    (models) => {
      User.hasMany(models.UserSubscription, { foreignKey: "userId" });
      User.hasMany(models.PaymentMethod, { foreignKey: "userId" });
      User.hasMany(models.App, { foreignKey: "userId" });
    };

  return User;
};

export default UserModel;
