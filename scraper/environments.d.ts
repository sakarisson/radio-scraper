export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STATION_URL_RAS_2: string;
    }
  }
}
