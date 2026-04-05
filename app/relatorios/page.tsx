'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/client'

type ResumoContrato = {
  contrato: string
  programado: number
  realizado: number
  aderencia: number
  hh_total: number
  dias: number
}

export default function RelatoriosPage() {
  const [resumos, setResumos] = useState<ResumoContrato[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState(() => {
    const hoje = new Date()
    return hoje.toISOString().substring(0, 7)
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const inicio = periodo + '-01'
      const fim = new Date(periodo + '-01')
      fim.setMonth(fim.getMonth() + 1)

      const { data } = await supabase
        .from('metricas_diarias')
        .select('*, contratos(nome)')
        .gte('data', inicio)
        .lt('data', fim.toISOString().substring(0, 10))

      if (!data || data.length === 0) {
        setResumos([])
        setLoading(false)
        return
      }

      // Agrupar por contrato
      const mapa: Record<number, ResumoContrato> = {}
      for (const m of data) {
        const cid = m.contrato_id
        if (!mapa[cid]) {
          mapa[cid] = { contrato: (m as any).contratos?.nome || `Contrato #${cid}`, programado: 0, realizado: 0, aderencia: 0, hh_total: 0, dias: 0 }
        }
        mapa[cid].programado += Number(m.total_programado || 0)
        mapa[cid].realizado += Number(m.total_realizado || 0)
        mapa[cid].hh_total += Number(m.hh_total || 0)
        mapa[cid].dias++
      }

      // Calcular aderência média
      for (const key in mapa) {
        const r = mapa[key]
        r.aderencia = r.programado > 0 ? Math.round((r.realizado / r.programado) * 100) : 0
      }

      setResumos(Object.values(mapa))
      setLoading(false)
    }
    load()
  }, [periodo])

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
            <p className="text-sm text-muted-foreground mt-1">Consolidado mensal por contrato</p>
          </div>
          <input
            type="month"
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
            className="input w-44"
          />
        </div>

        {/* Tabela consolidada por contrato */}
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm">Desempenho por Contrato — {periodo}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {['Contrato','Dias com Registro','Programado','Realizado','Aderência','HH Total'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>
                ) : resumos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <p className="text-muted-foreground">Nenhum dado registrado para {periodo}</p>
                      <p className="text-xs text-muted-foreground mt-1">Os dados aparecem conforme registros forem inseridos nas operações</p>
                    </td>
                  </tr>
                ) : resumos.map((r, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.contrato}</td>
                    <td className="px-4 py-3 text-center">{r.dias}</td>
                    <td className="px-4 py-3 text-center">{r.programado}</td>
                    <td className="px-4 py-3 text-center">{r.realizado}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${r.aderencia >= 90 ? 'badge-green' : r.aderencia >= 70 ? 'badge-yellow' : 'badge-red'}`}>
                        {r.aderencia}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{r.hh_total.toFixed(1)}h</td>
                  </tr>
                ))}
              </tbody>
              {resumos.length > 0 && (
                <tfoot>
                  <tr className="bg-muted/50 font-semibold">
                    <td className="px-4 py-3">TOTAL</td>
                    <td className="px-4 py-3 text-center">{resumos.reduce((s, r) => s + r.dias, 0)}</td>
                    <td className="px-4 py-3 text-center">{resumos.reduce((s, r) => s + r.programado, 0)}</td>
                    <td className="px-4 py-3 text-center">{resumos.reduce((s, r) => s + r.realizado, 0)}</td>
                    <td className="px-4 py-3 text-center">
                      {(() => {
                        const prog = resumos.reduce((s, r) => s + r.programado, 0)
                        const real = resumos.reduce((s, r) => s + r.realizado, 0)
                        const adh = prog > 0 ? Math.round((real / prog) * 100) : 0
                        return <span className={`badge ${adh >= 90 ? 'badge-green' : adh >= 70 ? 'badge-yellow' : 'badge-red'}`}>{adh}%</span>
                      })()}
                    </td>
                    <td className="px-4 py-3 text-center">{resumos.reduce((s, r) => s + r.hh_total, 0).toFixed(1)}h</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
