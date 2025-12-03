import { getDamagedItems } from "@/actions/get-damaged-items";
import { getLinenTypes } from "@/actions/get-linen-types";
import { PageContainer, PageHeader } from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { DamagedItemsList } from "./components/damaged-items-list";
import { DamagedItemsFilters } from "./components/damaged-items-filters";

export default async function DanificadosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const result = await getDamagedItems({
    search: params.search as string,
    linenTypeId: params.linenTypeId as string,
  });

  const linenTypesResult = await getLinenTypes({});

  if (!result?.data?.data) {
    return (
      <PageContainer>
        <div>Erro ao carregar itens danificados</div>
      </PageContainer>
    );
  }

  const items = result.data.data;
  const linenTypes = linenTypesResult?.data?.data || [];

  return (
    <PageContainer>
      <div className="space-y-4 md:space-y-6">
        <PageHeader>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 md:text-3xl">
              <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-destructive" />
              Itens Danificados
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Gerencie itens danificados: repare, descarte ou mantenha para análise
            </p>
          </div>
        </PageHeader>

        <DamagedItemsFilters linenTypes={linenTypes} />

        <Card>
          <CardHeader>
            <CardTitle>Itens Danificados ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nenhum item danificado encontrado
              </p>
            ) : (
              <DamagedItemsList items={items} />
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

