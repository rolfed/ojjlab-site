# OJJ Lab — Claude Code Instructions

## Non-Negotiable Constraints

- TypeScript strict mode only — no `any`, no casting away errors
- Standards-based Web Components — NO React, Vue, Svelte, Astro, Next
- Tailwind v4 for all styling — no inline styles, no other CSS libraries
- GSAP for all animation — always reducedMotion-aware
- WCAG 2.2 AA — zero axe violations (CI gate)
- Progressive enhancement — all pages render without JS
- Mobile-first always — base styles target 375px, scale up with breakpoints
- pnpm only — never npm or yarn

## After Every UI Change: Visual Verification Required

**This is mandatory, not optional.** Before considering any UI task complete:

1. Start dev server: `pnpm dev`
2. Use Playwright MCP browser tools to open `http://localhost:5173`
3. Check at **375px** (mobile-first baseline)
4. Check at **1280px** (desktop)
5. For animated sections: scroll through the full interaction — pin, scrub, transitions
6. If anything looks wrong, **self-heal immediately** before moving on

### Self-Heal Loop

When Playwright reveals a visual defect:
1. Identify root cause (don't guess — read the code)
2. Fix the implementation
3. Re-run `pnpm test --run` (all tests must pass)
4. Re-verify in Playwright at both breakpoints
5. Repeat until the interaction matches the intended design

### UX Checklist (run at 375px and 1280px)

- [ ] Section spacing is consistent (no orphaned gap between sections)
- [ ] Tap targets ≥ 44px height
- [ ] Single primary CTA per screen — no competing actions
- [ ] Focus states visible on all interactive elements
- [ ] No horizontal overflow at 375px
- [ ] Animated sections: motion is smooth and scrub-linked (not instant/jerky)
- [ ] `prefers-reduced-motion`: animation disabled, content still accessible

## Code Quality Standards

- Functions do one thing — if you need "and" to describe it, split it
- No magic numbers — extract named constants
- No commented-out code in commits
- Types are explicit — infer where obvious, annotate where not
- Tests co-locate intent — test descriptions read like specifications

## PR / Commit Rules

- No "Claude" in commit messages or PR descriptions
- Commits are atomic — one logical change per commit
- Tests must pass before any commit
- PR description explains *why*, not just *what*
