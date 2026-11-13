"use client";

/** Billetera de revisión (fixture): con o sin SubasCoins para cubrir la consignación de Ganá Ya.
 *  Se elige en el panel «Opciones Ganá Ya» y se recuerda en este navegador. No hay backend. */
import { useSyncExternalStore } from "react";

/** Importe local necesario para habilitar Ganá Ya; no es una consignación. */
export const GANAYA_FEE_HABILITACION_SC = 50;
export const WALLETS = [
  { id: "con-fondos", label: "Con fondos (>S< 50)", balance: 50 },
  { id: "sin-fondos", label: "Sin fondos (>S< 0)", balance: 0 },
] as const;
export type WalletId = (typeof WALLETS)[number]["id"];

const KEY = "ganaya-wallet";
let current: WalletId | null = null;
const listeners = new Set<() => void>();
function read(): WalletId {
  if (current) return current;
  let v: string | null = null;
  try { v = new URLSearchParams(window.location.search).get("billetera") ?? window.localStorage.getItem(KEY); } catch { /* sin storage */ }
  current = WALLETS.some((w) => w.id === v) ? (v as WalletId) : WALLETS[0].id;
  return current;
}
export function setWallet(id: WalletId) {
  current = id;
  try { window.localStorage.setItem(KEY, id); } catch { /* sin storage */ }
  listeners.forEach((l) => l());
}
export function useWallet(): WalletId {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, read, () => WALLETS[0].id);
}
export const balanceOf = (id: WalletId) => WALLETS.find((w) => w.id === id)?.balance ?? 0;
