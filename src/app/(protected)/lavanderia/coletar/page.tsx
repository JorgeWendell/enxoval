import { getRooms } from "@/actions/get-rooms";
import { PageContainer } from "@/components/ui/page-container";
import { CollectLinenForm } from "./components/collect-linen-form";

export default async function ColetarPage() {
  const roomsResult = await getRooms({});

  if (!roomsResult?.data?.data) {
    return (
      <PageContainer>
        <div>Erro ao carregar quartos</div>
      </PageContainer>
    );
  }

  const rooms = roomsResult.data.data;

  return (
    <PageContainer>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Coletar Enxovais</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Selecione um quarto e os itens sujos para coletar
          </p>
        </div>

        <CollectLinenForm rooms={rooms} />
      </div>
    </PageContainer>
  );
}

