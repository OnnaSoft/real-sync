


export type HttpErrors = {
  message?: string,
  "errors": {
    server?: {
      "message": string
    },
    [x: string]: {
      "message": string
    } | undefined
  }
}