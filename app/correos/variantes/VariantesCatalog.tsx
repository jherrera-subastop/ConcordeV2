"use client";

/**
 * VariantesCatalog — catálogo de los 45 correos REALES de producción. Su público
 * es quien REVISA los correos, no quien los programa, así que está optimizado
 * para recorrerlos rápido y saber de un vistazo qué falta:
 *
 *   · buscador + filtro por categoría (con conteos)
 *   · categorías COLAPSABLES y miniaturas densas: las 15 categorías caben en la
 *     primera pantalla plegadas, y se abren las que interesan
 *   · cada card: preview real + estado de revisión (listo · pendiente) + Abrir
 *   · al filtrar una categoría con flujo, se muestra el FlowDiagram
 *
 * El orden (categorías y correos) viene de catalogOrder.ts, el MISMO módulo que
 * usa el detalle para «anterior / siguiente»: así navegar con los botones recorre
 * exactamente lo que se ve aquí.
 *
 * Importa EMAILS/generateEmail directamente (módulos planos, sin node:fs), así
 * el HTML se genera en el cliente igual que en el catálogo original — nada de
 * serializar 45 correos como props.
 */

import { useCallback, useMemo, useState } from "react";
import type { JSX } from "react";
import Link from "next/link";
import { CATEGORY_GRADIENT, STAGE_ORDER, type EmailTemplate } from "@/src/emails/prodEmails";
import { generateEmail } from "@/src/emails/prodEmailTemplates";
import { applyPreset, presetForCategory } from "@/src/emails/headerSwap";
import { CATEGORIAS_ORDENADAS, CORREOS_ORDENADOS, categoriaDe } from "@/src/emails/catalogOrder";
import { estadoDe, PENDIENTES_TOTAL } from "@/src/emails/revisionStatus";
import { FlowDiagram } from "./FlowDiagram";

const INK = "var(--ui-ink)";
const BODY = "var(--ui-body)";
const DIVIDER = "var(--ui-border)";
const PURPLE = "#2E0F70";

/** Ancho real del correo de prod (tabla 600 + padding 20). */
const EMAIL_W = 640;

/**
 * Miniatura más chica que antes (0.34 en vez de 0.5): el objetivo es ver MUCHOS
 * correos de una vez para elegir cuál revisar, no leer el copy en la card — para
 * eso se entra. Con esto caben ~5 por fila en un portátil.
 */
const THUMB_SCALE = 0.34;
const THUMB_W = Math.round(EMAIL_W * THUMB_SCALE);
const THUMB_H = 190;

/** Verde/ámbar del estado de revisión — los dos únicos colores de estado. */
const LISTO = { bg: "#ecfdf5", fg: "#047857", border: "#a7f3d0", label: "Listo para revisar" };
const PENDIENTE = { bg: "#fff7ed", fg: "#b45309", border: "#fed7aa", label: "Pendiente" };

/**
 * Texto buscable de un correo: nombre, asunto y TODO el copy de sus secciones
 * (`content` es un Record<string,string>, así que se aplanan sus valores). Así
 * buscar «garantía» o «Hilux» encuentra el correo aunque esas palabras solo
 * estén en el cuerpo. Se quitan los marcadores de formato (**, __, (( )) ) para
 * que no estorben, y se cachea por id: son 45 correos y el índice no cambia.
 */
const searchIndex = new Map<string, string>();

function searchableText(e: EmailTemplate): string {
  const hit = searchIndex.get(e.id);
  if (hit !== undefined) return hit;
  const body = e.sections
    .flatMap(function values(s) { return Object.values(s.content ?? {}); })
    .join(" ");
  const text = `${e.name} ${e.subject} ${body}`
    .replace(/\*\*|__|\(\(|\)\)|\[\[|\]\]/g, " ")
    .toLowerCase();
  searchIndex.set(e.id, text);
  return text;
}

// ─── Estado de revisión ───────────────────────────────────────────────────────

/**
 * Pill de estado. Es la ÚNICA pill que queda en la card: las de categoría·paso
 * se quitaron porque, con 15 categorías de colores distintos, la galería se leía
 * como un semáforo y el estado —lo que de verdad importa al revisar— se perdía.
 */
function EstadoPill({ pendiente, compact }: { pendiente: boolean; compact?: boolean }): JSX.Element {
  const c = pendiente ? PENDIENTE : LISTO;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
        padding: compact ? "2px 7px" : "3px 9px", borderRadius: 9999,
        fontSize: compact ? 10 : 11, fontWeight: 700, letterSpacing: "0.01em",
        background: c.bg, color: c.fg, border: `1px solid ${c.border}`,
      }}
    >
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: c.fg, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

/**
 * Card de un correo. Sin descripción y sin pill de categoría: solo la miniatura,
 * el nombre y el estado. Toda la card es el enlace (área de clic grande) y el
 * `prefetch` deja el detalle listo antes de entrar.
 */
function EmailCard({ email }: { email: EmailTemplate }): JSX.Element {
  const html = useMemo(function render() {
    // Correo con HTML crudo (maqueta que no usa secciones): se pinta tal cual,
    // sin preset de header/footer.
    if (email.html) return email.html;
    const cat = categoriaDe(email);
    const base = generateEmail(email.sections, email.subject);
    return applyPreset(base, presetForCategory(cat), { titulo: email.subject });
  }, [email]);
  const pendiente = estadoDe(email.id) === "pendiente";

  return (
    <Link
      href={`/correos/${email.id}`}
      prefetch
      className="cor-card"
      style={{
        display: "flex", flexDirection: "column", textDecoration: "none",
        background: "#fff", borderRadius: 10, border: `1px solid ${DIVIDER}`, overflow: "hidden",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
      }}
    >
      <div style={{ position: "relative", height: THUMB_H, overflow: "hidden", background: "var(--ui-subtle)", borderBottom: "1px solid var(--ui-border-soft)" }}>
        {/* El iframe se renderiza a 640px y se reduce. Se centra con `left:50%` +
            `translateX(-50%)` en vez de `margin:auto`, que fallaba cuando la
            celda de la grilla es más estrecha que esos 640px. */}
        <iframe
          srcDoc={html}
          title={email.name}
          scrolling="no"
          tabIndex={-1}
          style={{ border: "none", width: EMAIL_W, height: Math.round(THUMB_H / THUMB_SCALE), position: "absolute", top: 0, left: "50%", transform: `translateX(-50%) scale(${THUMB_SCALE})`, transformOrigin: "top center", pointerEvents: "none", background: "#fff" }}
        />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 48, background: "linear-gradient(180deg, rgba(248,250,252,0) 0%, var(--ui-subtle) 90%)" }} />
      </div>
      <div style={{ padding: "10px 12px 12px", display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
        <h3 className="cor-name" style={{ fontSize: 13, fontWeight: 700, color: INK, margin: 0, letterSpacing: "-0.01em", lineHeight: 1.35 }}>
          {email.name}
        </h3>
        <div style={{ marginTop: "auto" }}>
          <EstadoPill pendiente={pendiente} compact />
        </div>
      </div>
    </Link>
  );
}

function EmailGrid({ emails }: { emails: EmailTemplate[] }): JSX.Element {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${THUMB_W}px, 1fr))`, gap: 14 }}>
      {emails.map(function renderCard(email) { return <EmailCard key={email.id} email={email} />; })}
    </div>
  );
}

/** Valoriza 2 ya fue revisado; se separa para distinguirlo de lo que sigue en avance. */
function CampanaValorizaReviewGroups({ emails }: { emails: EmailTemplate[] }): JSX.Element {
  const terminados = emails.filter(function terminado(email) { return estadoDe(email.id) === "listo"; });
  const enAvance = emails.filter(function pendiente(email) { return estadoDe(email.id) === "pendiente"; });
  const headingStyle = { margin: 0, fontSize: 14, fontWeight: 800, color: INK, letterSpacing: "-0.01em" };
  const metaStyle = { fontSize: 12, color: "var(--ui-muted)", fontWeight: 600 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <section aria-labelledby="valoriza-terminados">
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
          <h3 id="valoriza-terminados" style={headingStyle}>Terminados</h3>
          <span style={metaStyle}>{terminados.length} {terminados.length === 1 ? "correo" : "correos"}</span>
        </div>
        <EmailGrid emails={terminados} />
      </section>
      <section aria-labelledby="valoriza-en-avance" style={{ paddingTop: 20, borderTop: `1px solid ${DIVIDER}` }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
          <h3 id="valoriza-en-avance" style={headingStyle}>En avance</h3>
          <span style={metaStyle}>{enAvance.length} correos</span>
        </div>
        <EmailGrid emails={enAvance} />
      </section>
    </div>
  );
}

// ─── Categoría colapsable ─────────────────────────────────────────────────────

/**
 * Una categoría plegable. Plegadas, las 15 categorías caben en una pantalla y
 * sirven de índice; la cabecera dice cuántos correos tiene y cuántos están
 * pendientes, que es la información con la que se decide dónde entrar.
 */
function CategoriaSection({
  categoria, emails, abierta, onToggle,
}: {
  categoria: string;
  emails: EmailTemplate[];
  abierta: boolean;
  onToggle: () => void;
}): JSX.Element {
  const pendientes = emails.filter(function isPend(e) { return estadoDe(e.id) === "pendiente"; }).length;
  const solid = CATEGORY_GRADIENT[categoria];

  return (
    <section style={{ marginBottom: abierta ? 28 : 8 }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        className="cor-cat"
        style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%",
          padding: "10px 12px", marginBottom: abierta ? 14 : 0,
          background: abierta ? "var(--ui-subtle)" : "#fff",
          border: `1px solid ${abierta ? DIVIDER : "var(--ui-border-soft)"}`, borderRadius: 10,
          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
          transition: "background 0.15s ease, border-color 0.15s ease",
        }}
      >
        {/* Chevron: la señal de plegado. Rota, no cambia de glifo. */}
        <span
          aria-hidden="true"
          style={{ flexShrink: 0, fontSize: 11, color: "var(--ui-muted)", transform: abierta ? "rotate(90deg)" : "none", transition: "transform 0.18s ease", display: "inline-block", width: 10 }}
        >
          ▶
        </span>
        {/* Barrita de color de la categoría: identifica sin gritar como una pill. */}
        <span aria-hidden="true" style={{ flexShrink: 0, width: 4, height: 18, borderRadius: 2, backgroundImage: solid ?? "none", background: solid ? undefined : "var(--ui-border-hover)" }} />
        <span style={{ fontSize: 15, fontWeight: 800, color: INK, letterSpacing: "-0.01em" }}>{categoria}</span>
        <span style={{ fontSize: 12, color: "var(--ui-muted)", fontWeight: 600 }}>
          {emails.length} {emails.length === 1 ? "correo" : "correos"}
        </span>
        {pendientes > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: PENDIENTE.fg, background: PENDIENTE.bg, border: `1px solid ${PENDIENTE.border}`, padding: "2px 8px", borderRadius: 9999 }}>
            {pendientes} pendiente{pendientes === 1 ? "" : "s"}
          </span>
        )}
      </button>
      {abierta && (categoria === "Campaña Valoriza"
        ? <CampanaValorizaReviewGroups emails={emails} />
        : <EmailGrid emails={emails} />)}
    </section>
  );
}

// ─── Catálogo ─────────────────────────────────────────────────────────────────

export default function VariantesCatalog({
  initialCategory = null,
  focusMode = false,
}: {
  /** Categoría con la que debe arrancar el catálogo. */
  initialCategory?: string | null;
  /** Vista de revisión directa: una sola campaña, sin controles ni otras categorías. */
  focusMode?: boolean;
} = {}): JSX.Element {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<{ category: string | null; stage: string | null }>({ category: initialCategory, stage: null });
  const [soloPendientes, setSoloPendientes] = useState(false);
  /**
   * Categorías abiertas. Arranca VACÍO: todas plegadas, así lo primero que se ve
   * es el índice completo de las 15 categorías y no una sola galería infinita.
   */
  const [abiertas, setAbiertas] = useState<ReadonlySet<string>>(
    initialCategory ? new Set([initialCategory]) : new Set(),
  );

  const toggle = useCallback(function toggle(categoria: string) {
    setAbiertas(function prev(p) {
      const next = new Set(p);
      if (next.has(categoria)) next.delete(categoria);
      else next.add(categoria);
      return next;
    });
  }, []);

  const todasAbiertas = abiertas.size === CATEGORIAS_ORDENADAS.length;
  const setTodas = useCallback(function setTodas(abrir: boolean) {
    setAbiertas(abrir ? new Set(CATEGORIAS_ORDENADAS.map(function cat(g) { return g.categoria; })) : new Set());
  }, []);

  const filtrado = useMemo(function filter() {
    const q = query.trim().toLowerCase();
    return CORREOS_ORDENADOS.filter(function matches(e) {
      // Busca en nombre, asunto y CUERPO del correo (ver searchableText).
      const matchesQuery = !q || searchableText(e).includes(q);
      const matchesCategory = !active.category || categoriaDe(e) === active.category;
      const matchesStage = !active.stage || e.stage === active.stage;
      const matchesEstado = !soloPendientes || estadoDe(e.id) === "pendiente";
      return matchesQuery && matchesCategory && matchesStage && matchesEstado;
    });
  }, [query, active, soloPendientes]);

  /**
   * Al buscar o filtrar por pendientes se muestra una sola grilla plana: agrupar
   * 3 resultados en 3 categorías plegadas escondería justo lo que se buscaba.
   */
  const vistaPlana = Boolean(query.trim()) || soloPendientes;

  /** Categorías con sus correos ya filtrados (para la vista agrupada). */
  const grupos = useMemo(function group() {
    if (vistaPlana) return null;
    const visibles = new Set(filtrado.map(function id(e) { return e.id; }));
    return CATEGORIAS_ORDENADAS
      .filter(function visible(g) { return !active.category || g.categoria === active.category; })
      .map(function toGroup(g) {
        return { categoria: g.categoria, emails: g.correos.filter(function inFiltrado(e) { return visibles.has(e.id); }) };
      })
      .filter(function nonEmpty(g) { return g.emails.length > 0; });
  }, [filtrado, active.category, vistaPlana]);

  const showDiagram = !focusMode && Boolean(active.category) && Boolean(STAGE_ORDER[active.category ?? ""]) && !vistaPlana;

  /** Pill de filtro: fila horizontal, no columna — libera el ancho del sidebar. */
  const pillStyle = function pillStyle(isActive: boolean) {
    return {
      display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0,
      height: 28, padding: "0 11px", borderRadius: 9999,
      border: `1px solid ${isActive ? PURPLE : DIVIDER}`, cursor: "pointer", fontFamily: "inherit", fontSize: 12,
      background: isActive ? PURPLE : "#ffffff", color: isActive ? "#fff" : BODY, fontWeight: 700,
      transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
    };
  };

  return (
    <div>
      {/* ── Barra de filtros: buscador + categorías en una fila ── */}
      {!focusMode && <div style={{ position: "sticky", top: 56, zIndex: 10, background: "#ffffff", paddingTop: 4, paddingBottom: 10, marginBottom: 14, borderBottom: `1px solid ${DIVIDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          <input
            value={query}
            onChange={function onChange(e) { setQuery(e.target.value); }}
            placeholder="Buscar por nombre, asunto o contenido…"
            style={{ flex: "1 1 240px", maxWidth: 340, height: 34, padding: "0 13px", borderRadius: 9, border: `1px solid ${DIVIDER}`, fontFamily: "inherit", fontSize: 13, color: INK, outline: "none" }}
          />

          {/* Filtro por estado: el atajo a «qué me falta», que es la pregunta con
              la que se abre este catálogo. Sin pendientes NO se pinta: un filtro
              a cero solo puede vaciar la galería. */}
          {PENDIENTES_TOTAL > 0 && (
            <button
              type="button"
              aria-pressed={soloPendientes}
              onClick={function toggle() { setSoloPendientes(function p(v) { return !v; }); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0, height: 28, padding: "0 11px", borderRadius: 9999,
                cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700,
                border: `1px solid ${soloPendientes ? PENDIENTE.fg : PENDIENTE.border}`,
                background: soloPendientes ? PENDIENTE.fg : PENDIENTE.bg,
                color: soloPendientes ? "#fff" : PENDIENTE.fg,
                transition: "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
              }}
            >
              Pendientes <span style={{ opacity: 0.75, fontWeight: 600 }}>{PENDIENTES_TOTAL}</span>
            </button>
          )}

          {/* Al buscar sí importa cuántos hay: sin resultados visibles arriba, el
              contador es la única señal de que la búsqueda encontró algo. */}
          {vistaPlana && (
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ui-accent)", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {filtrado.length} {filtrado.length === 1 ? "resultado" : "resultados"}
            </span>
          )}

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {!vistaPlana && (
              <button
                type="button"
                onClick={function toggleAll() { setTodas(!todasAbiertas); }}
                style={{ height: 28, padding: "0 11px", borderRadius: 8, border: `1px solid ${DIVIDER}`, background: "#ffffff", color: BODY, fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {todasAbiertas ? "Plegar todo" : "Desplegar todo"}
              </button>
            )}
            {(active.category || active.stage || query || soloPendientes) && (
              <button
                type="button"
                onClick={function clear() { setActive({ category: null, stage: null }); setQuery(""); setSoloPendientes(false); }}
                style={{ height: 28, padding: "0 11px", borderRadius: 8, border: `1px solid ${DIVIDER}`, background: "#ffffff", color: BODY, fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Las 15 categorías caben en 2 filas; envuelven en pantallas estrechas.
            Al elegir una, se abre sola: filtrar y tener que desplegar sería un
            clic de más para la misma intención. */}
        <div role="tablist" aria-label="Categorías" style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <button type="button" role="tab" aria-selected={!active.category} onClick={function all() { setActive({ category: null, stage: null }); }} style={pillStyle(!active.category)}>
            Todos <span style={{ opacity: 0.65, fontWeight: 600 }}>{CORREOS_ORDENADOS.length}</span>
          </button>
          {CATEGORIAS_ORDENADAS.map(function renderPill({ categoria, correos }) {
            const on = active.category === categoria;
            return (
              <button
                key={categoria}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={function pick() {
                  setActive({ category: categoria, stage: null });
                  setAbiertas(new Set([categoria]));
                }}
                style={pillStyle(on)}
              >
                {categoria} <span style={{ opacity: 0.65, fontWeight: 600 }}>{correos.length}</span>
              </button>
            );
          })}
        </div>
      </div>}

      {/* ── Main ── */}
      <main>
        {showDiagram && active.category && (
          <FlowDiagram
            category={active.category}
            emails={CORREOS_ORDENADOS.filter(function inCat(e) { return categoriaDe(e) === active.category; })}
            activeStage={active.stage}
            onSelectStage={function pickStage(stage) { setActive({ category: active.category, stage }); }}
          />
        )}

        {filtrado.length === 0 && <p style={{ color: BODY, fontSize: 14 }}>Sin resultados para esta búsqueda.</p>}

        {vistaPlana
          ? <EmailGrid emails={filtrado} />
          : grupos?.map(function renderGroup({ categoria, emails }) {
              return (
                <CategoriaSection
                  key={categoria}
                  categoria={categoria}
                  emails={emails}
                  abierta={abiertas.has(categoria)}
                  onToggle={function onToggle() { toggle(categoria); }}
                />
              );
            })}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .cor-card:hover { box-shadow: 0 8px 30px -8px rgba(15,23,42,0.12), 0 2px 8px -2px rgba(15,23,42,0.05); border-color: var(--ui-border-hover); transform: translateY(-2px); }
        .cor-card:hover .cor-name { color: var(--ui-accent); }
        .cor-cat:hover { background: var(--ui-subtle); border-color: var(--ui-border-hover); }
      `}} />
    </div>
  );
}
