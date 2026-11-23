// Entry program for the "Day one, day seven" make.fun bounty.
//
// The video itself is the entry: a short TikTok video about Lantern Lane,
// our agent-built spot-the-difference game, on the day it was made and
// after a week of daily updates. This program's only job is to hand the
// video's address to the grader: it reads VIDEO.json from the repository
// root and copies it to the output directory.
//
// It runs on Node 22 with two environment variables:
//   MAKEFUN_BOT_DIR    -- the repository root (defaults to /bot)
//   MAKEFUN_OUTPUT_DIR -- where the entry's outputs go (defaults to /output)
//
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Validation is deliberately honest and small: VIDEO.json must parse as a
// JSON object with a string url, and that url must either be a real TikTok
// video address (https://www.tiktok.com/@<handle>/video/<digits>) or the
// kit's own placeholder, which stands in until the video is posted and its
// real address is written in. Anything else (a short link, a photo post, a
// non-TikTok address) fails loudly with exit code 1 instead of handing the
// grader a bad link. No network, no wall clock, no files outside the
// repository, so repeated runs write identical bytes.

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// A real TikTok video address, as TikTok shows it in a browser: the id is
// digits only, and a short link (vm.tiktok.com, vt.tiktok.com, tiktok.com/t)
// or a photo post (/photo/<id>) does not match.
const TIKTOK_VIDEO_URL =
  /^https:\/\/(www\.|m\.)?tiktok\.com\/@[^/]+\/video\/\d+$/;

// The placeholder the kit ships, kept until the video is posted.
const PLACEHOLDER_URL = "https://www.tiktok.com/@<handle>/video/<id>";

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

const source = join(BOT_DIR, "VIDEO.json");
let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(source, "utf8"));
} catch (error) {
  fail(
    `VIDEO.json could not be read as JSON: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
}

if (typeof parsed !== "object" || parsed === null || !("url" in parsed)) {
  fail("VIDEO.json must be a JSON object with a url field");
}
const url = (parsed as { url: unknown }).url;
if (typeof url !== "string") {
  fail("VIDEO.json url must be a string");
}
if (url !== PLACEHOLDER_URL && !TIKTOK_VIDEO_URL.test(url)) {
  fail(
    "VIDEO.json url must be a TikTok video address " +
      "(https://www.tiktok.com/@<handle>/video/<digits>)",
  );
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(source, join(OUTPUT_DIR, "VIDEO.json"));
} catch (error) {
  fail(
    `VIDEO.json could not be copied to ${OUTPUT_DIR}: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
}
