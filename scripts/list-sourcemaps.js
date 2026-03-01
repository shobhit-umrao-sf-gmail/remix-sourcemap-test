#!/usr/bin/env node
/**
 * List uploaded sourcemaps in New Relic
 *
 * Required environment variables:
 * - NR_API_KEY: New Relic personal user API key
 * - NR_APPLICATION_ID: New Relic Browser application ID
 */

import { listSourcemaps } from "@newrelic/publish-sourcemap"

const NR_API_KEY = process.env.NR_API_KEY
const APPLICATION_ID = process.env.NR_APPLICATION_ID

if (!NR_API_KEY) {
  console.error("❌ Error: NR_API_KEY environment variable is required")
  process.exit(1)
}

if (!APPLICATION_ID) {
  console.error("❌ Error: NR_APPLICATION_ID environment variable is required")
  process.exit(1)
}

console.log("\n📋 Listing uploaded sourcemaps in New Relic\n")
console.log(`Application ID: ${APPLICATION_ID}\n`)

listSourcemaps({ applicationId: APPLICATION_ID, apiKey: NR_API_KEY, limit: 100, offset: 0 }, (err, result) => {
  if (err) {
    console.error("❌ Error:", err.message)
    process.exit(1)
  }

  const sourcemaps = result?.sourcemaps || []

  if (sourcemaps.length === 0) {
    console.log("No sourcemaps found.")
    return
  }

  console.log(`Found ${sourcemaps.length} sourcemap(s):\n`)
  sourcemaps.forEach((sm, index) => {
    console.log(`${index + 1}. ${sm.javascriptUrl}`)
    console.log(`   Release: ${sm.releaseId || "N/A"}`)
    console.log(`   Uploaded: ${sm.createdAt || "N/A"}`)
    console.log()
  })
})
