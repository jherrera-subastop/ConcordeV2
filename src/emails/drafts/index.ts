import { valorizacionPublicacion } from "./01-valorizacion-publicacion";
import { publicacionRevision } from "./02-publicacion-revision";
import { publicacionExitosa } from "./03-publicacion-exitosa";
import { condicionesAvisoPrevio } from "./04-condiciones-aviso-previo";
import { condicionesVigentes } from "./05-condiciones-vigentes";
import type { EmailDraft } from "./shared";

export const EMAIL_DRAFTS: EmailDraft[] = [
  valorizacionPublicacion,
  publicacionRevision,
  publicacionExitosa,
  condicionesAvisoPrevio,
  condicionesVigentes,
];
export const getEmailDraft = (id: string): EmailDraft | undefined => EMAIL_DRAFTS.find(draft => draft.id === id);
export { renderDraft, renderDraftBase } from "./shared";
