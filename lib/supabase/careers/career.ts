// ============================================================================
// ADVISOR AI — CAREER DATABASE
// ============================================================================
// Each career has an `idealSkillProfile` and `idealInterestProfile` using the
// SAME tags as lib/assessment/questions.ts. The recommendation engine compares
// a student's computed profiles against every career here (cosine similarity)
// to produce a match percentage — no AI guessing involved in the scoring.
//
// SKILL TAGS: analytical, problem_solving, communication, leadership,
// creativity, math_logic, programming, writing, research, design,
// data_interpretation, presentation, teamwork, decision_making,
// attention_to_detail
//
// INTEREST TAGS: technology, business, healthcare, design_arts, finance,
// research_science, management, media, social_impact
//
// Profile values are 0-100 representing how important/present that trait
// typically is for someone thriving in this career.
// ============================================================================

export type CareerEducationPath = {
  degree: string;
  typicalDuration: string;
  entranceExams?: string[]; // India-focused; extend as needed
};

export type Career = {
  id: string;
  name: string;
  shortDescription: string;
  idealSkillProfile: Record<string, number>;
  idealInterestProfile: Record<string, number>;
  salaryRangeINR: { entry: string; mid: string; senior: string };
  educationPaths: CareerEducationPath[];
  jobTitles: string[];
  industries: string[];
  currentDemand: "low" | "moderate" | "high" | "very high";
  futureOutlook: string;
  roadmapShUrl?: string; // fallback link per the product doc
};

export const careers: Career[] = [
  {
    id: "data_analyst",
    name: "Data Analyst",
    shortDescription:
      "Turns raw data into insights that guide business decisions, using statistics, spreadsheets, SQL, and visualization tools.",
    idealSkillProfile: {
      analytical: 90, math_logic: 80, data_interpretation: 95,
      attention_to_detail: 80, research: 70, presentation: 60, programming: 50,
    },
    idealInterestProfile: {
      technology: 60, business: 70, finance: 60, research_science: 50,
    },
    salaryRangeINR: { entry: "₹4-7 LPA", mid: "₹8-15 LPA", senior: "₹18-30 LPA" },
    educationPaths: [
      { degree: "B.Sc/B.Tech (Statistics, CS, Math, Economics)", typicalDuration: "3-4 years", entranceExams: ["CUET", "State CETs"] },
    ],
    jobTitles: ["Data Analyst", "Business Analyst", "Reporting Analyst"],
    industries: ["Technology", "E-commerce", "Finance", "Consulting"],
    currentDemand: "very high",
    futureOutlook:
      "Demand is strong and growing as more companies become data-driven, though basic reporting tasks are increasingly automated — analysts who can also interpret and communicate insights remain highly valued.",
    roadmapShUrl: "https://roadmap.sh/data-analyst",
  },
  {
    id: "software_engineer",
    name: "Software Engineer",
    shortDescription:
      "Designs, builds, and maintains software applications and systems, from websites to mobile apps to backend infrastructure.",
    idealSkillProfile: {
      programming: 95, analytical: 80, problem_solving: 90, math_logic: 70,
      attention_to_detail: 70, teamwork: 60, decision_making: 60,
    },
    idealInterestProfile: { technology: 95, business: 30, research_science: 40 },
    salaryRangeINR: { entry: "₹5-10 LPA", mid: "₹12-25 LPA", senior: "₹30-60+ LPA" },
    educationPaths: [
      { degree: "B.Tech/B.E. Computer Science or related", typicalDuration: "4 years", entranceExams: ["JEE Main/Advanced", "BITSAT", "State CETs"] },
    ],
    jobTitles: ["Software Developer", "Backend Engineer", "Frontend Engineer", "Full-Stack Developer"],
    industries: ["Technology", "Fintech", "E-commerce", "Startups"],
    currentDemand: "very high",
    futureOutlook:
      "Consistently high demand globally; AI tools are changing day-to-day workflows but increasing the need for engineers who can design systems and solve novel problems, not just write boilerplate code.",
    roadmapShUrl: "https://roadmap.sh/full-stack",
  },
  {
    id: "ai_engineer",
    name: "AI / Machine Learning Engineer",
    shortDescription:
      "Builds systems that learn from data — from recommendation engines to computer vision and language models.",
    idealSkillProfile: {
      programming: 90, math_logic: 90, analytical: 90, research: 75,
      problem_solving: 85, data_interpretation: 70,
    },
    idealInterestProfile: { technology: 90, research_science: 80, business: 30 },
    salaryRangeINR: { entry: "₹8-14 LPA", mid: "₹18-35 LPA", senior: "₹40-80+ LPA" },
    educationPaths: [
      { degree: "B.Tech CS/AI/Data Science, often + M.Tech/M.S.", typicalDuration: "4-6 years", entranceExams: ["JEE Main/Advanced", "GATE (for M.Tech)"] },
    ],
    jobTitles: ["ML Engineer", "AI Engineer", "Applied Scientist"],
    industries: ["Technology", "Research Labs", "Healthcare Tech", "Automotive"],
    currentDemand: "very high",
    futureOutlook:
      "One of the fastest-growing fields; strong math/research foundations matter more than ever as the field moves quickly, and specialization (vision, language, robotics) increasingly differentiates candidates.",
    roadmapShUrl: "https://roadmap.sh/ai-engineer",
  },
  {
    id: "product_manager",
    name: "Product Manager",
    shortDescription:
      "Decides what a product should do and why, working across design, engineering, and business to ship things users actually want.",
    idealSkillProfile: {
      communication: 85, leadership: 80, decision_making: 85, analytical: 70,
      presentation: 75, research: 65, teamwork: 75,
    },
    idealInterestProfile: { business: 80, technology: 60, design_arts: 40, management: 70 },
    salaryRangeINR: { entry: "₹8-15 LPA", mid: "₹20-40 LPA", senior: "₹45-90+ LPA" },
    educationPaths: [
      { degree: "Any bachelor's (Engineering/Business common) + often an MBA", typicalDuration: "3-4 years + 2 year MBA", entranceExams: ["CAT", "CUET", "GMAT (for MBA)"] },
    ],
    jobTitles: ["Product Manager", "Associate Product Manager", "Product Owner"],
    industries: ["Technology", "E-commerce", "Fintech", "SaaS"],
    currentDemand: "high",
    futureOutlook:
      "Growing role as more companies become product-led; entry is competitive and often favors people who've first built experience in engineering, design, or business analysis.",
    roadmapShUrl: "https://roadmap.sh/product-manager",
  },
  {
    id: "ux_designer",
    name: "UX/Product Designer",
    shortDescription:
      "Researches how people use products and designs interfaces that are clear, usable, and pleasant.",
    idealSkillProfile: {
      design: 90, creativity: 80, communication: 65, research: 70,
      attention_to_detail: 75, presentation: 60,
    },
    idealInterestProfile: { design_arts: 90, technology: 55, business: 30 },
    salaryRangeINR: { entry: "₹4-8 LPA", mid: "₹10-20 LPA", senior: "₹25-45 LPA" },
    educationPaths: [
      { degree: "B.Des or any bachelor's + UX certification/portfolio", typicalDuration: "3-4 years", entranceExams: ["UCEED", "NID DAT", "CEED"] },
    ],
    jobTitles: ["UX Designer", "Product Designer", "UI Designer"],
    industries: ["Technology", "E-commerce", "Agencies", "Startups"],
    currentDemand: "high",
    futureOutlook:
      "Strong demand as digital products multiply; a portfolio of real work matters more than credentials, and designers who understand research and business impact (not just visuals) stand out.",
    roadmapShUrl: "https://roadmap.sh/ux-design",
  },
  {
    id: "doctor",
    name: "Physician / Doctor (MBBS route)",
    shortDescription:
      "Diagnoses and treats patients; requires years of rigorous medical education and licensing.",
    idealSkillProfile: {
      analytical: 85, decision_making: 85, communication: 75,
      attention_to_detail: 90, research: 60, teamwork: 65,
    },
    idealInterestProfile: { healthcare: 95, research_science: 60, social_impact: 60 },
    salaryRangeINR: { entry: "₹6-10 LPA", mid: "₹15-30 LPA", senior: "₹40-100+ LPA (private practice/specialization varies widely)" },
    educationPaths: [
      { degree: "MBBS (+ optional MD/MS specialization)", typicalDuration: "5.5 years MBBS + 3 years specialization", entranceExams: ["NEET-UG", "NEET-PG (for specialization)"] },
    ],
    jobTitles: ["General Physician", "Resident Doctor", "Specialist (post-PG)"],
    industries: ["Hospitals", "Clinics", "Public Health", "Research"],
    currentDemand: "very high",
    futureOutlook:
      "Consistently high demand and social respect; the path is long and competitive (NEET), and specialization significantly affects earning potential and role.",
  },
  {
    id: "financial_analyst",
    name: "Financial Analyst",
    shortDescription:
      "Evaluates investments, company performance, and market trends to guide financial decisions.",
    idealSkillProfile: {
      analytical: 85, math_logic: 80, data_interpretation: 80,
      decision_making: 65, attention_to_detail: 75, research: 70,
    },
    idealInterestProfile: { finance: 90, business: 70 },
    salaryRangeINR: { entry: "₹5-9 LPA", mid: "₹12-25 LPA", senior: "₹30-60+ LPA" },
    educationPaths: [
      { degree: "B.Com/BBA/Economics, often + CFA or MBA Finance", typicalDuration: "3-4 years + optional certifications", entranceExams: ["CUET", "CAT/CMAT (for MBA)"] },
    ],
    jobTitles: ["Financial Analyst", "Investment Analyst", "Equity Research Analyst"],
    industries: ["Banking", "Investment Firms", "Corporate Finance", "Consulting"],
    currentDemand: "high",
    futureOutlook:
      "Stable long-term demand; routine analysis is increasingly automated, so analysts who can interpret nuance and communicate recommendations clearly remain most valuable.",
    roadmapShUrl: "https://roadmap.sh/",
  },
  {
    id: "entrepreneur_founder",
    name: "Startup Founder / Entrepreneur",
    shortDescription:
      "Builds a business from scratch — identifying a problem, building a solution, and figuring out how to make it sustainable.",
    idealSkillProfile: {
      leadership: 90, decision_making: 85, problem_solving: 85,
      communication: 80, creativity: 70, presentation: 70, teamwork: 60,
    },
    idealInterestProfile: { business: 90, technology: 50, management: 70 },
    salaryRangeINR: { entry: "Highly variable / often ₹0 initially", mid: "Highly variable", senior: "Highly variable (unlimited upside, high risk)" },
    educationPaths: [
      { degree: "No fixed path — any degree, or none; business/engineering backgrounds common", typicalDuration: "Varies" },
    ],
    jobTitles: ["Founder", "Co-Founder", "CEO (own company)"],
    industries: ["Any — depends entirely on the venture"],
    currentDemand: "moderate",
    futureOutlook:
      "Not a 'job market' in the traditional sense — success depends heavily on execution, timing, and resilience to failure; most startups don't succeed, so this path carries real financial risk alongside high potential upside.",
  },
  {
    id: "journalist",
    name: "Journalist / Content Creator",
    shortDescription:
      "Researches, writes, and publishes stories — news, features, or digital content — for an audience.",
    idealSkillProfile: {
      writing: 90, communication: 80, research: 80, creativity: 65,
      presentation: 55, decision_making: 55,
    },
    idealInterestProfile: { media: 90, social_impact: 50, business: 30 },
    salaryRangeINR: { entry: "₹3-6 LPA", mid: "₹7-15 LPA", senior: "₹18-35+ LPA (varies a lot by outlet/reach)" },
    educationPaths: [
      { degree: "BA Journalism/Mass Comm, or any degree + strong writing portfolio", typicalDuration: "3 years", entranceExams: ["CUET", "IIMC Entrance"] },
    ],
    jobTitles: ["Reporter", "Content Writer", "Editor", "Digital Journalist"],
    industries: ["News Media", "Digital Media", "Publishing", "Independent/Creator"],
    currentDemand: "moderate",
    futureOutlook:
      "Traditional media roles are shrinking, but independent and digital content creation is growing fast — success increasingly depends on building a personal audience/brand, not just institutional employment.",
  },
  {
    id: "social_worker_ngo",
    name: "Social Impact / NGO Program Manager",
    shortDescription:
      "Designs and runs programs that address social problems — education access, poverty, health, environment — often through nonprofits.",
    idealSkillProfile: {
      communication: 75, leadership: 65, teamwork: 75, research: 60,
      decision_making: 60, presentation: 55,
    },
    idealInterestProfile: { social_impact: 95, management: 50, healthcare: 30 },
    salaryRangeINR: { entry: "₹3-6 LPA", mid: "₹7-14 LPA", senior: "₹15-30 LPA" },
    educationPaths: [
      { degree: "BA/MA Social Work, Public Policy, or any degree + relevant experience", typicalDuration: "3-5 years", entranceExams: ["TISS-NET", "CUET"] },
    ],
    jobTitles: ["Program Manager", "Social Worker", "Policy Associate", "NGO Coordinator"],
    industries: ["Nonprofits", "Government", "International Development", "CSR (corporate)"],
    currentDemand: "moderate",
    futureOutlook:
      "Steady but modest-paying compared to corporate roles; growing corporate CSR spending and impact-investing are creating some higher-paying hybrid roles at the intersection of business and social good.",
  },
  {
    id: "mechanical_engineer",
    name: "Mechanical Engineer",
    shortDescription:
      "Designs, builds, and tests physical machines and systems — from vehicles to manufacturing equipment.",
    idealSkillProfile: {
      analytical: 80, math_logic: 80, problem_solving: 80,
      attention_to_detail: 75, design: 55, research: 55,
    },
    idealInterestProfile: { technology: 70, research_science: 50, business: 30 },
    salaryRangeINR: { entry: "₹4-8 LPA", mid: "₹9-18 LPA", senior: "₹20-40 LPA" },
    educationPaths: [
      { degree: "B.Tech/B.E. Mechanical Engineering", typicalDuration: "4 years", entranceExams: ["JEE Main/Advanced", "State CETs"] },
    ],
    jobTitles: ["Design Engineer", "Manufacturing Engineer", "R&D Engineer"],
    industries: ["Automotive", "Manufacturing", "Aerospace", "Energy"],
    currentDemand: "moderate",
    futureOutlook:
      "Stable core-industry demand; automation and EV/robotics growth are reshaping the field, rewarding engineers who combine mechanical fundamentals with some software/controls knowledge.",
    roadmapShUrl: "https://roadmap.sh/",
  },
  {
    id: "research_scientist",
    name: "Research Scientist (Academia/R&D)",
    shortDescription:
      "Conducts original research to expand knowledge in a field — physics, biology, chemistry, social science, etc.",
    idealSkillProfile: {
      research: 95, analytical: 85, writing: 65, math_logic: 75,
      attention_to_detail: 80, decision_making: 50,
    },
    idealInterestProfile: { research_science: 95, healthcare: 30, technology: 30 },
    salaryRangeINR: { entry: "₹4-8 LPA (PhD stipend much lower)", mid: "₹10-20 LPA", senior: "₹25-50+ LPA (varies hugely by field/institution)" },
    educationPaths: [
      { degree: "B.Sc + M.Sc + PhD in chosen field", typicalDuration: "3+2+4-5 years", entranceExams: ["JEE/NEET (undergrad)", "CSIR-NET, GATE (postgrad)"] },
    ],
    jobTitles: ["Research Scientist", "Postdoctoral Researcher", "R&D Scientist"],
    industries: ["Academia", "Government Labs", "Pharma/Biotech", "Corporate R&D"],
    currentDemand: "moderate",
    futureOutlook:
      "Long training path with real financial trade-offs early on (stipends are low); demand is strong in emerging fields like biotech and materials science, more limited in oversaturated academic tracks.",
  },
  {
    id: "hr_manager",
    name: "HR / People Operations Manager",
    shortDescription:
      "Manages hiring, employee experience, culture, and organizational policies within a company.",
    idealSkillProfile: {
      communication: 85, teamwork: 80, decision_making: 65,
      leadership: 60, presentation: 55, research: 40,
    },
    idealInterestProfile: { management: 80, business: 60, social_impact: 30 },
    salaryRangeINR: { entry: "₹3-6 LPA", mid: "₹8-16 LPA", senior: "₹18-35 LPA" },
    educationPaths: [
      { degree: "BBA/BA + MBA (HR) common", typicalDuration: "3 years + 2 year MBA", entranceExams: ["CAT", "CUET", "XAT"] },
    ],
    jobTitles: ["HR Executive", "Talent Acquisition Specialist", "HR Business Partner"],
    industries: ["Any industry — every company needs HR"],
    currentDemand: "moderate",
    futureOutlook:
      "Steady demand across all industries; the role is shifting toward data-informed people strategy and employee experience, rewarding HR professionals comfortable with analytics tools too.",
  },
  {
    id: "civil_engineer",
    name: "Civil Engineer",
    shortDescription:
      "Plans and oversees construction of infrastructure — buildings, roads, bridges, water systems.",
    idealSkillProfile: {
      analytical: 75, math_logic: 75, attention_to_detail: 85,
      problem_solving: 70, decision_making: 60, teamwork: 60,
    },
    idealInterestProfile: { technology: 40, business: 30, management: 40 },
    salaryRangeINR: { entry: "₹3-6 LPA", mid: "₹7-15 LPA", senior: "₹18-35 LPA" },
    educationPaths: [
      { degree: "B.Tech/B.E. Civil Engineering", typicalDuration: "4 years", entranceExams: ["JEE Main", "State CETs"] },
    ],
    jobTitles: ["Site Engineer", "Structural Engineer", "Project Engineer"],
    industries: ["Construction", "Infrastructure", "Government/Public Works", "Real Estate"],
    currentDemand: "moderate",
    futureOutlook:
      "Steady demand tied to infrastructure spending and urbanization; sustainable/green construction knowledge is becoming an increasingly valuable specialization.",
    roadmapShUrl: "https://roadmap.sh/",
  },
  {
    id: "graphic_designer",
    name: "Graphic / Visual Designer",
    shortDescription:
      "Creates visual content — branding, marketing materials, digital graphics — for businesses and media.",
    idealSkillProfile: {
      design: 90, creativity: 90, attention_to_detail: 65,
      communication: 50, presentation: 45,
    },
    idealInterestProfile: { design_arts: 95, media: 50, business: 30 },
    salaryRangeINR: { entry: "₹3-5 LPA", mid: "₹6-12 LPA", senior: "₹14-25 LPA" },
    educationPaths: [
      { degree: "B.Des or diploma + strong portfolio", typicalDuration: "3-4 years or shorter diploma", entranceExams: ["UCEED", "NID DAT"] },
    ],
    jobTitles: ["Graphic Designer", "Brand Designer", "Visual Designer"],
    industries: ["Agencies", "Marketing", "Media", "Freelance/Creator"],
    currentDemand: "moderate",
    futureOutlook:
      "AI design tools are automating basic production work, shifting value toward designers with strong creative direction, branding strategy, and taste rather than pure execution speed.",
  },
];