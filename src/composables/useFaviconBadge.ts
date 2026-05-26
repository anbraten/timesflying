import { ref } from "vue";

// Module-level singleton state — shared across all callers.
const hasBadge = ref(false);
let originalHref: string | undefined = undefined;
let loadToken = 0;

function cacheOriginal() {
  if (originalHref !== undefined) return;
  const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  originalHref = link?.href ?? "/favicon.ico";
}

function drawDot(ctx: CanvasRenderingContext2D) {
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(24, 6, 7, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.beginPath();
  ctx.arc(24, 6, 5, 0, 2 * Math.PI);
  ctx.fillStyle = "#ef4444";
  ctx.fill();
}

function setFaviconHref(href: string) {
  const existing = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (existing) existing.remove();
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  link.href = href;
  document.head.appendChild(link);
}

function showBadge() {
  cacheOriginal();
  hasBadge.value = true;
  const myToken = ++loadToken;

  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  const img = new Image();
  img.onload = () => {
    if (myToken !== loadToken) return;
    ctx.drawImage(img, 0, 0, 32, 32);
    drawDot(ctx);
    setFaviconHref(canvas.toDataURL("image/png"));
  };
  img.src = originalHref!;
}

function hideBadge() {
  loadToken++;
  hasBadge.value = false;
  // Cache here too, in case hideBadge is called before any showBadge.
  // That way originalHref is set, and any future restoration works.
  cacheOriginal();
  if (originalHref !== undefined) setFaviconHref(originalHref);
}

export function useFaviconBadge() {
  return { hasBadge, showBadge, hideBadge };
}
