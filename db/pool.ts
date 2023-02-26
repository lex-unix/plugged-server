import { Pool, type PoolConfig } from 'pg'

export const createPool = (config: PoolConfig) => {
  return new Pool(config)
}
