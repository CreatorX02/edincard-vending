# Structured data blocks

Each file here is one JSON-LD block. A page opts in by listing the filename
(without `.json`) in its `schema` array in the front matter.

## machine-waverley.json — currently NOT in use

Ready to go, but deliberately not attached to any page yet: the Waverley
machine is not installed and taking payments. Publishing a `Store` entry for
a business that isn't open puts a false "you can buy here" result into local
search, so it stays off until the unit is live.

**When the Waverley machine goes live**, add `"machine-waverley"` to the
`schema` array in `src/pages/locations.html`, add an `openingHours` property
with the station's real hours, flip the card's pill from `pill-soon` to
`pill-live`, and re-run `python3 tools/build.py`.

Copy this file per site as more machines go in — change the `@id`, `name`
and `address` each time.
