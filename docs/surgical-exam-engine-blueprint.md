# Surgical Exam Engine: Market Research and Build Blueprint

Prepared 11 September 2026 for an orthopaedic surgery resident (FCPS trainee, Pakistan) evaluating whether to build an affordable, multi-specialty, multi-level alternative to Surgeon.AI.

---

## 1. Verdict in one paragraph

Yes, it is buildable by one Python-literate resident with Claude Code, at a Year-1 cash cost of roughly PKR 1.2 to 1.8 million if you do the engineering yourself. But the obvious product, "a cheap AI question bank for FCPS Part 1", is already crowded: three Pakistani players launched AI-flavoured qbanks in the last 18 months at PKR 500 to 1,500 a month. Do not enter there. The white space is one level up: **specialty-level FCPS Part 2, IMM and TOACS preparation with an AI viva examiner**, which nobody in Pakistan offers and which Surgeon.AI has priced and positioned for the UK, US and India. Build that first for orthopaedics (you are the domain expert and the customer), prove it with a pass-rate study, then open the same engine to other specialties through resident "track leads" on revenue share. Only after two medical tracks are profitable should you touch MDCAT, NRE or non-medical exams, and by then the engine will already be domain-agnostic by design.

---

## 2. What Surgeon.AI actually is (audit summary)

- Launched 7 September 2026 by Professor Shafi Ahmed (colorectal surgeon, Barts). Operated by Surgeon AI LLC, a Wyoming entity at a virtual-office address.
- Education only. Its own terms say it is "not a provider of healthcare, diagnosis, treatment, or clinical decision support."
- Stack, from its sub-processor page: Anthropic models for the tutor and question generation, Voyage AI embeddings for retrieval, ElevenLabs voice, Supabase, Stripe. In other words, a well-built LLM wrapper around an original question bank plus a viva simulator. Nothing you cannot replicate.
- Feature set: MCQ bank (7 specialties, 6 modes, confidence calibration), AI oral-board examiner with safe/unsafe classification, 100+ OSCE stations with a 100-point six-domain rubric, competency profile across six domains, spaced routing ("SurgeonGPS"), voice in 29 languages, logbook and WBA pre-fill, portfolio coach, PubMed evidence feed, live lectures, educator dashboards, MCQ authoring studio.
- Exam tracks: MRCS, FRCS (general), ABSITE, ABS oral boards, NEET-SS, MS/DNB. No orthopaedics, no trauma, no FCPS, no Pakistan.
- Evidence: none published. Its safety page calls its scores "educational indicators generated from limited evidence."
- Traction: 11 followers on X, 13 posts, no third-party reviews. Pricing hidden behind registration.
- Founder track record: genuine pioneer in surgical education technology, but Companies House lists eight dissolved UK companies including both Virtual Medics entities.

Sources: [surgeon.ai](https://surgeon.ai/), [AI safety policy](https://surgeon.ai/ai-safety), [terms](https://surgeon.ai/terms), [sub-processors](https://surgeon.ai/subprocessors), [imprint](https://surgeon.ai/imprint), [launch coverage](https://htworld.co.uk/news/ai/new-ai-platform-aims-to-transform-surgical-training-globally-jp26/), [Companies House](https://find-and-update.company-information.service.gov.uk/officers/fZ9ZA4DkqA-d1mfgzUKuplGKc4Y/appointments).

---

## 3. Market research

### 3.1 Demand: the exam funnel in Pakistan

| Exam | Volume | Pass rate | Prep budget signal | Notes |
|---|---|---|---|---|
| MDCAT (undergrad entry) | 140,125 sat in 2025 for ~22,000 seats | 53% qualified | Low (PKR 500 to 1,500) | Huge volume, price-sensitive, seasonal |
| PMDC NRE (licensing, mandatory for foreign grads) | 7,012 sat Dec 2025 | 21% | Medium | New exam, growing, poorly served |
| FCPS Part 1 | CPSP does not publish counts. Held four times a year; coaching sites imply tens of thousands of attempts a year. **Verify before relying on it.** | 25 to 35% per session | PKR 1,000 to 3,000 per subject | Registration fee PKR 25,050 anchors willingness to pay |
| FCPS IMM (all surgical and medical trainees mid-training) | Thousands a year (every trainee sits it) | Not published | PKR 3,000 to 8,000 | No dedicated digital prep exists |
| FCPS Part 2 (specialty, includes TOACS/viva) | Ortho alone: likely only 300 to 600 candidates a year (estimate) | Not published | PKR 3,000 to 8,000 per resource, "serious buyers" | Small per specialty, large across 60+ specialties |
| MRCS / PLAB / SMLE (Pakistani IMGs) | RCSI reports a "massive increase" in Pakistani MRCS candidates; PLAB 2 had ~20,000 sitters globally in 2024 | 40 to 60% | USD pricing tolerated | Your margin market once the engine exists |

Sources: [PMDC MDCAT press release](https://pmdc.pk/Documents/press/Press%20release%20MDCAT%202025.pdf), [Tribune MDCAT 2025](https://tribune.com.pk/story/2574276/mdcat-2025-begins-across-pakistan-today-despite-calls-for-postponement), [PMDC NRE press release](https://pmdc.pk/Documents/press/PMDC%20Conducts%20National%20Registration%20Examination%20NRE-1%202025%20Across%20Major%20Cities.pdf), [NRE Dec 2025 results](https://bloompakistan.com/pmdc-nre-results-2025-26-announced-for-foreign-medical-graduates/), [FCPS pass criteria](https://fcpsworld.com/fcps-passing-criteria/), [FCPS fee](https://revisefcps1.com/blog/how-to-apply-fcps-part-1-online), [RCSI MRCS Part A](https://www.rcsi.com/dublin/professional-cpd/professional-exams/surgery/mrcs-part-a).

### 3.2 Competitors already in the lane

| Product | Country | What it has | Price | Weakness you can exploit |
|---|---|---|---|---|
| ReviseFCPS1 | PK | 10,176 MCQs, 8,236 "real exam recalls", AI tutor, pass-probability score | PKR 500 to 1,000 per 1 to 6 months | Part 1 only. Built on recalls (legal and ethical exposure, no moat). |
| Part1PK | PK | 10,000 "expert-verified" MCQs, "MedMentor AI", analytics, study groups, 3-day trial, Rawalpindi office | Not published | Part 1 and MD/MS only. Marketing leans on CPSP score-report screenshots. |
| HighYield.pk | PK | 18 banks, 75,000 MCQs across MDCAT, NRE, FCPS-1 (6 specialties), FCPS-2 Plastics, SMLE, DHA, CSS, PPSC | PKR 1,499 per bank per month | Explanations only, no AI tutor, no viva. 38 reviews total, so small. Already proves one engine can span medical and non-medical exams. |
| FcpsWorld | PK | 30,000 "leaked" questions, live classes, Part 1 and Part 2 | Course pricing | Sells leaked material openly. Do not compete on recalls; compete on legitimacy. |
| MedExamExpert, StudyFCPS | PK/UK | Part 2 courses, some TOACS (paeds, OBG), mentorship | Course pricing | Human-delivered, not scalable, no ortho. |
| NEETPGAI | India | 33,500 MCQs, free tier, AI tutor, OSCE-style case simulator, SM-2 spaced repetition, Claude Haiku drafting + Gemini verifier + SME review | INR 299/month or 2,499/year (one tenth of PrepLadder) | This is the template. Copy the pipeline, beat it on viva and specialty depth. |
| Surgeon.AI | US/UK/IN | Everything in section 2 | Undisclosed | No FCPS, no ortho, no Pakistan pricing. |
| AMBOSS, UWorld | Global | Gold standard qbanks, AI study tools | USD 200 to 600 a year | Irrelevant to FCPS; sets the quality bar. |

Sources: [ReviseFCPS1](https://www.revisefcps1.com/), [Part1PK](https://part1pk.com/), [HighYield](https://highyield.pk/), [FcpsWorld](https://fcpsworld.com/), [MedExamExpert](https://www.medexamexpert.com/courses/fcps/), [NEETPGAI](https://neetpgai.com/), [NEETPGAI comparison](https://neetpgai.com/neet-pg-study-material/neetpgai-vs-dams-vs-marrow-vs-prepladder-2026).

### 3.3 Does AI tutoring work? Evidence base

- Harvard physics RCT (Kestin et al., 2025): students using a purpose-built AI tutor learned more than twice as much in less time than active-learning classroom peers. Strongest single trial. [ResearchGate](https://www.researchgate.net/publication/392839220_AI_tutoring_outperforms_in-class_active_learning_an_RCT_introducing_a_novel_research-based_design_in_an_authentic_educational_setting)
- Google LearnLM (Nov 2025): learners with the pedagogy-tuned model were 5.5 percentage points more likely to solve novel problems than those with human tutors. [DeepMind report](https://storage.googleapis.com/deepmind-media/LearnLM/learnLM_nov25.pdf)
- 18-week nursing RCT, 360 students (2025 to 2026): AI plus knowledge-graph group scored 84.2 vs 74.1. [BMC Medical Education](https://link.springer.com/article/10.1186/s12909-026-09348-8)
- LLMs as graders of general surgery oral-board cases were more consistent than senior surgeons. [PubMed](https://pubmed.ncbi.nlm.nih.gov/42689231/)
- An AI oral-examination simulator built on MIMIC-IV cases was feasible and acceptable to trainees. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12270061/)
- Caveat: none of this is in an FCPS population. The first FCPS-specific trial is yours to run, and it doubles as your marketing and your first publication.

### 3.4 Payments and infrastructure realities

- Stripe is unavailable to Pakistani entities. Use Safepay or Rapid Gateway (both SBP-regulated, one API for JazzCash, Easypaisa, Raast, cards; roughly 2 to 2.5% per transaction). PayPro if you need invoicing for institutional sales. Keep manual bank transfer plus WhatsApp confirmation as a fallback for the first hundred users. [Gateway comparison](https://rapidgateway.pk/resources/best-payment-gateway-pakistan), [Xpezia](https://www.xpezia.com.pk/blog/best-payment-gateway-pakistan-startups/)
- Local gateways rarely do true recurring billing. Sell fixed terms (1, 3, 6 months) with no auto-renew, which is also what every Pakistani competitor does and what students trust.
- Design for phones on 4G with data caps: progressive web app, text-first viva, voice as an option not a requirement.
- Pakistani edtech has raised little (Maqsad is the leader at USD 4.9 million total). Plan to bootstrap; do not plan around venture capital. [Tracxn](https://tracxn.com/d/explore/edtech-startups-in-pakistan/__yvxD4izCbFU0J1ZjULgLMh0ThweOS0mPpg-GRL73Zws)

### 3.5 Market conclusion

- **Part 1 qbank**: commoditised. Three local AI-flavoured products at PKR 500 to 1,500. Entering here means a price war against people selling recalls.
- **Part 2 / IMM / TOACS with viva simulation**: empty. Candidates pay 3 to 5 times more, are senior, and have no digital option beyond human courses.
- **Structural risk**: each specialty is small. Ortho Part 2 alone cannot sustain a company. The business only works if the engine is specialty-agnostic from day one and specialties are added by residents, not by you.
- **Potential to take off**: real but bounded. Realistic Year-2 ceiling with 8 to 10 specialties plus IMM is a few thousand paying users and PKR 15 to 30 million a year in revenue. That is a strong physician side-business and a credible seed-stage story for MRCS and Gulf licensing expansion. It is not a unicorn, and you should not build as if it were.

---

## 4. Product thesis

**"Viva-first, specialty-deep, PKR-priced."**

One engine, many tracks. A track is a configuration, not code: a curriculum blueprint, an item bank, a viva rubric, a pricing tier and a set of reviewers. Orthopaedics FCPS-II is track one because you can author and validate it faster than anyone alive, and because passing candidates will be your testimonials.

What the product must do better than Surgeon.AI, not merely as well:

1. **Examiner that knows the CPSP style.** TOACS stations and long-case vivas with Pakistani case mix (neglected trauma, TB spine, late-presenting CTEV, gunshot fractures, resource-limited implant choices). Surgeon.AI cannot do this; it is trained toward MRCS and ABSITE norms.
2. **Confidence-calibrated MCQs with item statistics.** Every item accrues difficulty and discrimination from live answers; bad items retire automatically. This is what UWorld does and no Pakistani competitor does.
3. **Original, cited content only.** Cite Apley, Rockwood, Campbell's, Miller's, Bailey and Love; never reproduce. No recalls. This is your legal shield and your marketing line against FcpsWorld.
4. **Price that fits a PKR salary.** Part 2 tier at PKR 2,499 a month or 5,999 for three months. Part 1 tier at PKR 999 a month. Free tier with MCQs and no AI, exactly as NEETPGAI does, because the free tier is your acquisition channel.

---

## 5. Architecture

### 5.1 Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Python 3.12, FastAPI, SQLAlchemy, Pydantic | Your primary language; Claude Code is very productive here |
| Database | Postgres with pgvector (Supabase hosted, Singapore region, or self-hosted on a PKR 5,000/month VPS) | One database for auth, content, embeddings and analytics |
| Frontend | Next.js progressive web app, mobile-first, installable | No app-store review, works on low-end Android, offline MCQ cache |
| LLM | Anthropic API. Opus 5 or Sonnet 5 for the examiner; Haiku 4.5 for explanations, drafting and grading; Batch API for all offline generation at 50% off | See cost table in 5.3 |
| Retrieval | Voyage or Anthropic-compatible embeddings into pgvector over your own content only | Grounds the tutor in cited material |
| Voice | Browser Web Speech API for speech-to-text (free, on-device on Android Chrome); text-to-speech optional via browser | ElevenLabs is the single biggest cost in Surgeon.AI's stack; you do not need it for v1 |
| Payments | Safepay or Rapid Gateway; manual transfer fallback | Section 3.4 |
| Email/WhatsApp | Resend for email; WhatsApp Business API later | Students live on WhatsApp |
| Hosting | Vercel for the PWA, Railway or a VPS for FastAPI | Under PKR 15,000 a month at launch |
| Observability | Log every LLM call with tokens, cost, model, track and item ID | Cost control and item psychometrics come from the same table |

### 5.2 Data model (the part that makes it domain-agnostic)

```sql
-- A track is an exam pathway. Adding "FCPS-II Gen Surg" or "CSS MPT" is a row, not a deploy.
create table track (
  id text primary key,            -- 'fcps2-ortho', 'fcps-imm', 'mdcat'
  name text not null,
  domain text not null,           -- 'medicine', 'law', 'civil-service' ...
  level text not null,            -- 'undergrad', 'licensing', 'postgrad-1', 'postgrad-2'
  blueprint jsonb not null,       -- topic weights mapped to the public curriculum
  pricing jsonb not null,         -- tiers in PKR and USD
  examiner_style jsonb not null   -- persona, rubric, pass rules for the viva engine
);

create table topic (
  id uuid primary key, track_id text references track, parent_id uuid,
  name text not null, weight numeric not null
);

-- Every learnable thing is an item. Type drives rendering and grading, not schema.
create table item (
  id uuid primary key, track_id text references track, topic_id uuid references topic,
  type text not null,             -- 'mcq', 'viva_case', 'osce_station', 'flashcard', 'image_mcq'
  body jsonb not null,            -- stem/options/explanation or case stages/rubric
  sources jsonb not null,         -- [{book, edition, chapter}] cited, never reproduced
  status text not null default 'draft',  -- draft -> verified -> reviewed -> live -> retired
  difficulty numeric, discrimination numeric,  -- updated nightly from attempts
  created_by text, reviewed_by text, reviewed_at timestamptz
);

create table attempt (
  id uuid primary key, user_id uuid, item_id uuid references item,
  response jsonb, correct boolean, confidence smallint,  -- 1..5 for calibration
  seconds int, created_at timestamptz default now()
);

create table competency (
  user_id uuid, track_id text, topic_id uuid, domain text,  -- 'knowledge','reasoning','decision','operative','evidence','professional'
  rating numeric not null default 1500,   -- Elo-style, updated per attempt
  primary key (user_id, track_id, topic_id, domain)
);

create table llm_call (
  id bigserial primary key, user_id uuid, feature text, model text,
  input_tokens int, cached_tokens int, output_tokens int, usd numeric, created_at timestamptz default now()
);
```

Non-medical expansion later means a new `track` with `domain = 'civil-service'`, a new blueprint and new reviewers. The examiner, MCQ engine, spaced repetition and analytics do not change.

### 5.3 Unit economics of the AI features

Assumptions: list prices as of June 2026 (Opus 5 USD 5/25 per million tokens in/out, Sonnet 5 USD 2/10, Haiku 4.5 USD 1/5; cache reads at 10% of input price; Batch API at 50%). USD 1 = PKR 280.

| Feature | Tokens per use | Opus 5 | Sonnet 5 | Haiku 4.5 |
|---|---|---|---|---|
| Viva session (15 turns, 4k cached context, 400 fresh in, 250 out per turn, 800-token report) | ~70k | USD 0.20 | USD 0.08 | USD 0.04 |
| Tutor question with retrieval (2.5k context, 350 out) | ~3k | USD 0.02 | USD 0.009 | USD 0.0045 |
| On-demand MCQ explanation (pre-generated; zero marginal) | 0 | 0 | 0 | 0 |
| Heavy user per month (20 vivas, 150 tutor questions) | | USD 7.0 / PKR 1,960 | USD 2.95 / PKR 830 | USD 1.5 / PKR 420 |
| Average user (one third of heavy) | | PKR 650 | PKR 280 | PKR 140 |

Recommendation: examiner on Sonnet 5, tutor on Haiku 4.5, with an Opus 5 "senior examiner" mode reserved for the paid Part 2 tier if a blind test shows candidates can tell the difference. Measure before deciding; do not assume the cheaper model is good enough for viva reasoning. With Sonnet as examiner, gross margin on the PKR 2,499 tier is about 85% for an average user and 65% for a heavy user, after a 2.5% gateway fee.

Content generation is cheap; review is not. Drafting 2,000 MCQs with Haiku on the Batch API costs about USD 5; cross-verifying with Sonnet about USD 10. Paying co-residents PKR 150 per item to review costs PKR 300,000. Budget for the humans.

### 5.4 Reference code: the viva examiner

Working shape using the Anthropic Python SDK 1.x. Structured output guarantees the grading JSON; prompt caching keeps the rubric cheap across 15 turns; streaming keeps the UI responsive.

```python
import anthropic
from pydantic import BaseModel
from typing import Literal

client = anthropic.Anthropic()          # reads ANTHROPIC_API_KEY
EXAMINER_MODEL = "claude-opus-5"       # switch to "claude-sonnet-5" after the blind test

class TurnGrade(BaseModel):
    examiner_reply: str                 # what the examiner says next
    safety: Literal["safe", "incomplete", "unsafe"]
    domains_touched: list[Literal["knowledge","reasoning","decision","operative","evidence","professional"]]
    score_delta: int                    # -3..+3 applied to the touched domains
    end_of_case: bool

def examiner_turn(case: dict, history: list[dict], candidate_answer: str) -> TurnGrade:
    system = [{
        "type": "text",
        "text": (
            "You are a CPSP FCPS-II Orthopaedics examiner conducting a TOACS station. "
            "Use progressive disclosure. Challenge unsafe plans. Never invent patient data "
            "beyond the case. Judge against the rubric. Speak as an examiner, briefly.\n\n"
            f"CASE:\n{case['stages']}\n\nRUBRIC:\n{case['rubric']}"
        ),
        "cache_control": {"type": "ephemeral"},   # cached across all turns of this case
    }]
    messages = history + [{"role": "user", "content": candidate_answer}]
    response = client.messages.parse(
        model=EXAMINER_MODEL,
        max_tokens=2000,
        system=system,
        messages=messages,
        output_format=TurnGrade,
    )
    if response.stop_reason == "refusal":
        raise RuntimeError("examiner declined; route to human review")
    return response.parsed_output
```

Add the server-side refusal fallback (`fallbacks="default"` with the `server-side-fallback-2026-07-01` beta on `client.beta.messages`) once you are on the beta client; clinical trauma content occasionally trips classifiers and you do not want a dead session in the middle of a viva.

### 5.5 Reference code: MCQ generation pipeline (offline, batch)

Three stages, mirroring NEETPGAI's published pipeline but with your rubric:

1. **Draft** with Haiku 4.5 via the Message Batches API, one request per topic-by-difficulty cell in the blueprint. Output schema: stem, five options, key, explanation, two cited sources, Bloom level.
2. **Verify** with Sonnet 5 in a separate batch: re-solve blind, flag any disagreement on the key, flag any option that is defensible, flag any factual claim without a source.
3. **Human review** queue in your admin UI: reviewer scores on a seven-point rubric (clinical accuracy, single best answer, distractor plausibility, Pakistani context, source fidelity, difficulty label, wording). Approve, edit, or reject. Reviewer name is stored on the item.

Items go live at `reviewed`; after 100 attempts the nightly job computes difficulty (p-value) and discrimination (point-biserial); items with discrimination under 0.15 are retired for rewrite.

---

## 6. Feature parity map against Surgeon.AI

| Surgeon.AI feature | Your v1 | Your v2 | Skip |
|---|---|---|---|
| MCQ bank, 6 modes, confidence calibration | Yes (practice, timed, mock, tutor, remediation; confidence 1 to 5) | | |
| AI viva examiner, safe/unsafe, board report | Yes, text-first | Voice via browser STT | |
| OSCE stations with AI patient and examiner | TOACS stations (same mechanism, CPSP format) | | |
| Six-domain competency profile | Yes, Elo per topic and domain | IRT once you have 10k attempts | |
| Guided next-step routing | Yes, rule-based (weakest weighted topic first) | Learned | |
| Spaced repetition | SM-2 on wrong answers (NEETPGAI does this free) | | |
| Voice in 29 languages | | Urdu/English STT via browser | |
| Logbook and WBA pre-fill | | Mirror CPSP e-logbook fields, export CSV | |
| Portfolio and application coach | | | Skip; no equivalent in the CPSP pathway |
| Cited encyclopaedia | Topic notes generated from your sources, reviewed | | |
| PubMed evidence feed | Free NCBI E-utilities, 30-minute refresh | | |
| Live lectures | Zoom or Google Meet links, calendar in-app | | |
| Educator dashboards, cohort analytics | | Department licence (PKR 50,000 a year per training unit) | |
| MCQ authoring studio | Admin review queue (section 5.5) | | |

---

## 7. Roadmap

### Phase 0: Validate before building (weeks 1 to 4, ~15 hours)

1. One-page landing site: "AI TOACS examiner for FCPS-II Orthopaedics. Original cases, CPSP format, PKR 1,999 for three months at launch." Collect WhatsApp numbers.
2. Post in FCPS ortho and surgery groups, your department, and your batchmates' departments. Target: 150 sign-ups.
3. Run ten live "AI viva" demos over Zoom using a 60-line Python script and the examiner prompt above. Record reactions. This is your usability study.
4. Take 25 paid pre-orders at PKR 999 via bank transfer. Refund if you do not ship by week 12.
5. **Kill criterion**: fewer than 100 sign-ups or fewer than 15 pre-orders means the wedge is too small or the message is wrong. Pivot to IMM as track one before writing more code.

### Phase 1: MVP, FCPS-II Orthopaedics (weeks 5 to 12, ~80 hours)

- Content: 1,200 reviewed MCQs across the CPSP ortho blueprint, 60 viva cases, 20 TOACS stations. You and two co-residents review; pay them PKR 150 per MCQ and PKR 1,500 per case.
- Features: MCQ modes, text viva examiner with report, competency profile, basic analytics, manual payment activation.
- Launch price: PKR 1,999 for three months (launch), rising to 5,999.
- Metric that matters: weekly active rate of paid users above 60%, and a post-session "would you recommend" above 8 of 10.

### Phase 2: Engine hardening and second track (months 4 to 6)

- Voice via browser STT; SM-2 repetition; nightly item psychometrics; gateway integration (Safepay or Rapid); PWA offline cache; department licence pilot at your own hospital.
- Track two: **FCPS IMM (surgical stream)**. Every surgical trainee in the country sits it and there is no digital prep. Reuses the entire engine.
- Track three: **FCPS-I Surgery and Allied** at PKR 999 with the Haiku tutor. You enter the crowded market with a differentiator (calibrated items, viva-style reasoning questions) rather than price.

### Phase 3: Specialty scaling by track leads (months 7 to 12)

- Recruit one senior resident per specialty (general surgery, medicine, OBG, paeds, anaesthesia, radiology, ENT, ophthalmology) as track lead. They author and review with the pipeline; they earn 25% of their track's net revenue for as long as they maintain it. This is the only way one person scales content across 60 specialties.
- Publish the first outcomes paper: platform users vs matched non-users, FCPS-II pass rates, with your department as co-authors. JPMA or JCPSP.
- Register the company (SECP SMC-Pvt, FBR NTN). Terms, privacy, no-PHI policy, "not affiliated with CPSP" disclaimer on every page.

### Phase 4: Volume and export (year 2)

- NRE track (7,000 sitters a year, 21% pass rate, badly served) at PKR 1,499.
- MDCAT track at PKR 499, only if you have a marketing partner; 140,000 candidates is a different business (seasonal, ads-driven, price-driven).
- MRCS Part A and B, PLAB, SMLE tracks priced in USD (USD 15 to 25 a month) for Pakistani, Bangladeshi and Egyptian IMGs. This is where margin lives.
- Non-medical tracks (CSS, PPSC, law) via the same engine, only through a partner who owns that content and audience. HighYield has shown it works; you should not be the one writing CSS content.

---

## 8. Budget and financial scenarios

### Year-1 cash needs (you do the engineering)

| Item | PKR |
|---|---|
| Content review (2,000 MCQs, 150 cases, 40 stations) | 500,000 |
| LLM API (generation plus ~200 average paid users for 9 months) | 350,000 |
| Hosting, domain, email, tools | 180,000 |
| Company registration, legal templates | 100,000 |
| Marketing (creatives, one micro-influencer resident per specialty) | 150,000 |
| Contingency | 200,000 |
| **Total** | **~1,480,000 (about USD 5,300)** |

Add PKR 1.0 to 1.5 million if you hire a contract Next.js developer instead of building the frontend yourself with Claude Code.

### Revenue scenarios (Year 1, tracks: Ortho Part 2, IMM, Surgery Part 1)

| Scenario | Avg paying users/month by month 12 | Blended price | Month-12 revenue | Year-1 revenue |
|---|---|---|---|---|
| Conservative | 120 | PKR 1,800 | 216,000 | ~1.4 million |
| Base | 300 | PKR 1,900 | 570,000 | ~3.5 million |
| Optimistic | 800 | PKR 2,000 | 1,600,000 | ~9 million |

Break-even on monthly running costs (about PKR 120,000 including LLM, hosting and a part-time reviewer) is roughly 80 paying users at PKR 1,999 with 75% gross margin. The base case pays back Year-1 cash inside 14 months.

---

## 9. Risks, honestly

- **Piracy and recall culture.** Students share PDFs and buy leaks. Your defence is that the product is a service (examiner, analytics, repetition), not a file. Watermark nothing; make the free tier generous instead.
- **Accuracy liability.** One wrong management answer screenshot in a Facebook group can end a medical education brand. Every item carries a reviewer name and a source. Add a "report this item" button on everything and fix within 24 hours.
- **CPSP.** They may see you as a threat or a partner. Keep the disclaimer prominent, never use recalls, and offer them the psychometric data. Do not use "FCPS" in your product name.
- **Churn is structural.** Exam prep has a three-month customer lifetime. Sell fixed terms, price them so a single term is profitable, and use the IMM to Part 2 pathway to re-acquire the same trainee three times over five years.
- **Your time.** You have perhaps 8 to 10 hours a week. Phases 0 and 1 are feasible; Phase 3 is not without track leads. If you cannot recruit three residents by month 6, cap the product at ortho plus IMM and run it as a side income.
- **Model cost drift.** Prices fall over time but usage rises. The `llm_call` table gives you cost per user per feature from day one; set a per-user monthly token budget and degrade the tutor to Haiku when a user hits it.
- **Small specialty markets.** Repeated for emphasis: ortho Part 2 alone is a few hundred candidates a year. It is the proof, not the business.

---

## 10. KPIs and kill criteria

| Stage | Metric | Continue if | Kill or pivot if |
|---|---|---|---|
| Phase 0 | Sign-ups, pre-orders | 100 and 15 | Below either |
| Phase 1 | Paid weekly active rate | 60%+ | Below 35% after 8 weeks |
| Phase 1 | Viva sessions per paid user per week | 2+ | Below 0.5 (examiner is not valued) |
| Phase 2 | Gross margin per user | 70%+ | Below 50% (fix model mix before scaling) |
| Phase 3 | Track leads recruited | 3 by month 9 | 0 by month 9 (stay a two-track side business) |
| Phase 3 | Pass-rate delta in outcomes study | Any positive signal with n above 100 | Negative signal (rethink content) |

---

## 11. This week

1. Write the ortho blueprint: list every CPSP FCPS-II ortho topic with a weight. Two hours. This file becomes `track.blueprint` and drives everything.
2. Write five TOACS cases you have actually been examined on, in stage form (presentation, history reveal, examination reveal, imaging reveal, management, complication). Two hours.
3. Run the examiner script from section 5.4 on those five cases with two batchmates as candidates. Note every place the examiner is wrong or un-CPSP-like. Two hours.
4. Put up the landing page and post it. One hour.
5. Open a business bank account conversation and a Safepay or Rapid Gateway application in parallel; approvals take weeks.

Everything else waits for the Phase 0 numbers.
