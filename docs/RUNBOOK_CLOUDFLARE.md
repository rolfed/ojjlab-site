# Cloudflare Setup Runbook

One-time manual steps required before the first automated deploy.
Steps 1 and 2 (DNS + SSL) are deferred until the site is production-ready.

---

## Local credentials setup

Wrangler does not automatically read `.env` files — credentials must be present
as real shell environment variables when running any `wrangler` command.

This project uses [direnv](https://direnv.net/) to handle this automatically.
When you `cd` into the project, direnv loads `.env` into your shell. When you
`cd` out, the variables are unloaded.

**Setup (one time):**
```bash
brew install direnv
# Add to the end of ~/.zshrc:
eval "$(direnv hook zsh)"
# Reload shell:
source ~/.zshrc
# Approve the .envrc in this repo:
direnv allow .
```

Verify it's working:
```bash
direnv exec . env | grep CLOUDFLARE_ACCOUNT_ID | wc -c
# Should print a small number — not blank, not huge
```

Your `.env` is gitignored and will never be committed.

---

## Step 1 — DNS migration (deferred — do when site is production-ready)

1. Log into Cloudflare dashboard → Add a site → enter `ojjlab.com`
2. Cloudflare scans and imports existing DNS records — review them before continuing
3. At your domain registrar, update nameservers to the two Cloudflare nameservers shown
4. Wait for propagation (up to 48 hours; usually under 4 hours)

---

## Step 2 — SSL/TLS settings (deferred — configure after DNS propagates)

Cloudflare dashboard → ojjlab.com → SSL/TLS:

| Setting | Value |
|---|---|
| SSL/TLS mode | Full |
| Always Use HTTPS | On |
| Minimum TLS version | TLS 1.2 |
| HSTS → Enable | On |
| HSTS → Max age | 12 months |
| HSTS → Include subdomains | On |
| HSTS → Preload | On |

After DNS is live, add the custom domain:
Dashboard → Pages → ojjlab.com → Custom domains → Add → ojjlab.com

---

## Step 3 — Create the Cloudflare Pages project (do this now)

Load credentials into your shell first (see "Local credentials setup" above), then:

```bash
# From the repo root
npx wrangler pages project create ojjlab.com --production-branch main
```

Expected output:
```
✅ Successfully created the 'ojjlab.com' project.
Your project will be available at https://ojjlab-com.pages.dev
```

The site now deploys to `ojjlab-com.pages.dev` until the custom domain is added.

---

## Step 4 — Set Worker secrets

These are encrypted in Cloudflare's vault. Wrangler will prompt you to type the
value — it will not echo to the terminal. You cannot read them back after setting.

```bash
cd apps/worker

# Staging
pnpm wrangler secret put GHL_API_KEY --env staging
pnpm wrangler secret put GHL_LOCATION_ID --env staging

# Production (can do later — staging is enough to start)
pnpm wrangler secret put GHL_API_KEY --env production
pnpm wrangler secret put GHL_LOCATION_ID --env production
```

Verify they were set:
```bash
pnpm wrangler secret list --env staging
# Should show: GHL_API_KEY, GHL_LOCATION_ID
```

---

## Step 5 — GitHub Secrets

Settings → Secrets and variables → Actions → New repository secret

| Name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | CF API token with Pages:Edit + Workers:Edit + Account:Read |
| `CLOUDFLARE_ACCOUNT_ID` | Found in CF dashboard right sidebar |

---

## Step 6 — GitHub Environments

Settings → Environments:

**Create `staging`:**
1. New environment → name: `staging`
2. Configure environment → leave all protection rules unchecked
3. Save protection rules

**Create `production`:**
1. New environment → name: `production`
2. Configure environment → check **Required reviewers**
3. Search for your GitHub username → select it
4. Save protection rules

When `publish.yml` runs targeting production, GitHub pauses at the deploy step
and sends you an email. You review and click Approve in the GitHub Actions UI
before the deployment proceeds.

---

## Step 7 — First deployment

Verify locally before deploying:

```bash
# Copy the example and fill in your GHL credentials
cp apps/worker/.dev.vars.example apps/worker/.dev.vars
# Edit apps/worker/.dev.vars and add GHL_API_KEY and GHL_LOCATION_ID

make dev
# In a separate terminal:
curl http://localhost:8787/api/health
# Expected: {"status":"ok","ghl":"ok","timestamp":"..."}
```

Deploy to staging:

```bash
cd apps/worker
pnpm wrangler deploy --env staging
```

Test the deployed Worker (replace with your Account ID):
```bash
curl https://ojjlab-worker-staging.<CLOUDFLARE_ACCOUNT_ID>.workers.dev/api/health
```

Or trigger via GitHub Actions → Actions → Publish → Run workflow →
version: `0.1.0`, environment: `staging`.

---

## Rotating a secret

```bash
cd apps/worker
pnpm wrangler secret put GHL_API_KEY --env production
# Type the new value at the prompt
# Takes effect on next request — no redeploy required
```

---

## Rollback

**Worker:**
```bash
cd apps/worker
pnpm wrangler deployments list --env production
pnpm wrangler rollback --env production
```

**Pages site:**
Dashboard → Pages → ojjlab.com → Deployments → find previous build → Rollback

---

## Observability

| Concern | Where |
|---|---|
| Worker request metrics | CF Dashboard → Workers & Pages → ojjlab-worker → Analytics |
| Live log stream | `cd apps/worker && pnpm wrangler tail --env staging` |
| Error rate alerts | CF Dashboard → Notifications → Workers → Error rate > 5% over 5 min |
