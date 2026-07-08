// ===================================================================
// All site content — sourced from Juan's resume + prior design
// ===================================================================

export const SECTIONS = ['hero', 'about', 'work', 'projects', 'skills', 'personal', 'dispatch', 'contact']
export const NAV_LABELS = {
  hero: 'Home', about: 'About', work: 'Work', projects: 'Projects',
  skills: 'Skills', personal: 'Off the Clock', dispatch: 'Dispatch', contact: 'Contact',
}

export const JOBS = [
  {
    id: 'koch',
    dates: 'May 2026 — Present',
    org: 'Koch Engineered Solutions',
    role: 'Data Engineer',
    stack: ['AWS Lambda', 'Fargate/ECS', 'Step Functions', 'Snowflake Cortex', 'DynamoDB'],
    tabs: [
      {
        scene: 'lambda', label: '01 Ingestion + Backfill',
        caption: 'Parallel Lambdas inside Fargate assembling 13 months of history into Snowflake, on repeat',
        num: 13, pre: '', suf: 'mo', numLabel: 'of history recovered',
        detail: 'Owned the serverless Lambda ingestion pipeline end-to-end — scaled it to 26 new endpoints and 15,000+ records, then built a Fargate/ECS backfill with Step Functions-orchestrated parallel Lambdas, DynamoDB checkpointing, and Secrets Manager token rotation.',
      },
      {
        scene: 'merge', label: '02 Archive Pipeline',
        caption: 'Lambda API + OpenFlow transfers merging into unified tables — latency cut 58% in production',
        num: 58, pre: '−', suf: '%', numLabel: 'latency reduction',
        detail: 'Built a quarterly archive ingestion pipeline that fuses AWS Lambda API ingestion with Snowflake OpenFlow file transfers into unified tables — cutting latency 58% for a production application used across the business.',
      },
      {
        scene: 'docs', label: '03 Doc Extraction',
        caption: 'Documents flowing through regex, then a multi-LLM ensemble vote, into Snowflake validation',
        num: 92, pre: '', suf: '%', numLabel: 'target extraction accuracy',
        detail: 'Designed an automated document-extraction pipeline (Lambda, Step Functions, regex, Snowflake validation), then extended it with a multi-LLM agent ensemble targeting 88–92% accuracy — tracked in Grafana dashboards for stakeholders.',
      },
      {
        scene: 'cortex', label: '04 Cortex Agents',
        caption: 'One main agent routing through governance masking to specialist sub-agents — structure, ML discovery, semantic unify',
        num: 4, pre: '', suf: '', numLabel: 'governed data domains',
        detail: 'Architected a multi-agent data-routing system: a main Cortex agent structures new and legacy data, applies governance masking across PII, EHS, IP, and OT, and hands off to specialists for ML-driven relationship discovery and a unified semantic view of the data estate.',
      },
    ],
  },
  {
    id: 'wichita',
    dates: 'Sep 2025 — May 2026',
    org: 'City of Wichita',
    role: 'AI Data & Automation',
    stack: ['Claude API', 'MCP', 'RAG', 'Power Apps', 'Azure'],
    tabs: [
      {
        scene: 'rpa', label: '01 Enterprise RPA',
        caption: 'Direct system-to-system automation bridging city departments — +99% efficiency, +14% productivity',
        num: 99, pre: '+', suf: '%', numLabel: 'operational efficiency',
        detail: 'Engineered system-to-system automation bridging multiple city departments — a 99% efficiency gain now adopted as the city’s deployment blueprint for cross-departmental automation.',
      },
      {
        scene: 'agents', label: '02 Claude Multi-Agent',
        caption: 'One main agent orchestrating 8 sub-agents — tools, reasoning, and vision firing as they work',
        num: 85, pre: '', suf: '%', numLabel: 'of a procurement role automated',
        detail: 'Automated 85% of a procurement role with an on-prem multi-agent system on the Claude API — custom MCP server, human-in-the-loop controls, event logging, and intelligent RAG routing — owned from problem identification through adoption.',
      },
      {
        scene: 'tracker', label: '03 Cost Tracker',
        caption: 'Office 365 + Azure cost data streaming into forecasts, trends, and anomaly pings',
        num: 14, pre: '+', suf: '%', numLabel: 'staff productivity',
        detail: 'Built a cost-tracking dashboard integrated with Office 365 data — unlocking budget forecasting, productivity trends, and anomaly-detection insights for non-technical stakeholders.',
      },
    ],
  },
  {
    id: 'niar',
    dates: 'Feb 2025 — Oct 2025',
    org: 'NIAR',
    role: 'AI Platform & Cybersecurity',
    stack: ['Docker Swarm', 'Traefik', 'Qdrant', 'Neo4j', 'pfSense'],
    tabs: [
      {
        scene: 'swarm', label: '01 Container Ops',
        caption: 'Docker Swarm + Traefik routing traffic across a containerized AI fleet — NIST 800-53/171 assessed',
        num: 800, pre: 'NIST ', suf: '-53', numLabel: 'controls assessed',
        detail: 'Deployed containerized data/AI systems on Docker Swarm with Traefik ingress, running NIST 800-53/171 compliance assessment across the platform for reliable, scalable operations.',
      },
      {
        scene: 'graph', label: '02 RAG + Graph',
        caption: 'Millions of retrievals firing across Postgres, Qdrant vectors, and the Neo4j graph layer',
        num: 25, pre: '+', suf: '%', numLabel: 'retrieval accuracy',
        detail: 'Integrated Gemma 3 27B with Postgres, Qdrant vector search, and a Neo4j graph layer — lifting retrieval accuracy 25% across millions of queries.',
      },
      {
        scene: 'firewall', label: '03 VPC + pfSense',
        caption: '100% of traffic centralized through firewall inspection — clean packets pass, threats drop',
        num: 100, pre: '', suf: '%', numLabel: 'traffic inspected',
        detail: 'Locked down a secure AWS VPC architecture with pfSense — centralizing 100% of traffic inspection so every packet is seen before it moves.',
      },
    ],
  },
  {
    id: 'equity',
    dates: 'Jun 2024 — Aug 2024',
    org: 'Equity Bank',
    role: 'Data Analyst',
    stack: ['IBM Cognos', 'SQL', 'Dashboards', 'CRM'],
    tabs: [
      {
        scene: 'records', label: '01 CRM Migration',
        caption: '500+ customer records streaming into the legacy CRM — accuracy first',
        num: 500, pre: '', suf: '+', numLabel: 'records migrated',
        detail: 'Migrated 500+ customer records into a legacy CRM with zero loss — accuracy over speed, every row accounted for.',
      },
      {
        scene: 'retire', label: '02 Report Cleanup',
        caption: 'IBM Cognos analysis retiring 36% of reports — query times dropping with every cut',
        num: 36, pre: '', suf: '%', numLabel: 'redundant reports retired',
        detail: 'Analyzed the reporting estate in IBM Cognos and retired 36% of redundant reports — query times dropped and the reports that survived actually got read.',
      },
      {
        scene: 'dash', label: '03 Dashboards',
        caption: 'Interactive IBM dashboards assembling themselves for faster stakeholder decisions',
        num: 100, pre: '', suf: '%', numLabel: 'stakeholder visibility',
        detail: 'Built the interactive IBM Business Analytics dashboards stakeholders actually used — key metrics visible at a glance instead of buried in exports.',
      },
    ],
  },
]

export const PROJECT_BLOCKS = [
  {
    id: 'builds',
    dates: 'Independent builds',
    org: 'Personal stack, production habits',
    role: 'Retail IQ & Insight Forge',
    stack: ['Databricks', 'Delta Lake', 'MLflow', 'Snowflake', 'Streamlit'],
    tabs: [
      {
        scene: 'lakehouse', label: '01 Retail IQ',
        caption: 'Raw data refining bronze → silver → gold, MLflow forecasting ahead of the line',
        num: 3, pre: '', suf: '', numLabel: 'medallion layers, bronze to gold',
        detail: 'A lakehouse pipeline on AWS + Databricks — Lambda and S3 ingestion into PySpark and Delta Lake, MLflow forecasting with batch scoring, and an OpenAI-powered AI Analyst that answers questions about the data in plain English.',
      },
      {
        scene: 'forge', label: '02 Insight Forge',
        caption: 'Batch bursts and a real-time stream converging on Snowflake, Streamlit rendering it live',
        num: 2, pre: '', suf: '', numLabel: 'ingestion modes — batch + real-time',
        detail: 'A hybrid financial pipeline (Lambda, Glue, Athena, DynamoDB + Snowflake) handling batch and real-time market data side by side, surfaced through Snowflake Cortex AI and Streamlit dashboards for end users.',
      },
    ],
  },
  {
    id: 'rl-paper',
    dates: 'Research · Design doc v5',
    org: 'Online RL for LLM agents',
    role: 'Dual-Track RL: Parameter vs Harness',
    stack: ['LoRA + PPO', 'MCTS', 'Merton/KMV', 'Python + Rust', 'Verifiable Rewards'],
    tabs: [
      {
        scene: 'dualtrack', label: '01 Dual-Track',
        caption: 'Local weights learning vs a frozen API model whose harness learns — one shared reward engine',
        num: 2, pre: '', suf: '', numLabel: 'adaptation paradigms, one reward',
        detail: 'The core comparison: a local Gemma 4 26B updating its own weights via LoRA + PPO, against a frozen Gemini 3.5 Flash whose agent harness — prompts, tools, reasoning depth — is optimized as a discrete configuration policy with MCTS exploring reasoning paths at decision time. A controlled head-to-head largely absent from both literatures.',
      },
      {
        scene: 'rewardloop', label: '02 Reward Loop',
        caption: 'Predict → wait for truth → score MAE → update, orbiting weekly across 5 years of history',
        num: 260, pre: '~', suf: '', numLabel: 'weekly rolling loops',
        detail: 'Both tracks live inside the same weekly rolling loop: predict the week-ahead change in a company’s credit spread, wait for truth at T+1, score MAE against the realized value, update the agent. ~260 verifiable loops over a 5-year window, with a strict time-partitioned pipeline that never leaks future data.',
      },
      {
        scene: 'merton', label: '03 Credit Signal',
        caption: 'Equity volatility + SEC debt + FRED rates solved through Merton/KMV into Distance-to-Default',
        num: 100, pre: '', suf: '%', numLabel: 'reproducible from free public data',
        detail: 'The reward target is built, not bought: the Merton/KMV structural model turns free public data — equity prices and volatility, SEC EDGAR debt levels, the FRED risk-free rate — into a weekly Distance-to-Default and implied credit spread for AAPL, JPM, XOM, MSFT and others. Zero data-licensing dependency.',
      },
      {
        scene: 'cutoff', label: '04 Contamination',
        caption: 'The window splits at the model’s training cutoff — flat advantage means memorized, improving means learned',
        num: 78, pre: '~', suf: '', numLabel: 'guaranteed-novel loops',
        detail: 'Because the API model has a fixed training cutoff, the 5-year window is partitioned structurally: ~182 contamination-risk loops before the cutoff, ~78 guaranteed-novel loops after. Accuracy and improvement-slope are reported separately for each — memorization shows up as a flat, front-loaded advantage; real learning shows an improving trend.',
      },
    ],
  },
  {
    id: 'econ-paper',
    dates: 'Research · SSRN',
    org: 'Applied Econometrics, WSU',
    role: 'Diverging Paths: Korea & Japan',
    stack: ['PWT 11.0', 'Pooled Long-Difference', 'OLS · Robust SE', 'Stata/R'],
    tabs: [
      {
        scene: 'econ', label: '01 Diverging Paths',
        caption: 'Korea keeps climbing while Japan’s Lost Decades flatten — 1980 to 2020, drawn live',
        num: 40, pre: '', suf: '', numLabel: 'years of growth data',
        detail: 'Two economies that started the postwar era on the same trajectory and split in the 1990s. The paper pools four decade-long windows per country from Penn World Table 11.0, using log-difference growth in real GDP per capita so the long-run structure shows instead of the year-to-year noise.',
      },
      {
        scene: 'econreg', label: '02 The Regression',
        caption: 'Coefficient signs tell the story — human capital negative and significant, the Japan dummy quiet',
        num: 8, pre: '', suf: '', numLabel: 'decade-long observations',
        detail: 'OLS with robust standard errors on 8 decade-observations: investment positive, human capital negative and significant — education kept rising while Japan’s economy didn’t — and the Japan dummy alone insignificant. Being Japan isn’t the story; how a country responds to changing conditions is.',
      },
      {
        scene: 'demog', label: '03 Demographic Penalty',
        caption: 'Japan’s working-age share shrinking decade by decade while Korea’s holds — the interaction term catches it',
        num: 1, pre: '', suf: '', numLabel: 'interaction term that explains it',
        detail: 'The Japan × population-growth interaction comes back negative: demographic decline drags Japan’s growth harder than Korea’s. The policy chapter is the optimistic part — adapt early with labor-force participation, immigration, and productivity technology, before the pyramid inverts. Korea still has time; Japan is the warning.',
      },
    ],
  },
]

export const SKILLS = [
  { label: 'Programming & Data', items: ['Python', 'SQL', 'PySpark', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'ETL/ELT', 'Medallion Design'] },
  { label: 'Cloud & Platforms', items: ['AWS', 'Databricks', 'Snowflake', 'DBT', 'Docker', 'Terraform', 'GCP', 'GitHub'] },
  { label: 'AI & ML Infra', items: ['Claude Dev Platform', 'Claude Code', 'OpenAI Codex', 'Snowflake Cortex', 'Ollama', 'LM Studio'] },
  { label: 'Analytics & Viz', items: ['Power BI', 'Tableau', 'Streamlit', 'Power Automate', 'Power Apps', 'Excel'] },
]

export const CERTS = ['Claude Certified Architect — In Progress', 'AWS Cloud Practitioner', 'CompTIA Network+', 'CompTIA Security+']

export const INTERESTS = [
  { scene: 'peaks', tag: 'Colorado', title: 'Mountains & lakes', desc: 'The peak-and-alpine-water combo is the whole reason — and the wildlife that lives around it. Even a llama or two.' },
  { scene: 'river', tag: 'Lakes & rivers', title: 'Fishing', desc: 'Nothing fancy — a rod, a river or a lake, and being out and about all day while the fish decide to show up.' },
  { scene: 'cosmos', tag: 'After dark', title: 'Space & stars', desc: 'Away from city light the sky does the talking. Same reason the whole site lives under a starfield.' },
  { scene: 'hoops', tag: 'Hoops', title: 'Kawhi & LeBron', desc: 'Two blueprints for the same thing — quiet relentless execution, and force-of-will longevity.' },
]

export const ALBUMS = [
  { scene: 'ballet', title: 'MBDTF', year: '2010', bg: 'linear-gradient(180deg,#2a1015,#0b0d16)', meaning: 'Maximalist and operatic — the Runaway ballerinas, the whole thing. Ambition that refuses to apologize for itself.' },
  { scene: 'ascend', title: 'Graduation', year: '2007', bg: 'linear-gradient(180deg,#141f3d,#0b0d16)', meaning: 'Stadium-sized optimism, Dropout Bear taking flight. Betting on yourself out loud before the world agrees.' },
  { scene: 'heart', title: '808s & Heartbreak', year: '2008', bg: 'linear-gradient(180deg,#1a1f2e,#0b0d16)', meaning: 'A single cold heart on the cover. Rebuilding after loss and inventing a decade of sound while doing it. Underrated.' },
  { scene: 'pablo', title: 'The Life of Pablo', year: '2016', bg: 'linear-gradient(180deg,#2a1a08,#0b0d16)', meaning: 'That orange wall of words — gospel, family, chaos, faith. A living, unfinished album: ship it, then keep working.' },
  { scene: 'bully', title: 'Bully', year: 'Out now', bg: 'linear-gradient(180deg,#20222a,#0b0d16)', meaning: 'Stripped-back and raw, the boxing-gloves era. Fatherhood, fight, and figuring it out — the most personal one yet.' },
]
