VERBORA — fallback fonts of the web demo, served from this site.

Flutter's web engine asks for these files by fixed paths under a base
address that defaults to Google's font server (fonts.gstatic.com). The demo
points that base here (web/flutter_bootstrap.js, fontFallbackBaseUrl), so
that no visitor's browser talks to a third party.

  roboto/v32/...            Roboto: the engine loads it at every start.
  notosanssymbols/v43/...   Noto Sans Symbols: for the few signs the app's own
                            fonts lack (the arrow in the wheel-spelling note).

The paths belong to the Flutter version the demo is built with (3.44.1).
After a Flutter upgrade, open the demo with the browser's network panel:
a request under ff/ that fails names the file to add here; one to
fonts.gstatic.com means the base address is no longer applied.

Roboto: Apache License 2.0 (https://github.com/googlefonts/roboto).
Noto Sans Symbols: SIL Open Font License 1.1 (https://github.com/notofonts/symbols).
