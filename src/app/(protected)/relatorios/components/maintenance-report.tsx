import { getMaintenanceReport } from "@/actions/get-maintenance-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function MaintenanceReport() {
  const result = await getMaintenanceReport({});

  if (!result?.data?.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Erro ao carregar relatório de manutenção
          </p>
        </CardContent>
      </Card>
    );
  }

  const { damagedItems, itemsToDiscard, stats } = result.data.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Number(stats.totalItems)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Itens Danificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {Number(stats.totalDamaged)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((Number(stats.totalDamaged) / Number(stats.totalItems)) * 100).toFixed(1)}%
              do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Itens Descartados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {Number(stats.totalDiscarded)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((Number(stats.totalDiscarded) / Number(stats.totalItems)) * 100).toFixed(1)}%
              do total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens Danificados ({damagedItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {damagedItems.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center">
              Nenhum item danificado
            </p>
          ) : (
            <div className="space-y-2">
              {damagedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{item.linenTypeName}</p>
                    <p className="text-xs text-muted-foreground">
                      Item #{item.id.slice(0, 8)}
                      {item.roomNumber && ` • Quarto ${item.roomNumber}`}
                    </p>
                    {item.lastWashDate && (
                      <p className="text-xs text-muted-foreground">
                        Última lavagem:{" "}
                        {new Date(item.lastWashDate).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.condition}</Badge>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens para Descarte ({itemsToDiscard.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {itemsToDiscard.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center">
              Nenhum item para descarte
            </p>
          ) : (
            <div className="space-y-2">
              {itemsToDiscard.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{item.linenTypeName}</p>
                    <p className="text-xs text-muted-foreground">
                      Item #{item.id.slice(0, 8)}
                      {item.roomNumber && ` • Quarto ${item.roomNumber}`}
                    </p>
                    {item.lastWashDate && (
                      <p className="text-xs text-muted-foreground">
                        Última lavagem:{" "}
                        {new Date(item.lastWashDate).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">{item.condition}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

