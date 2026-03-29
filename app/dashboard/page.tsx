import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard/stats"
import { ProductionChart } from "@/components/dashboard/production-chart"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { BatteryOverview } from "@/components/dashboard/battery-overview"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get today's KPIs
  const today = new Date().toISOString().split('T')[0]
  const { data: kpis } = await supabase
    .from('kpis')
    .select('*')
    .eq('date', today)
    .single()

  // Get batteries overview
  const { data: batteries } = await supabase
    .from('batteries')
    .select('*')
    .eq('status', 'operational')

  // Get recent activities
  const { data: activities } = await supabase
    .from('activities')
    .select(`
      *,
      profiles:user_id (full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get team attendance for today
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('date', today)

  const stats = {
    production: kpis?.production_tons || 0,
    productionTarget: kpis?.production_target || 850,
    efficiency: kpis?.operational_efficiency || 0,
    furnacesOperational: batteries?.reduce((acc, b) => acc + (b.furnaces_operational || 0), 0) || 0,
    furnacesTotal: batteries?.reduce((acc, b) => acc + (b.total_furnaces || 0), 0) || 0,
    safetyIncidents: kpis?.safety_incidents || 0,
    teamPresent: attendance?.filter(a => a.status === 'present').length || 0,
    teamTotal: attendance?.length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visao geral das operacoes do dia
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Producao Semanal</CardTitle>
            <CardDescription>Toneladas de coque produzidas</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductionChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Baterias</CardTitle>
            <CardDescription>Visao geral dos fornos</CardDescription>
          </CardHeader>
          <CardContent>
            <BatteryOverview batteries={batteries || []} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
          <CardDescription>Ultimas operacoes registradas</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentActivities activities={activities || []} />
        </CardContent>
      </Card>
    </div>
  )
}
