import { getRooms } from "@/actions/get-rooms";
import { PageContainer } from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BedDouble } from "lucide-react";
import { CreateRoomDialog } from "./components/create-room-dialog";
import { PageHeader, PageActions } from "@/components/ui/page-container";
import { RoomsFilters } from "./components/rooms-filters";

const statusColors = {
  disponivel: "bg-green-500",
  ocupado: "bg-red-500",
  limpeza: "bg-yellow-500",
  manutencao: "bg-gray-500",
  reservado: "bg-blue-500",
};

const statusLabels = {
  disponivel: "Disponível",
  ocupado: "Ocupado",
  limpeza: "Limpeza",
  manutencao: "Manutenção",
  reservado: "Reservado",
};

export default async function QuartosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const result = await getRooms({
    status: params.status as any,
    type: params.type as any,
    floor: params.floor ? Number(params.floor) : undefined,
    search: params.search as string,
  });

  if (!result?.data?.data) {
    return (
      <PageContainer>
        <div>Erro ao carregar quartos</div>
      </PageContainer>
    );
  }

  const rooms = result.data.data;

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Quartos</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Gerencie os 89 quartos do hotel
            </p>
          </div>
          <PageActions>
            <CreateRoomDialog />
          </PageActions>
        </PageHeader>

        <RoomsFilters />

        {rooms.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nenhum quarto encontrado com os filtros aplicados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Link key={room.id} href={`/quartos/${room.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BedDouble className="h-5 w-5" />
                        Quarto {room.number}
                      </CardTitle>
                      <Badge
                        className={`${statusColors[room.status]} text-white`}
                      >
                        {statusLabels[room.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Andar:</span> {room.floor}
                      </p>
                      <p>
                        <span className="font-medium">Tipo:</span> {room.type}
                      </p>
                      <p>
                        <span className="font-medium">Capacidade:</span>{" "}
                        {room.capacity} pessoas
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
