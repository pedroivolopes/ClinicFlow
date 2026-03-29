'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Activity } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await authApi.login(email, password)
      setAuth(data.user, data.accessToken, data.refreshToken)
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.error
        || 'Credenciais inválidas'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Painel esquerdo — Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-between p-12">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan flex items-center justify-center">
            <Activity className="w-5 h-5 text-navy" strokeWidth={2.5} />
          </div>
          <span className="text-white text-xl font-bold tracking-wide">ClinicFlow</span>
        </div>

        {/* Conteúdo central */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Gestão de clínicas<br />
            <span className="text-cyan">simplificada.</span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-sm">
            Agendamentos, pacientes, financeiro e WhatsApp em um único lugar.
          </p>

          {/* Features */}
          <div className="space-y-3 pt-2">
            {[
              'Agendamento inteligente com confirmação automática',
              'Inbox WhatsApp integrado em tempo real',
              'Dashboard financeiro completo',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan flex-shrink-0" />
                <span className="text-white/70 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/30 text-sm">
          © 2026 RothaDigital · ClinicFlow
        </p>
      </div>

      {/* ── Painel direito — Formulário ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-cloud">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-navy flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan" strokeWidth={2.5} />
            </div>
            <span className="text-navy text-xl font-bold tracking-wide">ClinicFlow</span>
          </div>

          {/* Cabeçalho */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy">Bem-vindo de volta</h2>
            <p className="text-muted mt-1 text-sm">
              Acesse sua clínica com e-mail e senha
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com.br"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted
                             hover:text-navy transition-colors"
                  tabIndex={-1}
                >
                  {showPass
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200
                              text-red-700 text-sm px-4 py-3 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-muted/60">
            RothaDigital · Todos os direitos reservados
          </p>
        </div>
      </div>

    </div>
  )
}
