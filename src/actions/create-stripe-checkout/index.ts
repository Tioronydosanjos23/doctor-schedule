"use server";

import Stripe from "stripe";

import { protectedActionClient } from "@/lib/next-safe-action";

export const createStripeCheckout = protectedActionClient.action(
  async ({ ctx }) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        success: false as const,
        error: "Chave secreta do Stripe não configurada. Entre em contato com o suporte.",
      };
    }
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-05-28.basil",
      });
      const { id: sessionId } = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?payment=cancelled`,
        subscription_data: {
          metadata: {
            userId: ctx.user.id,
          },
        },
        line_items: [
          {
            price: process.env.STRIPE_ESSENTIAL_PLAN_PRICE_ID,
            quantity: 1,
          },
        ],
      });
      return {
        success: true as const,
        sessionId,
      };
    } catch (error) {
      console.error("Erro ao criar sessão Stripe:", error);
      return {
        success: false as const,
        error: "Erro ao processar pagamento. Tente novamente mais tarde.",
      };
    }
  },
);
