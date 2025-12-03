import { PageContainer } from "@/components/ui/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockReport } from "./components/stock-report";
import { UsageReport } from "./components/usage-report";
import { MaintenanceReport } from "./components/maintenance-report";
import { LaundryReport } from "./components/laundry-report";

export default async function RelatoriosPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Relatórios</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Relatórios detalhados do sistema de enxovais
          </p>
        </div>

        <Tabs defaultValue="estoque" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="estoque">Estoque</TabsTrigger>
            <TabsTrigger value="utilizacao">Utilização</TabsTrigger>
            <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
            <TabsTrigger value="lavanderia">Lavanderia</TabsTrigger>
          </TabsList>

          <TabsContent value="estoque" className="space-y-4">
            <StockReport />
          </TabsContent>

          <TabsContent value="utilizacao" className="space-y-4">
            <UsageReport />
          </TabsContent>

          <TabsContent value="manutencao" className="space-y-4">
            <MaintenanceReport />
          </TabsContent>

          <TabsContent value="lavanderia" className="space-y-4">
            <LaundryReport />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

