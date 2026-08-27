// PPTX presentations are stored as a raw base64-encoded copy of the uploaded
// .pptx file (see ContentType.PPTX in prisma/schema.prisma) and rendered
// entirely in the browser via @aiden0z/pptx-renderer — there is no server-side
// parsing or conversion step.
//
// The renderer's standalone browser bundle is vendored into public/ (see
// scripts/sync-pptx-renderer.mjs) so the slides route can serve a single
// self-contained HTML document, the same way lib/reveal.ts serves RevealJS
// presentations via CDN script tags.

// Keep in sync with the installed @aiden0z/pptx-renderer version - run
// `node scripts/sync-pptx-renderer.mjs` after upgrading the package.
const PPTX_RENDERER_VERSION = "1.2.4"
const PPTX_RENDERER_URL = `/vendor/pptx-renderer/${PPTX_RENDERER_VERSION}/aiden0z-pptx-renderer.browser.es.js`

// 50MB of raw file bytes. Stored as base64 this is ~67MB of text in the
// `content` column (Postgres TEXT, so well within limits).
export const MAX_PPTX_FILE_BYTES = 50 * 1024 * 1024

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Builds a self-contained HTML document that renders a base64-encoded PPTX
 * file client-side using @aiden0z/pptx-renderer. `base64Content` must be a
 * plain base64 string (no `data:` prefix) - this is how Post/Project.content
 * is stored for ContentType.PPTX.
 */
export function buildPptxViewerHtml(base64Content: string, title: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background: #191919;
      color: #eee;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    #pptx-outer {
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    /* Sized in JS to match the slide's own aspect ratio, so the renderer's
       width-based "contain" fit also ends up height-contained. */
    #pptx-stage {
      position: relative;
    }
    #pptx-status {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
      font-size: 1.1rem;
      z-index: 20;
    }
    #pptx-status.hidden {
      display: none;
    }
    #pptx-status .error {
      color: #ff6b6b;
      white-space: pre-wrap;
    }
    .pptx-nav-zone {
      position: fixed;
      top: 0;
      bottom: 0;
      width: 20%;
      cursor: pointer;
      z-index: 5;
    }
    .pptx-nav-zone.prev {
      left: 0;
    }
    .pptx-nav-zone.next {
      right: 0;
    }
    .pptx-controls {
      position: fixed;
      bottom: 0.75rem;
      right: 1rem;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #aaa;
      user-select: none;
    }
    .pptx-controls button {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #eee;
      border-radius: 6px;
      width: 2rem;
      height: 2rem;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }
    .pptx-controls button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.18);
    }
    .pptx-controls button:disabled {
      opacity: 0.35;
      cursor: default;
    }
    #pptx-counter {
      min-width: 3.5rem;
      text-align: center;
    }
  </style>
</head>
<body>
  <div id="pptx-status">Loading presentation&hellip;</div>
  <div id="pptx-outer"><div id="pptx-stage"></div></div>
  <div class="pptx-nav-zone prev" id="pptx-prev-zone" title="Previous slide"></div>
  <div class="pptx-nav-zone next" id="pptx-next-zone" title="Next slide"></div>
  <div class="pptx-controls">
    <button id="pptx-prev" title="Previous slide (←)">&#8249;</button>
    <span id="pptx-counter"></span>
    <button id="pptx-next" title="Next slide (→)">&#8250;</button>
    <button id="pptx-fullscreen" title="Fullscreen (F)">&#9974;</button>
  </div>

  <script type="module">
    import { PptxViewer, parseZip, buildPresentation, RECOMMENDED_ZIP_LIMITS } from "${PPTX_RENDERER_URL}";

    const statusEl = document.getElementById("pptx-status");
    const stage = document.getElementById("pptx-stage");
    const counterEl = document.getElementById("pptx-counter");
    const prevBtn = document.getElementById("pptx-prev");
    const nextBtn = document.getElementById("pptx-next");
    const fullscreenBtn = document.getElementById("pptx-fullscreen");
    const prevZone = document.getElementById("pptx-prev-zone");
    const nextZone = document.getElementById("pptx-next-zone");

    let viewer = null;

    function base64ToArrayBuffer(base64) {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    }

    function updateControls() {
      if (!viewer) return;
      const index = viewer.currentSlideIndex;
      const count = viewer.slideCount;
      counterEl.textContent = (index + 1) + " / " + count;
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= count - 1;
    }

    function goNext() {
      if (!viewer) return;
      viewer.goToSlide(Math.min(viewer.currentSlideIndex + 1, viewer.slideCount - 1));
    }

    function goPrev() {
      if (!viewer) return;
      viewer.goToSlide(Math.max(viewer.currentSlideIndex - 1, 0));
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }

    prevBtn.addEventListener("click", goPrev);
    nextBtn.addEventListener("click", goNext);
    prevZone.addEventListener("click", goPrev);
    nextZone.addEventListener("click", goNext);
    fullscreenBtn.addEventListener("click", toggleFullscreen);

    document.addEventListener("keydown", (e) => {
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        goNext();
      } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Home") {
        e.preventDefault();
        viewer?.goToSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        viewer?.goToSlide(viewer.slideCount - 1);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    });

    // The renderer's "contain" fit mode only scales to the container's
    // *width* (it's built for a vertically-scrolling slide list, where
    // height is unconstrained). For a single centered slide we size the
    // stage element ourselves to the slide's own aspect ratio first, so
    // that width-based fit also ends up height-contained within the
    // viewport. The library's own ResizeObserver on the stage element
    // picks up size changes and re-renders automatically.
    function sizeStage(aspectRatio) {
      const pad = 32;
      const maxW = Math.max(window.innerWidth - pad, 1);
      const maxH = Math.max(window.innerHeight - pad, 1);
      let w = maxW;
      let h = w / aspectRatio;
      if (h > maxH) {
        h = maxH;
        w = h * aspectRatio;
      }
      stage.style.width = w + "px";
      stage.style.height = h + "px";
    }

    async function main() {
      const base64 = ${JSON.stringify(base64Content)};
      const buffer = base64ToArrayBuffer(base64);

      const files = await parseZip(buffer, RECOMMENDED_ZIP_LIMITS);
      const presentation = buildPresentation(files);
      const aspectRatio = presentation.width / presentation.height;

      sizeStage(aspectRatio);
      window.addEventListener("resize", () => sizeStage(aspectRatio));

      viewer = new PptxViewer(stage, { fitMode: "contain" });
      viewer.load(presentation);
      await viewer.renderSlide(0);

      viewer.on("slidechange", updateControls);
      updateControls();
      statusEl.classList.add("hidden");
    }

    main().catch((err) => {
      console.error("Failed to render presentation:", err);
      statusEl.innerHTML = '<div class="error">Failed to render this presentation.<br>' +
        (err && err.message ? String(err.message).replace(/</g, "&lt;") : "Unknown error") +
        '</div>';
    });
  </script>
</body>
</html>`
}
