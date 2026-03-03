# /docs/GYMDESK_INTEGRATION.md
# Oregon Jiu Jitsu Lab — GymDesk Integration

---

## What is Embedded vs Native

| Feature | Strategy | Rationale |
|---|---|---|
| Class Schedule | **Embed** (iframe) | GymDesk provides embed widget; live data without custom API |
| Member Login | **Redirect** | Avoid iframe for authentication (security + UX) |
| Member Portal | **Redirect** | Post-login management stays in GymDesk |
| Trial Booking | **Native form** | Own the conversion flow; forward data to GymDesk if API available |
| Payment | **GymDesk-owned** | No PCI scope on our side |

---

## Schedule Integration Strategy

**Method:** GymDesk iframe embed widget.

**Implementation:**
```html
<!-- ojj-schedule-embed component renders this -->
<iframe
  src="[GYMDESK_SCHEDULE_EMBED_URL]"
  title="Oregon Jiu Jitsu Lab Class Schedule"
  width="100%"
  height="600"
  loading="lazy"
  frameborder="0"
></iframe>
```

**Embed URL:** Sourced from environment variable `VITE_GYMDESK_SCHEDULE_URL`. Not hardcoded.

**Responsive handling:**
- Container has `overflow-x: auto` to prevent horizontal bleed on mobile
- `ojj-schedule-embed` component sets height dynamically if GymDesk supports `postMessage` resize; otherwise fixed height with scroll

**Enhancement layer (if GymDesk embed API permits):**
- Pre-filter by day/level via URL params on the embed URL
- Sync filter UI (our custom) → embed URL → iframe refresh
- If GymDesk does not support URL param filtering, the filter UI is omitted from MVP

---

## Login Strategy

**Decision: Redirect to GymDesk.**

**Rationale:**
1. Authentication in an iframe violates security best practices — credential fields in iframes are blocked by some browsers and flagged by security scanners
2. GymDesk manages sessions; duplicating or proxying auth adds attack surface
3. Redirect provides full GymDesk UX without compromise
4. Users accept redirect patterns for member portal login (Mindbody, Pike13 set this expectation)

**Implementation:**
```html
<!-- /login page -->
<main id="main-content">
  <section aria-labelledby="login-heading">
    <h1 id="login-heading">Member Login</h1>
    <p>Access your schedule, attendance, and account through our member portal.</p>
    <a
      href="[GYMDESK_LOGIN_URL]"
      class="ojj-button ojj-button--primary"
      rel="noopener"
      target="_blank"
      aria-describedby="login-external-notice"
    >
      Go to Member Portal
    </a>
    <p id="login-external-notice" class="text-sm text-neutral-600">
      Opens GymDesk — our member management system.
    </p>
  </section>
</main>
```

**Login URL:** Sourced from environment variable `VITE_GYMDESK_LOGIN_URL`.

---

## Loading / Error / Fallback States

### Schedule Embed

**Loading state:**
- Skeleton placeholder with matching height renders immediately
- Announced via `aria-live="polite"` region: "Loading class schedule..."
- Skeleton uses CSS animation (respects `prefers-reduced-motion`)

**Loaded state:**
- Skeleton removed; iframe becomes visible
- Live region updated: "Class schedule loaded."

**Error state (iframe fails to load):**
- Detected via `iframe.onload` + checking for blank/error content if cross-origin allows
- Fallback: Static schedule table (maintained in source) + link to GymDesk directly
- Error announced via live region

```html
<!-- Fallback content inside ojj-schedule-embed -->
<div slot="fallback" role="alert">
  <p>Unable to load live schedule. <a href="[GYMDESK_SCHEDULE_URL]">View schedule on GymDesk</a>.</p>
</div>
```

### Login Page

No embed — no loading state. Login page is pure static HTML with redirect link.

---

## Security Considerations

- **No credentials handled by this codebase.** GymDesk owns all auth.
- GymDesk embed URL: served over HTTPS only. Never HTTP.
- `VITE_GYMDESK_*` environment variables are public (they are embed URLs, not secrets). This is acceptable.
- `Content-Security-Policy` header must permit GymDesk iframe source:
  ```
  frame-src https://*.gymdesk.com;
  ```
- `X-Frame-Options` on our pages: `SAMEORIGIN` (we do not need to be embedded by others)
- No sensitive data (member names, billing) is processed or stored in this codebase
- External links to GymDesk: `rel="noopener noreferrer"` on all `target="_blank"` links

---

## Performance Considerations

- Schedule iframe: `loading="lazy"` — does not block LCP
- Schedule page LCP element: heading or hero image, not the iframe
- Iframe height: fixed or JS-controlled — must never cause CLS after load
- CLS prevention: set explicit `height` on iframe container before iframe loads
- GymDesk assets: outside our control — document performance dependency
- If GymDesk embed is slow: skeleton state masks the delay; our page Lighthouse score is measured before iframe loads

---

## Testing Considerations for Embedded Flows

**What we test:**
- `ojj-schedule-embed` component renders correct iframe `src` from attribute
- Loading skeleton appears on mount, is removed after `iframe.onload`
- Error fallback renders when `iframe.onerror` fires
- Fallback link has correct `href` and opens in new tab with `rel="noopener"`
- Login page renders redirect link with correct URL and ARIA description
- Environment variables are correctly injected at build time (Vite `import.meta.env`)

**What we do NOT test:**
- Live GymDesk schedule data (we do not control it)
- GymDesk login authentication flow
- Member portal behavior post-login

**E2E test approach:**
- Schedule page E2E: verify iframe is present in DOM with correct `title`; verify fallback container exists in DOM (hidden); do not test iframe contents
- Login page E2E: verify CTA link present, correct `href` set, correct `aria-describedby`

**Stubbing in tests:**
```ts
// playwright.config.ts — stub GymDesk URLs in test environment
await page.route('https://*.gymdesk.com/**', route => {
  route.fulfill({ status: 200, body: '<html><body>Schedule placeholder</body></html>' });
});
```
