// ponytail: solo flushSync; instalar @types/react-dom si se usa algo más de react-dom.
declare module "react-dom" { export function flushSync<R>(fn: () => R): R; export function createPortal(children: import("react").ReactNode, container: Element, key?: string | null): import("react").ReactPortal; }
