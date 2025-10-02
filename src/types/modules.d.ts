// Type declarations for missing modules

declare module 'firebase-admin/app' {
  export * from 'firebase-admin';
}

declare module 'firebase-admin/firestore' {
  export * from 'firebase-admin';
}

declare module 'firebase-admin/auth' {
  export * from 'firebase-admin';
}

declare module 'next/app' {
  export * from 'next';
}

declare module 'next/head' {
  export * from 'next';
}

declare module 'next' {
  export interface NextApiRequest {
    body: any;
    query: { [key: string]: string | string[] };
    cookies: { [key: string]: string };
    headers: { [key: string]: string | string[] | undefined };
    method?: string;
    url?: string;
  }

  export interface NextApiResponse {
    status(statusCode: number): NextApiResponse;
    json(body: any): void;
    send(body: any): void;
    end(): void;
    setHeader(name: string, value: string | string[]): NextApiResponse;
    getHeader(name: string): string | string[] | undefined;
  }

  export type NextApiHandler = (
    req: NextApiRequest,
    res: NextApiResponse
  ) => void | Promise<void>;
}

declare module 'body-parser' {
  export function json(options?: any): any;
  export function urlencoded(options?: any): any;
}

declare module 'caseless' {
  export = caseless;
  function caseless(dict?: any): any;
}

declare module 'connect' {
  export = connect;
  function connect(): any;
}

declare module 'cors' {
  export = cors;
  function cors(options?: any): any;
}

declare module 'express' {
  export = express;
  function express(): any;
}

declare module 'express-serve-static-core' {
  export interface Request {
    body: any;
    params: any;
    query: any;
    headers: any;
  }
  export interface Response {
    status(code: number): Response;
    json(obj: any): Response;
    send(body: any): Response;
  }
}

declare module 'http-errors' {
  export = createError;
  function createError(status?: number, message?: string): Error;
}