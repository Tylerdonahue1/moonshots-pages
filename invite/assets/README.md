# /invite/assets — asset drop-in guide

The invite page renders with graceful fallbacks until these files exist. Drop a
file in at the exact path below and it auto-upgrades on next deploy — no code
change needed. Use **owned/approved/licensed** assets only.

## Section 05 — Tier 1 institution logos (grayscale logo strip)
Mono/white (or any color — CSS forces grayscale) logos, transparent background.
Until present, each shows a styled text wordmark fallback.

| File | Brand |
|---|---|
| `logos/google.svg` | Google |
| `logos/xprize.svg` | XPRIZE |
| `logos/range-media.svg` | Range Media |
| `logos/salesforce.svg` | Salesforce |
| `logos/a16z.svg` | Andreessen Horowitz |
| `logos/ark-invest.svg` | ARK Invest |
| `logos/stellar.svg` | Stellar |

PNG works too — rename the `src` in `index.html` or just use `.svg`. Logos are
normalized to ~36px height, so provide assets with consistent visual weight.

## Section 05 — Tier 2 headshots (B/W grid)
Square (1:1) photos, ~256×256 or larger; CSS crops to a circle and forces
grayscale. Until present, each shows an initials monogram.

`people/diamandis.jpg`, `people/ansari.jpg`, `people/horowitz.jpg`,
`people/benioff.jpg`, `people/wood.jpg`, `people/mccaleb.jpg`,
`people/roddenberry.jpg`

## Section 04 — SpaceShipOne proof image
Licensed/owned photo of SpaceShipOne (Ansari XPRIZE). The whole figure stays
hidden until at least one of these exists. Wide aspect (~16:9) looks best.

`spaceshipone.jpg` (required fallback) — optionally also `spaceshipone.webp`
and `spaceshipone.avif` for smaller transfer.

## Already here
`og-image.png` — 1200×630 social share card.
