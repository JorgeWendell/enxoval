import { getRoomById } from "@/actions/get-room-by-id";
import { startCleaningChecklist } from "@/actions/start-cleaning-checklist";
import { initializeChecklistItems } from "@/actions/initialize-checklist-items";
import { getCleaningChecklist } from "@/actions/get-cleaning-checklist";
import { PageContainer } from "@/components/ui/page-container";
import { CleaningChecklistForm } from "./components/cleaning-checklist-form";
import { redirect } from "next/navigation";

export default async function LimpezaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const queryParams = await searchParams;

  const roomResult = await getRoomById({ id });

  if (!roomResult?.data?.data) {
    return (
      <PageContainer>
        <div>Quarto não encontrado</div>
      </PageContainer>
    );
  }

  const room = roomResult.data.data;

  let checklistId = queryParams.checklistId as string | undefined;

  if (!checklistId) {
    const startResult = await startCleaningChecklist({ roomId: id });

    if (startResult?.data?.error) {
      return (
        <PageContainer>
          <div className="text-destructive">{startResult.data.error}</div>
        </PageContainer>
      );
    }

    if (startResult?.data?.data?.checklist) {
      checklistId = startResult.data.data.checklist.id;

      const itemsCheck = await getCleaningChecklist({ checklistId });
      const hasItems =
        itemsCheck?.data?.data?.items && itemsCheck.data.data.items.length > 0;

      if (!hasItems) {
        const initResult = await initializeChecklistItems({
          checklistId,
          roomId: id,
        });

        if (initResult?.data?.error) {
          return (
            <PageContainer>
              <div className="text-destructive">{initResult.data.error}</div>
            </PageContainer>
          );
        }
      } else {
        const initResult = await initializeChecklistItems({
          checklistId,
          roomId: id,
        });

        if (initResult?.data?.error) {
          return (
            <PageContainer>
              <div className="text-destructive">{initResult.data.error}</div>
            </PageContainer>
          );
        }
      }

      redirect(`/quartos/${id}/limpeza?checklistId=${checklistId}`);
    }
  }

  if (!checklistId) {
    return (
      <PageContainer>
        <div>Erro ao criar checklist</div>
      </PageContainer>
    );
  }

  const checklistResult = await getCleaningChecklist({ checklistId });

  if (!checklistResult?.data?.data) {
    return (
      <PageContainer>
        <div>Erro ao carregar checklist</div>
      </PageContainer>
    );
  }

  const { checklist, items, currentRoomItems } = checklistResult.data.data;

  return (
    <PageContainer>
      <CleaningChecklistForm
        checklist={checklist}
        items={items}
        currentRoomItems={currentRoomItems}
        room={room}
      />
    </PageContainer>
  );
}
