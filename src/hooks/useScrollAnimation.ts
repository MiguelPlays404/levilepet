import { useEffect } from 'react';

/**
 * useScrollAnimation — revelação de elementos [data-animate] ao entrar na viewport.
 *
 * Gargalos que esta versão resolve:
 *
 * 1. ANTES cada página criava seu próprio IntersectionObserver + MutationObserver.
 *    Com layout + rail de álbuns + seções, chegavam a existir vários observers
 *    concorrentes. AGORA são singletons de módulo, compartilhados por todos os
 *    consumidores (contagem de referência para desligar quando ninguém usa).
 *
 * 2. ANTES o MutationObserver rodava `querySelectorAll` a CADA nó adicionado —
 *    ou seja, a cada render do React que inserisse DOM (listas, modais, toasts).
 *    Isso é trabalho síncrono no main thread bem no meio do commit do React.
 *    AGORA as mutações são enfileiradas e processadas UMA vez por frame (rAF),
 *    fora do caminho crítico do commit.
 *
 * 3. `rootMargin` positivo antecipa a revelação: o elemento já chega animando,
 *    então o usuário nunca "pega" o fade no meio.
 *
 * 4. Respeita `prefers-reduced-motion`: nesse caso nada é observado, o CSS já
 *    entrega tudo visível.
 */

let io: IntersectionObserver | null = null;
let mo: MutationObserver | null = null;
let consumers = 0;
let rafId: number | null = null;
let pending: HTMLElement[] = [];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function reveal(el: HTMLElement) {
  // Aplica o stagger como transition-delay (o CSS lê --rv-delay), mantendo
  // compatibilidade com elementos que definem data-delay dinamicamente.
  const delay = el.dataset.delay;
  if (delay) {
    const ms = Math.min(parseInt(delay, 10) || 0, 6) * 55;
    if (ms) el.style.setProperty('--rv-delay', `${ms}ms`);
  }
  el.classList.add('is-visible');
}

function ensureObservers() {
  if (io) return;

  io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        reveal(el);
        io!.unobserve(el);
      }
    },
    // Antecipa 80px: a animação termina praticamente quando o elemento
    // encosta na viewport → sensação de conteúdo "já pronto".
    { threshold: 0, rootMargin: '0px 0px 80px 0px' }
  );

  const observeTree = (root: ParentNode) => {
    root.querySelectorAll<HTMLElement>('[data-animate]:not(.is-visible)').forEach((el) => {
      io!.observe(el);
    });
  };

  const flush = () => {
    rafId = null;
    const batch = pending;
    pending = [];
    for (const node of batch) {
      if (!node.isConnected) continue;
      if (node.matches?.('[data-animate]') && !node.classList.contains('is-visible')) {
        io!.observe(node);
      }
      observeTree(node);
    }
  };

  observeTree(document);

  mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (n.nodeType === 1) pending.push(n as HTMLElement);
      }
    }
    // Uma única varredura por frame, fora do commit do React.
    if (pending.length && rafId === null) {
      rafId = requestAnimationFrame(flush);
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
}

function teardown() {
  io?.disconnect();
  mo?.disconnect();
  if (rafId !== null) cancelAnimationFrame(rafId);
  io = null;
  mo = null;
  rafId = null;
  pending = [];
}

export const useScrollAnimation = () => {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    consumers += 1;
    ensureObservers();

    return () => {
      consumers -= 1;
      if (consumers <= 0) {
        consumers = 0;
        teardown();
      }
    };
  }, []);
};
