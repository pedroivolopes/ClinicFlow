'use client'

import { useAuthStore } from '@/store/auth.store'
import { Activity, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'

export default function DashboardPage() {
  const { user, refreshToken, clearAuth } = useAuthStore()
  const router = useRouter()

  async function handleLogout() {
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } catch {}
    clearAuth()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex">

      {/* Sidebar */}
      <aside className="w-64 bg-navy flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-cyan flex items-center justify-center">
            <Activity className="w-4 h-4 text-navy" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-lg tracking-wide">ClinicFlow</span>
        </div>

        {/* Nav placeholder */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 py-2 rounded-lg bg-cyan/10 text-cyan text-sm font-medium">
            Dashboard
          </div>
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center
                            text-cyan text-xs font-bold uppercase">
              {user?.name?.charAt(0) ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-white/40 text-xs truncate">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/40 hover:text-white transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 bg-cloud p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
          {user?.clinic && (
            <span className="inline-block mt-1 px-3 py-0.5 bg-cyan/10 text-navy
                             text-xs font-semibold rounded-full border border-cyan/30">
              {user.clinic.name}
            </span>
          )}
        </div>

        <div className="card p-8 text-center">
          <p className="text-muted text-sm">
            🚀 Semana 2 em andamento — módulos sendo implementados
          </p>
        </div>
      </main>

    </div>
  )
}
