'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SolicitarAcessoPage() {
  const [form, setForm] = useState({ nome: '', email: '', empresa: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome || !form.email) {
      setErro('Nome e e-mail são obrigatórios.')
      return
    }
    setStatus('loading')
    setErro('')

    const supabase = createClient()
    const { error } = await supabase.from('solicitacoes_acesso').insert({
      nome: form.nome,
      email: form.email,
      empresa: form.empresa || null,
    })

    if (error) {
      setErro('Erro ao enviar solicitação. Tente novamente.')
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <span className="text-white font-bold text-xl">PG</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Solicitar Acesso</h1>
          <p className="text-muted-foreground mt-1 text-sm">Preencha o formulário para solicitar acesso ao sistema</p>
        </div>

        {status === 'success' ? (
          <div className="card text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="font-semibold text-foreground">Solicitação enviada!</h2>
            <p className="text-sm text-muted-foreground">
              Sua solicitação foi recebida. O administrador irá analisar e entrar em contato pelo e-mail informado.
            </p>
            <Link href="/login" className="btn-primary inline-block">
              Voltar para Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card space-y-4">
            {erro && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">
                {erro}
              </div>
            )}

            <div>
              <label className="label">Nome completo *</label>
              <input
                type="text"
                className="input"
                placeholder="Seu nome"
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="label">E-mail *</label>
              <input
                type="email"
                className="input"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="label">Empresa</label>
              <input
                type="text"
                className="input"
                placeholder="Nome da empresa (opcional)"
                value={form.empresa}
                onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
              />
            </div>

            <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
              {status === 'loading' ? 'Enviando...' : 'Enviar Solicitação'}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Já tem acesso?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Fazer login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
