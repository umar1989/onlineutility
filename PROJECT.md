# PROJECT.md

Static utility-tools site for Indian exam applicants, students and teachers. Astro (static output), vanilla JS tools,
Markdown guides. Hosting-neutral (GitHub Pages and Cloudflare Pages both serve `dist/` as-is).

## Commands
- `npm run dev` start dev server · `npm run build` build to `dist/` · `npm run preview` serve the build
- `npm run check` audits the built site (internal links, titles, descriptions, word counts) — run after `npm run build`
- `node tests/make-fixtures.mjs` then `node tests/test-<tool>.mjs` run browser tests (Playwright + Chromium)

## Conventions
- Site address, name, author, email, Search Console tag and ad slot sizes: **`src/config.ts` only**.
- Tools are registered in `src/data/tools.ts` (slug, title < 60 chars, meta description, category, guide, related).
- URLs: lowercase, hyphenated, trailing slash. One tool per URL. No near-duplicate pages; use options instead.
- One H1 per page. Tool pages: lead paragraph (contains primary phrase) → tool → how-to → worked example → FAQs → related.
- Every drafted text block carries an `AUTHOR REVIEW` comment (`{/* AUTHOR REVIEW: … */}` in .astro, a hidden
  `[//]: # (AUTHOR REVIEW: …)` line in Markdown guides).
- Never state official photo/file-size rules for any exam. Presets are generic and say "check your notification".
- Ads: two empty reserved blocks (`top`, `bottom`) in `Base.astro` via `AdSlot`. No AdSense code. 404 has none.
- All file processing is in the browser. Scripts are vanilla JS in `src/scripts/`, imported by the tool page with
  `<script>import '../../scripts/x.js'</script>` (Astro bundles it). Heavy libraries load only on the pages that need them.
- Fonts: system stack. One stylesheet: `src/styles/global.css`.

## Folder structure
```
src/config.ts            site-wide settings
src/data/tools.ts        tool registry + categories
src/layouts/             Base, ToolLayout, GuideLayout, PageLayout
src/components/          Header, Footer, Breadcrumb, AdSlot, FaqBlock, ToolCard, RelatedLinks
src/content/guides/*.md  guides (content collection, schema in src/content.config.ts)
src/pages/<slug>/index.astro   one folder per tool
src/pages/{about,contact,privacy-policy,terms-and-disclaimer}.astro
src/pages/{robots.txt,sitemap.xml}.ts   generated at build time (sitemap has lastmod)
src/scripts/             vanilla JS for tools (common.js = shared helpers)
src/styles/global.css
public/                  favicon, apple-touch icon, og-default.png, author placeholder
tests/                   static server, fixtures generator, Playwright tests
scripts/                 make-images.mjs (icons/og), check-site.mjs (audit)
_old/                    previous files (git-ignored, never reused)
```

## Checklist: adding a tool
1. Add entry to `src/data/tools.ts` (slug = what people search; title < 60 chars; description 120–160 chars; guide slug; related).
2. Create `src/pages/<slug>/index.astro` using `ToolLayout` (slots: `lead`, `tool`, default prose; pass `faqs`, 4–5 items).
3. Put logic in `src/scripts/<name>.js` (vanilla JS), import it from the page.
4. Prose 300–500 words incl. FAQs: how to use, worked example, 4–5 FAQs. Add `AUTHOR REVIEW` comments.
5. Add guide `src/content/guides/<guide-slug>.md` (600–900 words, frontmatter: title ≤ 60, description, primaryPhrase, tool, published, updated).
6. `npm run build`, `npm run check`, write/run a Playwright test, commit.
7. Record the primary phrase and review status below.

## Primary search phrases
| Page | URL | Primary phrase |
|---|---|---|
| Home | `/` | exam form and classroom tools |
| Photo and signature resizer | `/photo-and-signature-resizer/` | photo and signature resizer |
| Guide | `/guides/how-to-reduce-photo-size-in-kb/` | how to reduce photo size in kb |
| Image to PDF | `/image-to-pdf/` | image to pdf converter |
| Guide | `/guides/how-to-combine-photos-into-one-pdf/` | how to combine photos into one pdf |
| PDF to image | `/pdf-to-image/` | pdf to image converter |
| Guide | `/guides/how-to-convert-pdf-pages-to-images/` | how to convert pdf pages to images |
| Percentage calculator | `/percentage-calculator/` | percentage calculator |
| Guide | `/guides/how-to-calculate-percentage-of-marks/` | how to calculate percentage of marks |
| CGPA to percentage | `/cgpa-to-percentage-calculator/` | cgpa to percentage calculator |
| Guide | `/guides/how-to-convert-cgpa-to-percentage/` | how to convert cgpa to percentage |
| Age calculator | `/age-calculator-for-cut-off-date/` | age calculator for cut off date |
| Guide | `/guides/how-to-calculate-age-on-a-cut-off-date/` | how to calculate age on a cut-off date |
| Seating plan generator | `/seating-plan-generator/` | seating plan generator |
| Guide | `/guides/how-to-make-an-exam-hall-seating-plan/` | how to make an exam hall seating plan |
| Random student picker | `/random-student-picker/` | random student picker |
| Guide | `/guides/how-to-pick-students-fairly-in-class/` | how to pick students fairly in class |
| Marks to grade converter | `/marks-to-grade-converter/` | marks to grade converter |
| Guide | `/guides/how-to-convert-marks-to-grades/` | how to convert marks to grades |
| Compress PDF | `/compress-pdf-to-specific-size/` | compress pdf to specific size |
| Guide | `/guides/how-to-make-a-pdf-smaller-for-upload/` | how to make a pdf smaller |

## Backlog
- [x] Phase 1: shell (config, layouts, components, stylesheet, home, guides index, 404, robots.txt, sitemap)
- [x] Phase 2: About, Contact, Privacy Policy, Terms and Disclaimer
- [x] Tool 1: Photo and signature resizer + guide
- [x] Tool 2: Compress PDF to a target size + guide
- [x] Tool 3: Image to PDF + guide
- [x] Tool 4: PDF to image + guide
- [x] Tool 5: Percentage calculator + guide
- [x] Tool 6: CGPA to percentage converter + guide
- [x] Tool 7: Age calculator for a cut-off date + guide
- [x] Tool 8: Seating plan generator + guide
- [x] Tool 9: Random student picker + guide
- [x] Tool 10: Marks to grade converter + guide
- [ ] Phase 4: Lighthouse audit (mobile): home, one tool, one guide, each ≥ 90
- [ ] Phase 5: domain + CNAME, GitHub Actions workflow, link/title audit, history check, add remote (no push)

## Pages needing author review (all drafted text)
- Home (intro, "why these tools exist")
- About (name, photo, teaching background — placeholders)
- Contact (email placeholder in `src/config.ts`)
- Privacy Policy, Terms and Disclaimer
- Photo and signature resizer + guide
- Compress PDF + guide
- Percentage calculator, CGPA to percentage, Age calculator (each + guide)
- Seating plan generator, Random student picker, Marks to grade converter (each + guide)
- PDF to image + guide
- Image to PDF + guide

## Lighthouse results
_Not run yet._
