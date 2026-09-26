import 'dotenv/config'
import prisma from './src/shared/lib/prisma'
import bcrypt from 'bcrypt'

const email = process.env.ADMIN_EMAIL
const senha = process.env.ADMIN_PASSWORD

if (!email || !senha) {
  throw new Error('ADMIN_EMAIL e ADMIN_PASSWORD devem ser definidos no ambiente')
}

const adminEmail = email
const adminPassword = senha

async function main() {
  const senhaHash = await bcrypt.hash(adminPassword, 10)
  const usuario = await prisma.usuario.create({
    data: {
      nome_completo: 'Admin DashOS',
      email: adminEmail,
      senha: senhaHash,
      telefone: '000000000',
      ativo: true,
      perfil: {
        connectOrCreate: {
          where: { nome: 'Administrador' },
          create: { nome: 'Administrador' },
        },
      },
    },
  })
  console.log(`Administrador criado: ${usuario.email}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
