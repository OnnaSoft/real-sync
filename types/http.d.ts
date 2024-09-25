import { Request } from "express";
import * as core from "express-serve-static-core";
import { User } from "./models";

export interface ErrorItem {
  message: string;
}

export type ErrorsMap = Record<string, ErrorItem>;

export interface ErrorResBody {
  errors: ErrorsMap;
}

export interface Session {
  userId: number;
  username: string;
}

export interface RequestWithSession<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: User;
}
