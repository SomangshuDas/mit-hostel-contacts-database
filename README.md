# MIT Hostel Contacts Database

Web tools for the hostel contacts directory of **Murshidabad Institute of Technology (MIT)**, built as static pages for GitHub Pages. No contact data lives in this repository — these are front-end tools only, driven by URL parameters or backed by a private Google Apps Script deployment.

**This deployment is configured for MIT's hosting only.** The `direct-dial` tool has no backend and can be reused elsewhere. The `edit-link-form` tool is wired to MIT's private Apps Script endpoint and won't do anything useful for a different institution unless you point it at your own deployment (see below).

## What's in this repo

### `/direct-dial/`
A tap-to-call contact card. Fully static, no backend, no data storage — everything comes from the URL query string:

| Param | Aliases | Purpose |
|---|---|---|
| `number` | `n`, `phone` | Number to dial (required) |
| `name` | `label` | Display name |
| `img` | `photo`, `avatar`, `dp` | Avatar image URL |

Example:
```
/direct-dial/?number=%2B91XXXXXXXXXX&name=Example+Contact&img=https://example.com/photo.jpg
```
Supports call, WhatsApp, SMS, FaceTime (Apple devices only), copy number, share, and save-to-contacts (vCard download). Because it only reads the URL, this piece is generic — fork it for any contact-card/QR-code use case without touching MIT's data.

### `/edit-link-form/`
A self-service form: a registered contact enters their email and requests the edit link for their own directory entry. It posts the email to a Google Apps Script Web App tied to the hostel contacts spreadsheet.

- **Verification is silent.** The form always shows "you'll receive your link soon," whether or not the email is registered — this avoids revealing which addresses exist in the database. If the email isn't registered, nothing is sent and no edit link is issued.
- To point this at a different backend, update `webAppURL` in `edit-link-form/js/script.js`.

## Hosting on GitHub Pages

1. Settings → Pages → Deploy from branch → `main` / `/ (root)`.
2. There's no root `index.html` in this repo, so `https://<user>.github.io/<repo>/` will 404 by itself. Either:
   - Link people directly to `/edit-link-form/` (the entry point that needs no query params), or
   - Add a small root `index.html` that redirects/links to both tools.
3. Set the repo's **About → Website** field to whichever URL you want as the public entry point.

## Privacy note

No student contact data is stored in this repository or in git history — only the UI. The actual directory lives in a private Google Sheet behind the Apps Script Web App. Keep the `webAppURL` pointed at a deployment with appropriate access controls, since anyone can call it from a fork of this page.

## License

MIT License — see [LICENSE](LICENSE). The license covers this repository's code (HTML/CSS/JS); it does not grant any rights to MIT's hostel contact data, which isn't part of this repo.
