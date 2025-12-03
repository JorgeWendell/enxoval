import { getLaundryItems } from "@/actions/get-laundry-items";
import { PageContainer } from "@/components/ui/page-container";
import { RegisterWashForm } from "./components/register-wash-form";

export default async function LavarPage() {
  const result = await getLaundryItems({ status: "coletado" });

  if (!result?.data?.data) {
    return (
      <PageContainer>
        <div>Erro ao carregar itens</div>
      </PageContainer>
    );
  }

  const items = result.data.data;

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Registrar Lavagem</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Selecione os itens coletados que foram lavados
          </p>
        </div>

        <RegisterWashForm items={items} />
      </div>
    </PageContainer>
  );
}

