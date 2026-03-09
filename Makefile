.PHONY: dev build test deploy-staging deploy-production

# Start both the site dev server and the Worker dev server concurrently.
# Ctrl-C kills both processes cleanly.
dev:
	@trap 'kill 0' EXIT; \
	pnpm dev & \
	(cd apps/worker && pnpm wrangler dev --port 8787) & \
	wait

build:
	pnpm build
	cd apps/worker && pnpm build

test:
	pnpm test --run
	cd apps/worker && pnpm typecheck

# Requires CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in environment.
deploy-staging:
	cd apps/worker && pnpm deploy:staging

deploy-production:
	cd apps/worker && pnpm deploy:production
	wrangler pages deploy dist --project-name ojjlab.com --branch main
