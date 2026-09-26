import 'dotenv/config'
import { z } from 'zod'

const EnvironmentSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
  PORT: z.coerce.number().int().positive().default(3333),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export function carregarAmbiente() {
  return EnvironmentSchema.parse(process.env)
}