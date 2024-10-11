import { HttpError } from "http-errors-enhanced";
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
 * @property {number|null} [dedicatedServerPlanId]
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
      },
    },
    {
      timestamps: true,
      hooks: {
        beforeCreate: async (app) => {
          const { User, Plan, UserSubscription } = sequelize.models;
          const user = await User.findByPk(app.getDataValue("userId"), {
            include: [
              {
                model: UserSubscription,
                where: { status: "active" },
                include: [Plan],
              },
            ],
          });

          if (!user) {
            throw new HttpError(404, "User not found", {
              errors: { user: { message: "User not found" } },
            });
          }

          /**
           * @type {import('sequelize').Model<import('../models/Plan.js').PlanAttributes>}
           */
          // @ts-ignore
          const activePlan = user.userSubscriptions[0]?.plan;

          if (!activePlan) {
            const errMsg = "User does not have an active plan";
            throw new HttpError(400, errMsg, {
              errors: { plan: { message: errMsg } },
            });
          }

          const maxApps = activePlan.getDataValue("maxApps");
          const dsPlanId = app.getDataValue("dedicatedServerPlanId");
          if (maxApps !== 0 && !dsPlanId) {
            // 0 means unlimited
            /** @type {number} */
            // @ts-ignore
            const appCount = await App.count({
              // @ts-ignore
              where: {
                userId: app.getDataValue("userId"),
                dedicatedServerPlanId: null,
              },
            });
            if (appCount >= activePlan.getDataValue("maxApps")) {
              const errMsg = `Maximum number of apps reached for the current plan`;
              throw new HttpError(400, errMsg, {
                errors: { app: { message: errMsg } },
              });
            }
          }

          if (activePlan.getDataValue("videoCalls") === false) {
            if (app.getDataValue("enableVideoCalls")) {
              const errMsg = `Video calls are not enabled for the current plan`;
              throw new HttpError(400, errMsg, {
                errors: { app: { message: errMsg } },
              });
            }
          }

          if (activePlan.getDataValue("voiceCalls") === false) {
            if (app.getDataValue("enableCalls")) {
              const errMsg = `Calls are not enabled for the current plan`;
              throw new HttpError(400, errMsg, {
                errors: { app: { message: errMsg } },
              });
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
