// Fundido foto → fondo para los banners con foto (publica-vmc.html, max-vmc.html), 22/10.
// El área vacía del banner se pinta con los colores reales del borde de la foto (muestreados en 8 puntos a lo largo del borde
// que toca el fondo), y el velo de marca cubre solo el lado del texto y termina antes de la foto: no hay banda en la unión.
// side = la foto entra por arriba (verticales); si no, por la izquierda (franjas y hero). izq = franja con la foto a la izquierda:
// se muestrea su borde derecho y el velo va de derecha a izquierda.
function blendBanner(bn, img, side, claro, izq) {
  const go = () => {
    const iw = img.naturalWidth, ih = img.naturalHeight, bw = img.clientWidth, bh = img.clientHeight;
    if (!iw || !bw) return;
    // Mapeo elemento → imagen (object-fit cover u otro: escala y desplazamiento reales).
    const cs = getComputedStyle(img), cover = cs.objectFit === "cover";
    const s = cover ? Math.max(bw / iw, bh / ih) : side ? bw / iw : bh / ih;
    const [px, py] = cs.objectPosition.split(" ").map((v) => parseFloat(v) / 100);
    const ox = cover ? (bw - iw * s) * px : 0, oy = cover ? (bh - ih * s) * py : 0;
    const c = document.createElement("canvas"); c.width = iw; c.height = ih;
    const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0);
    const stops = [], cols = [];
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      // Punto del borde visible, en coordenadas de la imagen; se promedia un bloque de 8 × 8 px.
      const ex = side ? t * bw : izq ? bw - 1 : 0, ey = side ? 0 : t * bh;
      const ix = Math.min(iw - 8, Math.max(0, Math.round((ex - ox) / s))), iy = Math.min(ih - 8, Math.max(0, Math.round((ey - oy) / s)));
      const d = x.getImageData(ix, iy, 8, 8).data; let r = 0, g = 0, b = 0;
      for (let k = 0; k < d.length; k += 4) { r += d[k]; g += d[k + 1]; b += d[k + 2]; }
      const n = d.length / 4;
      // La posición del punto se expresa en % del banner (el borde de la foto ocupa todo el alto o todo el ancho del banner).
      const at = side ? (img.offsetLeft + ex) / bn.clientWidth : (img.offsetTop + ey) / bn.clientHeight;
      cols.push([r / n, g / n, b / n]);
      stops.push(`rgb(${Math.round(r / n)} ${Math.round(g / n)} ${Math.round(b / n)}) ${(at * 100).toFixed(1)}%`);
    }
    const start = side ? img.offsetTop / bn.clientHeight : izq ? 1 - (img.offsetLeft + bw) / bn.clientWidth : img.offsetLeft / bn.clientWidth; // dónde empieza la foto
    // El velo de marca toma parte del tono real de la foto: con una foto casi negra (moto de noche) el violeta se oscurece
    // y no queda un violeta brillante chocando con el negro; con fotos de colores casi no cambia.
    const avg = [0, 1, 2].map((i) => cols.reduce((a, c) => a + c[i], 0) / cols.length);
    const lum = (0.2126 * avg[0] + 0.7152 * avg[1] + 0.0722 * avg[2]) / 255;
    const mix = (c, k) => c.map((v, i) => Math.round(v * (1 - k) + avg[i] * k)).join(" ");
    const kk = lum < 0.12 ? [0.6, 0.85] : lum < 0.3 ? [0.45, 0.75] : [0.2, 0.45];
    const brand = claro ? ["rgb(246 240 253)", "rgb(246 240 253 / 85%)"] : [`rgb(${mix([74, 29, 184], kk[0])})`, `rgb(${mix([46, 14, 134], kk[1])} / 90%)`];
    const velo = `linear-gradient(${side ? "180deg" : izq ? "270deg" : "90deg"}, ${brand[0]} 0%, ${brand[1]} ${(start * 55).toFixed(1)}%, transparent ${(start * 100).toFixed(1)}%)`;
    bn.style.background = `${velo}, linear-gradient(${side ? "90deg" : "180deg"}, ${stops.join(", ")})`;
  };
  img.complete && img.naturalWidth ? go() : img.addEventListener("load", go);
}
