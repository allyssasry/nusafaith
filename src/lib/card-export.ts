import { toBlob, toPng } from "html-to-image";

export const CARD_WIDTH = 1920;
export const CARD_HEIGHT = 1080;

async function waitForCardAssets(node: HTMLElement): Promise<void> {
  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }

  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map(async (img) => {
      if (!img.complete) {
        await new Promise<void>((resolve, reject) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener(
            "error",
            () => reject(new Error("Gagal memuat gambar template kartu.")),
            { once: true }
          );
        });
      }
      if (typeof img.decode === "function") {
        try {
          await img.decode();
        } catch {
          // Abaikan error decode jika gambar sudah siap dirender
        }
      }
    })
  );
}

function getExportOptions() {
  return {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    canvasWidth: CARD_WIDTH,
    canvasHeight: CARD_HEIGHT,
    pixelRatio: 1, // 1920 x 1080 px (1:1 sesuai resolusi asli template, tajam & cepat di HP)
    cacheBust: false,
    style: {
      transform: "none",
      margin: "0",
    },
  };
}

export function buildGreetingCardFilename(fullName: string): string {
  const slug = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `nusafaith-kasmaran-${slug || "peserta"}.png`;
}

export async function renderGreetingCardPngDataUrl(
  node: HTMLElement
): Promise<string> {
  await waitForCardAssets(node);
  return toPng(node, getExportOptions());
}

export async function renderGreetingCardBlob(
  node: HTMLElement
): Promise<Blob> {
  await waitForCardAssets(node);
  const blob = await toBlob(node, getExportOptions());
  if (!blob) {
    throw new Error("Gagal merender greeting card menjadi gambar PNG.");
  }
  return blob;
}

export function triggerPngDownload(dataUrlOrBlob: string | Blob, filename: string) {
  const isBlob = dataUrlOrBlob instanceof Blob;
  const href = isBlob ? URL.createObjectURL(dataUrlOrBlob) : dataUrlOrBlob;

  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (isBlob) {
    setTimeout(() => URL.revokeObjectURL(href), 5000);
  }
}
