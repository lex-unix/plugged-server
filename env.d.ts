declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string
    HOST: string
    COOKIE_SECRET: string
    COOKIE_NAME: string
    PGHOST: string
    PGPORT: string
    PGDATABASE: string
    PGUSER: string
    PGPASSWORD: string
    REDIS_URL: string
    CORS_ORIGIN: string
    SUPABASE_URL: string
    SUPABASE_SECRET: string
  }
}
