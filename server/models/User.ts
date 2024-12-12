import { DataTypes, Model, Sequelize, ModelStatic } from "sequelize";
import bcrypt from "bcrypt";

export interface UserAttributes {
  id: number;
  fullname: string;
  username: string;
  email: string;
  avatarUrl?: string;
  password: string;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
  stripeCustomerId: string | null;
  isActive: boolean;
  lastLoginAt: Date;
}

export interface UserCreationAttributes extends Omit<UserAttributes, "id" | "resetToken" | "resetTokenExpiry" | "lastLoginAt"> {}

interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface UserModel extends ModelStatic<UserInstance> {
  associate: (models: { [key: string]: ModelStatic<Model> }) => void;
}

const UserModel = (sequelize: Sequelize): UserModel => {
  const User = sequelize.define<UserInstance>(
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
      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: { msg: "Invalid URL" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Password is required" },
          isStrongPassword: {
            args: {
              minLength: parseInt(process.env.PASSWORD_MIN_LENGTH ?? "8"),
              minLowercase: parseInt(process.env.PASSWORD_MIN_LOWERCASE ?? "1"),
              minUppercase: parseInt(process.env.PASSWORD_MIN_UPPERCASE ?? "1"),
              minNumbers: parseInt(process.env.PASSWORD_MIN_NUMBERS ?? "1"),
              minSymbols: parseInt(process.env.PASSWORD_MIN_SYMBOLS ?? "1"),
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
        beforeCreate: async (user: UserInstance) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(
              parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "10")
            );
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user: UserInstance) => {
          if (user.changed("password") && user.password) {
            const salt = await bcrypt.genSalt(
              parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "10")
            );
            user.password = await bcrypt.hash(user.password, salt);
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
  ) as UserModel;

  User.associate = (models: { [key: string]: ModelStatic<Model> }) => {
    User.hasMany(models.UserSubscription, { foreignKey: "userId" });
    User.hasMany(models.PaymentMethod, { foreignKey: "userId" });
  };

  return User;
};

export default UserModel;