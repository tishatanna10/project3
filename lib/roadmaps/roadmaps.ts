// ============================================================================
// ADVISOR AI — CAREER ROADMAPS
// ============================================================================
// Each roadmap is a set of NODES connected by `connectsFrom` (prerequisite
// node ids), designed to be rendered as a flowchart: main trunk path plus
// branches for optional/parallel topics — similar in spirit to roadmap.sh.
//
// Rendering guide for the frontend:
// - Nodes with no connectsFrom are roots (top of the chart).
// - A node can have multiple connectsFrom (converging paths) or multiple
//   children (branching paths) — infer children by scanning for nodes whose
//   connectsFrom includes this node's id.
// - `optional: true` nodes should be styled distinctly (e.g., dashed border)
//   since they're valuable but not required to progress.
// - `level` can color-code node stage: beginner / intermediate / advanced.
// ============================================================================

export type RoadmapNode = {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  optional?: boolean;
  connectsFrom: string[]; // ids of prerequisite nodes; [] = root/starting node
};

export type CareerRoadmap = {
  careerId: string; // must match an id in lib/careers/careers.ts
  nodes: RoadmapNode[];
};

export const roadmaps: CareerRoadmap[] = [
  // ==========================================================================
  {
    careerId: "software_engineer",
    nodes: [
      { id: "sw_1", title: "Programming Fundamentals", description: "Variables, loops, functions, control flow — pick one language to start (Python or JavaScript).", level: "beginner", connectsFrom: [] },
      { id: "sw_2", title: "Data Structures & Algorithms", description: "Arrays, lists, stacks, queues, trees, sorting, and searching — the core toolkit for solving problems efficiently.", level: "beginner", connectsFrom: ["sw_1"] },
      { id: "sw_3", title: "Git & Version Control", description: "Track changes, branch, and collaborate on code using Git and GitHub.", level: "beginner", connectsFrom: ["sw_1"] },
      { id: "sw_4", title: "Web Fundamentals (HTML/CSS)", description: "How web pages are structured and styled — the foundation for frontend work.", level: "beginner", optional: true, connectsFrom: ["sw_1"] },
      { id: "sw_5", title: "A Core Language, Deeply", description: "Go deep in one language (JavaScript/TypeScript, Python, or Java) — idioms, standard library, common patterns.", level: "intermediate", connectsFrom: ["sw_2", "sw_3"] },
      { id: "sw_6", title: "Databases & SQL", description: "How data is stored and queried — relational databases, basic schema design, SQL queries.", level: "intermediate", connectsFrom: ["sw_5"] },
      { id: "sw_7", title: "Backend / APIs", description: "Build servers and APIs that handle requests and talk to a database.", level: "intermediate", connectsFrom: ["sw_6"] },
      { id: "sw_8", title: "Frontend Frameworks", description: "Build interactive user interfaces (e.g., React) that talk to your backend.", level: "intermediate", connectsFrom: ["sw_4", "sw_5"] },
      { id: "sw_9", title: "System Design Basics", description: "How to structure larger applications — scalability, caching, basic architecture trade-offs.", level: "advanced", connectsFrom: ["sw_7"] },
      { id: "sw_10", title: "Testing & Deployment", description: "Writing tests, CI/CD, and deploying applications to the cloud.", level: "advanced", connectsFrom: ["sw_7", "sw_8"] },
      { id: "sw_11", title: "Build Real Projects", description: "2-3 substantial personal projects that solve a real problem end-to-end.", level: "advanced", connectsFrom: ["sw_9", "sw_10"] },
      { id: "sw_12", title: "Internship / Open Source", description: "Real-world experience — an internship or consistent open-source contributions.", level: "advanced", connectsFrom: ["sw_11"] },
      { id: "sw_13", title: "Interview Preparation", description: "Practice data structure/algorithm interview questions and mock interviews.", level: "advanced", connectsFrom: ["sw_12"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "data_analyst",
    nodes: [
      { id: "da_1", title: "Excel / Spreadsheets", description: "Formulas, pivot tables, and data cleaning — the everyday toolkit.", level: "beginner", connectsFrom: [] },
      { id: "da_2", title: "SQL Fundamentals", description: "Query, filter, join, and aggregate data stored in databases.", level: "beginner", connectsFrom: ["da_1"] },
      { id: "da_3", title: "Statistics Basics", description: "Mean, median, distributions, correlation vs causation — the reasoning behind the numbers.", level: "beginner", connectsFrom: ["da_1"] },
      { id: "da_4", title: "Python or R for Analysis", description: "Use pandas (Python) or R for analysis beyond what spreadsheets can handle.", level: "intermediate", connectsFrom: ["da_2", "da_3"] },
      { id: "da_5", title: "Data Visualization", description: "Build clear charts and dashboards using tools like Power BI, Tableau, or matplotlib.", level: "intermediate", connectsFrom: ["da_4"] },
      { id: "da_6", title: "Data Cleaning at Scale", description: "Handling messy, missing, or inconsistent real-world data.", level: "intermediate", connectsFrom: ["da_4"] },
      { id: "da_7", title: "Business Context & Metrics", description: "Understanding what metrics actually matter for a business, not just how to compute them.", level: "intermediate", optional: true, connectsFrom: ["da_5"] },
      { id: "da_8", title: "Advanced Analytics", description: "A/B testing, forecasting, and intro to predictive modeling.", level: "advanced", connectsFrom: ["da_5", "da_6"] },
      { id: "da_9", title: "Portfolio Projects", description: "2-3 real analysis projects using public datasets, presented clearly with insights.", level: "advanced", connectsFrom: ["da_8"] },
      { id: "da_10", title: "Internship / Job Preparation", description: "Apply skills in a real or simulated business setting; prepare for case-study interviews.", level: "advanced", connectsFrom: ["da_9"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "ai_engineer",
    nodes: [
      { id: "ai_1", title: "Programming Fundamentals", description: "Strong Python fundamentals — this is the language of the field.", level: "beginner", connectsFrom: [] },
      { id: "ai_2", title: "Git & GitHub", description: "Version control basics for collaborative and reproducible work.", level: "beginner", connectsFrom: ["ai_1"] },
      { id: "ai_3", title: "Data Structures & Algorithms", description: "Core computer science fundamentals for efficient code.", level: "beginner", connectsFrom: ["ai_1"] },
      { id: "ai_4", title: "Mathematics & Statistics", description: "Linear algebra, probability, and statistics — the math underneath every model.", level: "intermediate", connectsFrom: ["ai_1"] },
      { id: "ai_5", title: "SQL & Data Handling", description: "Query and manipulate datasets using SQL and pandas.", level: "intermediate", connectsFrom: ["ai_2", "ai_3"] },
      { id: "ai_6", title: "NumPy / Pandas", description: "Numerical computing and dataframes — the daily tools of the trade.", level: "intermediate", connectsFrom: ["ai_5"] },
      { id: "ai_7", title: "Machine Learning Fundamentals", description: "Core algorithms — regression, classification, clustering, model evaluation.", level: "intermediate", connectsFrom: ["ai_4", "ai_6"] },
      { id: "ai_8", title: "Deep Learning", description: "Neural networks, using frameworks like PyTorch or TensorFlow.", level: "advanced", connectsFrom: ["ai_7"] },
      { id: "ai_9", title: "Specialization", description: "Pick a focus — computer vision, NLP/language models, or reinforcement learning.", level: "advanced", connectsFrom: ["ai_8"] },
      { id: "ai_10", title: "MLOps Basics", description: "Deploying, monitoring, and maintaining ML models in production.", level: "advanced", optional: true, connectsFrom: ["ai_8"] },
      { id: "ai_11", title: "Projects", description: "2-3 real projects showing the full pipeline — data to trained, evaluated model.", level: "advanced", connectsFrom: ["ai_9"] },
      { id: "ai_12", title: "Internships / Research", description: "Apply skills via internships, research assistantships, or Kaggle competitions.", level: "advanced", connectsFrom: ["ai_11"] },
      { id: "ai_13", title: "Interview Preparation", description: "ML system design, coding rounds, and applied ML case studies.", level: "advanced", connectsFrom: ["ai_12"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "product_manager",
    nodes: [
      { id: "pm_1", title: "Understand Businesses & Users", description: "How companies make money, and how to think from a user's perspective.", level: "beginner", connectsFrom: [] },
      { id: "pm_2", title: "Basic Data Literacy", description: "Reading metrics, dashboards, and basic statistics to make informed calls.", level: "beginner", connectsFrom: ["pm_1"] },
      { id: "pm_3", title: "Communication & Writing", description: "Clear written and verbal communication — PM work is 80% communication.", level: "beginner", connectsFrom: ["pm_1"] },
      { id: "pm_4", title: "User Research Basics", description: "Interviewing users, surveys, and turning feedback into insight.", level: "intermediate", connectsFrom: ["pm_2"] },
      { id: "pm_5", title: "Prioritization Frameworks", description: "How to decide what to build next with limited time and resources.", level: "intermediate", connectsFrom: ["pm_2", "pm_3"] },
      { id: "pm_6", title: "Working with Engineering & Design", description: "Understanding enough of both crafts to collaborate effectively without needing to do the work yourself.", level: "intermediate", connectsFrom: ["pm_4"] },
      { id: "pm_7", title: "Product Metrics & Experimentation", description: "Defining success metrics and running basic A/B tests.", level: "advanced", connectsFrom: ["pm_5", "pm_6"] },
      { id: "pm_8", title: "Case Studies / Side Projects", description: "Practice product case studies; ideally ship a small product end-to-end yourself.", level: "advanced", connectsFrom: ["pm_7"] },
      { id: "pm_9", title: "Internship / APM Programs", description: "Entry-level PM roles or Associate Product Manager programs at companies.", level: "advanced", connectsFrom: ["pm_8"] },
      { id: "pm_10", title: "Interview Preparation", description: "Product sense, strategy, and behavioral interview practice.", level: "advanced", connectsFrom: ["pm_9"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "ux_designer",
    nodes: [
      { id: "ux_1", title: "Design Fundamentals", description: "Layout, typography, color theory, and visual hierarchy.", level: "beginner", connectsFrom: [] },
      { id: "ux_2", title: "Design Tools", description: "Learn Figma (industry standard) — wireframing and prototyping.", level: "beginner", connectsFrom: ["ux_1"] },
      { id: "ux_3", title: "User Research Basics", description: "Interviews, surveys, and understanding real user needs before designing.", level: "beginner", connectsFrom: ["ux_1"] },
      { id: "ux_4", title: "Information Architecture", description: "Organizing content and flows so products make logical sense to use.", level: "intermediate", connectsFrom: ["ux_2"] },
      { id: "ux_5", title: "Wireframing & Prototyping", description: "Turning ideas into testable low- and high-fidelity prototypes.", level: "intermediate", connectsFrom: ["ux_2", "ux_4"] },
      { id: "ux_6", title: "Usability Testing", description: "Testing designs with real users and iterating based on feedback.", level: "intermediate", connectsFrom: ["ux_3", "ux_5"] },
      { id: "ux_7", title: "Design Systems", description: "Building/using consistent, reusable component systems.", level: "advanced", optional: true, connectsFrom: ["ux_5"] },
      { id: "ux_8", title: "Portfolio Projects", description: "3-4 polished case studies showing your process, not just final screens.", level: "advanced", connectsFrom: ["ux_6"] },
      { id: "ux_9", title: "Internship / Freelance Work", description: "Real client or company projects to build credibility.", level: "advanced", connectsFrom: ["ux_8"] },
      { id: "ux_10", title: "Interview Preparation", description: "Portfolio walkthroughs and design challenge practice.", level: "advanced", connectsFrom: ["ux_9"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "doctor",
    nodes: [
      { id: "dr_1", title: "Strong Science Foundation (11th-12th)", description: "Physics, Chemistry, Biology — the prerequisite subjects for medical entrance.", level: "beginner", connectsFrom: [] },
      { id: "dr_2", title: "NEET-UG Preparation", description: "Focused, sustained preparation for India's medical entrance exam.", level: "beginner", connectsFrom: ["dr_1"] },
      { id: "dr_3", title: "MBBS — Pre-Clinical Years", description: "Anatomy, physiology, biochemistry — foundational medical science.", level: "intermediate", connectsFrom: ["dr_2"] },
      { id: "dr_4", title: "MBBS — Para-Clinical Years", description: "Pathology, pharmacology, microbiology — bridging science to disease.", level: "intermediate", connectsFrom: ["dr_3"] },
      { id: "dr_5", title: "MBBS — Clinical Rotations", description: "Hands-on rotations across departments — medicine, surgery, pediatrics, etc.", level: "advanced", connectsFrom: ["dr_4"] },
      { id: "dr_6", title: "Internship (1 year)", description: "Mandatory supervised clinical practice after MBBS coursework.", level: "advanced", connectsFrom: ["dr_5"] },
      { id: "dr_7", title: "NEET-PG (optional)", description: "Entrance exam for specialization (MD/MS) if you want to pursue a specific field.", level: "advanced", optional: true, connectsFrom: ["dr_6"] },
      { id: "dr_8", title: "Specialization (MD/MS)", description: "3-year focused training in a chosen specialty.", level: "advanced", optional: true, connectsFrom: ["dr_7"] },
      { id: "dr_9", title: "Practice / Residency", description: "Begin practicing as a general physician or continue into specialty residency.", level: "advanced", connectsFrom: ["dr_6", "dr_8"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "financial_analyst",
    nodes: [
      { id: "fa_1", title: "Accounting & Finance Basics", description: "Financial statements, basic accounting principles, time value of money.", level: "beginner", connectsFrom: [] },
      { id: "fa_2", title: "Excel for Finance", description: "Advanced spreadsheet modeling — the daily tool of the trade.", level: "beginner", connectsFrom: ["fa_1"] },
      { id: "fa_3", title: "Statistics & Data Analysis", description: "Understanding trends, variance, and basic quantitative reasoning.", level: "beginner", connectsFrom: ["fa_1"] },
      { id: "fa_4", title: "Financial Modeling", description: "Building models to forecast company performance and valuation.", level: "intermediate", connectsFrom: ["fa_2", "fa_3"] },
      { id: "fa_5", title: "Markets & Valuation", description: "How equity/debt markets work, and how companies are valued.", level: "intermediate", connectsFrom: ["fa_4"] },
      { id: "fa_6", title: "CFA Level 1 (optional)", description: "Globally recognized finance certification — strengthens credibility.", level: "advanced", optional: true, connectsFrom: ["fa_5"] },
      { id: "fa_7", title: "Industry Research Projects", description: "Practice equity research reports or company analysis on real companies.", level: "advanced", connectsFrom: ["fa_5"] },
      { id: "fa_8", title: "Internship", description: "Real exposure at a bank, fund, or corporate finance team.", level: "advanced", connectsFrom: ["fa_7"] },
      { id: "fa_9", title: "Interview Preparation", description: "Technical finance questions, valuation case studies, and market awareness.", level: "advanced", connectsFrom: ["fa_8"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "entrepreneur_founder",
    nodes: [
      { id: "en_1", title: "Learn to Spot Real Problems", description: "Practice noticing genuine, painful problems people have — not just ideas you find cool.", level: "beginner", connectsFrom: [] },
      { id: "en_2", title: "Basic Business Literacy", description: "Understand revenue, costs, margins, and how businesses actually sustain themselves.", level: "beginner", connectsFrom: ["en_1"] },
      { id: "en_3", title: "Talk to Potential Customers", description: "Validate a problem is real and painful before building anything.", level: "beginner", connectsFrom: ["en_1"] },
      { id: "en_4", title: "Build a Minimum Viable Product", description: "Create the smallest possible version that tests your core assumption.", level: "intermediate", connectsFrom: ["en_2", "en_3"] },
      { id: "en_5", title: "Get First Users/Customers", description: "Learn basic sales/marketing to get real people using or paying for it.", level: "intermediate", connectsFrom: ["en_4"] },
      { id: "en_6", title: "Iterate Based on Feedback", description: "Adjust the product based on what users actually do, not what they say.", level: "intermediate", connectsFrom: ["en_5"] },
      { id: "en_7", title: "Fundraising Basics (optional)", description: "Understand how startup funding works, if your venture needs outside capital.", level: "advanced", optional: true, connectsFrom: ["en_6"] },
      { id: "en_8", title: "Build a Small Team", description: "Learn to hire, delegate, and lead as the venture grows.", level: "advanced", connectsFrom: ["en_6"] },
      { id: "en_9", title: "Scale or Learn & Restart", description: "Double down on what's working, or take lessons into the next attempt — most founders don't succeed on the first try.", level: "advanced", connectsFrom: ["en_7", "en_8"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "journalist",
    nodes: [
      { id: "jo_1", title: "Strong Writing Fundamentals", description: "Clear, concise, grammatically sound writing — the core skill.", level: "beginner", connectsFrom: [] },
      { id: "jo_2", title: "Reading Widely & Critically", description: "Following quality journalism to understand tone, structure, and framing.", level: "beginner", connectsFrom: ["jo_1"] },
      { id: "jo_3", title: "Research & Fact-Checking", description: "Verifying information and finding credible sources.", level: "beginner", connectsFrom: ["jo_1"] },
      { id: "jo_4", title: "Interviewing Skills", description: "Asking good questions and drawing out real, useful answers.", level: "intermediate", connectsFrom: ["jo_2", "jo_3"] },
      { id: "jo_5", title: "Story Structure & Pitching", description: "Framing a story angle and pitching it to editors or audiences.", level: "intermediate", connectsFrom: ["jo_4"] },
      { id: "jo_6", title: "Digital & Multimedia Skills", description: "Basic photo/video/social media skills — most journalism today is multi-format.", level: "intermediate", optional: true, connectsFrom: ["jo_5"] },
      { id: "jo_7", title: "Build a Portfolio", description: "Published clips — via student papers, blogs, or freelance pieces.", level: "advanced", connectsFrom: ["jo_5"] },
      { id: "jo_8", title: "Internship at a Publication", description: "Real newsroom experience, however small the outlet.", level: "advanced", connectsFrom: ["jo_7"] },
      { id: "jo_9", title: "Build an Audience / Beat", description: "Develop expertise in a specific topic area and a following around it.", level: "advanced", connectsFrom: ["jo_8"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "social_worker_ngo",
    nodes: [
      { id: "sw2_1", title: "Understand Social Issues Deeply", description: "Go beyond surface awareness — study the root causes of the issues you care about.", level: "beginner", connectsFrom: [] },
      { id: "sw2_2", title: "Volunteer Experience", description: "Hands-on volunteering to understand ground realities, not just theory.", level: "beginner", connectsFrom: ["sw2_1"] },
      { id: "sw2_3", title: "Communication & Communities", description: "Learn to work respectfully and effectively with diverse communities.", level: "beginner", connectsFrom: ["sw2_1"] },
      { id: "sw2_4", title: "Program Design Basics", description: "How social programs are planned, budgeted, and measured for impact.", level: "intermediate", connectsFrom: ["sw2_2", "sw2_3"] },
      { id: "sw2_5", title: "Grant Writing & Fundraising", description: "Understanding how NGOs get funded and sustain their work.", level: "intermediate", optional: true, connectsFrom: ["sw2_4"] },
      { id: "sw2_6", title: "Policy & Government Systems", description: "Understanding how public policy intersects with on-ground social work.", level: "advanced", optional: true, connectsFrom: ["sw2_4"] },
      { id: "sw2_7", title: "Internship with an NGO", description: "Direct field experience with an established organization.", level: "advanced", connectsFrom: ["sw2_4"] },
      { id: "sw2_8", title: "Specialize in a Cause Area", description: "Build deep expertise in a focus area — education, health, environment, etc.", level: "advanced", connectsFrom: ["sw2_7"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "mechanical_engineer",
    nodes: [
      { id: "me_1", title: "Physics & Math Foundations", description: "Mechanics, thermodynamics, and calculus — the backbone of the field.", level: "beginner", connectsFrom: [] },
      { id: "me_2", title: "Engineering Drawing / CAD", description: "Learn to design and represent parts using CAD software (e.g., SolidWorks, AutoCAD).", level: "beginner", connectsFrom: ["me_1"] },
      { id: "me_3", title: "Materials Science", description: "Understanding material properties and how they affect design choices.", level: "intermediate", connectsFrom: ["me_1"] },
      { id: "me_4", title: "Manufacturing Processes", description: "How parts are actually made — machining, casting, 3D printing, etc.", level: "intermediate", connectsFrom: ["me_2", "me_3"] },
      { id: "me_5", title: "Thermodynamics & Fluid Mechanics", description: "Core mechanical engineering subjects for energy and systems design.", level: "intermediate", connectsFrom: ["me_1"] },
      { id: "me_6", title: "Basic Programming/Simulation Tools", description: "MATLAB or Python for simulations and analysis.", level: "advanced", optional: true, connectsFrom: ["me_5"] },
      { id: "me_7", title: "Design Projects", description: "Real hands-on design/build projects — robotics club, formula student, etc.", level: "advanced", connectsFrom: ["me_4", "me_5"] },
      { id: "me_8", title: "Internship", description: "Industry exposure at a manufacturing, automotive, or energy company.", level: "advanced", connectsFrom: ["me_7"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "research_scientist",
    nodes: [
      { id: "rs_1", title: "Strong Foundations in Your Field", description: "Deep undergraduate-level mastery of the core subject (physics, biology, chemistry, etc.).", level: "beginner", connectsFrom: [] },
      { id: "rs_2", title: "Scientific Writing", description: "Learning to write clearly and precisely about technical findings.", level: "beginner", connectsFrom: ["rs_1"] },
      { id: "rs_3", title: "Research Methodology", description: "Understanding experimental design, data collection, and statistical validity.", level: "intermediate", connectsFrom: ["rs_1"] },
      { id: "rs_4", title: "Undergraduate Research Assistantship", description: "Hands-on lab or field experience assisting an ongoing research project.", level: "intermediate", connectsFrom: ["rs_2", "rs_3"] },
      { id: "rs_5", title: "Master's Degree", description: "Specialized coursework and a research thesis in your chosen area.", level: "intermediate", connectsFrom: ["rs_4"] },
      { id: "rs_6", title: "Publish or Present Work", description: "Conference papers or journal submissions — builds a research track record.", level: "advanced", optional: true, connectsFrom: ["rs_5"] },
      { id: "rs_7", title: "PhD Program", description: "Multi-year deep original research culminating in a dissertation.", level: "advanced", connectsFrom: ["rs_5"] },
      { id: "rs_8", title: "Postdoctoral Research / Industry R&D", description: "Continued research work in academia, government labs, or corporate R&D.", level: "advanced", connectsFrom: ["rs_7"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "hr_manager",
    nodes: [
      { id: "hr_1", title: "Understand Organizations & People", description: "Basics of organizational behavior and workplace dynamics.", level: "beginner", connectsFrom: [] },
      { id: "hr_2", title: "Communication Skills", description: "Clear, empathetic communication — the core HR skill.", level: "beginner", connectsFrom: ["hr_1"] },
      { id: "hr_3", title: "Recruitment & Hiring Basics", description: "How sourcing, screening, and interviewing candidates works.", level: "intermediate", connectsFrom: ["hr_2"] },
      { id: "hr_4", title: "Labor Law & Compliance Basics", description: "Understanding key employment law and workplace policy fundamentals.", level: "intermediate", connectsFrom: ["hr_1"] },
      { id: "hr_5", title: "Performance & Culture Systems", description: "How companies structure feedback, growth, and culture-building.", level: "intermediate", connectsFrom: ["hr_3"] },
      { id: "hr_6", title: "People Analytics (optional)", description: "Using data to understand attrition, engagement, and hiring effectiveness.", level: "advanced", optional: true, connectsFrom: ["hr_5"] },
      { id: "hr_7", title: "Internship / HR Generalist Role", description: "Entry-level HR experience across multiple functions.", level: "advanced", connectsFrom: ["hr_4", "hr_5"] },
      { id: "hr_8", title: "Specialize", description: "Choose a focus — talent acquisition, L&D, compensation, or HR business partnering.", level: "advanced", connectsFrom: ["hr_7"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "civil_engineer",
    nodes: [
      { id: "ce_1", title: "Physics & Math Foundations", description: "Statics, mechanics, and calculus — essential for structural understanding.", level: "beginner", connectsFrom: [] },
      { id: "ce_2", title: "Engineering Drawing / CAD", description: "Technical drawing and design software for civil structures.", level: "beginner", connectsFrom: ["ce_1"] },
      { id: "ce_3", title: "Structural Analysis", description: "Understanding how loads and forces act on buildings and structures.", level: "intermediate", connectsFrom: ["ce_1"] },
      { id: "ce_4", title: "Construction Materials", description: "Concrete, steel, and other materials — properties and appropriate use.", level: "intermediate", connectsFrom: ["ce_2", "ce_3"] },
      { id: "ce_5", title: "Surveying & Site Work", description: "Practical site measurement and planning skills.", level: "intermediate", connectsFrom: ["ce_2"] },
      { id: "ce_6", title: "Project Management Basics", description: "Timelines, budgets, and coordinating construction projects.", level: "advanced", connectsFrom: ["ce_4", "ce_5"] },
      { id: "ce_7", title: "Sustainable/Green Building (optional)", description: "Growing specialization in environmentally efficient construction.", level: "advanced", optional: true, connectsFrom: ["ce_6"] },
      { id: "ce_8", title: "Internship / Site Experience", description: "Hands-on exposure to real construction or infrastructure projects.", level: "advanced", connectsFrom: ["ce_6"] },
    ],
  },
  // ==========================================================================
  {
    careerId: "graphic_designer",
    nodes: [
      { id: "gd_1", title: "Design Fundamentals", description: "Color theory, typography, layout, and composition basics.", level: "beginner", connectsFrom: [] },
      { id: "gd_2", title: "Design Software", description: "Learn industry tools — Adobe Illustrator, Photoshop, and/or Figma.", level: "beginner", connectsFrom: ["gd_1"] },
      { id: "gd_3", title: "Branding Basics", description: "How logos, color palettes, and visual identity systems work together.", level: "intermediate", connectsFrom: ["gd_2"] },
      { id: "gd_4", title: "Digital & Print Design", description: "Designing for both screens and physical print materials.", level: "intermediate", connectsFrom: ["gd_2"] },
      { id: "gd_5", title: "Motion / Basic Animation (optional)", description: "Adding movement to designs for social media and digital ads.", level: "advanced", optional: true, connectsFrom: ["gd_4"] },
      { id: "gd_6", title: "Build a Portfolio", description: "A focused body of work showing range and a clear personal style.", level: "advanced", connectsFrom: ["gd_3", "gd_4"] },
      { id: "gd_7", title: "Freelance / Agency Experience", description: "Real client work — freelance gigs or an internship at a design agency.", level: "advanced", connectsFrom: ["gd_6"] },
    ],
  },
];