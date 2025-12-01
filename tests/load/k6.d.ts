/**
 * K6 Type Declarations
 * 
 * These types allow TypeScript to compile k6 test files.
 * K6 runs in its own JavaScript runtime, not Node.js.
 */

// K6 global environment variables
declare const __ENV: Record<string, string | undefined>;

// K6 HTTP module
declare module 'k6/http' {
  interface Response {
    status: number;
    body: string | null;
    headers: Record<string, string>;
    timings: {
      duration: number;
      blocked: number;
      connecting: number;
      tls_handshaking: number;
      sending: number;
      waiting: number;
      receiving: number;
    };
  }

  interface RequestParams {
    headers?: Record<string, string>;
    tags?: Record<string, string>;
    timeout?: string;
  }

  interface BatchRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
    url: string;
    body?: string | object;
    params?: RequestParams;
  }

  export function get(url: string, params?: RequestParams): Response;
  export function post(url: string, body?: string | object, params?: RequestParams): Response;
  export function put(url: string, body?: string | object, params?: RequestParams): Response;
  export function del(url: string, body?: string | object, params?: RequestParams): Response;
  export function patch(url: string, body?: string | object, params?: RequestParams): Response;
  export function batch(requests: BatchRequest[]): Response[];
  
  const http: {
    get: typeof get;
    post: typeof post;
    put: typeof put;
    del: typeof del;
    patch: typeof patch;
    batch: typeof batch;
  };
  export default http;
}

// K6 core module
declare module 'k6' {
  export interface Options {
    stages?: Array<{ duration: string; target: number }>;
    thresholds?: Record<string, string[]>;
    vus?: number;
    duration?: string;
    iterations?: number;
    noConnectionReuse?: boolean;
    userAgent?: string;
    insecureSkipTLSVerify?: boolean;
  }

  type CheckCallback<T> = (val: T) => boolean;
  type Checks<T> = Record<string, CheckCallback<T>>;

  export function check<T>(val: T, checks: Checks<T>): boolean;
  export function group<T>(name: string, fn: () => T): T;
  export function sleep(seconds: number): void;
  export function fail(message?: string): never;
}

// K6 metrics module
declare module 'k6/metrics' {
  export class Counter {
    constructor(name: string);
    add(value: number, tags?: Record<string, string>): void;
  }

  export class Gauge {
    constructor(name: string);
    add(value: number, tags?: Record<string, string>): void;
  }

  export class Rate {
    constructor(name: string);
    add(value: number | boolean, tags?: Record<string, string>): void;
  }

  export class Trend {
    constructor(name: string, isTime?: boolean);
    add(value: number, tags?: Record<string, string>): void;
  }
}

// K6 crypto module
declare module 'k6/crypto' {
  export function sha256(input: string, outputEncoding?: string): string;
  export function md5(input: string, outputEncoding?: string): string;
  export function hmac(algorithm: string, secret: string, input: string, outputEncoding?: string): string;
}

// K6 encoding module
declare module 'k6/encoding' {
  export function b64encode(input: string): string;
  export function b64decode(input: string): string;
}
