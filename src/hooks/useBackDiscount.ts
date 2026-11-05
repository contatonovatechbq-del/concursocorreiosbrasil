import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

export const BACK_DISCOUNT_RATE = 0.4;
export const BACK_DISCOUNT_FLOOR = 18;

/** Preço após N tentativas de voltar: -40% a cada vez, nunca abaixo de R$ 18. */
export const discountedValue = (base: number, level: number): number => {
  if (base <= BACK_DISCOUNT_FLOOR) return base;
  let v = base;
  for (let i = 0; i < level; i++) v = Math.max(BACK_DISCOUNT_FLOOR, Math.round(v * (1 - BACK_DISCOUNT_RATE) * 100) / 100);
  return v;
};

/**
 * Back redirect: cada vez que a pessoa tenta voltar, segura na página
 * e dá mais 40% de desconto, até chegar em R$ 18.
 */
export const useBackDiscount = (storageKey: string, base: number | undefined) => {
  const key = `back_discount_${storageKey}`;
  const [level, setLevel] = useState<number>(() => Number(sessionStorage.getItem(key) || 0));

  useEffect(() => {
    if (!base) return;
    const atFloor = discountedValue(base, level) <= BACK_DISCOUNT_FLOOR;
    if (atFloor) return;
    window.history.pushState(window.history.state, "", window.location.href);
    const onPop = () => {
      const next = level + 1;
      sessionStorage.setItem(key, String(next));
      const v = discountedValue(base, next);
      toast({ title: "🎁 Espere! Desconto de 40% liberado", description: `Sua taxa agora sai por R$ ${v.toFixed(2).replace(".", ",")}. Um novo PIX foi gerado.` });
      setLevel(next);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [base, level, key]);

  return { level, value: base ? discountedValue(base, level) : base };
};
