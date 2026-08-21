import { useEffect } from "react";

/**
 * CodeShield — camada de dissuasão contra inspeção casual do código.
 *
 * Bloqueia: menu de contexto, F12, Ctrl/Cmd+Shift+I/J/C/K/E, Ctrl/Cmd+U (view-source),
 * Ctrl/Cmd+S / P / A, arrasto de imagens, seleção em massa, colagem de
 * `javascript:`/`view-source:` na barra e mantém um detector de DevTools que
 * borra a tela enquanto o painel estiver aberto.
 *
 * Observação honesta: nenhum site consegue impedir 100% o view-source — o
 * navegador é do usuário e o HTML/JS precisa chegar até ele. Isto eleva muito
 * a barreira; a proteção real dos dados continua sendo RLS + validação no
 * servidor (nada sensível trafega no bundle).
 */
const MESSAGE = "Le Ville Pet tem seus códigos e direitos reservados.";
const BLUR_ID = "lvp-code-shield-blur";

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

function setBlur(active: boolean) {
  const existing = document.getElementById(BLUR_ID);
  if (!active) {
    existing?.remove();
    document.documentElement.style.removeProperty("overflow");
    return;
  }
  if (existing) return;
  const el = document.createElement("div");
  el.id = BLUR_ID;
  el.innerHTML =
    `<div style="max-width:420px;text-align:center;color:#F5C000;font:600 16px/1.5 Inter,system-ui,sans-serif">${MESSAGE}<br><span style="color:#fff;font-weight:400;font-size:14px">Feche as ferramentas de desenvolvedor para continuar navegando.</span></div>`;
  el.style.cssText = [
    "position:fixed", "inset:0", "z-index:2147483646",
    "background:#09090B", "display:flex", "align-items:center",
    "justify-content:center", "padding:24px",
  ].join(";");
  document.body.appendChild(el);
  document.documentElement.style.overflow = "hidden";
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

    const isEditable = (t: EventTarget | null) =>
      !!(t as HTMLElement | null)?.closest?.("input, textarea, [contenteditable='true']");

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key?.toLowerCase?.() ?? "";
      const mod = e.ctrlKey || e.metaKey;
      const editable = isEditable(e.target);
      const blocked =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && k === "c") ||
        (mod && e.shiftKey && ["i", "j", "c", "k", "e", "m"].includes(k)) ||
        (mod && e.altKey && ["i", "j", "u", "c"].includes(k)) ||
        (mod && ["u", "s", "p"].includes(k)) ||
        (mod && k === "a" && !editable);
      if (blocked) {
        e.preventDefault();
        e.stopImmediatePropagation();
        showNotice();
      }
    };

    const onDragStart = (e: DragEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "IMG" || tag === "VIDEO") e.preventDefault();
    };

    const onCopy = (e: ClipboardEvent) => {
      if (isEditable(e.target)) return;
      const sel = window.getSelection?.()?.toString() ?? "";
      if (sel.length > 240) {
        e.preventDefault();
        showNotice();
      }
    };

    const onSelectStart = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (isEditable(t)) return;
      if (t?.closest("[data-allow-select]")) return;
      e.preventDefault();
    };

    const onAuxClick = (e: MouseEvent) => {
      if (e.button === 1) e.preventDefault(); // clique do meio (abrir em nova aba/colar)
    };

    // Detector simples de DevTools (janela desencaixada ou docked)
    const THRESHOLD = 170;
    let blurred = false;
    const checkDevtools = () => {
      const open =
        window.outerWidth - window.innerWidth > THRESHOLD ||
        window.outerHeight - window.innerHeight > THRESHOLD;
      if (open !== blurred) {
        blurred = open;
        setBlur(open);
      }
    };
    const timer = window.setInterval(checkDevtools, 800);

    // CSS de reforço (seleção e arrasto)
    const style = document.createElement("style");
    style.textContent =
      `body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}` +
      `input,textarea,[contenteditable='true'],[data-allow-select]{-webkit-user-select:text;user-select:text}` +
      `img,video{-webkit-user-drag:none;user-drag:none}` +
      `@media print{body{display:none!important}}`;
    document.head.appendChild(style);

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("copy", onCopy, true);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("auxclick", onAuxClick, true);
    window.addEventListener("resize", checkDevtools);

    return () => {
      window.clearInterval(timer);
      style.remove();
      setBlur(false);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("copy", onCopy, true);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("auxclick", onAuxClick, true);
      window.removeEventListener("resize", checkDevtools);
    };
  }, []);

  return null;
}
