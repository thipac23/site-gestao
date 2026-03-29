import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Factory, Gauge, Flame, Users, AlertTriangle, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    production: number
    productionTarget: number
    efficiency: number
    furnacesOperational: number
    furnacesTotal: number
    safetyIncidents: number
    teamPresent: number
    teamTotal: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const productionPercent = stats.productionTarget > 0 
    ? Math.round((stats.production / stats.productionTarget) * 100) 
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Producao do Dia</CardTitle>
          <Factory className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.production.toLocaleString('pt-BR')} ton</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span>{productionPercent}% da meta ({stats.productionTarget} ton)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eficiencia Operacional</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.efficiency}%</div>
          <p className="text-xs text-muted-foreground">
            Rendimento geral do turno
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fornos Operacionais</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.furnacesOperational}/{stats.furnacesTotal}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.furnacesTotal > 0 
              ? Math.round((stats.furnacesOperational / stats.furnacesTotal) * 100) 
              : 0}% em operacao
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Equipe Presente</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.teamPresent}/{stats.teamTotal}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {stats.safetyIncidents === 0 ? (
              <span className="text-green-600">0 incidentes de seguranca</span>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span className="text-amber-600">{stats.safetyIncidents} incidente(s)</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
