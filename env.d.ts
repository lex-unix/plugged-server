declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string
    HOST: string
    COOKIE_SECRET: string
    COOKIE_NAME: string
    DB_HOST: string
    DB_PORT: string
    DB_NAME: string
    DB_USER: string
    DB_PASSWORD: string
    REDIS_URL: string
    CORS_ORIGIN: string
    SUPABASE_URL: string
    SUPABASE_SECRET: string
  }
}
