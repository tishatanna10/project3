// ============================================================================
// ADVISOR AI — CAREER ASSESSMENT QUESTIONS
// ============================================================================
// Each question is scenario/behavior based, not a self-rating.
// Every answer option carries `weights`: points added to specific skill or
// interest tags. After the assessment, sum all weights per tag to build the
// student's Skill Profile and Interest Profile (each tag scored 0-100 after
// normalization). These profiles are later compared against each career's
// ideal profile (cosine similarity) to generate match scores.
//
// SKILL TAGS:
// analytical, problem_solving, communication, leadership, creativity,
// math_logic, programming, writing, research, design, data_interpretation,
// presentation, teamwork, decision_making, attention_to_detail
//
// INTEREST TAGS (domains):
// technology, business, healthcare, design_arts, finance, research_science,
// management, media, social_impact
// ============================================================================

export type AnswerOption = {
  id: string;
  text: string;
  weights: Record<string, number>; // tag -> points (typically 1-3)
};

export type AssessmentQuestion = {
  id: string;
  section: "skill" | "interest";
  prompt: string;
  helperText?: string;
  type: "single_select" | "multi_select" | "rank" | "open_text";
  options?: AnswerOption[];
  // for open_text questions we don't auto-score; they feed into the
  // AI explanation step as qualitative context, not the numeric profile.
};

// ============================================================================
// SECTION A — SKILL QUESTIONS (15)
// ============================================================================

export const skillQuestions: AssessmentQuestion[] = [
  {
    id: "sk_01",
    section: "skill",
    prompt:
      "Your team's project is falling behind schedule and nobody is sure exactly why. What's your first move?",
    type: "single_select",
    options: [
      { id: "a", text: "Pull up the timeline/data and trace where things slowed down", weights: { analytical: 3, data_interpretation: 2 } },
      { id: "b", text: "Ask each teammate what's blocking them", weights: { communication: 2, teamwork: 2 } },
      { id: "c", text: "Call a meeting to re-align on priorities and next steps", weights: { leadership: 3 } },
      { id: "d", text: "Start working faster on your own part to make up time", weights: { decision_making: 1, attention_to_detail: 1 } },
    ],
  },
  {
    id: "sk_02",
    section: "skill",
    prompt:
      "You're handed a tool that's supposed to solve your problem, but it doesn't quite fit your situation.",
    type: "single_select",
    options: [
      { id: "a", text: "Adapt the tool — tweak settings or use it in an unintended way", weights: { problem_solving: 3, creativity: 1 } },
      { id: "b", text: "Look for a different, better-fitting tool", weights: { research: 2, decision_making: 1 } },
      { id: "c", text: "Build your own small workaround from scratch", weights: { programming: 2, creativity: 2, problem_solving: 1 } },
      { id: "d", text: "Ask someone who's used it before for advice", weights: { communication: 1, teamwork: 1 } },
    ],
  },
  {
    id: "sk_03",
    section: "skill",
    prompt:
      "You need to explain something complicated to someone with zero background in it. What do you naturally reach for?",
    type: "single_select",
    options: [
      { id: "a", text: "An analogy or comparison to something familiar", weights: { communication: 3, creativity: 1 } },
      { id: "b", text: "A diagram or visual", weights: { design: 2, communication: 1 } },
      { id: "c", text: "A step-by-step written explanation", weights: { writing: 3 } },
      { id: "d", text: "Just show them by doing it live", weights: { presentation: 2, communication: 1 } },
    ],
  },
  {
    id: "sk_04",
    section: "skill",
    prompt:
      "Two teammates disagree on the direction of a group project and it's stalling progress. What do you do?",
    type: "single_select",
    options: [
      { id: "a", text: "Mediate — find a middle ground both can accept", weights: { leadership: 2, communication: 2 } },
      { id: "b", text: "Push the group to just decide and move forward", weights: { leadership: 3, decision_making: 2 } },
      { id: "c", text: "Gather more information before taking a side", weights: { research: 2, analytical: 1 } },
      { id: "d", text: "Let them work it out — step back", weights: { teamwork: 1 } },
    ],
  },
  {
    id: "sk_05",
    section: "skill",
    prompt: "You're asked to improve something completely ordinary — say, a daily commute or a common household object.",
    type: "single_select",
    options: [
      { id: "a", text: "Tweak one small thing at a time and test it", weights: { attention_to_detail: 2, analytical: 1 } },
      { id: "b", text: "Reimagine it completely from scratch", weights: { creativity: 3 } },
      { id: "c", text: "Combine ideas from a totally unrelated field", weights: { creativity: 2, research: 1 } },
      { id: "d", text: "Research how others have already solved it", weights: { research: 3 } },
    ],
  },
  {
    id: "sk_06",
    section: "skill",
    prompt:
      "Quick puzzle: A farmer has chickens and cows. Together they have 30 heads and 74 legs. How many chickens are there?",
    helperText: "Take a real shot — partial reasoning counts too.",
    type: "single_select",
    options: [
      { id: "a", text: "17 (solved it correctly)", weights: { math_logic: 3, analytical: 2 } },
      { id: "b", text: "Set up equations but got a different number", weights: { math_logic: 2, analytical: 1 } },
      { id: "c", text: "Tried to reason it out without equations", weights: { math_logic: 1 } },
      { id: "d", text: "Skipped — not for me", weights: {} },
    ],
  },
  {
    id: "sk_07",
    section: "skill",
    prompt: "You need to do the exact same small task 50 times this week.",
    type: "single_select",
    options: [
      { id: "a", text: "Just do it manually — it's simple enough", weights: { attention_to_detail: 1 } },
      { id: "b", text: "Find a way to automate or template it", weights: { programming: 3, problem_solving: 1 } },
      { id: "c", text: "Split the work with others", weights: { teamwork: 2, leadership: 1 } },
      { id: "d", text: "Find a shortcut that skips the less important parts", weights: { decision_making: 2 } },
    ],
  },
  {
    id: "sk_08",
    section: "skill",
    prompt:
      "\"me and my freind went to market and buyed alot of things\" — what's your instinct on this sentence?",
    type: "single_select",
    options: [
      { id: "a", text: "Rewrite it cleanly: grammar, spelling, and flow all fixed", weights: { writing: 3, attention_to_detail: 2 } },
      { id: "b", text: "Spot the errors but wouldn't naturally rewrite it", weights: { writing: 1, attention_to_detail: 2 } },
      { id: "c", text: "It's fine, the meaning is clear", weights: {} },
      { id: "d", text: "Not something I'd usually notice", weights: {} },
    ],
  },
  {
    id: "sk_09",
    section: "skill",
    prompt: "You need to make a decision but don't have enough information yet. First step?",
    type: "single_select",
    options: [
      { id: "a", text: "Search for data or existing information online", weights: { research: 3 } },
      { id: "b", text: "Ask someone experienced for their take", weights: { communication: 1, teamwork: 1 } },
      { id: "c", text: "Run a small test or experiment first", weights: { analytical: 2, research: 1 } },
      { id: "d", text: "Go with your gut and adjust later", weights: { decision_making: 3 } },
    ],
  },
  {
    id: "sk_10",
    section: "skill",
    prompt:
      "Two flyer designs for the same event — one is plain text with a border, the other uses a bold headline, one clear image, and lots of white space. Which grabs you, and why?",
    type: "open_text",
  },
  {
    id: "sk_11",
    section: "skill",
    prompt:
      "A chart shows sales 'doubled' this quarter — but the y-axis starts at 90 instead of 0, making a 5% increase look dramatic. What's your reaction?",
    type: "single_select",
    options: [
      { id: "a", text: "Immediately notice the axis is misleading", weights: { data_interpretation: 3, attention_to_detail: 2 } },
      { id: "b", text: "Something feels off but can't pinpoint it", weights: { data_interpretation: 1 } },
      { id: "c", text: "Take the 'doubled' claim at face value", weights: {} },
    ],
  },
  {
    id: "sk_12",
    section: "skill",
    prompt: "You have 2 minutes to convince someone of an idea. How do you open?",
    type: "single_select",
    options: [
      { id: "a", text: "With a short story or real example", weights: { presentation: 2, communication: 2 } },
      { id: "b", text: "With the strongest data point or fact", weights: { presentation: 2, analytical: 1 } },
      { id: "c", text: "With the big-picture vision or 'why it matters'", weights: { leadership: 2, presentation: 1 } },
      { id: "d", text: "By showing them, live if possible", weights: { presentation: 3 } },
    ],
  },
  {
    id: "sk_13",
    section: "skill",
    prompt: "In group work, you naturally end up being the one who...",
    type: "single_select",
    options: [
      { id: "a", text: "Organizes the tasks and keeps things on track", weights: { leadership: 2, teamwork: 2 } },
      { id: "b", text: "Generates most of the ideas", weights: { creativity: 2 } },
      { id: "c", text: "Checks the details and catches mistakes", weights: { attention_to_detail: 3 } },
      { id: "d", text: "Keeps the group motivated and gets along with everyone", weights: { teamwork: 3, communication: 1 } },
    ],
  },
  {
    id: "sk_14",
    section: "skill",
    prompt:
      "You must choose between two options with a deadline in an hour, and you don't have full information on either.",
    type: "single_select",
    options: [
      { id: "a", text: "Quickly list pros/cons and decide", weights: { decision_making: 2, analytical: 1 } },
      { id: "b", text: "Pick whichever feels safer and move on", weights: { decision_making: 2 } },
      { id: "c", text: "Try to get more info even if it eats into the time", weights: { research: 2 } },
      { id: "d", text: "Ask someone else to weigh in before deciding", weights: { teamwork: 1, communication: 1 } },
    ],
  },
  {
    id: "sk_15",
    section: "skill",
    prompt:
      "Spot the errors: \"The the meeting is scheduled for 3:00 pm on Friday, March 32nd, in Conferance Room B.\"",
    type: "single_select",
    options: [
      { id: "a", text: "Caught all three (repeated 'the', invalid date, misspelling)", weights: { attention_to_detail: 3 } },
      { id: "b", text: "Caught one or two", weights: { attention_to_detail: 2 } },
      { id: "c", text: "Didn't catch any on first read", weights: { attention_to_detail: 0 } },
    ],
  },
];

// ============================================================================
// SECTION B — INTEREST QUESTIONS (15)
// ============================================================================

export const interestQuestions: AssessmentQuestion[] = [
  {
    id: "in_01",
    section: "interest",
    prompt: "A free Saturday, zero obligations. What do you actually gravitate toward?",
    type: "single_select",
    options: [
      { id: "a", text: "Build or fix something physical", weights: { technology: 2 } },
      { id: "b", text: "Read or research a topic deeply, just for yourself", weights: { research_science: 2 } },
      { id: "c", text: "Plan or organize an event/gathering", weights: { management: 2, business: 1 } },
      { id: "d", text: "Create something — art, music, writing, video", weights: { design_arts: 2, media: 1 } },
      { id: "e", text: "Dig into numbers or trends for fun", weights: { finance: 2, business: 1 } },
      { id: "f", text: "Help someone work through a personal problem", weights: { social_impact: 2, healthcare: 1 } },
    ],
  },
  {
    id: "in_02",
    section: "interest",
    prompt: "Which of these problems sounds most satisfying to actually dig into?",
    type: "single_select",
    options: [
      { id: "a", text: "Figuring out the right price for a new product", weights: { business: 2, finance: 1 } },
      { id: "b", text: "Tracking down why a piece of software keeps crashing", weights: { technology: 2 } },
      { id: "c", text: "Working out what's causing a patient's symptoms", weights: { healthcare: 2 } },
      { id: "d", text: "Fixing a layout so people stop getting confused using it", weights: { design_arts: 2 } },
    ],
  },
  {
    id: "in_03",
    section: "interest",
    prompt: "Which headline would you actually click on first?",
    type: "single_select",
    options: [
      { id: "a", text: "\"The chip shortage explained: why your next phone costs more\"", weights: { technology: 2 } },
      { id: "b", text: "\"How this founder built a $10M business from a spare room\"", weights: { business: 2 } },
      { id: "c", text: "\"New study links sleep patterns to long-term memory\"", weights: { healthcare: 1, research_science: 2 } },
      { id: "d", text: "\"Inside the design choices of the world's most-used app\"", weights: { design_arts: 2, technology: 1 } },
      { id: "e", text: "\"What actually happens to your money when a bank fails\"", weights: { finance: 2 } },
      { id: "f", text: "\"The volunteers rebuilding flood-hit communities\"", weights: { social_impact: 2 } },
    ],
  },
  {
    id: "in_04",
    section: "interest",
    prompt: "You get to shadow someone for a full workday. Who do you pick?",
    type: "single_select",
    options: [
      { id: "a", text: "A startup founder", weights: { business: 2, management: 1 } },
      { id: "b", text: "A research scientist", weights: { research_science: 2 } },
      { id: "c", text: "A surgeon or doctor", weights: { healthcare: 2 } },
      { id: "d", text: "A product designer at a tech company", weights: { design_arts: 2, technology: 1 } },
      { id: "e", text: "A journalist covering breaking stories", weights: { media: 2 } },
      { id: "f", text: "A software engineer building a new app", weights: { technology: 2 } },
    ],
  },
  {
    id: "in_05",
    section: "interest",
    prompt: "What kind of \"done badly\" annoys you the most when you notice it?",
    type: "single_select",
    options: [
      { id: "a", text: "Clunky, inefficient systems and processes", weights: { technology: 1, business: 1 } },
      { id: "b", text: "Confusing communication or unclear instructions", weights: { media: 1, management: 1 } },
      { id: "c", text: "Ugly or hard-to-use design", weights: { design_arts: 2 } },
      { id: "d", text: "Unfair or unjust situations", weights: { social_impact: 2 } },
      { id: "e", text: "Wasted money or resources", weights: { finance: 2 } },
    ],
  },
  {
    id: "in_06",
    section: "interest",
    prompt: "Pick the 3 scenarios that intrigue you most:",
    type: "multi_select",
    options: [
      { id: "a", text: "A hospital deciding how to allocate limited ICU beds", weights: { healthcare: 2 } },
      { id: "b", text: "A startup deciding how to price a new app", weights: { business: 2 } },
      { id: "c", text: "A city planning where to build new public transit", weights: { management: 2 } },
      { id: "d", text: "A team debugging why an app keeps crashing", weights: { technology: 2 } },
      { id: "e", text: "A lab testing whether a new drug actually works", weights: { research_science: 2 } },
      { id: "f", text: "A brand deciding how to visually represent itself", weights: { design_arts: 2 } },
      { id: "g", text: "A newsroom deciding how to cover a breaking story", weights: { media: 2 } },
      { id: "h", text: "An NGO deciding how to spend a limited relief budget", weights: { social_impact: 2 } },
    ],
  },
  {
    id: "in_07",
    section: "interest",
    prompt: "What do you find yourself reading or watching most, even without meaning to?",
    type: "open_text",
  },
  {
    id: "in_08",
    section: "interest",
    prompt: "Which school subject would you actually study again, purely for fun — not for grades?",
    type: "single_select",
    options: [
      { id: "a", text: "Computer science / coding", weights: { technology: 2 } },
      { id: "b", text: "Economics / business studies", weights: { business: 2, finance: 1 } },
      { id: "c", text: "Biology / chemistry", weights: { healthcare: 1, research_science: 2 } },
      { id: "d", text: "Art / design", weights: { design_arts: 2 } },
      { id: "e", text: "History / social studies / civics", weights: { social_impact: 1, media: 1 } },
      { id: "f", text: "Physics / math", weights: { research_science: 2, technology: 1 } },
    ],
  },
  {
    id: "in_09",
    section: "interest",
    prompt: "In a group conversation, which topic makes you lean in?",
    type: "single_select",
    options: [
      { id: "a", text: "New tech, gadgets, or apps", weights: { technology: 2 } },
      { id: "b", text: "Money, markets, or business moves", weights: { finance: 2, business: 1 } },
      { id: "c", text: "Health, science, or how things work", weights: { research_science: 2, healthcare: 1 } },
      { id: "d", text: "Culture, art, or media", weights: { design_arts: 1, media: 2 } },
      { id: "e", text: "Politics or society", weights: { social_impact: 2 } },
    ],
  },
  {
    id: "in_10",
    section: "interest",
    prompt: "Which of these could you tolerate doing for hours without getting bored?",
    type: "single_select",
    options: [
      { id: "a", text: "Debugging code line by line", weights: { technology: 3 } },
      { id: "b", text: "Drafting a business plan or pitch", weights: { business: 3 } },
      { id: "c", text: "Writing and rewriting an article", weights: { media: 3 } },
      { id: "d", text: "Digging through patient or research data", weights: { healthcare: 2, research_science: 2 } },
      { id: "e", text: "Designing a poster or interface, pixel by pixel", weights: { design_arts: 3 } },
    ],
  },
  {
    id: "in_11",
    section: "interest",
    prompt: "Whose job — not their salary or fame, just the actual day-to-day work — sometimes makes you a little envious?",
    type: "open_text",
  },
  {
    id: "in_12",
    section: "interest",
    prompt: "Do you get more satisfaction from building something new, or understanding how something already works?",
    type: "single_select",
    options: [
      { id: "a", text: "Building something new", weights: { technology: 1, design_arts: 1, business: 1 } },
      { id: "b", text: "Understanding how it works", weights: { research_science: 2 } },
      { id: "c", text: "Both, about equally", weights: { research_science: 1, technology: 1 } },
    ],
  },
  {
    id: "in_13",
    section: "interest",
    prompt: "Would you rather improve one person's life deeply, or improve a system that affects thousands?",
    type: "single_select",
    options: [
      { id: "a", text: "One person, deeply", weights: { healthcare: 2, social_impact: 1 } },
      { id: "b", text: "A system, at scale", weights: { management: 2, technology: 1, business: 1 } },
    ],
  },
  {
    id: "in_14",
    section: "interest",
    prompt: "What excites you more?",
    type: "single_select",
    options: [
      { id: "a", text: "Mastering one deep, specific skill over years", weights: { research_science: 1, technology: 1 } },
      { id: "b", text: "Constantly switching between different kinds of work", weights: { business: 1, media: 1 } },
    ],
  },
  {
    id: "in_15",
    section: "interest",
    prompt: "If you started a side project this month purely because you wanted to, what would it likely be about?",
    type: "open_text",
  },
];

export const assessmentQuestions: AssessmentQuestion[] = [
  ...skillQuestions,
  ...interestQuestions,
];