import { DataTypes } from "sequelize";
import { Model, Sequelize } from "sequelize";

/**
 * @typedef {Object} AppAttributes
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {boolean} enableCalls
 * @property {boolean} enableVideoCalls
 * @property {boolean} enableConversationLogging
 * @property {number} userId
 * @property {number} [dedicatedServerPlanId]
 */

/**
 * @typedef {import("sequelize").ModelStatic<Model<AppAttributes, Omit<AppAttributes, 'id'>>>} AppModel
 */

/**
 * @param {Sequelize} sequelize
 * @returns {AppModel & {associate: (models: any) => void}}
 */
const AppModel = (sequelize) => {
  /** @type {AppModel & { associate: (models: any) => void }} */
  // @ts-ignore
  const App = sequelize.define(
    "app",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "App name is required" },
          len: {
            args: [1, 255],
            msg: "App name must be between 1 and 255 characters long",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      enableCalls: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      enableVideoCalls: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      enableConversationLogging: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      dedicatedServerPlanId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "dedicated-server-plans",
          key: "id",
        },
      },
    },
    {
      timestamps: true,
      hooks: {
        beforeCreate: async (app) => {
          const { User, Plan, UserPlan } = sequelize.models;
          const user = await User.findByPk(app.getDataValue("userId"), {
            include: [
              {
                model: UserPlan,
                where: { status: "active" },
                include: [Plan],
              },
            ],
          });

          if (!user) {
            throw new Error("User not found");
          }

          // @ts-ignore
          const activePlan = user["user-plans"][0]?.plan;

          if (!activePlan) {
            throw new Error("User does not have an active plan");
          }

          if (activePlan.maxApps !== 0) {
            // 0 means unlimited
            const appCount = await App.count({
              // @ts-ignore
              where: {
                userId: app.getDataValue("userId"),
                dedicatedServerPlanId: null,
              },
            });
            if (appCount > activePlan.maxApps) {
              throw new Error(
                "Maximum number of apps reached for the current plan"
              );
            }
          }
        },
      },
    }
  );

  App.associate =
    /**
     * @param {{ [x:string]: import("sequelize").ModelStatic<Model> }} models
     */
    (models) => {
      App.belongsTo(models.User, { foreignKey: "userId" });
      App.belongsTo(models.DedicatedServerPlan, {
        foreignKey: "dedicatedServerPlanId",
        as: "dedicatedServerPlan",
      });
      App.hasMany(models.ApiKey, { foreignKey: "appId", as: "apiKeys" });
    };

  return App;
};

export default AppModel;
