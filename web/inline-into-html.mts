import type { Plugin } from "vite";

/**
 * Build an interactive page as ONE html file that opens without a server.
 *
 * Chrome refuses to load a `<script type="module">` from a `file://` address,
 * and a page that cannot be opened by double-clicking cannot be emailed, zipped
 * or dropped in a shared folder. So the build is a single classic script,
 * inlined into `index.html`, with relative paths - one file, no server, no
 * network. Edge and Chrome behave the same here; check Safari and Firefox
 * before promising them.
 *
 * Every interactive page's vite.config.mts uses this; copy web/interactive-demo/
 * to start one.
 */
export const inlineIntoHtml = (): Plugin => ({
  name: "inline-into-html",
  apply: "build",
  transformIndexHtml: {
    order: "post",
    handler(html, ctx) {
      const bundle = ctx.bundle;
      if (!bundle) return html;

      let out = html;
      for (const file of Object.keys(bundle)) {
        const chunk = bundle[file];
        if (chunk.type !== "chunk") continue;

        // The tag Vite wrote for this chunk - dropped from <head> ...
        const tag = new RegExp(`<script[^>]*src="[^"]*${file.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}"[^>]*></script>`);
        out = out.replace(tag, "");

        // ... and the code itself goes last in <body>, as a classic script, so
        // `#root` already exists when it runs. A literal `</script` inside the
        // bundle would end the tag early, so it is escaped.
        const code = chunk.code.replace(/<\/script/g, "<\\/script");
        out = out.replace("</body>", () => `<script>${code}</script>\n</body>`);
        delete bundle[file];
      }
      return out;
    },
  },
});

/** The build settings every single-file page shares. */
export const singleFileBuild = (outDir: string) => ({
  // The hand-out is one folder named for the project: this page plus the
  // rendered MP4s of its paths, side by side in out/<project>/. emptyOutDir
  // MUST stay false, or Vite deletes those MP4s on every build.
  outDir,
  emptyOutDir: false,
  modulePreload: false as const,
  cssCodeSplit: false,
  assetsInlineLimit: 100_000_000,
  rollupOptions: { output: { format: "iife" as const, inlineDynamicImports: true } },
});
