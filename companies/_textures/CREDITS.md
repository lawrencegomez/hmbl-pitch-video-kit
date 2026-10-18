# Shared Vox textures (rule 11)

Real texture photos for the kit's `<Texture>` / `<PaperDisplace>` (src/voxa/kit.tsx). All public domain or made by us,
so they can live in the kit and go into any video. Each was run through `tools/vox-texture.sh` (grey, cropped to
1080x1920, average moved to mid-grey so overlay / hard-light stays neutral).

| File | Source | Licence |
|---|---|---|
| `paper-crumple.jpg` | "Crumpled olive green paper.jpg", Wikimedia Commons (rotated 90) | Public domain |
| `paper-old.jpg` | "Old Paper texture.jpg", Wikimedia Commons | Public domain |
| `newsprint.jpg` | The Paper Trade Journal, 1888-02-25, text columns from the tops of pages 4 and 3 stacked (no drawings or ads, so nothing reads as content), Internet Archive scan on Wikimedia Commons | Public domain |
| `dust.png` | Specks and hairline scratches on mid-grey, made with ImageMagick | Ours |
| `dispmap.png` | Red = `paper-crumple.jpg`, green = the same turned 180, blue = mid-grey, blurred 2 px | Ours |

Want more? Texturelabs (texturelabs.org) and Texture Fabrik (texturefabrik.com) are the sources the rule names. Their
licences allow use in videos but not sharing the files themselves, so keep those in `companies/<slug>/assets/`
(not here) and run them through `tools/vox-texture.sh` too.
