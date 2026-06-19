"use client";
import { loadStripe } from "@stripe/stripe-js";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { activateTrial } from "@/actions/activate-trial";
import { createStripeCheckout } from "@/actions/create-stripe-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SubscriptionPlanProps {
  active?: boolean;
  className?: string;
  userEmail: string;
}

export function SubscriptionPlan({
  active = false,
  className,
  userEmail,
}: SubscriptionPlanProps) {
  const router = useRouter();
  const [showMulticaixa, setShowMulticaixa] = useState(false);

  const createStripeCheckoutAction = useAction(createStripeCheckout, {
    onSuccess: async ({ data }) => {
      if (!data?.success) {
        toast.error(data?.error ?? "Erro ao processar pagamento.");
        return;
      }
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        toast.error("Chave pública do Stripe não configurada.");
        return;
      }
      try {
        const stripe = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        );
        if (!stripe) throw new Error("Stripe not found");
        if (!data?.sessionId) throw new Error("Session ID not found");
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } catch {
        toast.error("Erro ao redirecionar para o pagamento.");
      }
    },
    onError: () => {
      toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
    },
  });

  const activateTrialAction = useAction(activateTrial, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success("Teste gratuito ativado! Aproveite seus 30 dias.");
        router.push("/dashboard");
      } else {
        toast.info(data?.message || "Não foi possível ativar o teste.");
      }
    },
    onError: () => {
      toast.error("Erro ao ativar teste gratuito.");
    },
  });

  const features = [
    "Cadastro de até 3 médicos",
    "Agendamentos ilimitados",
    "Métricas básicas",
    "Cadastro de pacientes",
    "Confirmação manual",
    "Suporte via e-mail",
  ];

  const multicaixaSteps = [
    "Abra o aplicativo MCX Express no seu celular",
    "Vá em \"Pagamentos\" > \"Pagamento de serviços\"",
    "Digite a Entidade, Referência e Valor mostrados abaixo",
    "Confirme o pagamento com seu PIN",
    "Pronto! Sua assinatura será ativada automaticamente",
  ];

  return (
    <div
      className={`${className ?? ""} bg-card overflow-hidden rounded-2xl border shadow-sm`}
    >
      {/* Card Header — usa bg-primary do design system */}
      <div className="bg-primary px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-foreground/70 mb-1 text-xs font-medium tracking-widest uppercase">
              Plano
            </p>
            <h3 className="text-primary-foreground text-2xl font-bold">
              Essential
            </h3>
          </div>
          {active && (
            <Badge className="border-primary-foreground/30 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 text-xs">
              ✓ Ativo
            </Badge>
          )}
        </div>
        <p className="text-primary-foreground/70 mt-3 text-sm">
          Para profissionais autônomos ou pequenas clínicas
        </p>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-primary-foreground text-4xl font-bold">
            Kz 59
          </span>
          <span className="text-primary-foreground/70">/mês</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 py-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <CheckCircle2 className="text-primary h-4 w-4 shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2.5">
          {!active && (
            <Button
              className="w-full"
              size="lg"
              onClick={() => activateTrialAction.execute()}
              disabled={activateTrialAction.isExecuting}
            >
              {activateTrialAction.isExecuting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Começar Teste Grátis de 30 Dias
                </>
              )}
            </Button>
          )}

          {active ? (
            <Button
              className="w-full"
              size="lg"
              onClick={() =>
                router.push(
                  `${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL}?prefilled_email=${userEmail}`,
                )
              }
            >
              Gerenciar assinatura
            </Button>
          ) : (
            <>
              {/* Stripe / Cartão */}
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => createStripeCheckoutAction.execute()}
                disabled={createStripeCheckoutAction.isExecuting}
              >
                {createStripeCheckoutAction.isExecuting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pagar com Cartão (Visa/Mastercard)
                  </>
                )}
              </Button>

              {/* Multicaixa */}
              {!showMulticaixa ? (
                <Button
                  className="w-full"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowMulticaixa(true)}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Pagar com Multicaixa Express
                </Button>
              ) : (
                <Card className="border-2 border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Smartphone className="h-5 w-5 text-green-600" />
                      Pagamento via MCX Express
                    </CardTitle>
                    <CardDescription>
                      Pague usando o aplicativo Multicaixa Express
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Dados da referência */}
                    <div className="rounded-lg bg-muted p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground text-xs">
                            Entidade
                          </span>
                          <p className="text-lg font-bold tracking-widest">
                            99999
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-xs">
                            Referência
                          </span>
                          <p className="text-lg font-bold tracking-widest">
                            123 456 789
                          </p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground text-xs">
                            Valor
                          </span>
                          <p className="text-lg font-bold">Kz 59,00</p>
                        </div>
                      </div>
                    </div>

                    {/* Passos */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Como pagar:
                      </p>
                      <ol className="list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                        {multicaixaSteps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <Button className="w-full" size="lg" asChild>
                      <a
                        href="https://multicaixa.ao"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir MCX Express
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {!active && (
          <>
            <Separator className="my-4" />
            <p className="text-center text-xs text-muted-foreground">
              🔒 Pagamento 100% seguro via Rede Multicaixa / Stripe
            </p>
          </>
        )}
      </div>
    </div>
  );
}
