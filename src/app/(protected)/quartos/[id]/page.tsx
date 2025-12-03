import { getRoomById } from "@/actions/get-room-by-id";
import { getLinenItems } from "@/actions/get-linen-items";
import { PageContainer } from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDouble, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EditRoomDialog } from "../components/edit-room-dialog";
import { UpdateRoomStatusDialog } from "../components/update-room-status-dialog";
import { Sparkles } from "lucide-react";

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

export default async function QuartoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const roomResult = await getRoomById({ id });
  const linenResult = await getLinenItems({ roomId: id });

  if (!roomResult?.data?.data) {
    return (
      <PageContainer>
        <div>Quarto não encontrado</div>
      </PageContainer>
    );
  }

  const room = roomResult.data.data;
  const linenItems = linenResult?.data?.data || [];

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/quartos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 md:text-3xl">
              <BedDouble className="h-5 w-5 md:h-6 md:w-6" />
              Quarto {room.number}
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">Detalhes do quarto</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações do Quarto</CardTitle>
                <EditRoomDialog
                  roomId={room.id}
                  defaultValues={{
                    number: room.number,
                    floor: room.floor,
                    type: room.type,
                    capacity: room.capacity,
                    description: room.description,
                    status: room.status,
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={`${statusColors[room.status]} text-white mt-1`}
                  >
                    {statusLabels[room.status]}
                  </Badge>
                </div>
                <UpdateRoomStatusDialog
                  roomId={room.id}
                  currentStatus={room.status}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Andar</p>
                <p className="font-medium">{room.floor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{room.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacidade</p>
                <p className="font-medium">{room.capacity} pessoas</p>
              </div>
              {room.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Descrição</p>
                  <p className="font-medium">{room.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Enxovais do Quarto</CardTitle>
                <Link href={`/quartos/${room.id}/limpeza`}>
                  <Button>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Iniciar Limpeza
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {linenItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum enxoval atribuído a este quarto
                </p>
              ) : (
                <div className="space-y-2">
                  {linenItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {item.linenTypeName || `Item #${item.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.status}
                          {item.description && ` • ${item.description}`}
                        </p>
                      </div>
                      <Badge variant="outline">{item.condition}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

