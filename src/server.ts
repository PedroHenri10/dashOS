import 'dotenv/config'
import app from './app'
import { carregarAmbiente } from './shared/config/environment'

const ambiente = carregarAmbiente()
const PORT = ambiente.PORT

app.listen({ port: PORT, host: '0.0.0.0' })
  .then(() => {
    console.log(`DashOS rodando em http://localhost:${PORT}`)
  })
  .catch((error) => {
    console.error('Erro ao iniciar servidor:', error)
    process.exit(1)
  })