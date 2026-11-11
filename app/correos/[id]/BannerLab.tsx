"use client";

/**
 * BannerLab — laboratorio de un correo real. Combina cuatro capacidades:
 *
 *  · Tipologías intercambiables: tabs para el banner header, el footer «Centro
 *    de Ayuda» y el fondo (tono V2), que se sustituyen sobre el HTML generado
 *    sin tocar el cuerpo (ver src/emails/headerSwap.ts).
 *
 *  · Título del banner editable (B4), para probar copy sin salir de la vista.
 *
 *  · Cuerpo editable inline (B6): el EmailFrame marca el texto del cuerpo como
 *    contenteditable; «Copiar HTML» lee el estado VIVO del iframe.
 *
 *  · Comparar Figma: parte la vista en dos columnas — el correo maquetado a la
 *    izquierda y la referencia exportada de Figma a la derecha (html · svg · png,
 *    en ese orden de prioridad). Ambos se escalan para caber juntos en pantalla.
 *    Si no hay ningún export, la derecha muestra un skeleton con el nombre del
 *    archivo que falta.
 *
 *  · Estado en la URL (C9): banner/footer/tono viven en el query string, así el
 *    preview es enlazable y sobrevive a recargas.
 *
 *  · Slot `nav`: la navegación «anterior / siguiente» del recorrido de revisión,
 *    que se pinta bajo el campo del título, pegada al preview.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JSX, ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CopyHtmlButton from "@/app/correos/_components/CopyHtmlButton";
import EmailFrame, { EMAIL_FRAME_W, type EmailFrameHandle } from "@/app/correos/_components/EmailFrame";
import { BANNER_OPTIONS, FOOTER_OPTIONS, buildBannerFor, buildFooterFor, swapEmailHeader, swapEmailFooter, stripBodyTitle, presetForCategory, toneLabelForCategory, type BannerText, type LabPreset } from "@/src/emails/headerSwap";
import { V2_TONE_OPTIONS, type V2Tone } from "@/src/emails/tipologiasV2";
import type { RevisionEstado } from "@/src/emails/revisionStatus";
import type { FigmaRef } from "@/src/emails/figmaRef";
import { linkDraftHelpButton } from "@/src/emails/drafts/helpLink";

const ORIGINAL = "original";
const TONE_IDS = new Set(V2_TONE_OPTIONS.map(function id(o) { return o.tone; }));

export interface BannerLabProps {
  /** HTML del correo tal cual sale del renderer de producción. */
  html: string;
  title: string;
  /** Asunto real — default del título editable del banner. */
  subject: string;
  /** Draft-specific title and preset. Omitted by all existing production pages. */
  bannerTitle?: string;
  initialPreset?: LabPreset;
  initialComparing?: boolean;
  /** Nombre de la categoría — default del pill del banner. */
  categoria: string;
  /**
   * La referencia exportada de Figma (html · svg · png), o null si aún no existe.
   * La resuelve el Server Component leyendo public/figma/correos/.
   */
  figmaRef?: FigmaRef | null;
  /** Id del correo — el nombre base del archivo que el skeleton pide cuando falta. */
  figmaBaseName?: string;
  /** Estado de revisión del correo (ver src/emails/revisionStatus.ts). */
  estado?: RevisionEstado;
  /** Qué falta para poder revisarlo; null si está listo. */
  nota?: string | null;
  /**
   * Navegación «anterior / siguiente» del recorrido de revisión. Se recibe como
   * slot y se pinta bajo el campo del título del banner: quien la construye es la
   * página (necesita el registry en el servidor), pero su sitio está aquí.
   */
  nav?: ReactNode;
}

/** Escala del preview en modo comparación, para que ambas columnas quepan. */
const COMPARE_SCALE = 0.62;

// ─── UI atoms ─────────────────────────────────────────────────────────────────

/** Grupo de tabs. En el panel lateral se apila: etiqueta encima, opciones debajo. */
function TabGroup({ label, children, dimmed }: { label: string; children: JSX.Element[]; dimmed?: boolean }): JSX.Element {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: dimmed ? 0.45 : 1, transition: "opacity 0.15s ease" }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </span>
      <div role="tablist" aria-label={label} style={{ display: "flex", gap: 4, padding: 4, borderRadius: 10, background: "var(--ui-border-soft)", flexWrap: "wrap" }}>
        {children}
      </div>
    </div>
  );
}

/**
 * `recommended` marca la opción del preset de la categoría (ver
 * CATEGORY_PRESETS en headerSwap). Se señala con un punto y con el título
 * accesible, no con un texto largo: los tabs comparten fila y una etiqueta
 * «recomendado» completa los desbordaría.
 */
function Tab({ on, onClick, children, disabled, recommended }: { on: boolean; onClick: () => void; children: string; disabled?: boolean; recommended?: boolean }): JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={on}
      onClick={onClick}
      disabled={disabled}
      title={recommended ? `${children} — recomendado para esta categoría` : undefined}
      style={{
        position: "relative",
        height: 26, padding: "0 9px", borderRadius: 7, border: "none",
        cursor: disabled ? "default" : "pointer",
        whiteSpace: "nowrap",
        display: "inline-flex", alignItems: "center", gap: 5,
        background: on ? "#ffffff" : "transparent",
        color: on ? "var(--ui-ink)" : "var(--ui-body)",
        fontSize: 12, fontWeight: on ? 700 : 600, fontFamily: "inherit",
        boxShadow: on ? "0 1px 3px rgba(15,23,42,0.10)" : "none",
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
      {children}
      {recommended && (
        <span
          aria-hidden="true"
          style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--ui-accent)", flexShrink: 0 }}
        />
      )}
      {recommended && <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>recomendado</span>}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, disabled }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; disabled?: boolean }): JSX.Element {
  return (
    /* `flex: none` — en una fila los campos se reparten con `minWidth`; sin esto,
       dentro de una columna el `flex-grow` los estiraba y abría huecos enormes. */
    <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 180px", minWidth: 150 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--ui-muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
      <input
        value={value}
        onChange={function onInput(e) { onChange(e.target.value); }}
        placeholder={placeholder}
        disabled={disabled}
        style={{ height: 32, padding: "0 10px", borderRadius: 8, border: "1px solid var(--ui-border)", fontFamily: "inherit", fontSize: 13, color: "var(--ui-ink)", outline: "none", background: disabled ? "var(--ui-border-soft)" : "#fff", cursor: disabled ? "not-allowed" : "text", minWidth: 0 }}
      />
    </label>
  );
}

/**
 * Aviso de tono de marca. TODAS las categorías tienen un fondo asignado (el de su
 * flujo, o el morado por defecto); cambiarlo rompe el código visual del correo. No
 * se prohíbe —a veces se quiere comparar—, solo se advierte antes de la primera vez.
 */
function ToneAlert({ categoria, toneLabel, onCancel, onConfirm }: { categoria: string; toneLabel: string; onCancel: () => void; onConfirm: () => void }): JSX.Element {
  // Escape cierra sin aplicar el tono, como en cualquier diálogo.
  useEffect(function onEsc() {
    function handler(e: KeyboardEvent): void { if (e.key === "Escape") onCancel(); }
    document.addEventListener("keydown", handler);
    return function off() { document.removeEventListener("keydown", handler); };
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tone-alert-title"
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(2px)" }}
    >
      <div
        onClick={function stop(e) { e.stopPropagation(); }}
        style={{ width: "100%", maxWidth: 400, background: "var(--ui-surface)", borderRadius: 14, border: "1px solid var(--ui-border)", boxShadow: "0 20px 50px -12px rgba(15,23,42,0.35)", padding: 22, display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span aria-hidden="true" style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fff0e6", color: "#c85a1e", fontSize: 15 }}>!</span>
          <h2 id="tone-alert-title" style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--ui-ink)", margin: 0 }}>
            Este correo es de {categoria}
          </h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--ui-body)", lineHeight: 1.55, margin: 0 }}>
          Su fondo <strong style={{ color: "var(--ui-ink)", fontWeight: 700 }}>{toneLabel}</strong> es el color de la categoría.
          Si lo cambias, el correo dejará de seguir el código de color de su flujo.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ height: 34, padding: "0 14px", borderRadius: "var(--ui-radius-control)", border: "1px solid var(--ui-border)", background: "var(--ui-surface)", color: "var(--ui-body)", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            style={{ height: 34, padding: "0 16px", borderRadius: "var(--ui-radius-control)", border: "none", background: "var(--ui-accent)", color: "#ffffff", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
          >
            Entiendo, cambiar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Encabezado de cada columna en la vista de comparación. Texto llano con una
 * línea de color, no una pill: eran dos pills más en una página que ya tenía
 * demasiadas, y aquí solo hace falta saber qué lado es cuál.
 */
function ColumnLabel({ color, children }: { color: string; children: string }): JSX.Element {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, alignSelf: "flex-start", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ui-body)" }}>
      <span aria-hidden="true" style={{ width: 14, height: 2, borderRadius: 1, background: color, flexShrink: 0 }} />
      {children}
    </span>
  );
}

/**
 * Nota de revisión: por qué este correo está PENDIENTE. Va en la columna derecha,
 * donde iría la referencia de Figma — que es justo lo que falta en los dos casos
 * pendientes, así que es donde el revisor la va a buscar.
 */
function NotaRevision({ nota }: { nota: string }): JSX.Element {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: 8, padding: "14px 16px",
        background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: "#b45309" }}>
        <span aria-hidden="true" style={{ width: 16, height: 16, flexShrink: 0, borderRadius: "50%", background: "#b45309", color: "#fff7ed", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>!</span>
        Pendiente de revisión
      </span>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#7c2d12" }}>{nota}</p>
    </div>
  );
}


/**
 * Panel derecho del modo comparación: la referencia de Figma. Mientras no exista
 * ningún export, se pinta un skeleton que dice qué archivo hay que dejar y dónde
 * — así la vista ya es usable antes de tener las referencias.
 *
 * `matchHeight` iguala el alto al del correo maquetado: los exports de Figma
 * vienen en cualquier tamaño y con otra proporción, así que se ajustan por ALTO
 * (no por ancho) y se centran — que es como se comparan dos maquetas.
 *
 * El HTML se pinta en un `<iframe>` y las imágenes en un `<img>`: son medios
 * distintos, no un detalle de estilo. El iframe va con `sandbox` vacío —sin
 * `allow-scripts`— porque una referencia de diseño no necesita ejecutar nada, y
 * así un export con JS no puede tocar la página que lo enmarca.
 *
 * El HTML se renderiza a ANCHO DE CORREO (EMAIL_FRAME_W) y se reduce con
 * `transform`, igual que el maquetado de la izquierda: un export de Figma es un
 * correo de 600px, así que darle `width:100%` de una columna más estrecha no lo
 * encoge, lo RECORTA. Escalando ambos lados por el mismo factor, además, quedan
 * comparables 1:1 — que es el punto de esta vista.
 */
function FigmaPanel({ figmaRef, baseName, matchHeight, scale }: { figmaRef?: FigmaRef | null; baseName: string; matchHeight: number | null; scale: number }): JSX.Element {
  if (figmaRef) {
    const alt = `Referencia de Figma — ${baseName}.${figmaRef.kind}`;
    /* Alto del iframe SIN escalar: el `transform` del padre lo reduce después.
       `matchHeight` ya viene escalado, así que se le deshace la escala. */
    const htmlH = matchHeight ? Math.ceil(matchHeight / scale) : 1600;
    return (
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        {figmaRef.kind === "html" ? (
          /* Wrapper al tamaño YA ESCALADO: `transform` no encoge el hueco que el
             elemento reserva en el flujo, así que se fija a mano. */
          <div style={{ width: Math.ceil(EMAIL_FRAME_W * scale), height: Math.ceil(htmlH * scale), flexShrink: 0, overflow: "hidden" }}>
            <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: EMAIL_FRAME_W }}>
              <iframe
                src={figmaRef.src}
                title={alt}
                sandbox=""
                scrolling="no"
                style={{
                  width: EMAIL_FRAME_W, height: htmlH,
                  border: "none", display: "block", borderRadius: 8,
                  boxShadow: "0 6px 18px rgba(15,23,42,0.10)", background: "#ffffff",
                }}
              />
            </div>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element -- export estático
             de Figma de tamaño arbitrario; next/image exigiría medidas fijas. */
          <img
            src={figmaRef.src}
            alt={alt}
            style={{
              // Con alto conocido manda el alto; si no, cae a ancho completo.
              height: matchHeight ? matchHeight : "auto",
              width: matchHeight ? "auto" : "100%",
              maxWidth: "100%",
              objectFit: "contain",
              display: "block", borderRadius: 8, boxShadow: "0 6px 18px rgba(15,23,42,0.10)", background: "#ffffff",
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%", height: matchHeight ?? undefined, minHeight: matchHeight ? undefined : 420,
        borderRadius: 8, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 10, padding: 24, textAlign: "center",
        background: "repeating-linear-gradient(135deg, var(--ui-border-soft) 0 12px, #e9eef5 12px 24px)",
        border: "1px dashed var(--ui-border-hover)",
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ui-body)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        Sin referencia de Figma
      </span>
      <span style={{ fontSize: 12, color: "var(--ui-muted)", lineHeight: 1.6, maxWidth: 300 }}>
        Exporta el frame y déjalo en
        <br />
        <code style={{ fontFamily: "monospace", fontSize: 11, color: "#475569", background: "#ffffff", padding: "2px 6px", borderRadius: 4, display: "inline-block", marginTop: 6, border: "1px solid var(--ui-border)" }}>
          public/figma/correos/{baseName}.{"{html|svg|png}"}
        </code>
        <br />
        <span style={{ display: "inline-block", marginTop: 8 }}>
          Si hay varios, gana el <strong style={{ color: "var(--ui-body)", fontWeight: 700 }}>html</strong>, luego svg y por último png.
        </span>
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BannerLab({ html, title, subject, bannerTitle, initialPreset, initialComparing = true, categoria, figmaRef, figmaBaseName = "correo", estado = "listo", nota = null, nav = null }: BannerLabProps): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // La composición con la que abre el correo si la URL no dice otra cosa: las
  // categorías del flujo de subasta arrancan ya maquetadas (ver headerSwap).
  const preset = useMemo(function resolvePreset() { return initialPreset ?? presetForCategory(categoria); }, [categoria, initialPreset]);

  // Estado en la URL (C9): banner / footer / tono se leen del query string y,
  // si no están, caen al preset de la categoría.
  const bannerId = params.get("banner") ?? preset.banner;
  const footerId = params.get("footer") ?? preset.footer;
  const toneParam = params.get("tono");
  const tone: V2Tone = toneParam && TONE_IDS.has(toneParam as V2Tone) ? (toneParam as V2Tone) : preset.tone;

  const setParam = useCallback(function setParam(key: string, value: string, isDefault: boolean): void {
    const next = new URLSearchParams(params.toString());
    if (isDefault) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, router, pathname]);

  // El valor que se omite de la URL es el del PRESET, no «original»: así la URL
  // limpia significa «como abre este correo» y volver al preset la deja limpia.
  const setBanner = useCallback(function setBanner(id: string) { setParam("banner", id, id === preset.banner); }, [setParam, preset.banner]);
  const setFooter = useCallback(function setFooter(id: string) { setParam("footer", id, id === preset.footer); }, [setParam, preset.footer]);
  const applyTone = useCallback(function applyTone(t: V2Tone) { setParam("tono", t, t === preset.tone); }, [setParam, preset.tone]);

  // Aviso de tono de marca: TODA categoría tiene un fondo asignado (el de su flujo
  // o el morado por defecto), así que la primera vez que se intenta cambiarlo se
  // pide confirmación. Al aceptar queda desbloqueado para el resto de la visita a
  // ESTE correo (el estado se reinicia al navegar a otro, que es cuando conviene
  // recordarlo).
  const [toneUnlocked, setToneUnlocked] = useState(false);
  const [pendingTone, setPendingTone] = useState<V2Tone | null>(null);

  const setTone = useCallback(function setTone(t: V2Tone) {
    if (!toneUnlocked && t !== preset.tone) { setPendingTone(t); return; }
    applyTone(t);
  }, [toneUnlocked, preset.tone, applyTone]);

  const confirmTone = useCallback(function confirmTone() {
    setToneUnlocked(true);
    if (pendingTone) applyTone(pendingTone);
    setPendingTone(null);
  }, [pendingTone, applyTone]);

  // Título editable del banner (B4). Vacío = usa su default (el asunto). Las
  // tipologías vigentes solo rotulan el título, así que es el único campo.
  const [titulo, setTitulo] = useState("");

  const [editBody, setEditBody] = useState(false);
  // Vista dividida correo ↔ Figma (toggle, no hold: hay que poder mirar ambos).
  // Arranca ABIERTA: al entrar a un correo lo primero que se hace es cotejarlo
  // contra su referencia, así que ahorra un clic en el caso normal.
  const [comparing, setComparing] = useState(initialComparing);
  // Alto ya escalado del correo — la referencia de Figma se iguala a él.
  const [previewH, setPreviewH] = useState<number | null>(null);
  const frameRef = useRef<EmailFrameHandle | null>(null);

  const pendiente = estado === "pendiente";

  const bannerOn = bannerId !== ORIGINAL;
  const footerOn = footerId !== ORIGINAL;
  const allOriginal = !bannerOn && !footerOn;

  // HTML con las tipologías aplicadas (el default del título se resuelve aquí).
  const swappedHtml = useMemo(function compute() {
    let out = html;
    if (bannerOn) {
      const resolved: BannerText = { titulo: titulo.trim() || bannerTitle || subject };
      const bannerHtml = buildBannerFor(bannerId, tone, resolved);
      // El banner de tipología YA rotula el título de campaña: dejar además el
      // bloque `title` del cuerpo lo repetiría justo debajo.
      if (bannerHtml) out = stripBodyTitle(swapEmailHeader(out, bannerHtml));
    }
    if (footerOn) {
      const footerHtml = buildFooterFor(footerId, tone);
      if (footerHtml) out = swapEmailFooter(out, footerHtml);
    }
    return linkDraftHelpButton(out);
  }, [html, bannerId, footerId, tone, titulo, subject, bannerTitle, bannerOn, footerOn]);

  // El preview siempre muestra la composición activa: al comparar contra Figma la
  // referencia va al lado, no en lugar del correo.
  const previewHtml = swappedHtml;

  // Al re-montar el frame (cambia key), se pierde la edición inline: para B6 se
  // relee el frame vivo al copiar. Si no hay frame editado, cae al swappedHtml.
  const copyHtml = useCallback(function copyHtml(): string {
    if (editBody && frameRef.current) return frameRef.current.getHtml();
    return swappedHtml;
  }, [editBody, swappedHtml]);

  // La key del frame fuerza recarga del srcDoc cuando cambia la composición (no
  // en cada edición inline, que ocurre dentro del mismo documento).
  const frameKey = `${bannerId}-${footerId}-${tone}-${titulo}-${editBody}`;

  return (
    <div>
      {/* ── Barra superior: acciones + campos del banner ──────────────────────
          Las acciones (copiar / comparar) van aquí, no en el panel: son de la
          página entera y así no compiten por el alto del sidebar. Los campos de
          texto son del BANNER, que es lo más alto del correo, así que se editan
          desde arriba — es donde el ojo ya está mirando. */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <button
          type="button"
          aria-pressed={comparing}
          onClick={function toggle() { setComparing(function prev(p) { return !p; }); }}
          style={{
            height: 32, padding: "0 14px", borderRadius: "var(--ui-radius-control)", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700,
            border: "1px solid var(--ui-border)",
            background: comparing ? "var(--ui-accent)" : "var(--ui-surface)",
            color: comparing ? "#ffffff" : "var(--ui-body)",
            transition: "background 0.12s ease, color 0.12s ease",
            userSelect: "none",
          }}
        >
          {comparing ? "✕ Cerrar comparación" : "⇄ Comparar Figma"}
        </button>
        <CopyHtmlButton key={frameKey} html={copyHtml} />
        <label style={{ display: "inline-flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--ui-body)" }}>
          <input type="checkbox" checked={editBody} onChange={function toggle(e) { setEditBody(e.target.checked); }} style={{ accentColor: "var(--ui-accent)", width: 15, height: 15 }} />
          Editar cuerpo
          {editBody && <span style={{ fontSize: 11, color: "var(--ui-muted)", fontWeight: 500 }}>· clic en cualquier texto</span>}
        </label>

        {/* Estado de revisión: la primera cosa que hay que saber del correo, así
            que va en la barra de acciones y no enterrado más abajo. */}
        <span
          style={{
            marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
            padding: "4px 11px", borderRadius: 9999, fontSize: 11.5, fontWeight: 700,
            background: pendiente ? "#fff7ed" : "#ecfdf5",
            color: pendiente ? "#b45309" : "#047857",
            border: `1px solid ${pendiente ? "#fed7aa" : "#a7f3d0"}`,
          }}
        >
          <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />
          {pendiente ? "Pendiente" : "Listo para revisar"}
        </span>
      </div>

      {/* Con la comparación cerrada no hay columna derecha donde poner la nota, así
          que se muestra a lo ancho, encima del preview. */}
      {pendiente && nota && !comparing && (
        <div style={{ marginBottom: 14 }}>
          <NotaRevision nota={nota} />
        </div>
      )}

      {/* Título del banner: SIEMPRE montado, deshabilitado con «Basic». Si entrara
          y saliera del DOM, el preview daría un salto al cambiar de tipología.
          Manteniéndolo, el alto es constante y además se ve de un vistazo por qué
          no se puede editar. */}
      <div
        aria-hidden={!bannerOn}
        style={{
          display: "flex", gap: 12, flexWrap: "wrap", padding: "12px 14px", marginBottom: 14,
          background: "var(--ui-subtle)", border: "1px solid var(--ui-border-soft)", borderRadius: 10,
          opacity: bannerOn ? 1 : 0.5, transition: "opacity 0.15s ease",
        }}
      >
        <Field label="Título del banner" value={titulo} onChange={setTitulo} placeholder={bannerOn ? (bannerTitle || subject) : "—"} disabled={!bannerOn} />
      </div>

      {/* Recorrido de revisión: anterior · N de 45 · siguiente. */}
      {nav}

    {/* Dos columnas: las tipologías viven en un panel STICKY a la izquierda, así
        siguen a la vista mientras se recorre un correo largo. Al quedarse solo
        con los tres grupos de tabs, el panel es corto y nunca necesita scroll. */}
    <div style={{ display: "grid", gridTemplateColumns: "212px minmax(0, 1fr)", gap: 20, alignItems: "start" }}>
      <aside
        style={{
          position: "sticky", top: 72, display: "flex", flexDirection: "column", gap: 14,
          padding: 14, borderRadius: 12, background: "var(--ui-surface)", border: "1px solid var(--ui-border)",
        }}
      >
        <TabGroup label="Banner">
          {[
            <Tab key={ORIGINAL} on={bannerId === ORIGINAL} recommended={preset.banner === ORIGINAL} onClick={function pick() { setBanner(ORIGINAL); }}>Basic</Tab>,
            ...BANNER_OPTIONS.map(function renderTab(opt) {
              return <Tab key={opt.id} on={bannerId === opt.id} recommended={preset.banner === opt.id} onClick={function pick() { setBanner(opt.id); }}>{opt.label}</Tab>;
            }),
          ]}
        </TabGroup>

        <TabGroup label="Banner 2">
          {[
            <Tab key={ORIGINAL} on={footerId === ORIGINAL} recommended={preset.footer === ORIGINAL} onClick={function pick() { setFooter(ORIGINAL); }}>Basic</Tab>,
            ...FOOTER_OPTIONS.map(function renderTab(opt) {
              return <Tab key={opt.id} on={footerId === opt.id} recommended={preset.footer === opt.id} onClick={function pick() { setFooter(opt.id); }}>{opt.label}</Tab>;
            }),
          ]}
        </TabGroup>

        <TabGroup label="Fondo" dimmed={allOriginal}>
          {V2_TONE_OPTIONS.map(function renderTone(opt) {
            return (
              <Tab key={opt.tone} on={!allOriginal && tone === opt.tone} recommended={preset.tone === opt.tone} disabled={allOriginal} onClick={function pick() { setTone(opt.tone); }}>
                {opt.label}
              </Tab>
            );
          })}
        </TabGroup>

        {/* Pista permanente del tono propio: el modal solo sale la primera vez,
            así que esta línea recuerda cuál es el color de la categoría. */}
        <span style={{ fontSize: 11, color: "var(--ui-muted)", lineHeight: 1.45, marginTop: -6 }}>
          {categoria} usa <strong style={{ color: "var(--ui-body)", fontWeight: 700 }}>{(initialPreset ? (V2_TONE_OPTIONS.find(option => option.tone === preset.tone)?.label ?? "") : toneLabelForCategory(categoria))}</strong> como fondo de marca.
        </span>

      </aside>

      <div style={{ position: "relative", display: "flex", justifyContent: "center", padding: comparing ? 20 : 32, borderRadius: 12, background: "var(--ui-subtle)", border: "1px solid var(--ui-border-soft)", overflowX: "auto" }}>
        {comparing ? (
          /* Vista dividida: correo maquetado ↔ referencia de Figma, ambos
             reducidos para caber juntos sin scroll horizontal. */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, width: "100%", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <ColumnLabel color="var(--ui-accent)">Maquetado</ColumnLabel>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <EmailFrame
                  key={frameKey}
                  ref={frameRef}
                  html={previewHtml}
                  editable={editBody}
                  scale={COMPARE_SCALE}
                  onHeightChange={setPreviewH}
                  title={`${title} · ${allOriginal ? "original" : `${bannerId} / ${footerId}`}`}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <ColumnLabel color="#c85a1e">Figma</ColumnLabel>
              {/* La nota va ARRIBA de la referencia: explica por qué lo que hay
                  debajo no sirve todavía para dar el correo por bueno. */}
              {pendiente && nota && <NotaRevision nota={nota} />}
              <FigmaPanel figmaRef={figmaRef} baseName={figmaBaseName} matchHeight={previewH} scale={COMPARE_SCALE} />
            </div>
          </div>
        ) : (
          <EmailFrame
            key={frameKey}
            ref={frameRef}
            html={previewHtml}
            editable={editBody}
            title={`${title} · ${allOriginal ? "original" : `${bannerId} / ${footerId}`}`}
          />
        )}
      </div>
    </div>

    {pendingTone && (
      <ToneAlert
        categoria={categoria}
        toneLabel={(initialPreset ? (V2_TONE_OPTIONS.find(option => option.tone === preset.tone)?.label ?? "") : toneLabelForCategory(categoria))}
        onCancel={function cancel() { setPendingTone(null); }}
        onConfirm={confirmTone}
      />
    )}
    </div>
  );
}
