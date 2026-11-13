"use client";

/**
 * Notificaciones (27/10, pedido de Aaron): las novedades de Mi Garaje (en negrita y con punto en Tu actividad) no se ven si no
 * estás en Mi Garaje. Esta capa vive en el shell de la maqueta VMC (Chrome · vmc), así que se ve en todas sus páginas.
 * Diez formas para comparar desde el panel «Notificaciones» (?notif=…). Cada una usa piezas del DS: el degradado primary del
 * «Bienvenido» (naranja → violeta), el punto magenta (#CC00FF → #FF0066) de las filas sin abrir, el ícono de vidrio «alertas»
 * de app/iconos y las tarjetas blancas con sombra violeta de Mi Garaje.
 * Simulación: llega una novedad cada 20 s (o «Llega una ahora»); el número entra con rebote. Al cambiar de forma, la llegada
 * se repite desde una. Tocar una novedad la marca leída y lleva a Mi Garaje.
 */
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { JSX, ReactNode } from "react";
import { createPortal } from "react-dom";
import { LabPanel } from "./LabPanel";
import { Vidrio } from "@/src/product/ganaya/mi-garaje/app/iconos/Vidrio";
import "./notifs.css";

export type NotifMode = "campana" | "vidrio" | "bienvenido" | "avatar" | "previa" | "isla" | "banda" | "toast" | "caja" | "fab";
export const NOTIF_MODES: { id: NotifMode; label: string; where: string; hint: string }[] = [
  { id: "campana", label: "Campana", where: "Header", hint: "Botón redondo con el degradado primary del «Bienvenido», campana blanca y número magenta. Abre la bandeja." },
  { id: "vidrio", label: "Campana de vidrio", where: "Header", hint: "La campana esmerilada del DS (íconos de vidrio) en un círculo translúcido; número magenta. Abre la bandeja." },
  { id: "previa", label: "Campana + vista previa", where: "Header", hint: "Como «Campana», y cuando llega algo baja un globo con el mensaje 5 s y se recoge en el número." },
  { id: "bienvenido", label: "En «Bienvenido»", where: "Header", hint: "El número magenta en la esquina derecha del botón «Bienvenido». Tocarlo abre la bandeja." },
  { id: "avatar", label: "En el avatar", where: "Header", hint: "El número sobre el avatar, en la esquina izquierda del «Bienvenido»." },
  { id: "isla", label: "Isla", where: "Header", hint: "Una píldora oscura en el centro del header («2 novedades») que se estira para mostrar cada novedad 4 s." },
  { id: "banda", label: "Banda", where: "Bajo el header", hint: "Una franja bajo el header en todas las páginas: «Tienes 2 novedades» + la última + «Ver»." },
  { id: "toast", label: "Toast fijo", where: "Flotante", hint: "Tarjeta arriba a la derecha con la última novedad; no se va sola, se cierra o se ve. «+1» si hay más." },
  { id: "caja", label: "Caja", where: "Flotante", hint: "Una caja entra por la derecha con las últimas 3 novedades; se pliega a una pestaña en el borde." },
  { id: "fab", label: "Botón flotante", where: "Flotante", hint: "Un botón redondo abajo a la derecha con campana y número; al llegar algo asoma «Nueva novedad». Abre la bandeja." },
];

/** Sonidos (27/10): de Freesound (CC0) y Mixkit, uso comercial sin atribución (public/sonidos/LICENCIAS.md). Pensados como mensaje que entra a la
 *  bandeja. `vol` empareja el volumen percibido; `veces` repite el archivo (Toc-toc = dos golpes del martillo, como tocar la puerta).
 *  Los agregados el 27/10 en la tarde (versiones «2, 3…», Motores, En la pista y Videojuego de carreras) ya vienen recortados y nivelados
 *  a −18 LUFS, por eso van con vol 1. */
export const SONIDOS: { id: string; file?: string; grupo: string; label: string; vol: number; veces?: number; gap?: number }[] = [
  { id: "", grupo: "Sin sonido", label: "Ninguno", vol: 0 },
  { id: "mensaje-burbuja", grupo: "Mensaje", label: "Burbuja 1", vol: 1 },
  { id: "mensaje-burbuja-2", grupo: "Mensaje", label: "Burbuja 2", vol: 1 },
  { id: "mensaje-burbuja-3", grupo: "Mensaje", label: "Burbuja 3", vol: 1 },
  { id: "mensaje-clasico", grupo: "Mensaje", label: "Clásico", vol: 1 },
  { id: "mensaje-chime", grupo: "Mensaje", label: "Chime 1", vol: 1 },
  { id: "mensaje-chime-2", grupo: "Mensaje", label: "Chime 2", vol: 1 },
  { id: "mensaje-chime-3", grupo: "Mensaje", label: "Chime 3", vol: 1 },
  { id: "mensaje-dos-notas", grupo: "Mensaje", label: "Dos notas 1", vol: 1 },
  { id: "mensaje-dos-notas-2", grupo: "Mensaje", label: "Dos notas 2", vol: 1 },
  { id: "mensaje-gota", grupo: "Mensaje", label: "Gota", vol: .6 },
  { id: "mensaje-ding-dong", grupo: "Mensaje", label: "Ding-dong", vol: 1 },
  { id: "mensaje-campanita", grupo: "Campanitas", label: "Campanita 1", vol: 1 },
  { id: "mensaje-campanita-2", grupo: "Campanitas", label: "Campanita 2", vol: 1 },
  { id: "mensaje-campanita-3", grupo: "Campanitas", label: "Campanita 3", vol: 1 },
  { id: "mensaje-campanita-4", grupo: "Campanitas", label: "Campanita 4", vol: 1 },
  { id: "mensaje-campanita-5", grupo: "Campanitas", label: "Campanita 5", vol: 1 },
  { id: "mensaje-campanita-6", grupo: "Campanitas", label: "Campanita 6", vol: 1 },
  { id: "mensaje-campanita-7", grupo: "Campanitas", label: "Campanita 7", vol: 1 },
  { id: "mensaje-campanita-8", grupo: "Campanitas", label: "Campanita 8", vol: 1 },
  { id: "subasta-timbre", grupo: "Timbre de mostrador", label: "Timbre 1", vol: .8 },
  { id: "subasta-timbre-2", grupo: "Timbre de mostrador", label: "Timbre 2", vol: 1 },
  { id: "subasta-timbre-3", grupo: "Timbre de mostrador", label: "Timbre 3", vol: 1 },
  { id: "subasta-timbre-4", grupo: "Timbre de mostrador", label: "Timbre 4", vol: 1 },
  { id: "subasta-timbre-5", grupo: "Timbre de mostrador", label: "Timbre 5", vol: 1 },
  { id: "subasta-timbre-6", grupo: "Timbre de mostrador", label: "Timbre 6", vol: 1 },
  { id: "subasta-timbre-7", grupo: "Timbre de mostrador", label: "Campana de mano", vol: 1 },
  { id: "subasta-toctoc", file: "subasta-martillo", grupo: "Subastas y casino", label: "Toc-toc", vol: 1, veces: 2, gap: 170 },
  { id: "subasta-martillo", grupo: "Subastas y casino", label: "Martillo 1", vol: 1 },
  { id: "subasta-martillo-2", grupo: "Subastas y casino", label: "Martillo 2", vol: 1 },
  { id: "subasta-martillo-3", grupo: "Subastas y casino", label: "Martillo 3", vol: 1 },
  { id: "subasta-vendido", grupo: "Subastas y casino", label: "¡Vendido!", vol: 1 },
  { id: "casino-fichas", grupo: "Subastas y casino", label: "Fichas de póker", vol: .7 },
  { id: "casino-moneda", grupo: "Subastas y casino", label: "Moneda", vol: .7 },
  { id: "casino-tragamonedas", grupo: "Subastas y casino", label: "Tragamonedas", vol: 1 },
  { id: "casino-caja", grupo: "Subastas y casino", label: "Caja registradora 1", vol: .6 },
  { id: "casino-caja-2", grupo: "Subastas y casino", label: "Caja registradora 2", vol: 1 },
  { id: "carrera-alarma", grupo: "Autos", label: "Alarma al cerrar", vol: .9 },
  { id: "carrera-seguro", grupo: "Autos", label: "Seguro del auto", vol: .7 },
  { id: "carrera-seguro-3", grupo: "Autos", label: "Seguro electrónico", vol: 1 },
  { id: "carrera-bocina-doble", grupo: "Autos", label: "Bocina 1 · doble", vol: .7 },
  { id: "carrera-bocina-corta", grupo: "Autos", label: "Bocina 2 · corta", vol: .75 },
  { id: "carrera-bocina-3", grupo: "Autos", label: "Bocina clásica", vol: 1 },
  { id: "carrera-bocina-4", grupo: "Autos", label: "Bocina 4", vol: 1 },
  { id: "carrera-bocina-5", grupo: "Autos", label: "Bocina «bip bip»", vol: 1 },
  { id: "carrera-bocina-6", grupo: "Autos", label: "Bocina de Mini", vol: 1 },
  { id: "carrera-bocina-camion", grupo: "Autos", label: "Bocina de camión", vol: 1 },
  { id: "carrera-puerta", grupo: "Autos", label: "Puerta al cerrar", vol: 1 },
  { id: "carrera-puerta-2", grupo: "Autos", label: "Portazo", vol: 1 },
  { id: "carrera-llave", grupo: "Autos", label: "Llave en el contacto", vol: 1 },
  { id: "carrera-arranque", grupo: "Autos", label: "Arranque 1", vol: 1 },
  { id: "carrera-arranque-2", grupo: "Autos", label: "Arranque 2", vol: 1 },
  { id: "carrera-arranque-3", grupo: "Autos", label: "Arranque 3", vol: 1 },
  { id: "carrera-motor", grupo: "Motores", label: "Rugido 1", vol: .6 },
  { id: "motor-rugido-2", grupo: "Motores", label: "Rugido 2 · V8", vol: 1 },
  { id: "motor-rugido-3", grupo: "Motores", label: "Rugido 3 · V12", vol: 1 },
  { id: "motor-rugido-4", grupo: "Motores", label: "Rugido 4", vol: 1 },
  { id: "motor-rugido-5", grupo: "Motores", label: "Rugido 5 · AMG", vol: 1 },
  { id: "motor-rugido-6", grupo: "Motores", label: "Rugido 6 · Lambo", vol: 1 },
  { id: "motor-acelera", grupo: "Motores", label: "Superauto acelera", vol: 1 },
  { id: "motor-moto", grupo: "Motores", label: "Moto 1", vol: 1 },
  { id: "motor-moto-2", grupo: "Motores", label: "Moto 2 · cambio", vol: 1 },
  { id: "motor-moto-3", grupo: "Motores", label: "Moto 3", vol: 1 },
  { id: "motor-petardeo", grupo: "Motores", label: "Petardeo 1", vol: 1 },
  { id: "motor-petardeo-2", grupo: "Motores", label: "Petardeo 2", vol: 1 },
  { id: "motor-cambio", grupo: "Motores", label: "Cambio de marcha", vol: 1 },
  { id: "motor-cambio-2", grupo: "Motores", label: "Cambio de marcha 2", vol: 1 },
  { id: "motor-nitro", grupo: "Motores", label: "Nitro", vol: 1 },
  { id: "motor-turbo", grupo: "Motores", label: "Turbo", vol: 1 },
  { id: "carrera-radio", grupo: "En la pista", label: "Radio de F1", vol: 1 },
  { id: "carrera-pasada", grupo: "En la pista", label: "Pasada 1", vol: .7 },
  { id: "carrera-pasada-2", grupo: "En la pista", label: "Pasada 2", vol: 1 },
  { id: "carrera-pasada-3", grupo: "En la pista", label: "Pasada 3", vol: 1 },
  { id: "carrera-pasada-4", grupo: "En la pista", label: "Zumbido veloz", vol: 1 },
  { id: "carrera-derrape", grupo: "En la pista", label: "Derrape 1", vol: .55 },
  { id: "carrera-derrape-2", grupo: "En la pista", label: "Derrape 2", vol: 1 },
  { id: "carrera-derrape-3", grupo: "En la pista", label: "Derrape 3", vol: 1 },
  { id: "carrera-derrape-4", grupo: "En la pista", label: "Derrape 4", vol: 1 },
  { id: "carrera-derrape-5", grupo: "En la pista", label: "Derrape 5", vol: 1 },
  { id: "juego-semaforo", grupo: "Videojuego de carreras", label: "Semáforo 1", vol: 1 },
  { id: "juego-semaforo-2", grupo: "Videojuego de carreras", label: "Semáforo 2", vol: 1 },
  { id: "juego-semaforo-3", grupo: "Videojuego de carreras", label: "Semáforo 3", vol: 1 },
  { id: "juego-semaforo-4", grupo: "Videojuego de carreras", label: "Listos (8-bit)", vol: 1 },
  { id: "juego-largada", grupo: "Videojuego de carreras", label: "Chicharra de largada", vol: 1 },
  { id: "juego-vuelta", grupo: "Videojuego de carreras", label: "Vuelta completa", vol: 1 },
  { id: "juego-vuelta-rapida", grupo: "Videojuego de carreras", label: "Vuelta rápida", vol: 1 },
  { id: "juego-moneda", grupo: "Videojuego de carreras", label: "Moneda retro 1", vol: 1 },
  { id: "juego-moneda-2", grupo: "Videojuego de carreras", label: "Moneda retro 2", vol: 1 },
  { id: "juego-moneda-3", grupo: "Videojuego de carreras", label: "Moneda retro 3", vol: 1 },
  { id: "juego-moneda-4", grupo: "Videojuego de carreras", label: "Moneda retro 4", vol: 1 },
  { id: "juego-powerup", grupo: "Videojuego de carreras", label: "Power-up 1", vol: 1 },
  { id: "juego-powerup-2", grupo: "Videojuego de carreras", label: "Power-up 2", vol: 1 },
  { id: "juego-powerup-3", grupo: "Videojuego de carreras", label: "Bonus", vol: 1 },
  { id: "juego-boost", grupo: "Videojuego de carreras", label: "Boost arcade", vol: 1 },
  { id: "juego-checkpoint", grupo: "Videojuego de carreras", label: "Checkpoint", vol: 1 },
  { id: "juego-mision", grupo: "Videojuego de carreras", label: "Misión cumplida", vol: 1 },
  { id: "juego-logo", grupo: "Videojuego de carreras", label: "Intro de carrera retro", vol: 1 },
];
let audio: HTMLAudioElement[] = [];
let timers: ReturnType<typeof setTimeout>[] = [];
// Quién está sonando (o si el navegador lo bloqueó), para que el panel lo muestre.
type SndState = { id: string; state: "on" | "off" | "blocked" };
const sndListeners = new Set<(x: SndState) => void>();
const emit = (x: SndState) => sndListeners.forEach((f) => f(x));
/** Suena una vez (corta la anterior). El navegador solo deja sonar después de un clic en la página. */
function play(id: string) {
  const s = SONIDOS.find((x) => x.id === id); if (!s || !s.id) return;
  audio.forEach((a) => a.pause()); timers.forEach(clearTimeout); audio = []; timers = []; emit({ id: "", state: "off" });
  const n = s.veces ?? 1, src = `/producto-assets/ganaya/sonidos/${s.file ?? s.id}.mp3`;
  for (let k = 0; k < n; k++) timers.push(setTimeout(() => {
    try { const a = new Audio(src); a.volume = s.vol; audio.push(a);
      if (k === n - 1) a.onended = () => emit({ id: s.id, state: "off" });
      a.play().then(() => { if (k === 0) emit({ id: s.id, state: "on" }); }).catch(() => emit({ id: s.id, state: "blocked" })); } catch { emit({ id: s.id, state: "blocked" }); }
  }, k * (s.gap ?? 0)));
}
function useSnd(): SndState {
  const [x, setX] = useState<SndState>({ id: "", state: "off" });
  useEffect(() => { sndListeners.add(setX); return () => { sndListeners.delete(setX); }; }, []);
  return x;
}

type Item = { n: number; photo: string; title: string; body: string; href: string; targetRowId?: string; at: number; read: boolean };
/** Novedad contextual emitida por un flujo real del lab (no por el carrusel de ejemplos). */
export type NotifArrival = Omit<Item, "n" | "at" | "read">;
const ARRIVE_EVENT = "vmc:notificacion-llega";
export const NOTIF_OPEN_EVENT = "vmc:abrir-notificacion";
/** Permite que un flujo hijo anuncie una novedad en el shell: caja → campana de vidrio. */
export function notifyArrival(item: NotifArrival): void {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<NotifArrival>(ARRIVE_EVENT, { detail: item }));
}
const FEED: Omit<Item, "n" | "at" | "read">[] = [
  { photo: "sentra", title: "El vendedor respondió tu propuesta", body: "Nissan Sentra 2020 · te pide US$ 4,800", href: "/m/vmc#sec-negociaciones" },
  { photo: "nivus", title: "Nueva propuesta por tu Volkswagen Nivus", body: "Comprador 3 te ofrece US$ 17,200", href: "/m/vmc#sec-negociaciones" },
  { photo: "accent", title: "Tu subasta empieza en 10 min", body: "Hyundai Accent 2018 · la sala abre a la 1:00 pm", href: "/m/vmc#sec-participaciones" },
  { photo: "rio", title: "¡Ganaste la subasta!", body: "Kia Rio 2021 · el vendedor te evalúa", href: "/m/vmc#sec-participaciones" },
  { photo: "mazda3", title: "Tu propuesta vence en 1 hora", body: "Mazda 3 2018 · el vendedor aún no responde", href: "/m/vmc#sec-negociaciones" },
];
const photo = (slug: string) => `/producto-assets/ganaya/garage-photos/${slug}/1.jpg`;
const ago = (t: number, now: number) => { const s = Math.max(0, Math.round((now - t) / 1000)); return s < 60 ? "Ahora" : s < 3600 ? `Hace ${Math.floor(s / 60)} min` : `Hace ${Math.floor(s / 3600)} h`; };
const KEY = "mg-notif";
const make = (n: number): Item => ({ ...FEED[n % FEED.length], n, at: Date.now(), read: false });

type Ctx = { mode: NotifMode; items: Item[]; unread: number; last: Item | undefined; tick: number; inbox: boolean; setInbox: (v: boolean) => void;
  open: (it: Item) => void; readAll: () => void; arrive: (item?: NotifArrival) => void };
const C = createContext<Ctx | null>(null);
const useN = () => useContext(C)!;

/** Estado de la simulación + el panel del lab. Envuelve el shell; las piezas (header, banda, flotantes) leen de aquí. */
export function NotifProvider({ children }: { children: ReactNode }): JSX.Element {
  // Una sola receta aprobada: la caja anuncia la llegada y la campana de vidrio
  // conserva las novedades acumuladas.
  const [mode] = useState<NotifMode>("vidrio");
  const [items, setItems] = useState<Item[]>([]);
  const [tick, setTick] = useState(0); // sube con cada llegada (las animaciones se reinician con key={tick})
  const [every, setEvery] = useState(0); // Ganá Ya (12/11): sin el carrusel de notificaciones de ejemplo; solo llegadas reales
  const [inbox, setInbox] = useState(false);
  const [tab, setTab] = useState(true);
  const sonidoRef = useRef("mensaje-gota");
  const everyRef = useRef(every); everyRef.current = every; // apagadas: cambiar de forma no hace llegar una sola
  const seq = useRef(0);
  const arrive = useCallback((item?: NotifArrival) => { const n = seq.current++; const it: Item = item ? { ...item, n, at: Date.now(), read: false } : make(n); setItems((xs) => [it, ...xs].slice(0, 12)); setTick((t) => t + 1); play(sonidoRef.current); }, []);
  // Garaje vive dentro de este shell pero construye su árbol antes que <Chrome>.
  // El evento evita depender de un Context todavía inexistente y conserva una única
  // ruta visual para todas las llegadas: caja flotante y luego campana de vidrio.
  useEffect(() => { const receive = (e: Event) => arrive((e as CustomEvent<NotifArrival>).detail); addEventListener(ARRIVE_EVENT, receive); return () => removeEventListener(ARRIVE_EVENT, receive); }, [arrive]);
  // La primera llegada permite comprobar la transición caja → campana apenas se abre la demo.
  const first = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (everyRef.current) first.current = setTimeout(arrive, 450); return () => clearTimeout(first.current); }, [arrive]);
  useEffect(() => { if (!every) return; const t = setInterval(arrive, every * 1000); return () => clearInterval(t); }, [every, arrive, mode]);
  const pickEvery = (n: number) => { setEvery(n); try { localStorage.setItem(KEY + "-every", String(n)); } catch { /* idem */ } };
  const unread = items.filter((x) => !x.read).length;
  // Pestaña del navegador: «(2) …» delante del título.
  useEffect(() => { if (!tab) return; const base = document.title.replace(/^\(\d+\+?\) /, ""); document.title = unread ? `(${unread > 9 ? "9+" : unread}) ${base}` : base;
    return () => { document.title = document.title.replace(/^\(\d+\+?\) /, ""); }; }, [unread, tab]);
  const open = (it: Item) => { setItems((xs) => xs.map((x) => (x.n === it.n ? { ...x, read: true } : x))); setInbox(false);
    if (it.targetRowId) { window.dispatchEvent(new CustomEvent<string>(NOTIF_OPEN_EVENT, { detail: it.targetRowId })); return; }
    const [path, hash] = it.href.split("#"); if (location.pathname === path) document.getElementById(hash)?.scrollIntoView({ block: "start", behavior: "smooth" }); else location.href = it.href; };
  const readAll = () => setItems((xs) => xs.map((x) => ({ ...x, read: true })));
  const value: Ctx = { mode, items, unread, last: items.find((x) => !x.read), tick, inbox, setInbox, open, readAll, arrive };
  return <C.Provider value={value}>{children}
    <NotifPanel every={every} setEvery={pickEvery} tab={tab} setTab={setTab} arrive={arrive} /></C.Provider>;
}

function Bell({ size = 22 }: { size?: number }): JSX.Element {
  // Material Symbols «notifications» (relleno), la familia de íconos de Concorde.
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="currentColor"><path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z" /></svg>;
}
/** Número magenta. key={tick} lo vuelve a montar en cada llegada: entra con rebote. */
function Badge({ n, tick, className = "" }: { n: number; tick: number; className?: string }): JSX.Element | null {
  if (!n) return null;
  return <b key={tick} className={`nt-badge ${className}`} aria-hidden>{n > 9 ? "9+" : n}</b>;
}
const label = (n: number) => (n ? `Notificaciones: ${n} sin leer` : "Notificaciones");

/** Bandeja: lista de novedades bajo el elemento que la abre. */
function Inbox({ at = "header" }: { at?: "header" | "fab" }): JSX.Element | null {
  const { items, inbox, setInbox, open, readAll, unread } = useN();
  const ref = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!inbox) return; setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 15000);
    const close = (e: PointerEvent) => { const el = e.target as HTMLElement; if (!ref.current?.contains(el) && !el.closest("[data-nt-opener]")) setInbox(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setInbox(false); };
    addEventListener("pointerdown", close); addEventListener("keydown", esc); return () => { clearInterval(t); removeEventListener("pointerdown", close); removeEventListener("keydown", esc); }; }, [inbox, setInbox]);
  if (!inbox) return null;
  return <div ref={ref} className={`nt-inbox nt-inbox--${at}`} role="dialog" aria-label="Notificaciones">
    <header><b>Notificaciones</b>{unread ? <button type="button" onClick={readAll}>Marcar todo como leído</button> : null}</header>
    {items.length ? <ul>{items.map((it) => <li key={it.n}><button type="button" className={it.read ? "" : "is-unread"} onClick={() => open(it)}>
      <img src={photo(it.photo)} alt="" /><span><b>{it.title}</b><small>{it.body}</small><em>{ago(it.at, now)}</em></span>{it.read ? null : <i className="nt-dot" aria-label="Sin leer" />}</button></li>)}</ul>
      : <p className="nt-empty">Cuando una negociación, subasta o compra tenga novedades, las verás aquí.</p>}
    <a className="nt-inbox__all" href="/m/vmc">Ver todo en Mi Garaje</a>
  </div>;
}

/** Lo que va dentro del header (desktop o móvil). Se ubica respecto del botón «Bienvenido» (--welcome-w, medido). */
export function NotifHeader(): JSX.Element {
  const { mode, unread, tick, inbox, setInbox, last } = useN();
  const box = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { const host = box.current?.parentElement; const btn = host?.querySelector<HTMLElement>("header > button:last-child, header .pvbtn-auth-d"); if (!host || !btn) return;
    const m = () => host.style.setProperty("--welcome-w", `${btn.offsetWidth}px`); m(); const ro = new ResizeObserver(m); ro.observe(btn); return () => ro.disconnect(); }, []);
  const toggle = () => setInbox(!inbox);
  const [peek, setPeek] = useState(false); // vista previa / isla: el mensaje se muestra unos segundos al llegar
  useEffect(() => { if (!tick || (mode !== "previa" && mode !== "isla")) return; setPeek(true); const t = setTimeout(() => setPeek(false), mode === "isla" ? 4000 : 5000); return () => clearTimeout(t); }, [tick, mode]);
  const bell = (glass: boolean) => <button type="button" data-nt-opener className={`nt-bell${glass ? " nt-bell--glass vd-host" : ""}`} aria-label={label(unread)} aria-expanded={inbox} onClick={toggle}>
    <span key={tick} className="nt-bell__icon">{glass ? <Vidrio s="alertas" size={30} /> : <Bell />}</span><Badge n={unread} tick={tick} /></button>;
  return <div ref={box} className={`nt-h nt-h--${mode}`}>
    {mode === "campana" || mode === "previa" ? bell(false) : mode === "vidrio" ? bell(true) : null}
    {mode === "previa" && peek && last ? <div key={tick} className="nt-peek" role="status"><img src={photo(last.photo)} alt="" /><span><b>{last.title}</b><small>{last.body}</small></span></div> : null}
    {mode === "bienvenido" || mode === "avatar" ? <button type="button" data-nt-opener className={`nt-corner nt-corner--${mode}`} aria-label={label(unread)} aria-expanded={inbox} onClick={toggle}><Badge n={unread} tick={tick} /></button> : null}
    {mode === "isla" ? <button type="button" data-nt-opener className={`nt-isla${peek && last ? " is-open" : ""}${unread ? "" : " is-empty"}`} aria-label={label(unread)} aria-expanded={inbox} onClick={toggle}>
      <span className="nt-isla__bell"><Bell size={16} /><Badge n={unread} tick={tick} /></span>
      <span className="nt-isla__msg">{peek && last ? <span key={tick}><b>{last.title}</b> · {last.body}</span> : <span>{unread ? `${unread} ${unread === 1 ? "novedad" : "novedades"}` : "Al día"}</span>}</span></button> : null}
    {["campana", "vidrio", "previa", "bienvenido", "avatar", "isla"].includes(mode) ? <Inbox /> : null}
  </div>;
}

/** Banda bajo el header (en el flujo de la página). */
export function NotifBand(): JSX.Element | null {
  const { mode, unread, last, tick, open } = useN();
  const [shut, setShut] = useState(0);
  if (mode !== "banda" || !unread || !last || shut === tick) return null;
  return <div key={tick} className="nt-band" role="status"><i className="nt-dot" aria-hidden /><b>Tienes {unread} {unread === 1 ? "novedad" : "novedades"} en Mi Garaje</b>
    <span className="nt-band__last">{last.title} · {last.body}</span>
    <button type="button" className="nt-band__see" onClick={() => open(last)}>Ver</button>
    <button type="button" className="nt-x" aria-label="Ocultar hasta la próxima novedad" onClick={() => setShut(tick)}><X /></button></div>;
}
const X = () => <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;

/** Flotantes: toast fijo, caja y botón flotante. */
export function NotifFloat(): JSX.Element | null {
  const { last, tick, open } = useN();
  const [visible, setVisible] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(t); }, [tick]);
  // La caja es transitoria: anuncia la novedad y se recoge hacia la campana,
  // cuyo badge queda con el acumulado de pendientes.
  useEffect(() => { if (!tick) return; setVisible(true); const t = setTimeout(() => setVisible(false), 2400); return () => clearTimeout(t); }, [tick]);
  if (typeof document === "undefined") return null;
  return visible && last ? createPortal(<section key={tick} className="nt-box nt-box--arriving" aria-label="Nueva notificación">
    <header><b>Nueva notificación</b></header>
    <ul><li><button type="button" onClick={() => open(last)}><img src={photo(last.photo)} alt="" /><span><b>{last.title}</b><small>{last.body}</small></span><em>{ago(last.at, now)}</em></button></li></ul>
  </section>, document.body) : null;
}

/** Panel del lab (dock izquierdo), el mismo LabPanel que los demás. */
function NotifPanel({ every, setEvery, tab, setTab, arrive }: { every: number; setEvery: (n: number) => void;
  tab: boolean; setTab: (v: boolean) => void; arrive: (item?: NotifArrival) => void }): JSX.Element {
  const lastOn = useRef(every || 20); if (every) lastOn.current = every; // al volver a prender, el intervalo que tenía
  return <LabPanel title="Notificaciones" store={KEY + "-panel"} className="nt-sw" side="left" pill="Notificaciones · Campana de vidrio"
    actions={<><button type="button" role="switch" aria-checked={!!every} aria-label="Notificaciones automáticas" title={every ? "Apagar: dejan de llegar solas" : "Prender"} className="nt-sw__on" onClick={() => setEvery(every ? 0 : lastOn.current)}><i aria-hidden /></button>
      <button type="button" className="nt-sw__now" title="Llega una ahora" onClick={() => arrive()}>Llega una</button></>}>
    <div className="f-sw__g" role="note"><span className="f-sw__k"><b>Experiencia activa</b> · Campana de vidrio + caja flotante</span>
      <small className="f-sw__hint">Cada novedad aparece primero en la caja y se recoge hacia el contador de la campana.</small></div>
    <div className="f-sw__g" role="note"><span className="f-sw__k"><b>Sonido al llegar</b> · Gota</span></div>
    <div className={`f-sw__g${every ? "" : " is-off"}`} role="group" aria-label="Llega una cada"><span className="f-sw__k"><b>Llega una cada</b>{every ? null : " · apagadas: solo con «Llega una»"}</span>
      {[10, 20, 40].map((s) => <button key={s} type="button" aria-pressed={every === s} onClick={() => setEvery(s)}>{s} s</button>)}
      <label className="nt-sw__chk"><input type="checkbox" checked={tab} onChange={(e) => setTab(e.target.checked)} />También en la pestaña del navegador «(2)»</label></div>
  </LabPanel>;
}
