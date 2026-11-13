/**
 * Pills de las cards de lotes (`.lc-pill`): En vivo, Recibe ofertas (negociable) y Destacado, en su grupo `.lc-pills`.
 * Una sola fuente: las usa LotCards (Index) y las muestra /components con su código para copiar.
 */
export const PILL_CSS = `
/* Pills (estado / destacado) */
.lc-pills { position: absolute; top: 8px; left: 8px; z-index: 2; display: flex; gap: 4px; }
.lc-pill { display: inline-flex; align-items: center; gap: 5px; height: 18px; padding: 0 8px 0 6px; border-radius: 999px; font-size: 9px; font-weight: 700; letter-spacing: 0.07em; color: #fff;
  text-transform: uppercase; white-space: nowrap; box-shadow: rgba(0,0,0,0.18) 0 2px 6px; }
.lc-pill svg { flex: none; width: 10px; height: 10px; }
.lc-pill--live { background: linear-gradient(135deg, #ff9639 0%, #ef852e 40%, #be3d00 100%); }
.lc-pill--live i { width: 6px; height: 6px; border-radius: 50%; background: #fff; }
/* Recibe ofertas (feature nuevo): cian → morado de marca, en vez del turquesa plano de «Negociable». */
.lc-pill--negotiable { background: linear-gradient(110deg, #00A9B0 0%, #3F7FD0 45%, #6A35D6 100%); }
.lc-pill--featured { background: linear-gradient(135deg, #8460e5 0%, #3b1782 100%); }
`;
