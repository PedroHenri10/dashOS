import 'dotenv/config'
import prisma from './src/shared/lib/prisma'

const email = process.env.ADMIN_EMAIL

if (!email) {
  throw new Error('ADMIN_EMAIL deve ser definido no ambiente')
}

async function main() {
  const user = await prisma.usuario.findUnique({
    where: { email },
    include: { perfil: true },
  })
  console.log(user ? `Usuário encontrado: ${user.email}` : 'Usuário não encontrado')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
