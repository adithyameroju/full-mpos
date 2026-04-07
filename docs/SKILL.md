---
name: acko-electronics-ev-fy27-roadmap
description: >
  Complete product strategy and context for Acko's Electronics and EV Warranty
  business for FY27. Use this skill whenever working on anything related to the
  mPOS platform, Jarvis claims system, EV warranty, partner onboarding, fraud
  detection, comms platform, or new product bets (BFL, RoP, EMI, Acko Care).
  Also use for any questions about OEM partners (Xiaomi, Oppo, Hero Vida, Ather,
  Hisense), personas (promoter, dealer, distributor, brand admin, EV dealer),
  business targets, theme prioritisation, or FY27 investment decisions. Load
  this skill before writing any product specs, IA, UI copy, roadmap documents,
  or engineering briefs for the Electronics or EV vertical.
metadata:
  author: acko
  version: "1.0.0"
  source: "Electronics-EV-Roadmap-FY27-v18.pdf"
  confidentiality: "Internal — confidential"
---

# Acko Electronics & EV Warranty — FY27 Product Roadmap

## Table of Contents

1. [Business Context & FY26 Snapshot](#1-business-context--fy26-snapshot)
2. [FY27 Targets](#2-fy27-targets)
3. [Partner & Channel Landscape](#3-partner--channel-landscape)
4. [Six FY27 Themes — Electronics](#4-six-fy27-themes--electronics)
5. [Platform Deep-Dive — Personas & Tools](#5-platform-deep-dive--personas--tools)
6. [EV Warranty — Part 2](#6-ev-warranty--part-2)
7. [Agentic AI Capabilities](#7-agentic-ai-capabilities)
8. [Strategic Hypotheses](#8-strategic-hypotheses)
9. [Financial Impact Summary](#9-financial-impact-summary)
10. [Marketing & Visibility](#10-marketing--visibility)
11. [Three Non-Negotiable FY27 Outcomes](#11-three-non-negotiable-fy27-outcomes)
12. [What Is Explicitly Out of Scope](#12-what-is-explicitly-out-of-scope)
13. [Open Leadership Questions](#13-open-leadership-questions)

---

## 1. Business Context & FY26 Snapshot

**The problem in one sentence:** the business is healthy but the platform is the ceiling.

### FY26 Metrics — Electronics

| Metric | Value |
|---|---|
| GWP (YTD) | ₹143 Cr |
| AOP achievement | 99% |
| Loss ratio (FTM) | 74% (better than plan) |
| Active seller touchpoints | 100K+ |
| Policies issued (all channels) | ~7,000/day |
| mPOS policies today | ~400/day |
| Claims volume | ~1,700/week |
| Service centres on ASC-ASP | 2,200 |

### Why the ceiling is visible

- mPOS running at ~400 policies/day when the channel could do 5x that
- Claims live in a separate system — no continuity from sale to claim
- Dealer commissions don't motivate — no wallet, no settlement, no invoicing
- Fraud detection is manual
- Comms platform only talks to end customers
- Plan/model onboarding that should take minutes still needs ops intervention

---

## 2. FY27 Targets

### Electronics

| Metric | Target |
|---|---|
| GWP (incl. BFL) | ₹550 Cr |
| mPOS daily policies | 2,000/day |
| Loss ratio | < 70% |
| Plan/model onboarding | < 1 day |
| Claims auto-approval | < 30% |
| CX call deflection | 20–30% |

### EV

| Metric | Target |
|---|---|
| Hero Vida attach rate | 55%+ (from 30%) |
| Active EV OEM partners | 3 by FY27 end |
| EV claims live on mPOS | H1 FY27 |

---

## 3. Partner & Channel Landscape

### Channel Types

**API / B2B (scales with partner volume — needs platform reliability, not product investment):**
- Bajaj Finance: ₹9.3 Cr/month
- Amazon: ₹1.2 Cr/month
- Chola: ₹1.9 Cr/month
- Ather: API-based ECW

**mPOS (direct product investment moves the needle):**

| Partner | Category | Today | FY27 Target | Primary Blocker |
|---|---|---|---|---|
| Xiaomi | Mobile → Mobile + TV | ~135/day | 500+/day | No barcode/OCR; commissions via OEM payroll; TV plans pending multi-tenancy |
| Oppo | Mobile | ~78/day | 400+/day | UX friction + commission model; lowest attach rate on mPOS |
| Hero Vida | EV 2W | ~190/day | 400+/day | Sell flow works; claims not on mPOS limits dealer trust |
| Hisense | AC / TV (pipeline) | 0 | TBD | Requires multi-tenancy — first non-mobile brand |

### What's Working

- API/B2B book growing on its own: Bajaj ₹80 Cr YTD, Amazon ₹12.8 Cr, Chola ₹9 Cr
- Distribution infrastructure in place: 100K+ touchpoints, live OEM relationships
- Hero Vida at 30% attach — EV model proven

### What's Blocking Growth

- No barcode/OCR → manual IMEI entry errors, slow counter
- Commission paid via OEM payroll 30–45 days post-sale → motivation invisible
- Claims not on mPOS for EV → dealer trust erodes as volume grows
- Multi-tenancy not live → every AC/TV brand is a conversation that can't happen
- Fraud detection manual → growing LR risk as volume scales

---

## 4. Six FY27 Themes — Electronics

### Theme 1 — Sell Experience Rebuild (mPOS 2.0)

**Goal:** More attach rate · Faster counter · Motivated sellers

- Barcode scanner + OCR for IMEI and invoice capture
- In-app wallet with same-day encashment (removes 30–45 day OEM payroll dependency)
- Gamification: leaderboards, campaign engine, agent-level incentive tracking
- Role-based access (RBAC): store owner / promoter / OEM field staff views
- Smart plan recommendations: device + OEM combo-aware
- Multi-tenancy: enables Xiaomi TV, Hisense AC/TV on same platform
- Multi-device, multi-brand sale in single session
- Plug-and-play architecture: new partner onboarding < 1 day
- Step-by-step sell flow progress indicator

**Financial signal:** Each 1% attach rate improvement = ~₹5–8 Cr incremental GWP

---

### Theme 2 — Claims Operations & Service Centre Efficiency

**Goal:** Faster settlement · Lower ops cost · SC quality drives LR

- Unified claims creation: customer self-serve / dealer-filed via mPOS / B2B API
- B2B claim intimation via API (replace Excel + SFTP; ~4,000 claims/month affected)
- Small claims automation: auto-approve clean <₹2,000 EW claims — no maker-checker
- AI damage assessment from customer photos at FNOL
- Intelligent admissibility engine: auto-approve clean claims, route ambiguous
- AI voice bot for handler outbound (document follow-ups, deductible confirmations, BER/repair status)
- SC quality scoring: TAT, repair cost benchmark, repair quality → intelligent routing
- Real-time ops dashboard for claims handlers (SLA, workload, escalations)
- Customer claims experience: enhanced policy doc + real-time tracking page + proactive WhatsApp at every milestone

**Financial signal:** Ops cost reduction ~₹0.8 Cr/month; LR improvement via SC routing

---

### Theme 3 — Fraud Detection & Risk Signals

**Goal:** Protect LR · Catch bad actors · Scalable as volume grows

- Predictive fraud scoring at FNOL: claim patterns, device history, purchase-to-claim proximity
- Document and image manipulation detection (Resistant AI integrated)
- Policy sale fraud detection: bulk same-day, phantom IMEIs, price anomalies at dealer level
- SC fraud scoring: inflate-and-claim, repeat high-cost outliers, phantom billing
- Silent signal enrichment: device metadata, OEM activation data, repair history
- Fraud ops workflow: risk score visibility, flag-and-hold queue, audit trail, model feedback loop

**Financial signal:** ₹15–20 Cr combined fraud leakage (Electronics + Embedded); 25% capture = ₹4–5 Cr

---

### Theme 4 — Communications Platform

**Goal:** Reduce CX cost · Engage dealers · Keep OEMs informed

**Three audiences — three distinct layers:**

- **Customer:** proactive claim status, renewal alerts, coverage reminders, policy certificates
- **Dealer:** daily WhatsApp sales summaries, campaign nudges, commission milestones, zero-sale alerts
- **OEM:** issuance milestones, attach rate reports, campaign performance, reconciliation signals

**Capabilities:**
- Smart IVR: Electronics/EV-specific routing, dedicated OEM IVR for large appliance partners
- CX self-serve deflection: claim status, coverage queries, basic endorsements (target 20–30% call reduction)
- In-app endorsement discoverability

**Financial signal:** CX cost reduction ~₹0.5–1 Cr/year; dealer nudges drive incremental attach

---

### Theme 5 — Partner & Operator Experience

**Goal:** Faster onboarding · Less manual ops · Self-serve for partners

- Config-driven plan and model onboarding (< 1 day, no ops intervention)
- OEM Brand Admin portal: self-serve for campaign launches, plan changes, user management
- Tax invoicing and credit notes: system-generated GST-compliant per transaction
- Commission invoicing: automated statements for dealers and OEMs (currently manual)
- Bulk invoicing for B2B partners
- Automated financial reconciliation (replace Excel recon)
- Partner performance dashboard: volumes, attach rates, claim ratios, commission statements
- Structured dispute resolution workflow
- KYC capability (net new build): agent-first to avoid manual ops bottleneck
- Seamless policy cancellation and refund (fully automated)
- API completeness: unified policy issuance, endorsements, claims (Create/GET) across all product types

---

### Theme 6 — New Product Bets

**Goal:** Expand addressable market · Diversify revenue · Capture new segments

- **Affordability at mPOS:** EMI options at POS; pilot with Oppo and Xiaomi
- **Money Back (RoP):** reposition protection from 'cost' to 'investment'; pilot with OEM partners
- **Bundle plan issuance:** comprehensive data capture for large appliance OEM segment
- **Acko Care:** post-purchase engagement — device health tips, maintenance reminders, early renewal nudges (pilot H2 FY27)
- **Credit Protection, Life (sachet), Cyber:** mPOS as distribution; architecture accommodates multi-LOB without full rebuild
- **BFL partnership:** execution-ready product construct to unlock ₹550 Cr target

---

## 5. Platform Deep-Dive — Personas & Tools

### Tool 1 — mPOS

Five distinct personas with different jobs, problems, and success metrics.

#### Promoter / Frontline Seller
**Job:** Complete sale fast — customer is at the counter.

| Problem | Build |
|---|---|
| IMEI validation slow/fails — kills sale momentum | Barcode scanner + OCR |
| Commission visible but settlement/invoicing don't exist | Commission settlement with GST invoicing + payout tracking |
| No instant encashment — 30-day OEM payroll wait | In-app wallet with same-day encashment |
| No in-app issue reporting | In-app support and issue channel |
| Sell flow progress not visible mid-issuance | Step-by-step progress indicator |

#### Dealer / Store Owner
**Job:** Own outcomes — needs visibility and control, not direct selling.

| Problem | Build |
|---|---|
| Real-time dashboard lacks depth/drill-down | Better drill-down by staff, device, time period |
| No commission settlement or GST invoicing | Payout scheduling + GST-compliant invoices + credit notes |
| Org wallet doesn't exist (low-balance alerts, top-up, attribution all blocked) | Dealer wallet with alerts, top-up, per-staff attribution |
| No structured way to push campaigns to staff | In-app campaign broadcast |
| No GST-compliant invoice generation | Auto-generated commission invoices |

#### Distributor / Super Distributor
**Job:** Manage 30–50 dealers — problems discovered at month-end, not in time to act.

| Problem | Build |
|---|---|
| Zero-sale dealers only discovered at month-end | Real-time zero-sale alerts in distributor dashboard |
| Campaign design excludes distributor tier | Cascading campaign config with distributor incentives |
| No distributor-managed onboarding | Distributor-managed dealer onboarding flow |

#### OEM Brand Admin
**Job:** B2B client — if they can't self-serve it feels like a vendor dependency.

| Problem | Build |
|---|---|
| Every incentive change needs Acko PM/engineering | Self-serve campaign builder |
| No self-serve analytics | Real-time analytics with hierarchy drill-down |
| No in-platform comms tool (uses WhatsApp groups) | In-platform broadcast to field force |
| Device catalogue updates need ops ticket | Config-driven catalogue management |
| Communications carry Acko identity not OEM | White-labelled communications |

#### Acko Internal / Super Admin
**Job:** Ops, Finance, Fraud, Sales — the platform's internal operators.

| Problem | Build |
|---|---|
| KYC fully manual — can't scale | KYC auto-verification with manual fallback |
| Commission disputes via WhatsApp/escalations | Structured dispute workflow with audit trail |
| OEM onboarding requires engineering sprint | Config-driven onboarding < 1 day |
| No fraud detection tooling | Fraud scoring dashboard with anomaly flagging |
| Financial recon is monthly Excel | Automated recon — single source of truth |
| No journey manager — every UX change needs engineering | Journey manager / flow configurator |
| No sales demo environment | Sandbox/demo environment for Acko sales team |

---

### Tool 2 — Jarvis (Claims Management)

~1,700–2,000 claims/week. Tool works — doesn't scale.

#### Claims Handler

| Problem | Build |
|---|---|
| B2B claims via Excel + SFTP — manual before adjudication | B2B claim intimation via API (real-time) |
| Small claims (<₹2K) through full maker-checker | Small claims straight-through processing |
| No AI triage or admissibility assist | AI admissibility assist with coverage eligibility |
| Outbound follow-up calls manual | AI voice bot for document collection, status updates |
| No real-time SLA dashboard | Real-time handler ops dashboard |
| No fraud scoring at adjudication | Fraud score visible at every claim stage |

#### Fraud Ops

| Problem | Build |
|---|---|
| No fraud scoring at FNOL — anomalies post-payment | Predictive fraud score at FNOL with reason codes |
| Document/image manipulation not detected | Document and image manipulation detection |
| SC abuse patterns identified only via audit | SC fraud scoring: cost outliers, phantom billing |
| No dealer-level sale fraud signals | Dealer issuance anomaly signals in real time |
| No handler feedback loop | Handler approve/reject decisions feed model retraining |

#### Finance / Recon Team

| Problem | Build |
|---|---|
| Claims payout recon is manual Excel | Unified claims recon dashboard |
| Salvage sale completely outside Jarvis | Salvage sale integration with audit trail |
| Rejected claims can't be reopened | Reopen rejected claims workflow |
| Ombudsman/litigation reserves offline | Reserve tracking inside Jarvis |
| Expense payouts tracked separately | Expense payout categorisation |

---

### Tool 3 — Uploader (Internal Biz Ops)

Used 2–6x/week for plan, model, user config changes. Every change that should be self-serve routes through this.

**Key builds:**
- Config-driven plan/model management — OEM Brand Admin self-serves without Biz Ops
- Validation layer before upload (schema errors, duplicate IMEIs, invalid plan combos)
- Bulk user onboarding with CSV + error reporting
- Full audit trail + rollback capability

---

### Tool 4 — CX 360 (Customer Support)

Most inbound is avoidable. Needs deflection layer, not more features.

**Key builds:**
- Smart IVR: Electronics/EV routing + OEM-specific queues
- Self-serve deflection: claim status, coverage check, basic endorsements
- Enhanced claims tracking page (biggest single call deflection lever)
- Plain language policy summary at issuance
- Proactive WhatsApp updates at every claim milestone

---

### Tool 5 — ASC-ASP Portal (Service Centres)

2,200 SCs. Works — but quality and fraud are managed entirely manually.

**Key builds:**
- Rejection reason + handler notes visible to SC
- Estimate approval breakdown (approved vs adjusted vs cut, with reason)
- Real-time payment status in portal
- API-first SC integration layer (enables Xiaomi MSM sync without dual login)
- SC quality scorecard: TAT, cost benchmarks, repair quality rating
- Score-based intelligent routing
- SC fraud scoring
- Structured escalation when SC is unresponsive

---

## 6. EV Warranty — Part 2

### Why EV is structurally different (and in some ways better)

- Sale happens at vehicle delivery — customer at peak excitement, OEM relationship warm, dealer motivated
- Attach rates at delivery can be 2x device protection in store
- Higher ticket, lower claim frequency, longer tenure
- Strategy: extend Electronics platform (mPOS, Jarvis, SC network, commission engine) to EV — don't build separate

### FY26 EV Snapshot

| Metric | Value |
|---|---|
| Dec '25 monthly GP | ₹2.7 Cr (267% AOP) |
| Hero Vida attach rate | 30% |
| Industry benchmark ceiling | 55–65% |

### Current EV Partners

| Partner | Product | Channel | Current | FY27 Target |
|---|---|---|---|---|
| Hero Vida | ECW + EBW (2W) | mPOS | 30% attach; ~190/day; 108% AOP | 55%+ attach; 400+/day |
| Ather Energy | ECW (Component) | API | ~₹1 Cr/month | Claims on platform; deeper integration |
| EV 4W (TBD) | Extended Warranty | TBD | Business discussions | Architecture ready; first OEM live |

### The Gap That Matters Most

Sell flow works. Problem is post-sale:
- No claims continuity from dealer who sold the warranty
- No status tracking for customer
- No proactive comms
- Dealers have no visibility into deliveries vs warranties issued → can't manage attach rate
- Commissions settled offline — many Hero Vida dealers unaware of what they've earned

### EV Theme 1 — The Delivery Moment

**Goal:** Close gap to 55%+ attach | Purpose-built for delivery context | Motivated dealers

- EV sell flow redesign — built for vehicle handover moment, not adapted from device protection
- ECW and EBW plan presentation at delivery — clear differentiation, not flat list
- Dealer attach pipeline dashboard — real-time deliveries scheduled vs warranties issued
- Gamification for EV dealers — attach rate leaderboards, milestone rewards, daily target nudges
- Dealer commission settlement + invoicing — in-app visibility + same-day encashment
- VIN-based policy issuance improvements

### EV Theme 2 — Claims on mPOS (Net New Build)

**Goal:** Close post-sale gap | Build dealer trust | End-to-end experience

- EV claims FNOL on mPOS — dealer files at same touchpoint as sale
- Job card creation at dealership — links warranty sale to service job record
- Proactive claim status updates via WhatsApp
- SC routing for EV component repairs — scored on quality, TAT, component expertise
- Ather claims integration — API-based intake

### EV Theme 3 — Scale the Playbook to New OEMs

**Goal:** Hero Vida proves the model | Architecture ready for 4W

- Templatize Hero Vida onboarding playbook — every future EV OEM follows same path
- EV 4W architecture readiness — product constructs for car warranty (higher ticket, different components, longer tenure)
- OEM onboarding target: plan/model config < 1 day; partner API integration < 1 week
- EV-specific fraud signals: battery swap fraud, component claim pattern anomalies
- API completeness for EV: issuance, endorsements, cancellations, claims (Create/GET)

---

## 7. Agentic AI Capabilities

AI is a layer across every tool, not a theme. Three categories:

- **Assistive** — surfaces info or recommendation; human decides. Fastest to build, lowest risk.
- **Agentic (supervised)** — AI acts autonomously but human can review and override.
- **Fully autonomous** — AI completes workflow end-to-end. Reserved for narrow, well-defined, low-risk tasks.

### H1 Priorities (Highest ROI, Most Defined)

| Tool | Agent | What It Does | Mode |
|---|---|---|---|
| mPOS | KYC auto-verification | Reads Aadhaar/PAN, validates vs UIDAI/NSDL, auto-approves clean, queues edge cases | Agentic (supervised) |
| Jarvis | FNOL fraud scoring | Runs IMEI claim history, policy age, dealer pattern, document authenticity. Returns Green/Amber/Red with reason codes | Agentic (supervised) |
| Jarvis | Small claims STP | <₹2K + Green score + clean docs → auto-approve + trigger payment. Escalates on any ambiguity | Fully autonomous |
| Jarvis | Commission dispute tracer | Traces full transaction chain, identifies root cause, proposes resolution with confidence score | Agentic (supervised) |

### H2 Priorities

| Tool | Agent | What It Does | Mode |
|---|---|---|---|
| mPOS | Brand Admin insights engine | Weekly natural-language performance digest with anomalies flagged proactively | Fully autonomous |
| Jarvis | Outbound voice bot | Document collection, deductible confirmation, repair status follow-up. Escalates on disputes | Agentic (supervised) |
| Jarvis | SC intelligence agent | Weekly SC watchlist — cost outliers, TAT breaches, repeat IMEI phantom billing patterns | Fully autonomous |
| ASC-ASP | Estimate review agent | Benchmarks SC repair estimates against historical data. Flags outliers with suggested approved amount | Assistive |
| Uploader | Recon anomaly detector | Nightly recon — flags policies without payment, claims paid without approval, commission without policy match | Fully autonomous |
| Uploader | AI-assisted partner onboarding | Reads OEM Excel/PDF rate cards, maps to Acko schema, flags conflicts. Cuts onboarding prep from days to one review cycle | Agentic (supervised) |

### IRDAI Constraint
Claim decisions require human adjudication. AI can pre-populate and recommend — it cannot autonomously decide above thresholds. This is a hard regulatory stop, not a design choice.

---

## 8. Strategic Hypotheses

### Hypothesis 1 — ASC-ASP Portal into mPOS?

**Conclusion:** Likely middle path — keep portals separate, unify underlying APIs and data layer. A dealer who is also an ASC manager gets a single login with role-based portal routing.

**On Xiaomi OEM-native SC integration (MSM):**
- Xiaomi ASCs currently dual-enter every claim (MSM + ASC portal)
- Recommended: API-first SC integration where Jarvis exposes bidirectional API, Xiaomi MSM syncs in real time
- Jarvis remains the SC intelligence layer regardless of which portal the SC uses day-to-day (quality scoring, fraud detection, payment all stay in Jarvis)

---

### Hypothesis 2 — mPOS as Multi-LOB Distribution Platform

**The structural opportunity:** 100K+ seller touchpoints, 400 policies/day, multi-tenancy as the unlock. Same sell flow, wallet, and commission infrastructure can serve any Acko product.

| LOB | The Case | What Needs to Be Built |
|---|---|---|
| Credit Protection | Customer buying ₹30K+ phone on EMI is making a credit decision right now. BFL already an Acko partner | mPOS → embedded insurance API; credit eligibility check at POS; cross-LOB commission; co-branded issuance |
| Life — Sachet Term | ₹500–₹1,000/year at device purchase. KYC already captured at device sale | Sachet life product; KYC reuse; simplified UX on existing sell flow; Acko Life entity integration |
| Cyber Insurance | Customer just bought ₹50K phone. Phishing/online fraud cover, ₹300–₹600/year, no medical underwriting | Cyber issuance flow; bundle with device protection; plain-language coverage summary |

**FY27 posture — plant the flag, don't overcommit:**
- Complete Electronics multi-tenancy (Hisense, Xiaomi TV)
- Design embedded API gateway with LOB extensibility in mind
- Identify one LOB pilot partner — likely credit protection via BFL
- Build cross-LOB commission foundation in wallet data model

---

### Hypothesis 3 — Should mPOS Go App-Native?

**FY27 posture:** Build mPOS 2.0 on web. But plan for migration.

**Web-first rationale:** No app store dependency, no forced update across 100K+ devices, every new dealer is one link away.

**What's harder on web:** Barcode/IMEI scanning (inconsistent browser camera APIs on mid-range Android), OCR (slow and error-prone in JS), push notifications, offline resilience.

**Triggers that would accelerate native decision:**
- Barcode/OCR fails quality bar on mid-range Android
- Session drop-off on mobile web is material
- mPOS volume crosses 1,500–2,000/day and 5–10% UX improvement = clear GWP impact
- OEM partner requests native as condition of deeper integration

---

## 9. Financial Impact Summary

| Initiative | Primary Impact | Financial Signal |
|---|---|---|
| mPOS 2.0 (Sell Experience) | Attach rate improvement on Oppo, Xiaomi | Each 1% attach rate improvement = ~₹5–8 Cr incremental GWP |
| Claims Engine & SC Intelligence | TAT reduction, handler efficiency +30–40%; auto-approval for small claims | Ops cost reduction ~₹0.8 Cr/month; LR improvement via SC routing |
| Fraud Prevention | LR protection as volume scales | ₹15–20 Cr combined leakage; 25% capture = ₹4–5 Cr |
| Comms Platform | Call deflection 20–30%; dealer nudges drive attach | CX cost reduction ~₹0.5–1 Cr/year |
| Partner Self-Serve | Faster OEM launches; less Biz Ops bandwidth | Faster GTM = earlier revenue booking |
| New Products (EMI, Money Back, BFL) | Unlock BFL book; convert affordability-blocked sales | BFL is primary path to ₹550 Cr — biggest single variable |

---

## 10. Marketing & Visibility

### Enterprise & Partner Acquisition

| Initiative | What It Is | Why It Matters |
|---|---|---|
| Partner case studies (Xiaomi, Oppo, Hero Vida) | 1–2 page co-branded with attach rate, policy volume, operational outcomes | Social proof for prospective OEM and NBFC partners |
| Industry presence (CES India, CEAMA, FADA) | Speaking slots on embedded insurance, warranty economics, dealer-driven distribution | Acko invisible at trade events where OEM partnership decisions are influenced |
| mPOS platform demo environment | Always-on sandbox for enterprise sales team | Every BD conversation without a live demo is a day lost to competitors with one |
| Embedded insurance thought leadership | Quarterly data-backed content on device protection attach rates, EV warranty economics, fraud patterns | Positions Acko as category knowledge holder, not just a vendor |

### End Customer Visibility (Medium-Term Play, Start FY27)

| Initiative | What It Is | Outcome |
|---|---|---|
| Policy onboarding comms | WhatsApp + email sequence: confirmation, plain-language coverage, what to do at claim, 6-month reminder. Branded as Acko. | Builds direct Acko brand recall for Care, renewal, future products |
| Claims experience as brand moment | Proactive updates, fast resolution, post-claim follow-up | NPS from claims is the primary word-of-mouth driver |
| Acko Care pilot (H2 FY27) | Battery health tips, monsoon care, screen cleaning, software update nudges via WhatsApp | Keeps Acko top-of-mind between purchase and renewal |
| Renewal campaign | 60 and 30 days before expiry: what's covered, what's not, what renewal costs | Renewal rates low — most customers don't realise policy expired until they claim |

---

## 11. Three Non-Negotiable FY27 Outcomes

| # | Outcome | Why Non-Negotiable |
|---|---|---|
| 1 | **BFL partnership live and issuing by Q2** | Every quarter of delay = ~₹60–70 Cr GWP left on table. Nothing else moves the revenue needle as much. |
| 2 | **mPOS 2.0 (wallet + RBAC + multi-tenancy) in H1** | Wallet removes commission motivation gap. RBAC enables brand admin self-serve. Multi-tenancy unlocks Xiaomi TV and Hisense. Without these, attach rate stays flat and every new OEM conversation stalls at same friction points. |
| 3 | **EV claims on mPOS before H2** | Hero Vida at 30% attach and growing. When customers file claims and hit a broken experience, dealer trust we've built erodes fast. Claims on mPOS is the difference between a maturing EV business and a churn problem. |

---

## 12. What Is Explicitly Out of Scope

- Rebuilding OneAssist integration from scratch — B2B API covers this; no separate custom project
- Building a separate Acko storefront for Electronics — brand discovery is OEM-led; direct digital investment doesn't have same ROI here as Embedded
- Full Acko Care rollout in FY27 — this starts as a pilot, not a platform build

---

## 13. Open Leadership Questions

1. **Xiaomi OEM-native Jarvis API vs. status quo on ASC portal** — prioritise in H1 as a strategic bet on the Xiaomi partnership, or defer and spend Jarvis API investment on other claims automation priorities?

2. **mPOS as the designated offline distribution platform for all Acko LOBs** — or just Electronics/EV? If yes, multi-tenancy and embedded API gateway builds need to be scoped with that ambition in mind, not just for the Hisense use case. This is a 2–3 year architectural decision.

3. **Native app investment if web OCR/barcode fails quality bar on mid-range Android** — invest in native in FY27, or exhaust the PWA path first?

4. **Credit protection pilot via BFL in H2** — scope and entity separation sign-off needed before architecture is finalised. Regulatory: credit products may require IRDAI embedded insurance compliant flows.

---
# mPOS Platform Redesign

###### User Segments · Pain Points · Problem Space · Communication Tools · Encashment · Internal Teams

###### Brainstorm Document v1.2 · March 2026

## 1. Platform Overview

###### mPOS is Acko's point-of-sale platform for selling Device Protection (Electronics & White Goods) and EV Warranty

###### products. It serves two business verticals with distinct channel structures, user hierarchies, and selling contexts — but

###### both live in one unified app.

###### The redesign must work for a promoter at a Xiaomi counter, an ASC technician upselling at device drop-off, an EV

###### showroom executive selling warranty at delivery, a multi-ASC service partner tracking 10 centres, and a national OEM

###### admin reviewing scheme performance across 10,000 outlets.

###### Three distinct selling contexts on the platform:

- Electronics — Retail (Store): Sale at brand store or multi-brand outlet. Service is separate, at ASCs.
- Electronics — Service Centre (ASC): Policy sold during device repair or drop-off. Separate org structure from retail.
- EV — Showroom/Dealership: Sales and service at the same location. No separate ASC equivalent.

###### Note on EV scope: Currently 2-wheeler only. 4-wheeler should be designed for from day one — data model, product

###### fields (VIN, engine cc, 2W/4W flag), and pricing logic — even if the UI toggle is off at launch.

## 2. User Hierarchy Maps

##### 2A. Electronics — Retail (Store) Channel

###### Role Reports To Goal Key mPOS Actions

```
Acko Super
```
###### Admin

###### — Platform governance Brand config, product setup,

###### cross-brand analytics

```
Brand Admin
```
###### (National)

###### Acko Super Admin National performance &

###### strategy

```
Scheme creation, national reports,
```
###### comms push

```
Brand Admin
```
###### (State)

###### National Admin State-level performance State reports, dealer escalations

###### Super Distributor State Admin State sales volume Multi-distributor reports, team

###### performance

###### Distributor Super Distributor Area/district sales Dealer management, area

###### performance

```
Dealer / Store
```
###### Owner

###### Distributor Store revenue & payouts Staff mgmt, store reports, wallet,

###### earnings

```
Store Staff /
```
###### Sub-dealer

###### Dealer Complete sales, earn

###### commission

###### Sell, check earnings, view policies

```
Promoter
```
###### (Brand/Agency)

###### Brand / Agency Volume sales at counter Sell, track incentives, withdraw

###### earnings

##### 2B. Electronics — Service Centre (ASC) Channel


###### Policy sales at ASCs happen during device drop-off or repair — renewal or protection upsell. Separate org structure

###### from retail.

###### Role Reports To Goal Key mPOS Actions

```
OEM Admin
```
###### (National)

###### — ASC channel performance Reports, scheme setup, ASP

###### management

```
OEM Admin
```
###### (State/Region)

###### National Admin Regional ASC performance Regional reports, ASP oversight

```
ASP (Authorised
```
###### Service Partner)

###### OEM Admin Manage chain of ASCs, P&L Multi-ASC reports, staff

###### onboarding, wallet

###### ASC Manager ASP Run one service centre Sell, manage technicians, daily

###### report

```
Technician / Sales
```
###### Engineer

###### ASC Manager Sell during service interactions Sell, view own commissions

##### 2C. EV Channel

###### Unlike electronics, EV sales and service happen at the same physical dealership. The ASC track does not exist as a

###### separate entity.

###### Role Reports To Goal Key mPOS Actions

```
Acko Super
```
###### Admin

###### — Platform governance Brand & product config

```
OEM Brand
```
###### Admin (National)

###### Acko Super Admin National warranty attach rate Scheme setup, national reports,

###### comms

```
OEM Admin
```
###### (State/Region)

###### National Admin State performance State reports, dealer performance

###### Super Distributor State Admin Multi-district coverage Distributor-level reports

###### Distributor Super Distributor District sales Dealer management, area reports

```
EV Dealer /
```
###### Showroom

###### Distributor Sales + service revenue Staff mgmt, wallet, reports, sell

###### Showroom Staff EV Dealer Warranty sales at vehicle

###### delivery

###### Sell, view commissions

### 3. Pain Points by Segment

##### 3A. Promoter / Store Staff / Technician (Frontline Sellers)

###### The most important segment to get right. High-volume, time-sensitive sales with a customer physically present. Every

###### second of friction is a dropped sale.

###### Pain Point Detail Business Impact Severity

```
Sell flow has too many
```
###### fields

```
IMEI, customer name, phone, device model,
plan — re-entered every single sale. No
```
###### IMEI camera scanner.

```
Drop-offs mid-sale, errors,
```
###### failed policy issuance

###### HIGH

```
No customer invoice
```
###### sharing

```
After policy issuance, promoter has no easy
way to share a customer-facing invoice or
policy certificate. Customer leaves without
```
###### proof of purchase.

```
Customer calls Acko
helpline for documents,
trust in promoter drops,
post-sale experience
```
###### broken

###### HIGH


```
No real-time earnings
```
###### visibility

```
Commission figures are only known at
month-end or when manager communicates
```
###### them. No live balance or per-sale credit.

```
Trust issues,
disengagement from
```
###### platform mid-month

###### HIGH

```
No scheme payout
```
###### breakdown

```
Promoter receives a total payout number
with no breakdown of how it was calculated
— base commission, scheme bonus, TDS
```
###### all lumped together.

```
Disputes arise, promoters
don't trust the number,
can't replicate high-earning
```
###### behaviour

###### MED

```
EV and Electronics are
```
###### the same experience

```
EV warranty and electronics protection have
fundamentally different sell flows, fields, and
partner configurations — but the app treats
them identically. No separation by business
```
###### type or user journey.

```
Wrong fields, misrouted
policies, partner-specific
logic impossible to
maintain without
config-driven vertical
```
###### separation

###### HIGH

```
Commission is a black
```
###### box

```
No visibility into payout per product variant.
Promoter can't tell which plan earns more
```
###### before choosing what to push.

```
Motivation drop, inability to
prioritise high-earning
```
###### plans

###### HIGH

```
No scheme progress
```
###### visibility

```
Scheme updates come via WhatsApp, not
the app. No progress bar against targets
```
###### (e.g. sell 50 plans to unlock bonus).

```
Misses incentives, low
```
###### scheme participation

###### HIGH

```
No product knowledge
```
###### in sell flow

```
Technician/promoter can't answer customer
questions on the spot. Nothing embedded to
```
###### help objection handling.

```
Lost sales from
```
###### unanswered questions

###### MED

```
No structured training
```
###### for new products

```
New product launches have no training
pathway in the app. Everyone learns via
```
###### word-of-mouth or manager WhatsApp.

```
Inconsistent selling, low
attach on new products at
```
###### launch

###### MED

```
KYC flow doesn't exist
```
###### yet

```
No in-app KYC or bank detail collection flow
built. Users can sign up but can't complete
onboarding to first sale without offline
```
###### intervention.

```
Activation blocked entirely
— this is a build
requirement, not an
```
###### improvement

###### HIGH

```
White goods —
```
###### missing category

```
No support for ACs, washing machines,
refrigerators. Promoters at CE stores miss
upsell opportunities while competitors fill the
```
###### gap.

```
Revenue gap, competitor
protection products being
```
###### sold instead

###### HIGH

##### 3B. Dealer / Store Owner / ASC Manager / ASP / EV Dealer

###### The operator layer. They own outcomes but don't sell directly. They need visibility and control — not just reports.

###### Pain Point Detail Business Impact Severity

```
No sub-user
```
###### performance visibility

```
No view into individual staff performance.
Can't see who's selling, who's not, who
```
###### needs coaching.

```
No targeted intervention,
```
###### issues go undetected

###### HIGH

```
Staff onboarding is
```
###### slow and insecure

```
Adding new staff to mPOS takes too long.
Dealers share their own login as a
```
###### workaround.

```
Security risk, audit trail
```
###### breaks, compliance issues

###### HIGH

```
No proactive wallet
```
###### alerts

```
Org wallet (in development) has no
low-balance alerts. Staff discover they can't
```
###### sell mid-transaction.

```
Lost sales at POS,
```
###### customer embarrassment

###### HIGH

```
No per-staff wallet
```
###### attribution

```
No visibility into which staff member spent
what from the org wallet. All deductions look
```
###### like one pool.

```
Reconciliation issues,
potential misuse, no audit
```
###### trail

###### MED

```
No actionable insights
```
###### — just totals

```
Dashboards show numbers but no signals
— which product has low attach, which
```
###### hours are peak, which staff need coaching.

```
Dealer can't self-serve to
```
###### improve performance

###### MED


###### No peer benchmarking No comparison to other dealers in the

```
district or brand average. No context for
```
###### whether current performance is good or bad.

```
Dealers don't know where
they stand, no competitive
```
###### motivation

###### MED

```
Sales dashboard
```
###### needs improvement

```
Sales dashboards exist but lack depth — no
drill-down by product, time-of-day, or staff.
Answering nuanced ops questions still
```
###### requires an export.

```
Dealer can self-serve
basics but hits a ceiling
quickly. Agentic query layer
(ask 'how many sales
today?') could leapfrog
```
###### static filters.

###### MED

```
No commission
```
###### dashboard

```
Dealer has no dedicated view of
commission earned, pending, and settled —
separate from sales performance.
Commission data lives in wallet flow, not as
```
###### a standalone visibility layer.

```
Commission disputes,
distrust in settlement
numbers, dealer can't
reconcile earnings
```
###### independently

###### HIGH

```
No auto-generated
```
###### commission invoices

```
GST-registered dealers are required to raise
a tax invoice to Acko for commission income
each settlement cycle. No system generates
this — dealers do it manually in Tally or
```
###### Excel, or skip it entirely.

```
GST non-compliance for
dealer, ITC mismatch for
Acko, settlement delays
when invoices are missing
```
###### or incorrect

###### HIGH

```
Bulk invoice
generation not
```
###### possible

```
Dealers with multiple store locations or ASC
chains need to consolidate commissions
across nodes into a single invoice. No
tooling exists — each sub-unit is invoiced
```
###### (or not invoiced) independently.

```
Finance ops burden,
reconciliation errors,
incorrect GST filing by
dealer, Acko ITC claims
```
###### blocked

###### HIGH

```
GST treatment of
commissions is
```
###### unclear to dealers

```
Most dealers don't know whether their
commission income is taxable under GST, at
what rate, and whether they need to
register. No guidance in-platform. When
```
###### they get a tax notice, they blame Acko.

```
Dealer distrust, compliance
risk, Acko relationship
```
###### damage

###### HIGH

```
No GSTIN capture or
validation at
```
###### onboarding

```
Dealer GSTIN is not collected or verified
during onboarding. Acko cannot claim ITC
on commission payouts to GST-registered
dealers without a valid GSTIN on the
```
###### invoice.

```
Acko loses ITC on all
commissions paid to
registered dealers.
Significant tax leakage at
```
###### scale.

###### HIGH

```
No settlement
statement Acko can
```
###### countersign

```
Dealers have no way to get a Acko-stamped
commission settlement statement to
reconcile against their own books.
Commission data in mPOS is for reference
```
###### only — not a legally usable document.

```
Dealers maintain parallel
reconciliation in Excel,
disputes are inevitable,
```
###### audit trail breaks

###### HIGH

```
ASP has no multi-ASC
```
###### aggregate view

```
ASP managing 10+ ASCs has to check
each centre individually. No consolidated
```
###### dashboard.

```
Operational blind spots,
```
###### delayed escalations

###### HIGH

###### EV: no lifecycle view EV dealer needs unified view of warranty

```
sold at delivery vs extended warranty sold at
```
###### service. No way to see this today.

```
Revenue leakage, no
```
###### lifecycle visibility

###### MED

```
Scheme
```
###### communication gap

```
Same problem as promoters — scheme
```
###### changes are not pushed proactively.

```
Teams are misinformed,
wrong commission
```
###### expectations

###### HIGH

##### 3C. Distributor / Super Distributor

###### Often overlooked in platform design. But if a distributor doesn't push, 30–50 dealers don't sell.

###### Pain Point Detail Business Impact Severity


```
No aggregate view of
```
###### dealer network

```
Only way to check all dealers is exporting
and manually compiling reports. No live
```
###### roll-up.

```
Distributors disengage
from platform, no
```
###### downstream accountability

###### HIGH

```
No early warning on
underperforming
```
###### dealers

```
Problems caught only at month-end, not
```
###### when there's still time to intervene.

```
Performance dips go
```
###### unaddressed for weeks

###### HIGH

```
Can't self-serve dealer
```
###### onboarding

```
Dependent on Acko/brand admin to add
```
###### new dealers under their hierarchy.

```
Delays in activating new
```
###### channel partners

###### MED

```
No earnings
```
###### breakdown by dealer

```
Own commission structure is opaque — no
```
###### visibility by dealer into what they're earning.

###### Disputes at settlement time HIGH

```
No comms channel to
```
###### their network

```
Can't push scheme updates or
announcements to their dealer base through
```
###### the platform.

```
Distributors resort to
WhatsApp broadcast,
```
###### inconsistent reach

###### MED

##### 3D. Brand Admin (OEM — National / State / Regional)

###### The B2B client Acko has to impress. If they can't self-serve and have to call Acko for every scheme change, the

###### partnership feels like a dependency, not a product.

###### Pain Point Detail Business Impact Severity

```
No self-serve scheme
```
###### management

```
Every incentive change requires Acko PM
involvement. Brand admin has no control
```
###### over their own scheme configuration.

```
Acko is a bottleneck,
partner experience is poor,
```
###### stickiness weakens

###### HIGH

```
White-label is
```
###### skin-deep

```
Platform feels like an Acko app with a logo
on it. No way to customise colour themes,
```
###### language, or communication tone.

```
Brand ownership of
channel weakened, OEM
```
###### buy-in drops

###### HIGH

```
No self-serve comms
```
###### tool

```
Can't push scheme announcements,
product updates, or training content to their
```
###### field force without involving Acko.

```
Every update creates a
dependency, slows down
```
###### field communication

###### HIGH

```
Analytics can't drill
```
###### down

```
National admin sees national totals but can't
drill to state → district → dealer → individual
```
###### in one flow.

```
Surface-level insights only,
can't identify root cause of
```
###### underperformance

###### HIGH

```
No AI insights or
```
###### recommendations

```
Just raw data. Brand admin manually
```
###### interprets what's happening and why.

```
Slower decisions, insights
```
###### team underutilised

###### MED

```
Can't push training
```
###### content

```
No way to send new product training,
compliance modules, or quizzes to their field
```
###### force through the platform.

```
New product launches
depend on brand's own
```
###### infra, low consistency

###### MED

```
Can't self-serve
```
###### hierarchy onboarding

```
Brand admins cannot onboard or manage
their own distributor/dealer hierarchy.
Dependent on Acko ops for every addition
```
###### or change.

```
Slow partner activation,
Acko ops becomes a
bottleneck for the brand's
```
###### own network growth

###### MED

```
No data access
```
###### controls within org

```
National and regional admin see the same
```
###### data. No role-based data scoping.

```
Data governance issues,
```
###### compliance risk

###### MED

###### 4W EV not supported With 4-wheeler potential, brand admin will

```
need separate product types, pricing,
scheme structures. No multi-product support
```
###### today.

```
Will require dev effort per
brand for each new vehicle
```
###### type

###### HIGH

##### 3E. Acko Super Admin (Internal)

###### Pain Point Detail Business Impact Severity


```
Manual partner
```
###### onboarding

```
Every new brand requires manual config —
product setup, hierarchy mapping,
```
###### white-label theme. No self-serve.

```
Ops bandwidth bottlenecks
```
###### new OEM partnerships

###### HIGH

```
No cross-brand unified
```
###### view

```
Acko admins check brand by brand to
understand platform health. No aggregate
```
###### view.

```
Operational blind spots,
```
###### slow escalation response

###### MED

```
No built-in fraud
```
###### detection

```
No systematic signals for unusual patterns
— same IMEI sold multiple times, bulk
```
###### purchases, ghost accounts.

```
Financial exposure,
```
###### compliance risk

###### HIGH

```
Adding new product
categories requires
```
###### engineering

```
No config-driven product layer. White goods,
```
###### 4W EV each require code changes.

```
Time-to-market for new
```
###### verticals is slow

###### HIGH

### 4. Cross-Cutting Gaps

###### 4A. Vertical Separation

###### Electronics Retail, Electronics Service Centre, and EV are three contexts with different hierarchies, sell flows, and

###### product logic. There's no clean separation in the current app architecture. A user handling multiple verticals needs

###### clarity on which context they're in at any time.

###### 4B. White Goods — Missing Category

###### ACs, washing machines, refrigerators, and home appliances are a significant protection opportunity at the same retail

###### touchpoints as electronics. No product or sell flow support exists today. Competitors are filling this gap.

###### 4C. Notification Architecture is Broken

###### No structured, role-aware notification system. Scheme updates go on WhatsApp. Commission credits are discovered by

###### accident. Policy failures are invisible. A proper notification layer — in-app, push, SMS, WhatsApp — is foundational, not

###### a feature.

###### 4D. No Feedback Loop for Frontline Sellers

###### Promoters and technicians have no way to report issues, flag discrepancies, or ask product questions inside the app.

###### Everything happens outside the platform, creating noise, delays, and unresolved trust issues.

###### 4E. Wallet Anticipated Gaps (Pre-launch)

###### Wallet is in development but gaps already visible: no org-level visibility across multiple store wallets, no proactive

###### low-balance alerts, no per-transaction staff attribution, no reconciliation tool for brand admins. Resolve before launch,

###### not after.

###### 4F. 4-Wheeler EV — Build for It Now

###### Data model, sell flow, and product config layer should accommodate both 2W and 4W from day one. Key differences:

###### VIN structure, engine displacement, pricing bands, coverage variants. Toggle off in UI if needed — but the back-end

###### must be ready.

### 5. Open Questions to Resolve Before Screen Design

###### Q1: Multi-Role Users

###### A single user could have multiple roles (ASC Manager who also sells as a technician, dealer who is also a distributor for

###### their area). How do we handle this — single session with role switcher, or separate logins?

###### Q2: Channel Context Switching

###### If a brand operates both retail stores and service centres, does the national brand admin see both tracks in one

###### dashboard? How are the two channels separated without creating confusion?

###### Q3: White Goods — New Category or Extension?


###### Do we create a new product category for white goods, or extend Device Protection with appliance-specific fields (type,

###### brand, model, capacity)? The sell flow and eligibility logic will differ.

###### Q4: EV 4-Wheeler — Hidden or Coming Soon?

###### Should 4-wheeler product appear as a 'coming soon' placeholder with waitlist CTA, or be fully hidden until launch? The

###### former creates anticipation and early data; the latter avoids confusion.

###### Q5: Wallet and Incentive — One System or Two?

###### Promoter incentive settlement (individual earns and withdraws) and org wallet (brand/dealer loads, staff spends) are

###### different financial flows. One unified wallet product or two separate features? The UX and permissions model depends

###### on this.

###### Q6: Analytics Depth for Brand Admins

###### Self-serve BI (filters, drill-downs, custom date ranges) or insights-as-a-service (AI recommendations, anomaly alerts)?

###### The former is a dashboard; the latter is a product. Different build implications.

### 6. Communication & Engagement Tools

###### The platform is only part of the picture. mPOS needs a proactive communication layer that keeps users informed,

###### motivated, and accountable without requiring them to open the app. Done right, this layer replaces WhatsApp forwards

###### and Excel-based reporting for the entire channel.

##### 6A. Daily Emailers

###### Automated, scheduled emails landing every morning before the selling day starts.

- Daily Sales Digest (Dealer, Distributor, Brand Admin): Yesterday's sales count, revenue, top seller, product mix, vs

###### same day last week.

- Morning Leaderboard (Promoter, Store Staff, Technician): Personal rank in store/region, sales yesterday, gap to next

###### rank, active scheme progress bar.

- Weekly Performance Summary (Dealer, Distributor, Brand Admin): WoW sales trend, top/bottom performers in

###### network, scheme utilisation, pending onboarding blockers.

- Scheme Expiry Reminder (Promoter, Dealer, Distributor): Active schemes expiring in 3 days and 1 day, current

###### progress vs target, payout at stake.

- Commission Credit Notification (Promoter, Staff, Technician): Amount credited, breakdown by policy, pending amount,

###### withdrawal CTA.

- Inactive Seller Alert (Dealer, Distributor, Brand Admin): List of staff/dealers with zero sales in last 7 days, last active

###### date, suggested action.

- EV Delivery Pipeline (EV Dealer, EV Brand Admin): Vehicle deliveries scheduled today, warranty attach rate on

###### yesterday's deliveries, missed attach opportunities.

##### 6B. Triggered & Event-Based Notifications

###### Fired in response to a specific event — high-signal, sent via push notification and optionally WhatsApp for critical ones.

- Policy issued successfully → Promoter/staff: Policy number, customer name, plan, commission earned, certificate

###### link.

- Policy issuance failed → Promoter + Dealer/Manager: Failure reason, retry CTA, support contact. High priority push.
- Org wallet below threshold → Dealer/ASP/Manager: Current balance, estimated remaining sales capacity, top-up

###### CTA. Push + Email.

- New scheme launched → All active sellers under the brand: Scheme name, target, payout, validity, deep link to

###### scheme detail.

- Scheme target hit → Individual seller + their manager: Payout unlocked, next tier target if applicable.
- KYC/onboarding incomplete → New user: What's pending, what's blocked, deep link to pending step. D+1, D+3, D+

###### cadence.

- Commission withdrawal processed → Promoter/staff: Amount, bank account last 4, expected credit time, transaction

###### ID. Push + Email + SMS.

- Seller goes inactive 7 days → Seller + Manager: Re-engagement nudge with active scheme highlight, CTA to sell.


- Suspicious activity detected → Acko Super Admin + Brand Admin: Alert type, seller details, recommended action.

###### Email with high priority flag.

- New training module published → All active sellers: Module name, time required, product it covers, deadline if

###### mandatory.

- Policy expiring soon (renewal) → Dealer/ASC Manager: Customer name, expiry date, renewal plan options, initiate

###### renewal CTA.

##### 6C. Email Templates — Brand Admin Self-Serve

###### Brand admins should be able to configure and send communications to their field force without involving Acko for every

###### message.

- Scheme Launch Announcement: Configurable fields — scheme name, targets, payouts, validity, applicable products,

###### brand logo/colour.

- Product Training Notification: Product name, key features to sell, training link, completion deadline.
- Monthly Performance Review: Sales figures auto-populated, rank, top performer callout, message from brand.
- Seller Onboarding Welcome: Auto-triggered on onboarding; brand name, logo, first steps, support contact. Content

###### editable by Brand Admin.

- Policy Certificate (Customer-facing): Auto-triggered on issuance; white-labelled by brand — policy number, coverage

###### summary, claim process.

- Ad-hoc Broadcast: Free-form message with audience filter (role, state, active/inactive). Test-before-blast mandatory.

##### 6D. In-App Notification Centre

###### Every push and email lands in an in-app inbox — role-aware, filterable, actionable, not just a log.

- Notification types: Transactional, Scheme, System (wallet, KYC, fraud), Comms (brand broadcasts, training).
- Each notification has read/unread status, timestamp, and where relevant — an action CTA (retry, complete, view,

###### sell).

- Critical notifications (policy failure, wallet empty, fraud alert) persist until actioned. Not dismissible.
- Brand admins see a 'Sent Communications' log with open rates, click rates, and delivery status per send.

##### 6E. WhatsApp & SMS Layer

###### A significant chunk of the field force — particularly Tier 2/3 promoters — will miss emails and have inconsistent app

###### usage. WhatsApp is de facto. High-priority events that must be sent via WhatsApp:

- Policy issuance confirmation — seller + optionally customer.
- Commission credit alert — amount, balance, withdrawal link.
- New scheme launch — name, target, payout, deep link to mPOS.
- OTP / Login — mobile auth.
- Wallet low balance — current balance, top-up instructions.
- KYC reminders — D+1, D+3, D+7 after incomplete onboarding.
- Re-engagement nudge — 7 days of inactivity trigger.

##### 6F. Automated Reporting Digests

###### Scheduled reports auto-generated and delivered — eliminating the 'I have to download Excel to answer a simple

###### question' pattern.

- Daily Flash Report (7 AM) → Dealer, Distributor, Brand Admin: Yesterday's sales, top 5 sellers, scheme progress,

###### anomalies.

- Weekly Sales Report (Monday) → Dealer, Distributor, Brand Admin: WoW sales, leaderboard, product mix, inactive

###### seller list, scheme status.

- Monthly Performance Report (1st of month) → All admin levels: Full month, MoM comparison, commission summary,

###### top/bottom performers, scheme payouts.

- Scheme Closing Report (on scheme expiry) → Brand Admin, Distributor, Dealer: Final results, who hit targets, payout

###### amounts, participation rate, near-misses.


- Wallet Reconciliation Report (weekly) → Dealer, ASP, Brand Admin: Opening balance, loaded, spent by transaction,

###### closing balance, per-staff breakdown.

- EV Attach Rate Report (daily + monthly) → EV Brand Admin, EV Dealer: Deliveries vs warranty sold, dealer-wise

###### attach rate, missed opportunities, YTD trend.

- Fraud/Anomaly Digest (triggered + weekly summary) → Acko Super Admin, Brand Admin: Flagged transactions,

###### anomaly type, review status.

##### 6G. Design Guardrails for the Communication Layer

- Frequency caps: Promoters receive no more than 2 push notifications per day on average. Admins can receive more.
- Opt-down not opt-out: Users can reduce frequency or switch channels. Critical alerts (payment, fraud, wallet empty)

###### cannot be turned off.

- One CTA per notification maximum. If multiple actions are needed, it's two notifications.
- White-label the tone: Brand admin communications carry the brand's voice and logo, not Acko's. A Xiaomi seller

###### getting mail from 'Team Xiaomi' is materially different from 'Team Acko'.

- Test before blast: Brand admins must be able to send a test to themselves before pushing to their full network.

### 7. Instant Incentive & Commission Encashment

###### Today, promoters and dealers wait for OEM settlement at month-end — a lag of up to 30 days after the sale. Instant

###### encashment means the seller earns on a sale and can withdraw the same day.

###### Important: this is not a simple UX feature. Acko is effectively fronting commission payouts before the OEM

###### settles. That has float cost, TDS compliance, reconciliation complexity, and fraud exposure implications that

###### must be designed for from day one.

##### 7A. The Money Flow

###### For a ₹1,000 policy sale: OEM margin ₹200 | Promoter margin ₹100 (sub-part of OEM margin) | Acko margin ₹700.

- Acko credits promoter's wallet ₹100 immediately on policy issuance — before OEM settlement. Acko carries the float.
- OEM later raises invoice to Acko for ₹200 (their margin). Acko deducts TDS at applicable rate. Nets out against float

###### already paid.

- TDS is deducted at point of promoter withdrawal. Acko is the deductor. Form 16A issued to promoter at year-end.
- Dealer margin (org-level) follows the same instant credit logic — store margin available daily, not at month-end.
- Distributor commission accrues in real-time against confirmed sales in their network; withdrawable against that

###### balance.

##### 7B. Non-Negotiable Constraints

- Commission stays 'pending' until policy is successfully issued. Credits only post-issuance. Blocks the sell → withdraw

###### → cancel fraud loop.

- Withdrawal amount: seller can withdraw any amount above a minimum threshold (e.g. ₹100) up to their full available
    balance — partial or full, seller's choice. No lock-in, no minimum hold period. Note: each withdrawal must still map to

###### specific policy IDs for reconciliation; the system handles this mapping, not the seller.

- Transfer speed: instant via UPI/IMPS to registered bank account. Target T+0 for amounts under ₹50,000. Amounts

###### above ₹50,000 require additional verification, T+1.

- TDS deducted at source on every encashment above the taxable threshold. Wallet shows: gross earned | TDS
    deducted | net withdrawable. TDS certificate downloadable. Must be surfaced clearly — many promoters don't expect

###### deductions and it creates disputes.

- Cancellation clawback: if a policy is cancelled post-payout, commission is reversed. If already withdrawn, creates a

###### negative balance that offsets against future earnings. This edge case must be handled upfront — it will happen.

- KYC and bank account verified before first withdrawal. Commission accrues but withdrawal is hard-blocked until

###### complete. First encashment after KYC should have a 24-hour hold.

- Velocity fraud limits: flag if same seller requests >3 withdrawals/day or withdraws full balance immediately after every

###### single sale. Tie into fraud detection framework. Configurable daily cap per user.


- All wallet events sent to Finacko in real-time: policy sale, commission credit, TDS deduction, withdrawal, clawback.

###### No batch-only approach.

##### 7C. What Instant Encashment Unlocks — Behavioural Layer

###### Instant encashment isn't just a financial feature — it's a behavioural lever. A promoter who can see ₹47 credited to their

###### wallet 5 minutes after a sale is far more likely to push the next sale than one waiting 30 days for a lump sum.

- Real-time motivation: earnings visible immediately after each sale turn the wallet into a live scoreboard. Commission

###### becomes a per-action reward, not a delayed promise.

- Scheme design flexibility: brand admins can run intra-day flash incentives ('sell 3 plans before 2 PM, get ₹200 bonus

###### — credited instantly'). Impossible with batch settlement.

- Reduced shadow payments: dealers paying staff from their own pocket disappears when staff can see and access

###### their own money. Audit trail stays clean.

- Platform stickiness: the earnings wallet becomes a reason to open the app daily — not just when selling. Balance

###### checks, withdrawal status, pending earnings. Engagement goes up.

- Stronger OEM recruiter story: 'you get paid instantly per sale' is materially stronger than 'you get paid at month end'

###### when onboarding new promoters.

##### 7D. Commission Transparency Layer

###### Instant encashment only works if sellers understand exactly what they're earning and why. The transparency UI is as

###### important as the transfer itself. Currently this is opaque — sellers see a total number with no breakdown.

- Per-sale commission breakdown: every policy in sales history shows exact commission — base commission +

###### scheme bonus (if applicable) + TDS deducted. Not a lump sum.

- Earnings state machine: each commission has a clear status — Earned (policy issued) → Approved (cleared for

###### encashment) → Encashed (withdrawn) → Reversed (policy cancelled). Under Review state for disputes.

- Scheme bonus attribution: if a sale earned a bonus because it hit a scheme milestone, that must be called out

###### separately so the seller understands what triggered it and can replicate the behaviour.

- Projected earnings: if a seller is 3 plans away from a scheme payout, show 'sell 3 more to unlock ₹500 bonus'.

###### Progress bar, not a static table.

- TDS certificate download: quarterly TDS certificates downloadable from the earnings screen. Auto-generated — no

###### manual ops dependency.

##### 7E. Pain Points Solved by Instant Encashment

###### Pain Point Detail Business Impact Severity

###### Promoter / Technician Commission earned but no access for

```
20–30 days. No breakdown. Disputes via
```
###### WhatsApp.

```
Same-day withdrawal with
per-sale breakdown builds
financial trust and
```
###### motivation

###### HIGH

###### Store Staff Settlement depends on dealer's own

###### timeline — not Acko's. Zero visibility.

```
Direct Acko-to-staff payout
removes dealer as
```
###### settlement middleman

###### HIGH

###### Dealer Store margin locked with OEM until

###### month-end, affecting operational cashflow.

```
Dealer margin accessible
```
###### daily, backed by Acko float

###### HIGH

###### Distributor Commission on network sales not visible or

###### accessible until OEM cycle.

```
Real-time earnings ledger
with instant withdrawal
```
###### against confirmed sales

###### MED

###### Technician / ASC Commission flow through ASP is opaque.

###### Technician has no control.

```
Per-sale commission
credited directly to
technician wallet, same as
```
###### promoter model

###### HIGH


##### 7F. Wallet UX States

###### The wallet must reflect each state clearly. Trust is built through transparency, especially for sellers with historically

###### opaque payouts.

- Pending: Policy sale recorded, issuance in progress. Amount visible, not withdrawable. Shows 'Expected credit in X

###### minutes'.

- Available: Policy issued, commission credited, TDS calculated. Withdrawal CTA active. Shows gross, TDS line, net

###### withdrawable per policy.

- Withdrawn: Transfer processed. Shows bank last 4 digits, expected credit time, transaction reference.
- In Review: Flagged by fraud ops or velocity limit hit. 'Under review — typically resolved in 24 hours' with support

###### contact.

- Clawed Back: Policy cancelled post-payout. Reversal shown with reason. If already withdrawn, shows negative

###### balance with offset explanation.

- Blocked: KYC or bank verification incomplete. Commission accruing but locked. Clear status of exactly what's

###### pending, direct link to complete it.

### 8. Pain Points — Acko Internal Teams

###### The platform's internal users carry the operational cost of every gap in mPOS. These pain points are blockers to Acko's

###### ability to scale the channel, launch new products, and maintain partner relationships.

##### 8A. Business (Partnerships, Channel, Finance)

###### Pain Point Detail Business Impact Severity

```
Manual partner
```
###### onboarding

```
Every new OEM requires manual config by
Acko — product setup, hierarchy,
commission structure, white-label theme. No
```
###### self-serve.

```
Ops bandwidth bottlenecks
new brand partnerships.
Time-to-live is weeks, not
```
###### days.

###### HIGH

```
No real-time
```
###### cross-brand reporting

```
Business team pulls reports brand by brand
before OEM review calls, often stitching
Excel sheets together the night before. No
```
###### unified cross-brand view.

```
Unprepared QBRs, missed
signals, reliance on ops for
```
###### data

###### HIGH

```
Scheme management
```
###### requires engineering

```
Every scheme or commission change —
however minor — requires engineering or
Acko ops to configure. Business team
```
###### cannot self-serve.

```
Slow response to OEM
requests, loss of agility,
Acko perceived as
```
###### high-friction partner

###### HIGH

```
Attach rate visibility
```
###### lag

```
No real-time attach rate metric per OEM per
channel. Business finds out about attach
rate drops weeks after they've happened
```
###### and after the OEM has already noticed.

```
Commercial exposure,
contract renewal risk,
reactive rather than
proactive account
```
###### management

###### HIGH

```
Commission disputes
```
###### handled off-platform

```
Discrepancies between OEM expectations
and mPOS records resolved manually over
email and Excel. No in-platform dispute
```
###### workflow.

```
Ops spends significant
time monthly on
reconciliation queries.
```
###### Damages partner trust.

###### HIGH

###### Finacko not real-time Policy events, commission credits, TDS, and

```
withdrawals don't flow to Finacko in
real-time. Finance reconstructs the ledger
```
###### from multiple system exports.

```
Month-end close delayed.
Revenue recognition lag.
```
###### Audit risk.

###### HIGH

```
Scheme liability
```
###### invisible mid-cycle

```
Acko co-funds many OEM incentive
schemes but has no real-time view of
payout liability as it accrues. Only known at
```
###### settlement.

```
Financial exposure
invisible mid-scheme.
Overspend discovered too
```
###### late to course-correct.

###### HIGH

```
New product GTM
```
###### gated by engineering

```
Launching a new product category requires
significant engineering work per brand. No
```
###### config-driven product layer.

```
Business can't move at
market speed. GTM is
```
###### gated by sprint capacity.

###### HIGH


**No competitive**

###### benchmarking

```
Business team has no sense of how mPOS
attach rates compare to industry
benchmarks or competitor programs. All
```
###### decisions are internally referenced.

```
Risk of setting wrong
targets, inability to tell
OEMs how Acko performs
```
###### vs alternatives

###### MED

**TDS compliance at**

###### scale

```
With thousands of promoter payouts, TDS
deduction and Form 16A issuance is manual
```
###### and error-prone today.

```
Regulatory
non-compliance risk. Tax
notices to promoters reflect
```
###### on Acko.

###### HIGH

**GST ITC leakage on**

###### dealer commissions

```
Acko cannot claim Input Tax Credit on
commission payments to GST-registered
dealers unless it holds a valid tax invoice
from the dealer with correct GSTIN,
HSN/SAC code, and GST amount. Most
dealers don't raise this invoice — or raise it
```
###### incorrectly.

```
Acko loses 18% GST ITC
on all commissions paid to
registered dealers. At
scale, this is a material tax
leakage. No current
system to collect, validate,
or reconcile dealer
```
###### invoices.

###### HIGH

**No bulk invoice
processing**

###### infrastructure

```
Acko settles commissions with thousands of
dealers monthly. Each dealer settlement
ideally maps to a dealer-raised invoice. No
system to receive, match, validate, or reject
```
###### invoices in bulk. Finance does this manually.

```
Month-end close takes
significantly longer than it
should. ITC claims are
delayed or filed incorrectly.
Finance headcount scales
with partner count rather
```
###### than being automated.

###### HIGH

**GSTIN not validated at**

###### partner onboarding

```
Dealer and distributor GSTINs are not
collected or validated during mPOS
onboarding. Acko's ITC claim depends
entirely on having a correct GSTIN on the
dealer's invoice — which assumes the
GSTIN was captured correctly in the first
```
###### place.

```
Invalid or missing GSTINs
result in rejected ITC
claims by the GST portal
(GSTR-2B mismatch). No
retroactive fix possible —
correction requires
amended invoices and
```
###### re-filing.

###### HIGH

**No auto-reconciliation**

###### against GSTR-2B

```
Acko's finance team manually reconciles
dealer invoices against what appears in
GSTR-2B (the GST portal's auto-populated
ITC statement). Any mismatch — wrong
GSTIN, wrong invoice amount, wrong tax
rate — requires manual follow-up with the
```
###### dealer.

```
Significant ops burden. ITC
claims delayed by 1–
months routinely. Penalty
risk on incorrect ITC
```
###### claims.

###### HIGH

**Commission
classification under**

###### GST ambiguous

```
The GST treatment of warranty-related
commissions varies depending on whether
the dealer is acting as an insurance agent, a
distributor, or a service provider. Incorrect
classification at invoice level leads to wrong
```
###### tax rate applied (0% vs 18% vs exempt).

```
Wrong GST on
commission invoices →
incorrect ITC claim → GST
audit risk for Acko. Finance
needs a clear,
platform-enforced invoice
```
###### template per dealer type.

###### HIGH

**No automated Form
26AS / AIS**

###### reconciliation

```
Acko deducts TDS on promoter withdrawals
and files TDS returns (Form 26Q). But
there's no automated check that what Acko
filed matches what appears in promoter's
Form 26AS/AIS. Mismatches generate
queries from promoters and, eventually, IT
```
###### notices.

```
Ops burden managing
mismatch complaints.
Relationship damage with
promoters who face IT
scrutiny. Correction
requires revised TDS
```
###### returns.

###### HIGH

**Fraud exposure — no**

###### proactive monitoring

```
No systematic fraud detection. Duplicate
IMEIs, ghost promoter accounts, policy
churning surface through complaints, not
```
###### monitoring.

```
Financial exposure,
regulatory risk, partner
```
###### credibility damage.

###### HIGH

**No partner sales demo**

###### tool

```
Sales team pitching mPOS to prospective
OEM partners has no structured demo
environment. They either walk through the
```
```
Deals take longer to close,
partners underestimate
mPOS capability, sales
```
###### HIGH


```
live production app (messy, confusing to a
new audience) or use static slide decks that
can't show real product flows. No sandbox
with realistic dummy data, no capability
showcase tailored to what a prospective
partner cares about — attach rate uplift,
seller incentive mechanics, white-label
```
###### depth, integration simplicity.

```
team can't self-serve
demos without PM/eng
support for setup. Acko
loses credibility in
```
###### competitive evaluations.

##### 8B. Product Team

###### Pain Point Detail Business Impact Severity

```
No user research /
```
###### feedback loop

```
No structured feedback loop from frontline
sellers. Product decisions based on OEM
feedback and internal assumptions, not
```
###### actual user behaviour.

```
Features built that miss the
mark; high-priority UX
issues go unfixed because
they're invisible to product
```
###### team

###### HIGH

```
Feature parity chaos
```
###### across brands

```
Different OEM brands have been given
bespoke features over time — one brand
has X, another doesn't, a third has a variant.
No canonical feature set exists. Every new
deployment is a config archaeology
```
###### exercise.

```
Technical debt, regression
risk, impossible to do a
clean redesign without first
auditing what 'mPOS'
```
###### actually means per brand

###### HIGH

```
No product analytics /
```
###### PLG instrumentation

```
No embedded event tracking (Amplitude /
Segment). Drop-off points in the sell flow,
time-on-screen, feature adoption rates —
```
###### most of this is dark.

```
Decisions made on partner
complaints, not data. A/B
testing not possible.
Activation and retention
```
###### levers are guesswork.

###### HIGH

###### Feature delivery lag OEM partner requests (new scheme type,

```
new report column) have long lead times
because everything is hardcoded per
partner. Changes need a sprint, not a config
```
###### update.

```
Partners perceive Acko as
slow. Competitive risk from
```
###### faster-moving platforms.

###### HIGH

```
Low onboarding
```
###### activation rate

```
Self-reported activation rate (users who
complete onboarding and make their first
sale) is low. The product team doesn't know
exactly where the drop-off happens because
```
###### it's not instrumented.

```
Large % of onboarded
sellers never sell; OEM
questions the value of the
```
###### program

###### MED

```
No A/B testing
```
###### infrastructure

```
Can't run experiments on sell-flow
variations, onboarding steps, or notification
```
###### copy. Every change is a full release.

```
Optimisation is slow. No
rollback on harmful
```
###### changes.

###### MED

```
No in-app user
```
###### feedback

```
Product team hears about issues through
partner escalations, not direct user reports.
```
###### Signal is delayed and filtered.

```
Real problems take
months to surface to
```
###### product.

###### MED

```
Multi-vertical sprawl,
```
###### no shared framework

```
Electronics retail, ASC, EV, white goods —
each has bespoke product logic. No shared
```
###### component library or modular framework.

```
Every new vertical is
effectively a new product
build. Tech debt
```
###### compounds.

###### HIGH

```
Scheme logic owned
```
###### by engineering

```
Scheme rules (eligibility, targets, payout
tiers) are configured by engineering, not
```
###### product. Changes require a sprint.

```
Brand partners can't
self-serve. Acko product
team acts as account
```
###### management.

###### HIGH

##### 8C. Technology Team


###### Pain Point Detail Business Impact Severity

**Partner-specific**

###### hardcoding

```
Each OEM partner has bespoke logic in the
codebase — commission structures, product
eligibility, field validations. New partners
```
###### require code changes, not config.

```
Engineering blocked on
new partner onboarding.
Codebase complexity
grows with every partner
```
###### added.

###### HIGH

###### No API versioning OEM integrations (OPPO, Xiaomi, Hero)

```
tightly coupled to current API contract. Any
platform change risks breaking partner
```
###### integrations.

```
Engineering paralysis on
refactors. Breaking
changes require full
partner re-integration
```
###### cycles.

###### HIGH

**Broken RBAC /**

###### permission model

```
Current role/permission model was
designed for a simpler hierarchy. As EV,
ASC, Distributor, and Super Distributor roles
were added, permissions were patched in.
```
###### No clean RBAC system exists.

```
Security gaps, incorrect
data visibility across roles,
expensive to audit,
impossible to extend
```
###### cleanly for new verticals

###### HIGH

**Policy issuance failure**

###### handling is manual

```
When a policy fails (IMEI validation,
payment timeout), there's no automated
retry or structured failure state. Manual
```
###### intervention required.

```
Failed sales invisible to
seller. Leads to duplicate
attempts, data corruption,
```
###### customer-facing errors.

###### HIGH

**No real-time Finacko**

###### pipeline

```
No event streaming from mPOS to Finacko.
Batch exports only. Instant encashment
cannot work safely without a real-time
```
###### ledger.

```
Finance on stale data.
Instant encashment is
architecturally unsafe until
```
###### this is solved.

###### HIGH

###### IMEI validation fragility IMEI validation depends on OEM APIs (e.g.

```
OPPO ICSM) with uptime issues, rate limits,
and data security restrictions. Causes
```
###### issuance failures at peak hours.

```
Sell flow abandonment
during exactly the
high-traffic moments it
```
###### needs to be reliable.

###### HIGH

**Multi-tenancy at app**

###### layer, not architecture

```
Data isolation between brands enforced by
application-level controls, not architecture.
```
###### Gaps are possible.

```
Data leakage risk between
competing OEM brands.
Regulatory and contractual
```
###### exposure.

###### HIGH

**No unified notification**

###### service

```
Push, email, SMS, WhatsApp each wired
independently to different parts of the app.
No central orchestration, deduplication, or
```
###### delivery tracking.

```
Duplicate notifications,
invisible delivery failures,
disproportionate effort to
```
###### add new notification types.

###### MED

**No analytics pipeline
— dashboards hit**

###### production DB

```
Dashboards are powered by production DB
queries, creating performance risk at scale.
No separation between transactional and
```
###### analytical data stores.

```
Dashboard load times
degrade as data volume
grows. Risk of OLTP
performance impact. Can't
```
###### do real-time analytics.

###### HIGH

**Wallet / payout
infrastructure being**

###### built from scratch

```
Instant encashment and org wallet have no
existing fintech infrastructure for real-time
payouts, TDS calculation, or reconciliation.
Building from scratch alongside everything
```
###### else.

```
High build complexity; risk
of getting financial edge
cases wrong (reversals,
negative balances, TDS
```
###### deduction timing)

###### HIGH

**Mobile performance on**

###### low-end Android

```
App performance on low-end Android
devices — the primary device of Tier 2/
promoters — is not optimised. Heavy JS
bundles, unoptimised images, no skeleton
```
###### loading.

```
Sell flow drop-offs on the
devices that the majority of
```
###### the user base actually uses

###### HIGH

**Scalability untested at**

###### current volume

```
Platform designed for a few thousand users.
Now 44k+ dealers, 16k+ promoters — peak
loads during scheme end-dates are
```
###### untested territory.

```
Potential degradation
during exactly the
high-stakes moments
(scheme closing day,
festive peaks) when
```
###### reliability matters most.

###### HIGH


```
Offline resilience
```
###### absent

```
Sell flow fails completely without internet. In
low-connectivity environments (basements,
rural areas), this is common — not an edge
```
###### case.

```
Lost sales in poor
connectivity zones.
Promoter workarounds
(screenshot + re-enter)
```
###### create data quality issues.

###### MED

##### 8D. Ops Team

###### Ops is the invisible load-bearer. Every product self-serve gap becomes an ops ticket.

- KYC verification is manual — every new promoter/dealer requires ops to verify documents. Volume doesn't scale with

###### current ops capacity.

- Commission disputes land in ops via WhatsApp or call centre. No in-platform dispute resolution tool.
- Brand onboarding requires ops involvement for every new partner. No self-serve config console even for ops, let

###### alone brands.

- Wallet top-up requests (once wallet launches) will be the top ops category within 6 months unless there's a self-serve

###### load flow.

- Policy reissuance and correction (wrong IMEI, customer detail errors) handled via ops. No in-platform correction tool

###### for dealers or admins.

### 9. Claims Flow Within mPOS

###### A significant and underserved use case: EV dealers and store promoters are often the first point of contact when a

###### customer needs to raise a claim — months after the policy was sold. Today, they have no tools to help. The customer

###### calls the promoter, the promoter has no idea what to do, and both end up on hold with Acko support.

###### Embedding a lightweight claims initiation flow in mPOS doesn't replace Jarvis or the core claims management system. It

###### creates a trusted, guided entry point at the channel level — and turns channel partners into a claims assist layer, not

###### just a sales layer.

##### 9A. Two Distinct Claims Contexts

###### These are materially different use cases and should not be designed as one flow.

###### Electronics — Store Promoter / Staff EV — Dealer / Showroom Staff

###### When Customer walks into store weeks/months

```
after purchase with a damaged device.
Promoter sold them the policy; customer
```
###### trusts them to help.

```
Customer brings vehicle in for service or calls
the dealer after a breakdown or component
```
###### failure covered under warranty.

###### Who initiates Promoter or store staff on behalf of customer,

###### with customer present.

```
Showroom staff or service tech on behalf of
```
###### customer. Customer may or may not be present.

```
Information
```
###### available

```
Customer's phone number or policy number.
Device IMEI (can be scanned). Photos of
```
###### damage taken on the spot.

```
Vehicle registration number or chassis number
(VIN). Customer name. Nature of complaint
```
###### (component failure description).

###### Claim type Typically ALD (Accidental Liquid Damage) or

```
screen damage. Sometimes EW for functional
```
###### failures.

```
Extended Component Warranty — specific
component failure (battery, motor controller,
```
###### display). Not accidental damage.

```
Next step
```
###### post-filing

```
Customer drops device at ASC or arranges
pick-up. Promoter's role ends at FNOL
```
###### creation.

```
Vehicle stays at dealer for diagnosis. Dealer is
also the service centre — they own the repair
```
###### journey, not just the filing.

###### Complexity Lower. Promoter is a helper — they create the

###### FNOL and hand off to Acko claims.

```
Higher. EV dealer is both the claim filer AND the
service partner. They need to track the claim,
submit estimates, and get approvals — all from
```
###### mPOS.


##### 9B. What the Claims Flow Should Cover in mPOS

###### mPOS should not try to replicate Jarvis. It should cover the FNOL (First Notice of Loss) creation and, for EV dealers

###### specifically, the service-side claim tracking. Everything downstream (assessment, adjudication, settlement) stays in

###### Jarvis.

###### Electronics — Promoter-Assisted FNOL

- Policy lookup: Search by customer phone number, IMEI, or policy number. Display active policy with coverage

###### summary and remaining claim entitlement.

- Damage capture: Photo upload from camera (mandatory minimum 2 photos — damage + full device). IMEI scan to

###### confirm device identity. Brief damage description (dropdown + free text).

- Coverage eligibility check: Real-time call to Jarvis/policy engine — is this incident type covered? Is the policy active?

###### Any waiting period still running? Show result clearly before submitting.

- FNOL submission: Creates claim record in Jarvis. Returns claim reference number. Customer gets SMS/WhatsApp

###### with claim number and next steps. Promoter gets confirmation with tracking link to share.

- ASC routing (optional): If damage type is known, suggest nearest empanelled ASC. Don't make it mandatory —

###### customer may prefer to walk in later.

- Post-submission: Promoter can look up claim status by claim number or customer phone. Read-only — no ability to

###### edit or action the claim after filing.

###### EV — Dealer-Assisted Claim + Service Tracking

###### The EV dealer is more deeply involved than a promoter. They file the claim AND manage the repair. The flow needs to

###### support both.

- Policy & vehicle lookup: Search by vehicle registration number or chassis (VIN). Display active warranty, covered

###### components, and remaining claim history.

- Complaint logging: Component-specific complaint selection (battery degradation, motor controller failure, display,

###### charging port, etc.). Symptom description. Odometer reading at time of complaint.

- Coverage eligibility check: Same as electronics — is this component covered? Is it within warranty period and

###### mileage limits? Instant result before submitting.

- FNOL + job card creation: Submits FNOL to Jarvis AND creates an internal job card for the dealer's service workflow.

###### Job card carries the Jarvis claim ID as the anchor reference.

- Estimate submission: Dealer uploads repair estimate (labour + parts) from within mPOS. Estimate goes to Jarvis for

###### adjudicator review. Dealer can see estimate status (pending / approved / queried / rejected).

- Approval tracking: Once estimate is approved in Jarvis, dealer gets a push notification in mPOS with approved

###### amount. Repair can proceed.

- Repair completion: Dealer marks repair complete and uploads completion photos/invoice. Triggers settlement

###### initiation in Jarvis.

- Settlement visibility: Dealer can see settlement status and payout to their account — same wallet infrastructure as

###### commissions.

##### 9C. Pain Points This Solves

###### Pain Point Detail Business Impact Severity

```
Promoter has no
answer when customer
```
###### calls about a claim

```
Today: promoter gives Acko helpline
number. Customer calls, waits, re-explains
everything. Promoter-customer relationship
```
###### damaged.

```
Promoter can look up
policy, confirm coverage,
and file FNOL in 3 minutes
while customer stands
```
###### there. Trust maintained.

###### HIGH

```
EV dealer manages
claim tracking on
```
###### WhatsApp with ASM

```
Dealer texts Area Sales Manager for claim
status. ASM checks Jarvis and replies.
```
###### Often delayed, often lost in thread.

```
Dealer sees claim status,
estimate approval, and
settlement directly in
mPOS. No intermediary
```
###### needed.

###### HIGH

```
Acko FNOL team gets
```
###### incomplete information

```
Customer calling in can't find IMEI, doesn't
know policy number, describes damage
```
###### vaguely. Claim creation takes 15+ minutes.

```
Promoter files FNOL with
scanned IMEI, damage
photos, and policy
auto-populated. Jarvis
```
###### HIGH


```
receives complete,
```
###### structured data.

```
EV estimate approval
is a blind spot for
```
###### dealer

```
Dealer submits estimate via email or
WhatsApp. No visibility on whether it's been
```
###### received, reviewed, or approved.

```
Structured estimate
submission with real-time
status tracking. Dealer
knows exactly where they
```
###### are in the process.

###### HIGH

```
Duplicate or fraudulent
```
###### claims

```
Without IMEI verification at FNOL stage,
same device can be claimed multiple times
```
###### across different policies.

```
IMEI scan at filing
cross-checks against
existing open claims in
real-time. Flags duplicates
```
###### before FNOL is submitted.

###### HIGH

##### 9D. Integration with Jarvis — Scope

###### mPOS claims flow is a Jarvis input channel, not a replacement. The integration scope is narrow but critical.

- mPOS → Jarvis: FNOL creation API (policy ID, claimant details, damage type, photos, IMEI/VIN, location). EV

###### estimate submission API. EV repair completion API.

- Jarvis → mPOS: Coverage eligibility check (real-time, synchronous). Claim status events (async webhook: submitted,

###### under review, estimate approved, settled). Settlement amount confirmation.

- What stays in Jarvis: Adjudication, document review, ASC assignment, field ops coordination, settlement processing.

###### mPOS never touches these.

- Fraud gate at FNOL: Before creating the FNOL in Jarvis, mPOS should call a lightweight fraud check — duplicate

###### IMEI claim, policy in cooling period, blacklisted device. Hard block if flagged, soft flag if borderline.

##### 9E. Open Questions — Claims

- Should promoters be able to file claims for policies they did NOT sell? (Customer walks into any store, not

###### necessarily where they bought.) Has implications for data access scope.

- EV claim photos — dealer uploads from workshop. Are we relying on mobile camera only, or should we support file

###### upload from desktop (dealers likely use a PC at the service bay)?

- Claim status visibility — how much of the claims journey should a promoter see? Just the FNOL they filed, or all

###### claims on their sold policies?

- Commission on claims-assisted sales — should promoters earn any incentive for assisting a claim? Could drive filing

###### behaviour in both good ways (adoption) and bad (fraudulent FNOL gaming).

### 10. OEM Integration Architecture — Plug-and-Play

###### Every OEM on mPOS today is a custom integration. OPPO has its own IMEI validation API. Xiaomi has MSM. Hero has

###### a different data format. Ather has its own VIN/ECW system. Adding each new brand is weeks of engineering work, and

###### maintaining them is permanent overhead.

###### The platform cannot scale as a white-label product for 10+ OEM brands if each one is a bespoke integration. The

###### redesign must include an architectural position on this — not just a feature list.

##### 10A. What 'Plug-and-Play' Actually Means

###### Plug-and-play OEM integration means: a new brand can be onboarded onto mPOS — with their own hierarchy,

###### products, commission structure, sell flow, and IMEI/VIN validation — without a single line of code being written by Acko

###### engineering.

###### That requires three things to be true simultaneously:

- A config layer: all partner-specific settings (product eligibility rules, commission slabs, hierarchy structure, UI theme,

###### communication templates) are data, not code.


- A standard integration contract: OEMs connect their systems (device validation, policy issuance confirmation, claim
    notification) via a defined, versioned API spec. Acko provides the spec; the OEM implements it. Not the other way

###### around.

- An adapter layer: for OEMs who can't or won't build to Acko's spec, a configurable adapter normalises their existing

###### API format into Acko's internal contract. Acko builds adapters once per OEM system type, not per OEM.

##### 10B. Current State — What's Broken

###### Pain Point Detail Business Impact Severity

```
Each OEM is
```
###### hardcoded

```
OPPO's IMEI validation, Xiaomi's MSM
webhooks, Ather's ECW endpoint — each
wired directly into the codebase.
Commission slabs, product eligibility, and
field validations are partner-specific code
```
###### paths.

```
Adding a new OEM takes
4–6 weeks of engineering.
Changing an existing
OEM's config requires a
```
###### deployment.

###### HIGH

###### No API versioning Current OEM integrations are tightly coupled

```
to whatever API version was live when they
were built. Platform changes risk breaking
```
###### live partner integrations with no fallback.

```
Engineering paralysis on
refactors. Every platform
change requires OEM
```
###### re-validation.

###### HIGH

```
Acko builds to OEM
```
###### spec, not vice versa

```
Acko's team adapts to each OEM's data
format, auth method, and API design. The
```
###### burden is entirely on Acko.

```
Infinite maintenance
surface. OEM changes
their API → Acko's code
breaks → manual
```
###### firefighting.

###### HIGH

###### No self-serve config Hierarchy structure, commission slabs,

```
scheme rules — all configured by
engineering via direct DB edits or hardcoded
```
###### constants.

```
Every partner request (add
a dealer tier, change
commission slab) is a
ticket to engineering, not a
config change by ops or
```
###### brand admin.

###### HIGH

```
Device/VIN validation
```
###### fragility

```
IMEI validation for OPPO goes through
ICSM with uptime issues. Any OEM API
downtime directly stalls Acko's sell flow at
```
###### the point of sale.

```
Policy issuance failures
during peak retail hours.
Customer-facing errors at
the worst possible
```
###### moment.

###### HIGH

##### 10C. Target Architecture — Four Layers

###### Layer 1: Partner Config Engine

###### A no-code configuration layer where Acko ops or brand admins define everything that's partner-specific without

###### engineering involvement.

- Brand identity: logo, colour theme, display name, supported languages.
- Hierarchy definition: role names, reporting structure, depth (e.g. National → State → Super Distributor → Distributor

###### → Dealer → Staff), configurable per brand.

- Product catalogue: which products are active for this brand, device/vehicle categories covered, price bands, plan

###### variants.

- Commission engine: slab structure per product variant per role level, effective dates, clawback rules.
- Scheme rules engine: eligibility conditions, target metrics, payout tiers, validity windows — all configurable without

###### code.

- Communication templates: branded email/WhatsApp templates, notification tone, sender identity.

###### Layer 2: Standard Integration Contract (Acko Partner API)

###### A published, versioned API specification that defines what Acko expects from any OEM system connecting to mPOS.

###### OEMs who can implement this spec connect with minimal Acko engineering effort.


- Device/VIN Validation API: Acko calls OEM → OEM returns device eligibility, warranty status, model details. Standard

###### request/response schema. Auth via API key or OAuth2.

- Policy Issuance Webhook: On policy creation, Acko pushes structured event to OEM endpoint. OEM acknowledges.

###### Standard payload includes policy ID, device/vehicle identifiers, plan details, customer reference.

- Claim Event Webhook: On FNOL creation and claim status changes, Acko pushes to OEM. Allows OEM systems

###### (like Xiaomi MSM) to receive structured claim data without Acko custom-coding each integration.

- Commission Settlement API: Acko pulls or pushes settlement data per agreed cycle. Standardised invoice and TDS

###### data format.

- All endpoints are versioned (v1, v2). Breaking changes require a new version. Old versions deprecated with 6-month

###### notice. OEMs choose their migration timeline.

###### Layer 3: Adapter Layer (for Non-Standard OEMs)

###### Reality: most existing OEMs won't rebuild their systems to Acko's spec. The adapter layer translates between Acko's

###### internal contract and each OEM's existing format. Adapters are configuration-driven, not bespoke code.

- Each adapter is a mapping definition: OEM field X → Acko field Y, OEM status code 'VALID' → Acko 'eligible: true'.
- Auth adapters: handles OAuth, API key, IP whitelist, HMAC — whatever the OEM uses — without changing Acko's

###### core.

- Retry and fallback logic: if OEM API is down, configurable fallback behaviour per partner (hard block, graceful

###### degradation, cached validation).

- Acko builds one adapter per OEM system type — not per OEM. If three OEMs all use SAP for device management,

###### one SAP adapter serves all three.

###### Layer 4: Observability & Partner Health Dashboard

###### A real-time view of every active OEM integration — for Acko engineering and ops, not brand admins.

- API health: uptime, error rate, p95 latency for each OEM integration. Alerts when an OEM's validation API degrades.
- Event delivery: webhook delivery status, retry queue depth, failed deliveries with payload for manual re-trigger.
- Config audit log: every change to partner config (who changed what, when) with rollback capability.
- Onboarding checklist: structured flow for activating a new brand — config complete → integration tested → sandbox

###### validated → production toggle.

##### 10D. Onboarding a New OEM — Target State

###### With this architecture, onboarding a new brand should take days, not weeks.

- Week 1: Acko ops creates brand config (hierarchy, products, commissions, theme) in Partner Config Engine. No

###### engineering involved.

- Week 1–2: OEM implements Acko Partner API spec in their system (or Acko ops configures an adapter for their

###### existing API). Sandbox testing.

- Week 2: Integration validated in staging. Brand admin trained on self-serve scheme and comms tools.
- Week 3: Production go-live with monitoring via Partner Health Dashboard.

###### Compare to today: 4–6 weeks, requires engineering sprint, multiple rounds of back-and-forth with OEM technical teams,

###### no structured testing protocol.

##### 10E. EV-Specific Integration Considerations

- VIN validation is more complex than IMEI — VIN encodes make, model, year, plant, and serial. Validation must check

###### both VIN format and OEM registry (vehicle is actually registered and within warranty window).

- 4-wheeler VINs have a different structure from 2-wheelers. The adapter layer must handle both formats.
- EV OEMs (Hero, Ather, Bajaj) have their own telematics and warranty management systems. These are not designed
    for insurance integrations. Adapter layer is critical here — retrofitting these systems to Acko's spec directly is not

###### realistic.

- Battery State of Health (SoH) data will become relevant for ECW eligibility as the product matures — a vehicle with a
    degraded battery may not qualify for extended battery warranty. Integration should be designed to accept telematics

###### data as an optional enrichment field.


##### 10F. Open Questions — Integration Architecture

- Who owns the Partner Config Engine long-term — Acko product/ops, or brand admins directly? The answer

###### determines the UI and access controls for the config layer.

- What is Acko's position on OEMs who refuse to implement the standard contract and whose existing APIs are poorly

###### documented? Is there a minimum integration bar below which Acko won't onboard them?

- Should the adapter layer be built as a standalone internal service, or as configuration within an existing API gateway

###### (e.g., Kong, Apigee)? This is a tech architecture decision that should be made early.

- Real-time vs near-real-time IMEI validation: some OEM APIs can't support sub-second validation at scale. What is

###### the acceptable latency for the sell flow? What's the fallback if validation takes >3 seconds?

### 11. Affordability Tools in the Seller Journey

###### Affordability is not a seller problem — it's a customer conversion problem that the seller must be equipped to solve at

###### the counter. A promoter doesn't need to understand EMI math. They need a one-tap way to show a hesitant customer:

###### 'you can pay ₹83/month instead of ₹999 today.' The complexity lives in the back-end; the seller experience must be

###### dead simple.

###### Three distinct affordability mechanisms are relevant here — and they should not be conflated. They solve different

###### objections, for different customer profiles, at different points in the sell flow.

###### Mechanism Customer Objection It Solves Best Fit Product Context Who Bears the Cost

```
EMI (Credit
```
###### Card / BNPL)

```
'I can't pay ₹999 today but I can
```
###### pay ₹100/month'

```
Device protection
(electronics, white goods).
Higher-ticket plans where
```
###### upfront feels steep.

```
Customer bears interest
(standard EMI) or
Acko/OEM subsidises
```
###### (zero-cost EMI).

```
UPI AutoPay
```
###### (Mandate)

```
'I don't want to think about
renewals' or 'I'll pay monthly, not
```
###### upfront'

```
Annual renewable products,
subscription-style plans.
Strongest use case for EV
```
###### ECW renewal.

```
No cost — payment rails
are free. Convenience
feature, not a financing
```
###### product.

```
Money-Back /
Return of
```
###### Premium (RoP)

```
'I'll never claim, so why should I
```
###### pay for insurance?'

```
Device protection and EV
warranty both. Most powerful
for customers buying
extended warranty on a
```
###### reliable brand.

```
Actuarially priced into
premium or
OEM-subsidised. Not a
discount — a product
```
###### structure.

##### 11A. EMI — Breaking the Upfront Barrier

###### The upfront premium is the single biggest conversion blocker at the counter, particularly for lower-income buyers in Tier

###### 2/3 markets who've just spent ₹15,000–₹25,000 on a device. EMI converts a ₹999 annual premium into a ₹83/month

###### payment — psychologically, that's the difference between a sale and a no.

###### How it works in the sell flow

- After plan selection, the sell flow shows a payment options screen — not just 'pay now'. Options: Full payment | EMI

###### (if eligible) | UPI AutoPay (if applicable).

- EMI option shows a clear monthly breakdown: ₹999 plan → ₹83/month for 12 months. If zero-cost EMI is available,

###### call it out explicitly — 'No extra charge'.

- EMI eligibility is determined at the payment step: customer enters their card / BNPL provider. If not eligible, the option

###### gracefully disappears — seller does not need to explain why.

- Promoter's commission is credited on the full premium amount, not the first EMI instalment. Otherwise you create a

###### perverse incentive against offering EMI.

###### EMI flavours to support

- Credit card EMI: 3, 6, 9, 12-month tenures. Customer's card issuer handles the split. Acko receives full premium

###### upfront from the card network.

- BNPL / No-Cost EMI: Integration with BNPL providers (Bajaj Finserv EMI card, HDFC flexipay, etc.). Acko receives
    full amount; provider handles customer repayment. Subsidy (interest cost) borne by Acko or OEM depending on

###### scheme.


- Loan-linked (BFL context): For BFL-embedded products, EMI is bundled into the device loan itself — customer
    repays as part of their existing loan EMI. No separate payment action needed at point of sale. This is the cleanest UX

###### but requires the lender integration.

###### Pain points EMI solves

- 'Too expensive upfront' — the #1 stated objection for screen protection plans at the counter, especially in Tier 2/3

###### markets.

- Promoter hesitancy: promoters currently can't offer EMI, so they drop price mentally and undervalue the product. EMI

###### gives them a tool to hold the price and close on terms instead.

- Attach rate on higher-ticket plans: 2-year and 3-year plans have significantly higher per-policy commissions but lower

###### attach. EMI makes multi-year plans more accessible and increases avg. commission per sale.

##### 11B. UPI AutoPay (Mandate) — Enabling Recurring & Renewal

###### UPI AutoPay is not a financing product — it's a convenience and retention product. It removes the renewal friction that

###### causes policy lapse, and enables monthly-payment structures without the credit risk of BNPL.

###### Use cases in mPOS context

- Annual renewable protection plans: customer sets up a ₹999/year mandate at point of sale. Next year, premium

###### auto-debits — no re-sell needed. Reduces churn dramatically on renewable products.

- Monthly-premium products: if Acko launches a monthly device protection subscription (₹89/month), UPI mandate is

###### the only viable payment method at scale. No card required.

- EV ECW renewal: extended warranty on EVs typically needs renewal at year 2–3. AutoPay setup at original sale

###### removes the need for the dealer to re-engage the customer for renewal. High leverage for the EV channel.

###### Seller flow for mandate setup

- At payment step, 'Set up AutoPay' appears as an option alongside one-time payment.
- Customer scans QR or enters UPI ID → approves mandate on their UPI app (BHIM, GPay, PhonePe). Takes ~30

###### seconds.

- Mandate confirmation displayed to seller. Policy issued. Seller's job is done.
- If mandate fails at renewal time, Acko's system retries (D, D+2, D+5) and sends customer a payment link via
    WhatsApp before allowing lapse. Seller is notified of lapse risk on their sold policies — creates a re-engagement

###### opportunity.

###### What the seller gains

- Renewals happen automatically on their sold policies — which means renewal commission without any active effort.

###### This is a significant motivator if the commission structure rewards renewals.

- Lapse alerts on their book of policies create a natural re-engagement script: 'Your mandate failed — want me to help

###### set it up again?'

##### 11C. Money-Back / Return of Premium (RoP)

###### RoP is a product design mechanism, not a payment method. It directly counters the 'I'll never claim' objection — which

###### is the most common reason customers decline device protection or EV warranty at the point of sale.

###### The pitch changes entirely: from 'pay ₹999 to protect your device' (net negative if no claim) to 'pay ₹999 — if nothing

###### goes wrong, you get ₹600 back at the end of the year' (feels like a savings product with protection benefit).

###### Product structure options

- Full RoP: Customer gets 100% of premium back if no claim is filed in the policy term. Premium is higher to account

###### for this (actuarially priced). Best for high-trust markets where customers are sophisticated.

- Partial RoP: Customer gets 50–60% back if no claim. Lower headline premium, still meaningful incentive. More

###### broadly accessible.

- OEM-subsidised cashback: OEM funds the 'money back' as a marketing scheme — customer effectively pays a lower

###### net premium. Acko collects full premium; OEM pays the refund separately. Simpler actuarially.

- Loyalty cashback: instead of cash, customer receives store credit or OEM voucher. Lower cash outflow for

###### Acko/OEM, perceived value is high for brand-loyal customers.

###### Seller impact


- RoP plans will typically have a higher premium than standard plans — which means higher commission per sale.

###### Promoters have a financial incentive to lead with RoP, not hide it.

- The pitch is fundamentally easier: 'worst case you get your money back' removes the primary objection. Expect

###### meaningfully higher attach rates on products with RoP vs without, everything else equal.

- Seller training required: promoters must understand RoP clearly enough to explain it in 2 sentences. If they can't

###### explain it, they won't offer it. Training module in mPOS should include a 'how to pitch RoP' guide.

###### Operational complexity — flag for product and finance

- RoP creates a future liability: Acko must track claim status per policy through the full term, and trigger refund at expiry

###### for no-claim policies. This is a non-trivial ops and finance workflow.

- Clawback edge case: if a customer claims in month 11 of a 12-month RoP policy, the RoP refund must be

###### suppressed. Claim and RoP status must be in sync in real-time.

- TDS on RoP refund: money paid back to customer may be taxable depending on product structure. Finance and

###### compliance must define the tax treatment before launch.

##### 11D. Seller Experience — How Affordability Shows Up in mPOS

###### The seller should never have to explain affordability options — the sell flow should surface them contextually. Design

###### principles:

- Affordability options appear after plan selection, not before. Show the full price first — then offer ways to make it

###### easier. Leading with EMI before the customer knows what they're buying is confusing.

- One screen, three options max: Full payment | EMI (with monthly amount) | AutoPay (with annual amount). RoP is a

###### plan-level attribute, not a payment option — it's shown on the plan card, not the payment screen.

- Promoter coaching mode: for new promoters, an optional 'how to offer this' tip appears the first 5 times they reach the

###### affordability screen. Disappears once they've used it enough times.

- Commission transparency: when a promoter selects an EMI or RoP plan, they should immediately see their

###### commission on that specific plan. Removes hesitancy about offering higher-complexity options.

- EV-specific: at vehicle delivery, the affordability screen should show the UPI AutoPay option prominently for
    multi-year ECW plans. The EV buyer has just made a large purchase — monthly or auto-debit feels more

###### manageable than another upfront lump sum.

##### 11E. Pain Points Solved

###### Pain Point Detail Business Impact Severity

```
Promoter drops price
instead of offering
```
###### terms

```
Faced with 'too expensive', promoters either
walk away or informally discount. No
```
###### affordability tool exists.

```
EMI and RoP give the
promoter a structured,
priced alternative. They
can close at full price on
better terms rather than
```
###### discounting.

###### HIGH

```
Low attach on
```
###### multi-year plans

```
2-year and 3-year plans have better margins
for Acko and higher commissions for
```
###### promoters, but upfront cost is a barrier.

```
EMI makes multi-year
plans accessible. Promoter
earns more per sale; Acko
```
###### earns better LTV.

###### HIGH

```
Renewal lapse on
```
###### annual plans

```
No mechanism to ensure renewal.
Customer forgets; policy lapses; promoter
```
###### has to re-sell from scratch.

```
UPI mandate at point of
original sale makes
renewal automatic.
Renewal commission flows
```
###### without additional effort.

###### HIGH

```
'I'll never claim'
```
###### objection kills the sale

```
Promoters have no counter. They either
accept the no or try to explain risk — neither
```
###### works well at a retail counter.

```
RoP makes the product
feel like a savings
instrument with insurance
as a bonus. Objection
```
###### neutralised.

###### HIGH


```
Tier 2/3 affordability
```
###### gap

```
In lower-income markets, even ₹599 upfront
is a friction point. Significant device
```
###### protection gap in these segments.

```
EMI (₹50/month) and
monthly AutoPay make
protection accessible to
buyers who would
```
###### otherwise decline entirely.

###### HIGH

##### 11F. Open Questions — Affordability

- Who funds zero-cost EMI? If Acko absorbs the interest subvention, that needs to be baked into pricing or scheme
    budgets. If OEM funds it as a promotional scheme, the scheme config layer must support 'zero-cost EMI subsidy' as

###### a scheme type.

- How does partial-claim RoP work? If a customer claims ₹300 on a ₹999 policy, do they get ₹699 back, or does any

###### claim void the RoP entirely? Product and actuarial must define this before UX is designed.

- Commission on EMI plans: is commission paid upfront on full premium (preferred — promoter has no reason to avoid

###### EMI) or does it trail with EMI instalments (creates risk of non-payment impacting commission)?

- UPI AutoPay renewal commission: if a renewal happens automatically via mandate, does the original promoter earn a

###### renewal commission? If yes, for how many renewal cycles? This is a significant retention incentive design question.

- RoP refund channel: is the refund processed back to the original payment method, or to the customer's mPOS-linked

###### wallet (if we ever go consumer-facing), or via direct bank transfer? Each has different ops complexity.

### 12. RBAC — Role-Based Access Control

###### mPOS currently has no clean RBAC system. Permissions were patched in as new roles (EV dealer, ASP, Super

###### Distributor, Brand Admin) were added over time. The result is a fragile permission layer with security gaps, incorrect

###### data visibility across roles, and zero self-serve capability for brand admins or Acko ops to manage their own user base.

###### RBAC is not a single feature — it's foundational infrastructure that every other capability in this document depends on.

###### You can't build self-serve scheme management, config-driven vertical separation, or plug-and-play OEM onboarding

###### without a clean, extensible permission model underneath.

###### RBAC needs to serve two distinct admin surfaces: Brand Admin (OEM-level) and Acko Internal (super admin, ops,

###### product, finance). Both need overlapping but distinct capabilities.

##### 12A. Current State — What's Broken

###### Pain Point Detail Business Impact Severity

```
Permissions patched,
```
###### not designed

```
Role/permission model was designed for a
two-level hierarchy (dealer + promoter).
Every new role added since has been bolted
```
###### on. No clean RBAC system exists.

```
Security gaps across role
boundaries, incorrect data
visibility, impossible to
audit or extend for new
```
###### verticals

###### HIGH

```
No self-serve user
management for brand
```
###### admins

```
Brand admins cannot add, remove, or
modify users in their own hierarchy without
```
###### raising a request to Acko ops.

```
Acko ops is a bottleneck
for every partner's internal
HR action. Dealers share
logins because adding
```
###### users is too slow.

###### HIGH

```
No self-serve user
management for Acko
```
###### ops

```
Acko internal teams rely on engineering DB
edits to create or modify admin users,
assign product access, or change role
```
###### scopes.

```
Engineering does ops
work. Every config change
```
###### is a sprint ticket.

###### HIGH

###### No offboarding flow When a promoter leaves a store or a dealer

```
exits the network, there's no structured
offboarding. Accounts stay active, wallet
```
###### access remains, audit trail is broken.

```
Financial risk (wallet
access post-exit),
compliance risk, ghost
```
###### accounts in reporting

###### HIGH

```
No profile update
```
###### workflow

```
Changing a user's phone number, bank
account, or KYC details requires offline ops
```
```
High ops burden for routine
changes. Fraud vector if
```
###### HIGH


```
intervention. No in-platform request or
```
###### approval flow.

```
phone numbers can be
swapped without
```
###### verification.

```
No maker-checker on
```
###### sensitive actions

```
High-impact actions (commission slab
changes, new product enablement, KYC
approval, pricing updates) have no approval
workflow. Single-actor execution with no
```
###### audit trail.

```
Compliance risk, financial
exposure, no accountability
```
###### for incorrect configs

###### HIGH

```
Product model
```
###### catalogue unmanaged

```
Onboarding or discontinuing device models
(new phone launch, end-of-life model)
requires engineering involvement. No admin
```
###### interface.

```
New device models missed
at launch, discontinued
models still selectable in
sell flow causing issuance
```
###### failures

###### HIGH

```
KYC management is
```
###### entirely manual

```
KYC review, approval, rejection, and
re-submission is handled via email/ops. No
structured in-platform KYC management
```
###### console.

```
Ops bottleneck, slow
activation, no audit trail for
```
###### KYC decisions

###### HIGH

##### 12B. Capability Scope — Brand Admin RBAC

###### Brand admins (OEM national/state/regional) need full self-serve control over their own partner network. They should

###### never need to call Acko to perform routine people or product operations within their hierarchy.

###### User Hierarchy Management

- Add, edit, deactivate users at any level of their hierarchy (distributor, dealer, ASC manager, promoter, technician).
- Define custom role names per brand (e.g. 'Territory Manager' instead of 'Distributor') while mapping to Acko's

###### underlying permission model.

- Move users between nodes in the hierarchy — e.g. reassign a dealer from one distributor to another, move a

###### promoter to a different store.

- Bulk user upload via CSV for large network onboarding (new OEM partner activation, annual roster update).

###### Onboarding & Offboarding

- Initiate onboarding for new users — triggers KYC flow, bank detail collection, and role-specific training module

###### assignment.

- Structured offboarding: deactivate account, freeze wallet, flag pending commission for settlement, generate exit audit

###### report. Offboarding requires maker-checker approval.

- Offboarded user's sold policy history and commission records remain accessible to their manager for audit. Only

###### active platform access is revoked.

###### Profile & Credential Management

- Update user phone number with verification — OTP to old number (if accessible) + OTP to new number + brand

###### admin approval. Prevents unilateral phone swap fraud.

- Update bank account details — requires re-KYC verification or maker-checker approval before commission payouts

###### resume to new account.

- Reset login access for locked-out users without Acko ops involvement.
- View full profile history: phone changes, bank changes, KYC events, all timestamped with actor.

###### KYC Management

- Review KYC submissions from users in their hierarchy — view uploaded documents, approve or reject with reason.
- Flag KYC for re-submission with specific rejection reason (expired document, photo mismatch, address mismatch).
- KYC approval triggers wallet activation and sell flow access. Rejection freezes account and notifies user with reason.
- KYC audit log: every decision recorded with reviewer identity, timestamp, and document version reviewed.

###### Product Model Catalogue

- Add new device models to the brand's sellable catalogue — model name, IMEI prefix range, device category, eligible

###### plan variants.


- Discontinue models: mark end-of-life, set cutoff date after which model cannot be selected in sell flow. Existing

###### policies on discontinued models remain valid.

- Bulk model upload for new device range launches (e.g. new flagship series with 10 variants).
- View model-level sell data: policies issued per model, attach rate, claim frequency — to inform catalogue decisions.

###### Pricing & Plan Enablement

- Enable or disable specific plan variants (1yr / 2yr / 3yr ALD, EW, Total Protection) for their partner network.
- View pricing tiers per plan variant. Pricing itself is Acko-controlled — brand admin cannot edit base pricing but can

###### control which plans are visible in their sell flow.

- Maker-checker required for enabling a new plan type or disabling an existing active plan. Changes require Acko

###### product team countersign.

###### Maker-Checker Flows (Brand Admin Scope)

- User offboarding — initiated by brand admin, countersigned by peer or senior brand admin.
- Bank account change — initiated by user, approved by brand admin.
- New plan enablement — initiated by brand admin, countersigned by Acko product ops.
- Commission slab adjustment (if brand admin has co-funding scheme authority) — initiated by brand admin,

###### countersigned by Acko finance.

##### 12C. Capability Scope — Acko Internal RBAC

###### Acko super admin and internal teams (ops, product, finance, compliance) need a separate admin surface with broader

###### system-level controls. Acko internal RBAC has visibility across all brands and must support separation of duties — not

###### every internal user should have access to everything.

###### Internal Role Definitions

- Super Admin: full system access across all brands. Can create internal user accounts and assign roles. Should be

###### max 3–5 named individuals.

- Ops Admin: user management, KYC review, commission dispute resolution, partner onboarding. Cannot edit pricing

###### or plan configuration.

- Product Admin: plan configuration, product model catalogue, feature flag management, scheme rule engine. Cannot

###### approve KYC or access financials.

- Finance Admin: commission ledger, TDS management, settlement approval, payout reconciliation. Cannot edit

###### product config or user permissions.

- Read-Only / Analyst: cross-brand reporting and analytics access. No write access anywhere.
- Compliance: KYC audit logs, maker-checker history, fraud flag review. Read-only except for fraud action triggers

###### (account freeze, claim block).

###### Cross-Brand User & Hierarchy Management

- Acko ops can create, modify, or deactivate brand admin accounts across any OEM partner.
- Override brand admin actions in exceptional cases (fraud investigation, escalated dispute) — all overrides logged

###### with reason and actor.

- View full hierarchy of any brand: all nodes, user counts, activation status, last-sale timestamps.
- Bulk user operations across brands: e.g. freeze all accounts associated with a terminated OEM contract.

###### Product & Pricing Configuration

- Create and configure new insurance products, plan variants, cover types, and pricing bands — without engineering

###### involvement.

- Enable new warranty products (e.g. launching 4W EV extended warranty as a new product type) via config, not code.
- Define which plan variants are available to which brand/vertical/geography — granular eligibility matrix.
- Maker-checker required on all pricing changes: initiated by Product Admin, countersigned by Finance Admin.

###### KYC & Compliance Management

- Acko ops can review and action KYC submissions escalated from brand admins or flagged by the fraud detection

###### layer.

- Override brand admin KYC decisions in fraud or compliance scenarios.
- Full KYC audit log across all brands — exportable for regulatory review.
- Trigger re-KYC for a user or cohort (e.g. if document type requirement changes due to regulation).


###### Maker-Checker Flows (Acko Internal Scope)

- Pricing change: Product Admin initiates → Finance Admin countersigns → auto-effective on approval.
- New plan/product enablement: Product Admin initiates → Super Admin countersigns.
- Commission slab change: Finance Admin initiates → Super Admin countersigns.
- Brand admin account creation: Ops Admin initiates → Super Admin countersigns.
- KYC policy rule change (e.g. acceptable document types): Compliance initiates → Super Admin countersigns.
- Account freeze for fraud: Compliance initiates → auto-effective with 24hr Super Admin review window (freeze is

###### immediate, not delayed by review).

###### User Journey Configuration

- Define sell flow steps per vertical (Electronics Retail / ASC / EV 2W / EV 4W) — which fields are shown, which are

###### mandatory, in what order.

- Configure KYC flow requirements per role type — what documents are required for a promoter vs a dealer vs a

###### distributor.

- Feature flag management: enable/disable features per brand or per vertical without deployment. E.g. enable

###### affordability tools (EMI, UPI AutoPay) for specific OEM only.

- Notification template management: edit system notification copy, trigger conditions, and channel (push / SMS /

###### WhatsApp / email) per event type.

##### 12D. Pain Points RBAC Solves

###### Pain Point Detail Business Impact Severity

```
Dealers share logins
because adding users
```
###### is too slow

```
No self-serve user management. Adding a
new promoter requires ops ticket. Dealers
```
###### work around it by sharing credentials.

```
Security breach, broken
audit trail, compliance
failure. RBAC self-serve
eliminates the motivation to
```
###### share logins.

###### HIGH

```
Exited users retain
wallet and platform
```
###### access

```
No structured offboarding. Ex-promoters can
still log in and potentially withdraw pending
```
###### commissions or file fraudulent claims.

```
Financial and fraud risk
eliminated by structured
offboarding with
maker-checker and
```
###### immediate wallet freeze.

###### HIGH

```
Phone number swap is
```
###### a fraud vector

```
Anyone with ops access can change a
user's phone number, redirecting OTP and
```
###### commission payouts. No verification chain.

```
Dual OTP verification +
brand admin approval for
phone changes closes this
```
###### attack surface.

###### HIGH

```
KYC is a manual ops
```
###### black hole

```
KYC review happens over email. No SLA,
no audit trail, no visibility for the user on
```
###### where they are in the process.

```
In-platform KYC console
with structured
approve/reject/re-submit
flow. Activation time drops
```
###### from days to hours.

###### HIGH

```
New device launches
```
###### miss the sell flow

```
No admin interface to add new device
models. Engineering ticket required. Model
```
###### often added days after market launch.

```
Brand admin can add new
models on launch day. No
engineering dependency
```
###### for catalogue updates.

###### HIGH

```
Pricing and plan
changes are high-risk
```
###### single-actor actions

```
No approval workflow on pricing or plan
config. One person can make a change that
```
###### affects all active sellers with no countersign.

```
Maker-checker on all
pricing and plan actions.
Full audit trail. Rollback
```
###### capability.

###### HIGH

```
Acko product team
acts as account
```
###### management

```
Brand partners call Acko PM to add a
dealer, change a commission slab, or
```
###### enable a plan. PM becomes ops.

```
Brand admin self-serve
eliminates this category of
```
###### PM interrupt entirely.

###### HIGH

##### 12E. Open Questions — RBAC


- Delegation depth: should brand admins be able to delegate specific RBAC actions to their state admins? E.g. state

###### admin can onboard dealers but not change pricing. How granular does delegation go?

- Cross-brand role portability: if a promoter moves from an OPPO-affiliated store to a Xiaomi store, does their history

###### and wallet follow them? Or is it a new account? Policy and commission history attribution gets complex.

- Maker-checker SLA: what happens if a countersigner doesn't act within X hours? Auto-escalate? Auto-approve?

###### Auto-reject? Needs defined per action type.

- Audit log retention: how long do RBAC action logs need to be retained for regulatory compliance? IRDAI guidelines

###### may apply given insurance context.

- KYC re-trigger policy: if a user's KYC was approved 2 years ago and document standards change, is there a

###### mechanism to mass re-trigger KYC for affected cohorts?

###### — End of Brainstorm Document v1.9 —


## 13. Agentic Capabilities — Where AI Changes the Game

###### POV: Most pain points in this doc fall into two buckets: things humans are doing manually that shouldn’t require a

###### human, and decisions being made on stale or incomplete data. Both are the right problem for agentic AI. Not because

###### it’s fashionable — because the platform’s value proposition is making field sales faster and removing ops drag. An

###### agent that eliminates 3 manual steps from a seller’s day or auto-resolves a commission dispute before it escalates is

###### worth more than three new UI screens.

###### The distinction that matters: build AI where the agent takes a consequential action or synthesises context a human

###### would otherwise spend time on. Don’t build it where it’s a search box with extra steps. The “don’t build” list below is as

###### important as the “build” list.

#### 13A. High-Impact Agentic Use Cases

###### Area What the agent does Problem it replaces When to build

```
KYC
Auto-Verifica
```
###### tion

```
Reads uploaded documents,
extracts Aadhaar/PAN/bank
fields, cross-references
UIDAI/NSDL/NACH, flags
mismatches, auto-approves
clean submissions, queues
```
###### edge cases for human review.

```
Manual ops review of every
document. Doesn’t scale. 2–4
hour SLA per user. Will break at
```
###### 10x volume.

```
Phase 1 — highest ops
leverage. Unblocks
wallet and onboarding
```
###### scale.

```
Commission
Dispute
```
###### Tracer

```
When a dispute is raised, agent
traces the full transaction chain
(policy → issuance → scheme
→ commission ledger), identifies
root cause, proposes resolution
with confidence score. Human
```
###### approves or overrides.

```
Every dispute is a WhatsApp
thread. No audit trail. Resolution
takes days. PM gets escalated
```
###### frequently.

```
Phase 1 — directly
reduces ops load and
```
###### seller trust breakdown.

```
Fraud Gate
```
###### at FNOL

```
At claim submission, agent
checks: duplicate IMEI across
policies, policy age vs first-claim
proximity, seller claim velocity,
device geography vs claim
location. Returns flag with
```
###### explanation, not just a score.

```
No structured fraud gate at
FNOL today. Anomalies found in
manual review weeks later, or
```
###### not at all.

```
Phase 1 — integrate at
Jarvis FNOL API call.
Works with Resistant AI
signals already in
```
###### scope.

```
Brand
Admin
Insights
```
###### Engine

```
Proactively surfaces anomalies:
“Karnataka attach rate dropped
4% this week — 3 stores
account for 80% of the drop.”
Agent links to actionable
drill-down. Replaces the Excel
export + pivot table workflow
```
###### entirely.

```
Brand admins get raw data
exports. No proactive signal. Q6
in open questions (Section 5) is
really asking whether to build
```
###### this.

```
Phase 2 — needs clean
data infrastructure. High
perceived value for
```
###### OEM relationship.

```
Inactivity
Intervention
```
###### Agent

```
At 7-day seller inactivity, agent
generates a personalised
re-engagement message (last
sale, scheme progress, nearest
payout tier), sends via
WhatsApp/push, tracks
response. Escalates to manager
```
###### if no response in 24h.

```
Today: generic static notification.
No personalisation.
Re-engagement is entirely
manual. Covered in Section 6
comms layer but rule-based, not
```
###### intelligent.

```
Phase 2 — pairs with
Section 6 comms layer.
Needs WhatsApp
Business API setup
```
###### first.

```
Claim Status
```
###### Concierge

```
Customer or promoter
messages the mPOS WhatsApp
number with a claim ID or
phone. Agent looks up status in
Jarvis, returns plain-language
summary with next steps. No
```
```
Claim status is a top ops call
category. Most queries are
“where is my claim?” — a
3-second answer that takes an
```
###### ops agent 5 minutes end-to-end.

```
Phase 2 — reduces ops
load significantly.
```
###### WhatsApp-first surface.


```
human in the loop for status
```
###### queries.

```
Seller
Coaching
```
###### Agent

```
After enough sales, agent
analyses patterns: plan mix
(defaulting to 1Y when 2Y earns
more?), affordability option
usage, time-of-day performance.
Surfaces a weekly “one thing to
```
###### try” insight per seller.

```
No qualitative feedback loop for
frontline sellers today (Section
4D). Product decisions based on
inferred signals, not stated
```
###### problems.

```
Phase 3 — needs
sell-flow instrumentation
+ sufficient per-seller
```
###### history first.

#### 13B. What NOT to Build as Agentic

###### Don’t build this as AI Why not

```
AI plan recommender at sell
```
###### step

```
The sell flow is already a guided wizard. Adding an AI recommendation layer
adds friction. A promoter with a customer standing at the counter needs speed,
```
###### not a suggestion engine.

```
AI chatbot for general app
```
###### navigation

```
A well-designed UX is better than a chatbot explaining a poorly designed UX.
Fix the product first. A chatbot is a symptom of navigation that hasn’t been
```
###### solved properly.

```
AI-designed schemes for
```
###### Brand Admin

```
Too little training data per brand at this scale. Schemes are also political
decisions, not just mathematical ones. AI insights on past scheme
```
###### performance: yes. AI generating the next scheme: no.

```
Automated claim settlement
```
###### decisions

```
IRDAI regulatory requirement: claim decisions require human adjudication.
Agent can pre-populate and recommend; it cannot decide. This is a hard stop,
```
###### not a design choice.

#### 13C. Build Principles

###### ● Explainability over accuracy. A fraud flag with no explanation is useless. “Flagged because: duplicate IMEI used in 2

###### policies in 48h, seller velocity 3× average” is actionable. A score of 0.87 is not.

###### ● Human-in-the-loop for consequential actions. Any agent action involving money, account status, or regulatory data

```
must have a human approval step for edge cases. Auto-approve only after confidence thresholds are validated on
```
###### real data — not assumed.

###### ● Instrument before you automate. A KYC agent operating on incomplete or inconsistent document data generates

###### more noise than it clears. The data pipeline has to be solid before the agent is reliable.

###### ● Measure by ops tickets eliminated, not features shipped. If the KYC agent auto-approves 70% of submissions with a

###### <0.5% error rate, that’s the metric. Not “we launched AI.”

###### ● WhatsApp as the first agentic surface. Field force uses WhatsApp more reliably than the mPOS app, especially in

###### Tier 2/3 markets. Claim concierge and inactivity agent should be WhatsApp-first, app-second.

#### 13D. Phasing

###### Phase What to build Why now / why wait

```
Phase 1
```
###### (This cycle)

```
KYC auto-verification • Commission
```
###### dispute tracer • Fraud gate at FNOL

```
Highest ops leverage. Data already exists (Jarvis,
KYC docs, ledger). Low regulatory risk — humans
still approve. Unblocks wallet launch and partner
```
###### scale.

```
Phase 2
(Next
```
###### quarter)

```
Brand Admin insights engine • Inactivity
intervention agent • Claim status
```
###### concierge

```
Needs clean data infrastructure from Phase 1. High
perceived value for OEM partners. WhatsApp
```
###### Business API setup required first.

```
Phase 3
```
###### (Later)

###### Seller coaching agent Requires sell-flow instrumentation and sufficient

```
per-seller history. Build after core UX is validated
```
###### and data is flowing reliably.

###### Next: Validate open questions → Screen inventory → Vibe-code prompts



---
## Key Definitions for AI Context

| Term | Meaning |
|---|---|
| mPOS | Acko's point-of-sale mobile app for selling device protection and EV warranty through OEM partner dealer networks |
| Jarvis | Acko's internal claims management system (~1,700–2,000 claims/week) |
| ASC-ASP Portal | Service centre portal used by 2,200 authorised service centres to receive claims, submit estimates, and get paid |
| ECW | Extended Component Warranty — covers battery, motor, controller on EVs |
| EBW | Extended Battery Warranty — covers battery pack only on EVs |
| ALD | Accidental Liquid Damage — cover type for electronics |
| EW | Extended Warranty — covers functional failures after manufacturer warranty expires |
| RoP | Return of Premium — product construct where customer gets premium back if no claim filed |
| GWP | Gross Written Premium |
| LR | Loss Ratio |
| FNOL | First Notice of Loss — initial claim intimation |
| BER | Beyond Economic Repair |
| STP | Straight-Through Processing — automated approval without human intervention |
| RBAC | Role-Based Access Control |
| AOP | Annual Operating Plan |
| Attach rate | % of device purchases or vehicle deliveries where a warranty/protection plan was also sold |
| Multi-tenancy | Platform capability to serve multiple OEM brands and product categories on the same mPOS instance |
| Plug-and-play | New OEM partner onboarding via config, not engineering sprint |
| ASC | Authorised Service Centre |
| ASP | Authorised Service Partner (manages multiple ASCs) |
| OEM | Original Equipment Manufacturer (e.g., Xiaomi, Oppo, Hero Vida) |
| NBFC | Non-Banking Financial Company (e.g., Bajaj Finance, Chola) |
| BFL | Bajaj Finance Limited — key NBFC partner and path to ₹550 Cr GWP target |
| VIN | Vehicle Identification Number — used for EV policy issuance |
| IMEI | International Mobile Equipment Identity — used for electronics policy issuance |
| Finacko | Acko's internal financial ledger system |
| CEAMA | Consumer Electronics and Appliances Manufacturers Association |
| FADA | Federation of Automobile Dealers Associations |
