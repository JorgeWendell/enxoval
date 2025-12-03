import { getDashboardStats } from "@/actions/get-dashboard-stats";
import { PageContainer } from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BedDouble,
  PackageOpen,
  WashingMachine,
  AlertTriangle,
} from "lucide-react";

export default async function DashboardPage() {
  const result = await getDashboardStats({});

  if (!result?.data?.data) {
    return (
      <PageContainer>
        <div>Erro ao carregar dados</div>
      </PageContainer>
    );
  }

  const stats = result.data.data;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Visão geral do sistema de enxovais
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quartos</CardTitle>
              <BedDouble className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rooms.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.rooms.ocupados} ocupados • {stats.rooms.disponiveis}{" "}
                disponíveis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enxovais</CardTitle>
              <PackageOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.linen.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.linen.limpos} limpos • {stats.linen.sujos} sujos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lavanderia</CardTitle>
              <WashingMachine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.laundry.coletados) +
                  Number(stats.laundry.emLavagem) +
                  Number(stats.laundry.lavados)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.laundry.emLavagem} em lavagem • {stats.laundry.lavados}{" "}
                lavados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estoque Baixo
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lowStock.length}</div>
              <p className="text-xs text-muted-foreground">
                Tipos abaixo do mínimo
              </p>
            </CardContent>
          </Card>
        </div>

        {stats.lowStock.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.lowStock.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Mínimo: {item.minStock}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">
                        {item.currentStock}
                      </p>
                      <p className="text-xs text-muted-foreground">em estoque</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
