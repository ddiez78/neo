# Stitch Prompt: NEO GEO Visual Redesign

Redesign the visual interface of **NEO GEO**, a professional SaaS dashboard for digital marketing teams that monitor brand visibility inside AI/LLM answers. The product should feel familiar to users of Semrush, SE Ranking, Ahrefs, Google Ads, Search Console, and analytics tools, while still having its own modern identity.

## Product Context

NEO GEO helps marketing teams answer:

- How often does an AI model mention our brand?
- Which competitors appear next to us?
- Which prompts drive visibility?
- Which sources/domains influence AI answers?
- How does visibility evolve over time by model, competitor, prompt, and source?

The app already has these core areas:

- Login / Register
- Onboarding
- Workspaces
- Dashboard
- Company Bio
- Prompts
- Prompt Research
- Competitors
- Sources
- Team
- Settings
- Admin

## Visual Direction

Create a polished B2B marketing intelligence interface. It should be serious enough for marketing directors and performance teams, but visually sharper than a generic admin panel.

The interface should feel:

- Professional
- Analytical
- Trustworthy
- Fast to scan
- Dense but not cramped
- Calm, not playful
- Modern without looking like a landing page
- Suitable for daily use by SEO, paid media, and content teams

Avoid a marketing homepage. The first screen should be the actual app experience.

## Design References

Use the mental model of:

- Semrush project dashboards
- SE Ranking keyword dashboards
- Google Ads dark/light UI density
- Google Search Console information hierarchy
- Ahrefs-style tables and filters
- Modern B2B SaaS tools with clear data cards, filters, trend charts, and sortable tables

Do not copy these products directly. Use them only as UX references for density, navigation, filtering, metric hierarchy, and table usability.

## Color System

Build both **light mode** and **dark mode**.

Use a distinctive but professional palette:

- Primary: deep teal / cyan for active states and main actions
- Secondary: electric blue for links, selected filters, and chart emphasis
- Accent: amber or lime for warnings, opportunity signals, and positive deltas
- Negative: refined red for alerts and drops
- Neutrals: slate, graphite, zinc, and soft off-white

Avoid:

- Purple-dominant gradients
- Beige/tan/brown themes
- Overly black dark mode
- Flat white pages with no depth
- Neon cyberpunk styling

Light mode should use:

- Soft grey-blue app background
- White panels
- Slate text
- Clear dividers
- Subtle shadows only where useful

Dark mode should use:

- Graphite / dark slate surfaces
- Slightly lighter panels
- High contrast text
- Muted borders
- Cyan/blue active accents
- Charts that remain readable without glowing

## Layout Requirements

Use an application layout, not a landing page:

- Persistent left sidebar navigation
- Top bar with workspace switcher, global date range, search, and user controls
- Main content area with page title, context actions, filters, metrics, charts, and tables
- Responsive behavior for desktop, tablet, and mobile

Desktop:

- Sidebar visible
- Dense metric cards
- Tables with sticky headers where appropriate
- Filter bar near the top of dashboard and listing pages

Mobile:

- Sidebar collapses into a drawer
- Top metrics become a 2-column grid or horizontal scroll
- Tables become stacked rows or responsive cards
- Primary actions remain reachable without visual clutter

## Navigation

Design sidebar navigation for:

- Dashboard
- Company Bio
- Prompts
- Prompt Research
- Competitors
- Sources
- Team
- Settings
- Admin

Each item should have a lucide-style icon and a clear active state.

Group navigation visually:

- Core analytics: Dashboard, Competitors, Sources
- Workflow: Company Bio, Prompts, Prompt Research
- Organization: Team, Settings, Admin

The sidebar should show:

- Product mark: NEO GEO
- Current workspace
- Compact status indicator for active monitoring

## Dashboard Page

Create a high-quality analytics dashboard with:

- KPI cards:
  - Visibility Score
  - AI Mentions
  - Share of Voice
  - Positive Sentiment
  - Sources Found
  - Estimated Cost
- Main trend chart for visibility over time
- Secondary chart for mentions by provider/model
- Competitor comparison table
- Recent prompt runs table
- Alerts/opportunities panel

KPI cards should include:

- Current value
- Delta
- Small context label
- Micro sparkline or subtle visual indicator

Dashboard filters:

- Date range
- Provider/model
- Prompt group/tag
- Competitor
- Market/language

## Prompts Page

Design a workspace for managing monitored prompts.

Include:

- Search bar
- Status filters: Active, Paused, Failed, Needs Review
- Provider filters
- Tag filters
- Table/list with:
  - Prompt title
  - Prompt text preview
  - Status
  - Priority
  - Frequency
  - Providers
  - Last run
  - Visibility score
  - Cost
  - Actions

Actions:

- Create prompt
- Run prompt
- Pause/resume
- Duplicate
- Edit
- View history

Use compact icon buttons for repeated actions, with clear tooltips.

## Prompt Research Page

Create a research cockpit for generating and reviewing prompt ideas.

Sections:

- Coverage gaps
- Suggested prompts
- Competitor-driven prompts
- Funnel-stage prompts
- Market/language variations

Prompt candidate cards should include:

- Category
- Suggested prompt
- Reason it matters
- Estimated impact
- Confidence score
- Save / reject actions

The page should feel like an analyst queue, not a content generator toy.

## Competitors Page

Design a competitor intelligence view.

Include:

- Competitor cards or table
- Domain
- Aliases
- Share of voice
- Mention trend
- Sentiment
- Top sources
- Latest co-mentions

Add comparison controls:

- Compare selected competitors
- Sort by visibility
- Filter by source/domain
- Filter by model/provider

Visualize competitors with clear ranking, badges, and trend indicators.

## Sources Page

Design a source intelligence page.

Include:

- Domain table
- Source URL
- Authority/importance score
- Brand mentioned yes/no
- Competitors mentioned
- First seen / last seen
- Prompt run link
- Provider/model

Add a domain summary area:

- Top domains
- New sources
- Lost sources
- Most influential sources

Tables should be highly scannable and feel similar to SEO tooling.

## Company Bio Page

Design a form-heavy but elegant page for brand context.

Fields:

- Brand name
- Website
- Description
- Products/services
- Keywords
- Markets
- Tone
- Official URLs

Add a right-side context quality panel:

- Completeness score
- Missing fields
- Prompt coverage impact
- Suggested improvements

## Team Page

Design a clean team management page:

- Members table
- Role badges: Owner, Admin, Member, Viewer
- Invite member action
- Pending invites
- Last active

Keep it simple, secure, and professional.

## Settings Page

Design provider and workspace settings:

- Workspace metadata
- Language / market
- Timezone
- LLM providers
- Model configuration
- Daily run limits
- API key status
- Alert preferences

For provider rows:

- Provider logo/icon
- Model name
- Enabled toggle
- API key status
- Daily run limit
- Save action

## Admin Page

Design an operational admin panel:

- Recent runs
- Failed jobs
- Provider health
- Cost summary
- Logs table
- Backfill actions

This page should feel technical but still readable for a non-engineer operator.

## Components

Create reusable components:

- App shell
- Sidebar
- Top bar
- KPI card
- Data table
- Filter bar
- Empty state
- Status badge
- Provider badge
- Sentiment badge
- Trend indicator
- Page header
- Settings row
- Prompt candidate card
- Competitor rank row
- Source domain row

Use consistent spacing, border radius, and visual rhythm.

Cards should use a maximum `8px` border radius unless there is a strong reason otherwise.

## Typography

Use a professional SaaS typography system:

- Clean sans-serif for UI
- Strong numeric treatment for metrics
- Compact table text
- Clear hierarchy between page titles, section titles, labels, and metadata

Avoid huge hero typography inside dashboard pages.

## Interaction Details

Include polished states:

- Hover states
- Active nav state
- Focus rings
- Loading skeletons
- Empty states
- Error states
- Disabled states
- Saving states

Keep animations subtle:

- Short page transitions
- Gentle chart reveal
- Filter changes with no layout jump

## Accessibility

Ensure:

- High contrast in both themes
- Keyboard navigable controls
- Visible focus states
- Clear button labels
- Icons are not the only way to understand critical actions
- Tables remain readable on small screens

## Output Goal

Produce a complete visual redesign specification and interface direction for Stitch to generate a polished app UI. The result should look like a serious marketing intelligence product that a digital marketing team would trust and use every day.

The final design should make NEO GEO feel like a professional AI visibility platform for SEO, content, and performance marketing teams.
