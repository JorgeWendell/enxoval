import { getLaundryReport } from "@/actions/get-laundry-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function LaundryReport() {
  const result = await getLaundryReport({});

  if (!result?.data?.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Erro ao carregar relatório de lavanderia
          </p>
        </CardContent>
      </Card>
    );
  }

  const { stats, itemsByType } = result.data.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Coletados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(stats.totalCollected)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Em Lavagem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Number(stats.totalInWash)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Lavados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Number(stats.totalWashed)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Number(stats.totalDelivered)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Tempo Médio Coleta → Lavagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgCollectionToWash
                ? `${Number(stats.avgCollectionToWash).toFixed(1)}h`
                : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Tempo Médio Lavagem → Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgWashToDelivery
                ? `${Number(stats.avgWashToDelivery).toFixed(1)}h`
                : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ciclo Total Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgTotalCycle
                ? `${Number(stats.avgTotalCycle).toFixed(1)}h`
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens por Tipo de Enxoval</CardTitle>
        </CardHeader>
        <CardContent>
          {itemsByType.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center">
              Nenhum item na lavanderia
            </p>
          ) : (
            <div className="space-y-4">
              {itemsByType.map((item) => (
                <div
                  key={item.linenTypeName}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div>
                    <h3 className="font-semibold">{item.linenTypeName}</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Coletados</p>
                      <p className="font-medium">{Number(item.collected)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Em Lavagem</p>
                      <p className="font-medium text-blue-600">
                        {Number(item.inWash)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lavados</p>
                      <p className="font-medium text-green-600">
                        {Number(item.washed)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Entregues</p>
                      <p className="font-medium text-purple-600">
                        {Number(item.delivered)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

