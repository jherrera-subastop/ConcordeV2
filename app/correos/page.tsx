import type { JSX } from "react";
import Link from "next/link";
import Header from "@/app/_components/Header";
import { applyPreset, presetForCategory } from "@/src/emails/headerSwap";
import { TIPO_GROUPS } from "@/src/emails/tipologiasRegistry";
import { EMAIL_GROUPS, EMAIL_PROD_TOTAL } from "@/src/emails/registry";

/**
 * /correos — hub de correos. Dos cards:
 *   · Tipologías — layouts base de banner (propuestas de diseño).
 *   · Maquetar   — los correos REALES en producción: elige uno e intercambia su
 *     tipología de header/footer/fondo con preview vivo (BannerLab) y expórtalo.
 * Cada card enlaza a su galería (/correos/tipologias · /correos/variantes).
 */

const THUMB_H = 300;
const EMAIL_W = 600;
const SCALE = 0.5;

interface HubCard {
  href: string;
  title: string;
  meta: string;
  desc: string;
  previewDoc: string;
}

/** Primer correo real de producción — sirve de preview de la card «Maquetar». */
const SAMPLE_EMAIL = EMAIL_GROUPS[0]?.correos[0];

/** Se muestra con su composición por defecto, igual que en el catálogo. */
const SAMPLE_HTML = SAMPLE_EMAIL
  ? applyPreset(
      SAMPLE_EMAIL.html,
      presetForCategory(EMAIL_GROUPS[0]?.label ?? ""),
      { titulo: SAMPLE_EMAIL.subject },
    )
  : null;

const CARDS: HubCard[] = [
  {
    href: "/correos/tipologias",
    title: "Tipologías",
    meta: `${TIPO_GROUPS.length} layouts base`,
    desc: "Layouts base del banner header según la posición marca↔copy, en el estilo Voyager v2. Cada uno se puede ver sobre los 5 fondos de gradiente.",
    previewDoc: TIPO_GROUPS[0].plantillas[0].fondos[0].previewDoc,
  },
  {
    href: "/correos/variantes",
    title: "Maquetar",
    meta: `${EMAIL_PROD_TOTAL} correos en producción`,
    desc: "Los correos reales en producción. Elige uno e intercambia la tipología de su header, footer y fondo con preview en vivo; edita el copy y copia el HTML listo para enviar.",
    previewDoc: SAMPLE_HTML ?? TIPO_GROUPS[0].plantillas[0].fondos[0].previewDoc,
  },
];

export default function CorreosPage(): JSX.Element {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", color: "var(--ui-ink)", fontFamily: "var(--vmc-font-display, 'Plus Jakarta Sans', -apple-system, sans-serif)" }}>
      <Header active="correos" />

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 40px 80px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ui-ink)", margin: 0 }}>Correos</h1>
        </div>
        <p style={{ fontSize: 14, color: "var(--ui-body)", lineHeight: 1.6, margin: "0 0 32px", maxWidth: 720 }}>
          Sistema de mailing de VMC Subastas. Explora las <strong style={{ color: "var(--ui-ink)", fontWeight: 700 }}>tipologías</strong>{" "}
          (layouts base del banner) o entra a <strong style={{ color: "var(--ui-ink)", fontWeight: 700 }}>maquetar</strong>{" "}
          los correos que hoy están en producción, intercambiando su tipología de header, footer y fondo.
        </p>

        <Link href="/correos/borradores" style={{ display: "block", padding: "18px 20px", marginBottom: 24, border: "1px solid var(--ui-border)", borderRadius: 12, color: "var(--ui-ink)", textDecoration: "none", background: "var(--ui-subtle)" }}>
          <strong>Revisar los cinco borradores nuevos →</strong>
          <span style={{ display: "block", marginTop: 5, fontSize: 13, color: "var(--ui-body)" }}>Publicación de vehículos y actualización de condiciones. Borradores de revisión, no enviados ni incorporados al catálogo de producción.</span>
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {CARDS.map(function renderCard(c) {
            return (
              <Link key={c.href} href={c.href} className="cor-card" style={{ display: "flex", flexDirection: "column", textDecoration: "none", borderRadius: "var(--ui-radius-card)", overflow: "hidden", background: "#ffffff", border: "1px solid var(--ui-border)", transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease" }}>
                <div style={{ height: THUMB_H, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ui-subtle)", borderBottom: "1px solid var(--ui-border-soft)" }}>
                  <div style={{ width: EMAIL_W * SCALE, height: THUMB_H - 40, position: "relative", overflow: "hidden", borderRadius: 6, boxShadow: "0 6px 18px rgba(15,23,42,0.12)", outline: "1px solid var(--ui-border)", background: "var(--ui-subtle)" }}>
                    <iframe
                      title={c.title}
                      srcDoc={c.previewDoc}
                      scrolling="no"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: EMAIL_W,
                        height: (THUMB_H - 40) / SCALE,
                        border: "none",
                        transform: `scale(${SCALE})`,
                        transformOrigin: "top left",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "18px 20px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="cor-name" style={{ fontSize: 17, fontWeight: 800, color: "var(--ui-ink)", letterSpacing: "-0.02em" }}>{c.title}</span>
                    <span className="cor-arrow" aria-hidden="true" style={{ fontSize: 16, color: "var(--ui-border-hover)" }}>→</span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--ui-muted)", fontWeight: 600, fontFamily: "monospace" }}>{c.meta}</span>
                  <p style={{ fontSize: 13, color: "var(--ui-body)", lineHeight: 1.5, margin: "4px 0 0" }}>{c.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .cor-card:hover { box-shadow: 0 8px 30px -8px rgba(15,23,42,0.12), 0 2px 8px -2px rgba(15,23,42,0.05); border-color: var(--ui-border-hover); transform: translateY(-2px); }
        .cor-card:hover .cor-name { color: var(--ui-accent); }
        .cor-card:hover .cor-arrow { color: var(--ui-accent); transform: translateX(3px); transition: color 0.2s ease, transform 0.2s ease; }
      `}} />
    </div>
  );
}
