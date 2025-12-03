import { getLinenTypes } from "@/actions/get-linen-types";
import { getLinenItems } from "@/actions/get-linen-items";
import { PageContainer } from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { linenTypesTable } from "@/db/schema";
import { EditLinenTypeDialog } from "../components/edit-linen-type-dialog";
import { MoveLinenItemDialog } from "../components/move-linen-item-dialog";

const categoryLabels = {
  cama: "Cama",
  banho: "Banho",
  mesa: "Mesa",
  decoracao: "Decoração",
  outros: "Outros",
};

const statusLabels = {
  limpo: "Limpo",
  sujo: "Sujo",
  em_lavagem: "Em Lavagem",
  danificado: "Danificado",
  estoque: "Estoque",
  descartado: "Descartado",
};

export default async function LinenTypeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const type = await db
    .select()
    .from(linenTypesTable)
    .where(eq(linenTypesTable.id, id))
    .limit(1);

  if (type.length === 0) {
    return (
      <PageContainer>
        <div>Tipo de enxoval não encontrado</div>
      </PageContainer>
    );
  }

  const linenType = type[0];
  const itemsResult = await getLinenItems({ linenTypeId: id });
  const items = itemsResult?.data?.data || [];

  const itemsByStatus = items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/enxovais">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 md:text-3xl">
              <PackageOpen className="h-5 w-5 md:h-6 md:w-6" />
              {linenType.name}
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">Detalhes do tipo de enxoval</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações</CardTitle>
                <EditLinenTypeDialog
                  linenTypeId={linenType.id}
                  defaultValues={{
                    name: linenType.name,
                    description: linenType.description,
                    category: linenType.category,
                    unit: linenType.unit,
                    minStock: linenType.minStock,
                    imageUrl: linenType.imageUrl,
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium">
                  {categoryLabels[linenType.category]}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unidade</p>
                <p className="font-medium">{linenType.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estoque Mínimo</p>
                <p className="font-medium">{linenType.minStock}</p>
              </div>
              {linenType.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="font-medium">{linenType.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total de Itens</span>
                  <span className="font-medium">{items.length}</span>
                </div>
                {Object.entries(itemsByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {statusLabels[status as keyof typeof statusLabels]}
                    </span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Itens ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nenhum item deste tipo cadastrado
              </p>
            ) : (
              <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
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
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {statusLabels[item.status as keyof typeof statusLabels]}
                        </Badge>
                        <Badge variant="outline">{item.condition}</Badge>
                        {item.roomId && item.roomNumber ? (
                          <Badge variant="secondary">
                            Quarto {item.roomNumber}
                          </Badge>
                        ) : item.status === "em_lavagem" ? (
                          <Badge variant="secondary">
                            Lavanderia
                          </Badge>
                        ) : item.status === "estoque" && !item.roomId ? (
                          <>
                            <Badge variant="secondary">
                              Estoque
                            </Badge>
                            <MoveLinenItemDialog
                              linenItemId={item.id}
                              currentRoomId={item.roomId}
                            />
                          </>
                        ) : (
                          <MoveLinenItemDialog
                            linenItemId={item.id}
                            currentRoomId={item.roomId}
                          />
                        )}
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

