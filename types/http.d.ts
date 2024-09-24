export interface ErrorItem {
  message: string;
}

export type ErrorsMap = Record<string, ErrorItem>;

export interface ErrorResBody {
  errors: ErrorsMap;
}
