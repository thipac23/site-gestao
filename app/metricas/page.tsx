'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/client'
import { MetricaDiaria } from '@/lib/types/database'

export default function MetricasPage() {
  const [metricas, setMetricas] = useState<MetricaDiaria[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroMes, setFiltroMes] = useState(() => new Date().toISOString().substring(0, 7))

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const inicio = filtroMes + '-01'
      const fim = new Date(filtroMes + '-01')
      fim.setMonth(fim.getMonth() + 1)
      const fimStr = fim.toISOString().substring(0, 10)

      const { data } = await supabase
        .from('metricas_diarias')
        .select('*, equipes(nome), contratos(nome)')
        .gte('data', inicio)
        .lt('data', fimStr)
        .order('data', { ascending: false })

      setMetricas(data || [])
      setLoading(false)
    }
    load()
  }, [filtroMes])

  const calcMedia = (campo: keyof MetricaDiaria) => {
    const vals = metricas.map(m => Number(m[campo])).filter(v => !isNaN(v) && v > 0)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—'
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Métricas</h1>
            <p className="text-sm text-muted-foreground mt-1">Indicadores de desempenho operacional</p>
          </div>
          <input
            type="month"
            value={filtroMes}
            onChange={e => setFiltroMes(e.target.value)}
            className="input w-44"
          />
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Aderência Reframax', value: calcMedia('aderencia_reframax'), sufixo: '%' },
            { label: 'Aderência Cliente', value: calcMedia('aderencia_cliente'), sufixo: '%' },
            { label: 'Produtividade Média', value: calcMedia('produtividade'), sufixo: '%' },
            { label: 'HH Total (média/dia)', value: calcMedia('hh_total'), sufixo: 'h' },
          ].map(card => (
            <div key={card.label} className="card text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-foreground">
                {card.value}{card.value !== '—' ? card.sufixo : ''}
              </p>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {['Data','Equipe','Contrato','Programado','Realizado','Aderência','Produtividade','HH Total'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>
                ) : metricas.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nenhum dado para o período selecionado</td></tr>
                ) : metricas.map(m => (
                  <tr key={m.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{m.data}</td>
                    <td className="px-4 py-3">{(m as any).equipes?.nome || '—'}</td>
                    <td className="px-4 py-3">{(m as any).contratos?.nome || '—'}</td>
                    <td className="px-4 py-3 text-center">{m.total_programado ?? '—'}</td>
                    <td className="px-4 py-3 text-center">{m.total_realizado ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${Number(m.aderencia_reframax) >= 90 ? 'badge-green' : Number(m.aderencia_reframax) >= 70 ? 'badge-yellow' : 'badge-red'}`}>
                        {m.aderencia_reframax != null ? `${Number(m.aderencia_reframax).toFixed(1)}%` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{m.produtividade != null ? `${Number(m.produtividade).toFixed(1)}%` : '—'}</td>
                    <td className="px-4 py-3 text-center">{m.hh_total != null ? `${Number(m.hh_total).toFixed(1)}h` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
