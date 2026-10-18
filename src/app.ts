import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import { errorHandler } from './shared/middlewares/error.middleware'
import { authRoutes } from './modules/auth/auth.routes'
import { usuariosRoutes } from './modules/usuarios/usuarios.routes'
import { clientesRoutes } from './modules/clientes/clientes.routes'
import { fornecedoresRoutes } from './modules/fornecedores/fornecedores.routes'
import { equipamentosRoutes } from './modules/equipamentos/equipamentos.routes'
import { servicosRoutes } from './modules/servicos/servicos.routes'
import { ordensServicoRoutes } from './modules/ordens-servico/ordens-servico.routes'

const app = fastify({ logger: false })
const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:5173')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean)

app.register(fastifyCors, {
	origin: (origin, callback) => callback(null, !origin || corsOrigins.includes(origin)),
})
app.register(fastifyHelmet)
app.register(fastifyRateLimit, {
	max: 100,
	timeWindow: '1 hour',
})

app.get('/health', async () => ({ status: 'ok', timestamp: new Date() }))

app.register(authRoutes, { prefix: '/auth' })
app.register(usuariosRoutes, { prefix: '/usuarios' })
app.register(clientesRoutes, { prefix: '/clientes' })
app.register(fornecedoresRoutes, { prefix: '/fornecedores' })
app.register(equipamentosRoutes, { prefix: '/equipamentos' })
app.register(servicosRoutes, { prefix: '/servicos' })
app.register(ordensServicoRoutes, { prefix: '/ordens-servico' })

app.setErrorHandler(errorHandler)

export default app