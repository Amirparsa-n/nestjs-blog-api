namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    // Secret
    COOKIE_SECRET: string;
    OTP_TOKEN_SECRET: string;
    ACCESS_TOKEN_SECRET: string;
  }
}
