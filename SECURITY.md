# Security and privacy

Taste Align is a static local-first app. User media is stored in IndexedDB, not sent to a model or server. Hosting providers still see ordinary requests for public app files.

The app accepts raster images and playable MP4/WebM, never executes uploaded HTML/SVG or imported text, and validates project structure and archive sizes. ZIP entries are read in memory rather than extracted to filesystem paths. Exports contain original references: inspect them before sharing.

Browser storage is not a backup or encrypted vault. Anyone with access to the browser profile may access its data. Use exported backups and your device's normal protection.

Report a vulnerability through GitHub's private vulnerability reporting if enabled. Otherwise open an issue describing the affected component without personal data, credentials, or exploit payloads against a live site. Do not upload private reference bundles to a public issue.
