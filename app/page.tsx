import { redirect } from 'next/navigation'

// Raiz redireciona para dashboard (middleware cuida da auth)
export default function RootPage() {
  redirect('/dashboard')
}
