import { getUsageReport } from "@/actions/get-usage-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function UsageReport() {
  const result = await getUsageReport({});

  if (!result?.data?.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Erro ao carregar relatório de utilização
          </p>
        </CardContent>
      </Card>
    );
  }

  const { itemsInRooms, washCycleStats, movementsByType } = result.data.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Tempo Médio Coleta → Lavagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {washCycleStats.avgCollectionToWash
                ? `${Number(washCycleStats.avgCollectionToWash).toFixed(1)}h`
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
              {washCycleStats.avgWashToDelivery
                ? `${Number(washCycleStats.avgWashToDelivery).toFixed(1)}h`
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
              {washCycleStats.avgTotalCycle
                ? `${Number(washCycleStats.avgTotalCycle).toFixed(1)}h`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Number(washCycleStats.totalCycles)} ciclos completos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens por Quarto</CardTitle>
        </CardHeader>
        <CardContent>
          {itemsInRooms.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center">
              Nenhum item em quartos
            </p>
          ) : (
            <div className="space-y-2">
              {itemsInRooms.map((room) => (
                <div
                  key={room.roomId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">Quarto {room.roomNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{Number(room.totalItems)}</p>
                    <p className="text-xs text-muted-foreground">itens limpos</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          {movementsByType.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center">
              Nenhuma movimentação registrada
            </p>
          ) : (
            <div className="space-y-2">
              {movementsByType.map((movement) => (
                <div
                  key={movement.movementType}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {movement.movementType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{Number(movement.count)}</p>
                    <p className="text-xs text-muted-foreground">movimentações</p>
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

