#!/usr/bin/env node
/**
 * Upload sourcemaps to New Relic
 *
 * Required environment variables:
 * - NR_API_KEY: New Relic personal user API key
 * - NR_APPLICATION_ID: New Relic Browser application ID
 * - BASE_URL: Deployment URL (e.g. https://app.superfuel.io)
 * - RELEASE_ID: (optional) Release identifier / git commit SHA
 */

import { fileURLToPath } from "url"
import fs from "fs"
import path from "path"
import { publishSourcemap } from "@newrelic/publish-sourcemap"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const NR_API_KEY = process.env.NR_API_KEY
const APPLICATION_ID = process.env.NR_APPLICATION_ID
const RELEASE_ID = process.env.RELEASE_ID
const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

const BUILD_DIR = path.join(__dirname, "..", "build", "client")
const SOURCEMAP_EXTENSIONS = [".js.map", ".css.map"]

if (!NR_API_KEY) {
  console.error("❌ Error: NR_API_KEY environment variable is required")
  process.exit(1)
}

if (!APPLICATION_ID) {
  console.error("❌ Error: NR_APPLICATION_ID environment variable is required")
  process.exit(1)
}

if (!RELEASE_ID) {
  console.warn("⚠️  RELEASE_ID not set - sourcemaps will be matched by URL only")
}

function findSourcemaps(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const filepath = path.join(dir, file)
    const stat = fs.statSync(filepath)
    if (stat.isDirectory()) {
      findSourcemaps(filepath, fileList)
    } else if (SOURCEMAP_EXTENSIONS.some((ext) => file.endsWith(ext))) {
      fileList.push(filepath)
    }
  })
  return fileList
}

function uploadSourcemap(sourcemapPath) {
  return new Promise((resolve, reject) => {
    const relativeSourcemapPath = path.relative(BUILD_DIR, sourcemapPath)
    const originalFilePath = relativeSourcemapPath.replace(/\.map$/, "")

    try {
      const sourcemapContent = fs.readFileSync(sourcemapPath, "utf8")
      const sourcemap = JSON.parse(sourcemapContent)
      if (!sourcemap.sources || sourcemap.sources.length === 0 || !sourcemap.mappings) {
        console.log(`📤 Skipped (empty): ${relativeSourcemapPath}`)
        return resolve()
      }
    } catch {
      console.log(`📤 Skipped (invalid JSON): ${relativeSourcemapPath}`)
      return resolve()
    }

    const jsUrl = `${BASE_URL}/${originalFilePath}`
    console.log(`📤 Uploading: ${relativeSourcemapPath}`)
    console.log(`   URL: ${jsUrl}`)

    publishSourcemap(
      {
        sourcemapPath,
        javascriptUrl: jsUrl,
        applicationId: APPLICATION_ID,
        apiKey: NR_API_KEY,
      },
      (err) => {
        if (err) {
          if (err.status === 409) {
            console.log(`   ⏭️  Already uploaded`)
            resolve()
          } else {
            console.error(`   ❌ Failed: ${err.message}`)
            reject(err)
          }
        } else {
          console.log(`   ✅ Success`)
          resolve()
        }
      }
    )
  })
}

async function main() {
  console.log("\n🚀 New Relic Sourcemap Upload\n")
  console.log(`Application ID: ${APPLICATION_ID}`)
  console.log(`Release ID:     ${RELEASE_ID || "(none)"}`)
  console.log(`Base URL:       ${BASE_URL}`)
  console.log(`Build Dir:      ${BUILD_DIR}\n`)

  if (!fs.existsSync(BUILD_DIR)) {
    console.error(`❌ Build directory not found: ${BUILD_DIR}`)
    console.error('   Run "npm run build" first')
    process.exit(1)
  }

  const sourcemaps = findSourcemaps(BUILD_DIR)

  if (sourcemaps.length === 0) {
    console.warn("⚠️  No sourcemaps found — make sure vite.config.ts has sourcemap: true")
    process.exit(0)
  }

  console.log(`Found ${sourcemaps.length} sourcemap(s)\n`)

  let uploaded = 0
  let failed = 0

  for (const sourcemap of sourcemaps) {
    try {
      await uploadSourcemap(sourcemap)
      uploaded++
    } catch {
      console.error(`Error uploading ${path.basename(sourcemap)}`)
      failed++
    }
  }

  console.log(`\n📊 Results: ${uploaded} uploaded, ${failed} failed\n`)

  if (failed > 0) process.exit(1)
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
