import { HttpError } from "http-errors-enhanced";
import { DataTypes, Model, Sequelize, ModelStatic, Association } from "sequelize";

interface AppAttributes {
  id: number;
  name: string;
  description: string | null;
  enableCalls: boolean;
  enableVideoCalls: boolean;
  enableConversationLogging: boolean;
  userId: number;
  dedicatedServerPlanId: number | null;
}

interface AppCreationAttributes extends Omit<AppAttributes, "id"> {}

interface AppInstance extends Model<AppAttributes, AppCreationAttributes>, AppAttributes {
  createdAt?: Date;
  updatedAt?: Date;
}

interface AppModel extends ModelStatic<AppInstance> {
  associate: (models: { [key: string]: ModelStatic<Model> }) => void;
}

const AppModel = (sequelize: Sequelize): AppModel => {
  const App = sequelize.define<AppInstance>(
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
        beforeCreate: async (app: AppInstance) => {
          const { User, Plan, UserSubscription } = sequelize.models;
          const user = await User.findByPk(app.userId, {
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

          const activePlan = (user as any).userSubscriptions[0]?.plan;

          if (!activePlan) {
            const errMsg = "User does not have an active plan";
            throw new HttpError(400, errMsg, {
              errors: { plan: { message: errMsg } },
            });
          }

          const maxApps = activePlan.maxApps;
          if (maxApps !== 0 && !app.dedicatedServerPlanId) {
            // 0 means unlimited
            const appCount = await App.count({
              where: {
                userId: app.userId,
                dedicatedServerPlanId: null,
              },
            });
            if (appCount >= maxApps) {
              const errMsg = `Maximum number of apps reached for the current plan`;
              throw new HttpError(400, errMsg, {
                errors: { app: { message: errMsg } },
              });
            }
          }

          if (activePlan.videoCalls === false) {
            if (app.enableVideoCalls) {
              const errMsg = `Video calls are not enabled for the current plan`;
              throw new HttpError(400, errMsg, {
                errors: { app: { message: errMsg } },
              });
            }
          }

          if (activePlan.voiceCalls === false) {
            if (app.enableCalls) {
              const errMsg = `Calls are not enabled for the current plan`;
              throw new HttpError(400, errMsg, {
                errors: { app: { message: errMsg } },
              });
            }
          }
        },
      },
    }
  ) as AppModel;

  App.associate = (models: { [key: string]: ModelStatic<Model> }) => {
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