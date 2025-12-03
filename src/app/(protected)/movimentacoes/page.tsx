import { PageContainer } from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { getMovements } from "@/actions/get-movements";
import { db } from "@/db/index";
import { roomsTable, usersTable } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { MovementsFilters } from "./components/movements-filters";

const movementTypeLabels = {
  entrada: "Entrada",
  saida: "Saída",
  lavagem: "Lavagem",
  descarte: "Descarte",
  transferencia: "Transferência",
};

export default async function MovimentacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const movementsResult = await getMovements({
    movementType: params.movementType as any,
    roomId: params.roomId as string,
    limit: 50,
  });

  if (!movementsResult?.data?.data) {
    return (
      <PageContainer>
        <div>Erro ao carregar movimentações</div>
      </PageContainer>
    );
  }

  const movements = movementsResult.data.data;

  const roomIds = [
    ...new Set([
      ...movements
        .map((m) => m.fromRoomId)
        .filter((id): id is string => id !== null),
      ...movements
        .map((m) => m.toRoomId)
        .filter((id): id is string => id !== null),
    ]),
  ];

  const userIds = [
    ...new Set(
      movements
        .map((m) => m.userId)
        .filter((id): id is string => id !== null)
    ),
  ];

  const rooms =
    roomIds.length > 0
      ? await db
          .select()
          .from(roomsTable)
          .where(inArray(roomsTable.id, roomIds))
      : [];

  const users =
    userIds.length > 0
      ? await db
          .select()
          .from(usersTable)
          .where(inArray(usersTable.id, userIds))
      : [];

  const roomsMap = new Map(rooms.map((r) => [r.id, r.number]));
  const usersMap = new Map(users.map((u) => [u.id, u.name]));

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 md:text-3xl">
            <ClipboardList className="h-5 w-5 md:h-6 md:w-6" />
            Movimentações
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Histórico de movimentações de enxovais
          </p>
        </div>

        <MovementsFilters />

        <Card>
          <CardHeader>
            <CardTitle>Últimas Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center">
                Nenhuma movimentação encontrada com os filtros aplicados
              </p>
            ) : (
              <div className="space-y-2">
                {movements.map((movement) => (
                  <div
                    key={movement.id}
                    className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {
                          movementTypeLabels[
                            movement.movementType as keyof typeof movementTypeLabels
                          ]
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {usersMap.get(movement.userId) || "Usuário desconhecido"} •{" "}
                        {new Date(movement.createdAt).toLocaleString("pt-BR")}
                      </p>
                      {(movement.fromRoomId || movement.toRoomId) && (
                        <p className="text-xs text-muted-foreground">
                          {movement.fromRoomId &&
                            `De: Quarto ${roomsMap.get(movement.fromRoomId) || movement.fromRoomId}`}
                          {movement.fromRoomId && movement.toRoomId && " → "}
                          {movement.toRoomId &&
                            `Para: Quarto ${roomsMap.get(movement.toRoomId) || movement.toRoomId}`}
                        </p>
                      )}
                      {movement.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {movement.notes}
                        </p>
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
