import { getLinenItems } from "@/actions/get-linen-items";
import { PageContainer } from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageOpen } from "lucide-react";
import { LinenItemsFilters } from "./components/linen-items-filters";
import { StockItemsList } from "./components/stock-items-list";

const statusLabels = {
  limpo: "Limpo",
  sujo: "Sujo",
  em_lavagem: "Em Lavagem",
  danificado: "Danificado",
  estoque: "Estoque",
  descartado: "Descartado",
};

export default async function LinenItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const result = await getLinenItems({
    status: params.status as any,
    linenTypeId: params.linenTypeId as string,
    roomId: params.roomId as string,
    search: params.search as string,
  });

  if (!result?.data?.data) {
    return (
      <PageContainer>
        <div>Erro ao carregar itens</div>
      </PageContainer>
    );
  }

  const items = result.data.data;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Itens de Enxovais</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Gerencie todos os itens individuais
          </p>
        </div>

        <LinenItemsFilters />

        <Card>
          <CardHeader>
            <CardTitle>Itens ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center">
                Nenhum item encontrado com os filtros aplicados
              </p>
            ) : params.status === "estoque" ? (
              <StockItemsList items={items} />
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <PackageOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">
                          {item.linenTypeName || `Item #${item.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.description && `Descrição: ${item.description}`}
                          {item.description && item.id && " • "}
                          {item.id && `ID: ${item.id.slice(0, 8)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {statusLabels[item.status as keyof typeof statusLabels]}
                      </Badge>
                      <Badge variant="outline">{item.condition}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

