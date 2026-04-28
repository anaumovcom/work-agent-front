import { api } from "./client";

export interface AppSettingsDto {
  corsOrigins: string[];
  frameProvider: "mock" | "obs" | "file" | string;
  hidBridge: "mock" | "esp32_http" | "esp32_ws" | string;
  obsWsUrl: string;
  obsWsPassword: string;
  obsSourceName: string;
  esp32BaseUrl: string;
  esp32WsUrl: string;
  esp32ApiToken: string;
  vdiWidth: number;
  vdiHeight: number;
  frameRefreshIntervalMs: number;
  afterActionRefreshDelayMs: number;
  staleFrameWarningMs: number;
  staleFrameBlockMs: number;
  hidCommandTimeoutMs: number;
  frameStorageDir: string;
}

export type AppSettingsUpdateDto = Partial<AppSettingsDto>;

export const settingsApi = {
  get: () => api.get<AppSettingsDto>("/api/settings"),
  update: (settings: AppSettingsUpdateDto) => api.patch<AppSettingsDto>("/api/settings", settings),
};