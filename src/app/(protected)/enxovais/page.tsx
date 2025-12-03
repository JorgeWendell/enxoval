import { getLinenTypes } from "@/actions/get-linen-types";
import { PageContainer, PageHeader, PageActions } from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { CreateLinenTypeDialog } from "./components/create-linen-type-dialog";
import { CreateLinenItemDialog } from "./components/create-linen-item-dialog";
import { LinenTypesFilters } from "./components/linen-types-filters";

const categoryLabels = {
  cama: "Cama",
  banho: "Banho",
  mesa: "Mesa",
  decoracao: "Decoração",
  outros: "Outros",
};

const categoryColors = {
  cama: "bg-blue-500",
  banho: "bg-cyan-500",
  mesa: "bg-amber-500",
  decoracao: "bg-purple-500",
  outros: "bg-gray-500",
};

export default async function EnxovaisPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const result = await getLinenTypes({
    category: params.category as any,
    search: params.search as string,
  });

  if (!result?.data?.data) {
    return (
      <PageContainer>
        <div>Erro ao carregar tipos de enxovais</div>
      </PageContainer>
    );
  }

  const linenTypes = result.data.data;

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Tipos de Enxovais</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Gerencie os {linenTypes.length} tipos de enxovais
            </p>
          </div>
          <PageActions>
            <CreateLinenTypeDialog />
            <CreateLinenItemDialog />
          </PageActions>
        </PageHeader>

        <LinenTypesFilters />

        {linenTypes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nenhum tipo de enxoval encontrado com os filtros aplicados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {linenTypes.map((type) => (
            <Link key={type.id} href={`/enxovais/${type.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <PackageOpen className="h-5 w-5" />
                      {type.name}
                    </CardTitle>
                    <Badge
                      className={`${categoryColors[type.category]} text-white`}
                    >
                      {categoryLabels[type.category]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {type.description && (
                      <p className="text-muted-foreground">
                        {type.description}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Unidade:</span> {type.unit}
                    </p>
                    <p>
                      <span className="font-medium">Estoque Mínimo:</span>{" "}
                      {type.minStock}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        )}
      </div>
    </PageContainer>
  );
}

