// Copies the @aiden0z/pptx-renderer standalone browser bundle into public/vendor,
// versioned by the installed package version, for use by the raw HTML document
// served at /posts/[id]/slides and /projects/[id]/slides (see lib/pptx.ts).
//
// Run manually after upgrading @aiden0z/pptx-renderer:
//   node scripts/sync-pptx-renderer.mjs
import { copyFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const pkg = JSON.parse(
  await import("node:fs").then((fs) =>
    fs.readFileSync(
      join(rootDir, "node_modules/@aiden0z/pptx-renderer/package.json"),
      "utf8"
    )
  )
)

const src = join(
  rootDir,
  "node_modules/@aiden0z/pptx-renderer/dist/aiden0z-pptx-renderer.browser.es.js"
)
const destDir = join(rootDir, "public/vendor/pptx-renderer", pkg.version)
const dest = join(destDir, "aiden0z-pptx-renderer.browser.es.js")

mkdirSync(destDir, { recursive: true })
copyFileSync(src, dest)

console.log(`Synced pptx-renderer ${pkg.version} browser bundle to ${dest}`)
console.log(
  `Make sure PPTX_RENDERER_VERSION in lib/pptx.ts matches: ${pkg.version}`
)
