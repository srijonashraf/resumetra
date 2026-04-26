import { AxiosError } from "axios";

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }

  static fromResponse(status: number, body: unknown): ApiError {
    const data = body as Record<string, unknown> | undefined;
    const message =
      (data?.error as string) ??
      (data?.message as string) ??
      `Request failed with status ${status}`;
    return new ApiError(status, message, body);
  }

  static fromAxiosError(error: AxiosError): ApiError {
    const status = error.response?.status ?? 0;
    const data = error.response?.data;
    return ApiError.fromResponse(status, data);
  }
}
