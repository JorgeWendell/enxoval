import { PageContainer } from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WashingMachine } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { db } from "@/db/index";
import { laundryTable, linenItemsTable, linenTypesTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function LavanderiaPage() {
  const [laundryStats] = await db
    .select({
      coletados: sql<number>`count(*) filter (where ${laundryTable.status} = 'coletado')`,
      emLavagem: sql<number>`count(*) filter (where ${laundryTable.status} = 'em_lavagem')`,
      lavados: sql<number>`count(*) filter (where ${laundryTable.status} = 'lavado')`,
      entregues: sql<number>`count(*) filter (where ${laundryTable.status} = 'entregue')`,
    })
    .from(laundryTable);

  const itemsEmLavagem = await db
    .select({
      id: linenItemsTable.id,
      linenTypeId: linenItemsTable.linenTypeId,
      linenTypeName: linenTypesTable.name,
      status: linenItemsTable.status,
      description: linenItemsTable.description,
    })
    .from(linenItemsTable)
    .innerJoin(
      linenTypesTable,
      eq(linenItemsTable.linenTypeId, linenTypesTable.id)
    )
    .where(eq(linenItemsTable.status, "em_lavagem"))
    .limit(10);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 md:text-3xl">
            <WashingMachine className="h-5 w-5 md:h-6 md:w-6" />
            Lavanderia
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Controle do ciclo de lavagem
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Coletados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(laundryStats.coletados)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Em Lavagem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(laundryStats.emLavagem)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Lavados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(laundryStats.lavados)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(laundryStats.entregues)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/lavanderia/coletar">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Coletar Enxovais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Coletar enxovais sujos dos quartos
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/lavanderia/lavar">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Registrar Lavagem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Registrar itens que foram lavados
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/lavanderia/entregar">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>Entregar Enxovais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Entregar enxovais limpos aos quartos
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {itemsEmLavagem.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Itens em Lavagem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {itemsEmLavagem.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {item.linenTypeName || `Item #${item.id.slice(0, 8)}`}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">
                          Descrição: {item.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">Em Lavagem</Badge>
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

