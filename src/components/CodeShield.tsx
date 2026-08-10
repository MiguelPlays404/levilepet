import { useEffect } from "react";

/**
 * CodeShield — dificulta a inspeção casual do código no navegador.
 * Bloqueia F12, Ctrl/Cmd+Shift+I/J/C, Ctrl/Cmd+U, botão direito e seleção
 * em massa, exibindo o aviso de direitos reservados.
 *
 * Observação honesta: nenhum site pode impedir totalmente o DevTools — o
 * navegador é do usuário. Isto é uma camada de dissuasão; a proteção real
 * dos dados continua sendo o RLS + validações no servidor.
 */
const MESSAGE = "Le Ville Pet tem seus códigos e direitos reservados.";

function showNotice() {
  const id = "lvp-code-shield-notice";
  if (document.getElementById(id)) return;
  const el = document.createElement("div");
  el.id = id;
  el.setAttribute("role", "status");
  el.textContent = MESSAGE;
  el.style.cssText = [
    "position:fixed", "left:50%", "top:24px", "transform:translateX(-50%)",
    "z-index:2147483647", "background:#09090B", "color:#F5C000",
    "border:1px solid rgba(245,192,0,.45)", "border-radius:12px",
    "padding:12px 18px", "font:600 13px/1.4 Inter,system-ui,sans-serif",
    "box-shadow:0 10px 40px rgba(0,0,0,.5)", "max-width:90vw", "text-align:center",
  ].join(";");
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

export function CodeShield() {
  useEffect(() => {
    if (import.meta.env.DEV) return; // não atrapalha o desenvolvimento

    const onContextMenu = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, [contenteditable='true']")) return;
      e.preventDefault();
      showNotice();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      const blocked =
        e.key === "F12" ||
        (mod && e.shiftKey && ["i", "j", "c"].includes(k)) ||
        (mod && k === "u") ||
        (mod && k === "s");
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        showNotice();
      }
    };

    const onDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement)?.tagName === "IMG") e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("dragstart", onDragStart);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("dragstart", onDragStart);
    };
  }, []);

  return null;
}
