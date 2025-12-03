import { getLaundryItems } from "@/actions/get-laundry-items";
import { getRooms } from "@/actions/get-rooms";
import { PageContainer } from "@/components/ui/page-container";
import { DeliverLinenForm } from "./components/deliver-linen-form";

export default async function EntregarPage() {
  const [laundryResult, roomsResult] = await Promise.all([
    getLaundryItems({ status: "lavado" }),
    getRooms({}),
  ]);

  if (!laundryResult?.data?.data || !roomsResult?.data?.data) {
    return (
      <PageContainer>
        <div>Erro ao carregar dados</div>
      </PageContainer>
    );
  }

  const items = laundryResult.data.data;
  const rooms = roomsResult.data.data;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Entregar Enxovais</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Selecione um destino (quarto ou estoque) e os itens lavados para entregar
          </p>
        </div>

        <DeliverLinenForm items={items} rooms={rooms} />
      </div>
    </PageContainer>
  );
}

