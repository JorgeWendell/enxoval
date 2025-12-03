import { getStockReport } from "@/actions/get-stock-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockReportFilters } from "./stock-report-filters";

export async function StockReport() {
  const result = await getStockReport({});

  if (!result?.data?.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Erro ao carregar relatório de estoque
          </p>
        </CardContent>
      </Card>
    );
  }

  const report = result.data.data;

  const totalItems = report.reduce((sum, item) => sum + Number(item.total), 0);
  const lowStockItems = report.filter(
    (item) => Number(item.estoque) + Number(item.limpos) < item.minStock
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tipos de Enxovais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {lowStockItems.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.map((item) => {
              const available = Number(item.estoque) + Number(item.limpos);
              const isLowStock = available < item.minStock;

              return (
                <div
                  key={item.linenTypeId}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{item.linenTypeName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.category} • {item.unit}
                      </p>
                    </div>
                    {isLowStock && (
                      <Badge variant="destructive">Estoque Baixo</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium">{Number(item.total)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Limpos</p>
                      <p className="font-medium text-green-600">
                        {Number(item.limpos)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Em Estoque</p>
                      <p className="font-medium">{Number(item.estoque)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mínimo</p>
                      <p className="font-medium">{item.minStock}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sujos</p>
                      <p className="font-medium text-yellow-600">
                        {Number(item.sujos)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Em Lavagem</p>
                      <p className="font-medium text-blue-600">
                        {Number(item.emLavagem)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Danificados</p>
                      <p className="font-medium text-red-600">
                        {Number(item.danificados)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Descartados</p>
                      <p className="font-medium text-gray-600">
                        {Number(item.descartados)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

