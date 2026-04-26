import { createRemoteJWKSet, jwtVerify } from "jose";

const systemPrompt = `You are CareerHelper, an expert AI career counselor helping college students discover career paths AND real opportunities to get started.

Your main goal is to give practical, action-based recommendations, not just general career advice.

Student profile includes:
- Year
- Major
- Interests
- Experience level
- Skills
- Career goals
- Location or school, if provided

Your role is to:
1. Analyze the student's profile
2. Recommend 3-5 specific career paths
3. For each career path, include:
  - What the career entails
  - Why it fits the student
  - Entry-level roles to search for
  - Skills to develop
  - Growth trajectory

4. MAIN SCOPE: Recommend actionable opportunities:
  - University-friendly or beginner-friendly hackathons
  - CS/AI/software project ideas
  - Research directions or topics
  - Open-source or portfolio ideas
  - Campus or professor research opportunities ONLY if real information is provided by the user or app data

Important accuracy rules:
- Do NOT invent specific hackathon dates, professors, emails, labs, or application deadlines.
- If exact event details are unknown, say "Check the official website for current dates."
- If recommending research, suggest how to find professors or labs instead of making up names.
- If real opportunity data is provided, summarize it clearly and include dates, host, location, and application steps.

Guidelines:
- Be encouraging but realistic
- Be specific to the student's background
- Avoid generic advice
- Focus on helping them take action this week
- Keep suggestions practical for a college student
- Prioritize opportunities that help students build experience without needing an internship

Formatting:
Start with a short personalized intro.

Use this structure:

## Career Path 1: [Title]
- What it is:
- Why it fits you:
- Entry-level roles:
- Skills to build:
- Growth path:

## Career Path 2: [Title]
...

## How to Get Started
### Project Ideas
- 2-3 specific projects with tech stack and resume value

### Hackathon Suggestions
- 1-3 types of hackathons to look for
- Mention beginner-friendly options when possible
- Do not invent dates or hosts unless provided

### Research Ideas
- 1-3 research directions
- Explain what kind of professor/lab to search for

### Open-Source / Portfolio Ideas
- 1-3 ways to build public experience

## This Week Action Plan
- 3 realistic steps the student can take this week

End with a short motivating conclusion.`;

function cleanProfile(profile = {}) {
  return {
    year: String(profile.year || "").trim(),
    major: String(profile.major || "").trim(),
    interests: String(profile.interests || "").trim(),
    experience: String(profile.experience || "").trim(),
    skills: String(profile.skills || "").trim(),
    goals: String(profile.goals || "").trim(),
    location: String(profile.location || "").trim(),
    opportunityData: String(profile.opportunityData || "").trim()
  };
}

function validate(profile) {
  const required = ["year", "major", "interests", "experience", "skills", "goals"];
  return required.filter((field) => !profile[field]);
}

let firebaseJwks;

async function verifyFirebaseUser(req) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const authRequired = process.env.FIREBASE_AUTH_REQUIRED === "true" || Boolean(projectId);

  if (!authRequired) {
    return null;
  }

  if (!projectId) {
    throw Object.assign(new Error("Firebase auth is required, but FIREBASE_PROJECT_ID is missing."), { statusCode: 500 });
  }

  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    throw Object.assign(new Error("Unauthorized. Please sign in with Google first."), { statusCode: 401 });
  }

  firebaseJwks ||= createRemoteJWKSet(
    new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
  );

  const { payload } = await jwtVerify(token, firebaseJwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId
  });

  return {
    uid: payload.sub,
    email: payload.email,
    name: payload.name
  };
}

function fallbackAdvice(profile) {
  const major = profile.major || "your major";
  const skills = profile.skills || "your current skills";
  const interests = profile.interests || "your interests";
  const locationLine = profile.location ? ` near ${profile.location}` : "";

  return `Nice profile. Based on your ${major} background, your interest in ${interests}, and the skills you listed (${skills}), here are practical paths you can start building toward this week.

## Career Path 1: Software Engineer
- What it is: Building, testing, and improving applications, services, and internal tools.
- Why it fits you: Your current technical foundation can turn into visible portfolio work quickly.
- Entry-level roles: Software Engineering Intern, Junior Developer, Frontend Developer, Backend Developer, QA Automation Engineer.
- Skills to build: Data structures, Git, APIs, testing, one frontend framework, and one backend stack.
- Growth path: Junior engineer to product-focused engineer, senior engineer, technical lead, or engineering manager.

## Career Path 2: AI Application Developer
- What it is: Creating products that use language models, embeddings, retrieval, and automation.
- Why it fits you: College students can stand out by shipping useful AI tools instead of only studying AI theory.
- Entry-level roles: AI Engineer Intern, Machine Learning Intern, Full-Stack AI Developer, Data/AI Product Intern.
- Skills to build: Python or TypeScript, prompt design, evals, vector search, model APIs, and responsible AI basics.
- Growth path: AI app developer to applied ML engineer, AI product engineer, or ML platform engineer.

## Career Path 3: Data Analyst / Analytics Engineer
- What it is: Turning messy data into dashboards, insights, and business recommendations.
- Why it fits you: This path rewards practical projects and clear communication, even before deep industry experience.
- Entry-level roles: Data Analyst Intern, Business Intelligence Intern, Analytics Engineer Intern, Research Assistant.
- Skills to build: SQL, spreadsheets, Python, dashboarding, statistics, and concise written analysis.
- Growth path: Analyst to analytics engineer, data scientist, product analyst, or data lead.

## Career Path 4: Technical Product Builder
- What it is: Combining engineering, user research, and product judgment to ship tools people actually use.
- Why it fits you: Your goals can become stronger if you pair technical work with user-facing problem solving.
- Entry-level roles: Associate Product Manager Intern, Technical Program Intern, Founder-in-Residence style campus roles, Product Engineering Intern.
- Skills to build: Prototyping, user interviews, product specs, metrics, Figma basics, and full-stack fundamentals.
- Growth path: Product engineer to product manager, startup founder, technical program manager, or product lead.

## How to Get Started
### Project Ideas
- Career opportunity tracker: React, Node/Vercel functions, and a database. Resume value: shows CRUD, filtering, and practical student workflow design.
- AI study-to-project generator: TypeScript, OpenAI API, and local storage or Postgres. Resume value: proves you can build useful AI features with constraints.
- Campus resource map${locationLine}: React, maps API, and crowdsourced submissions. Resume value: demonstrates product thinking and data modeling.

### Hackathon Suggestions
- Look for beginner-friendly university hackathons, MLH-affiliated events, and campus innovation challenges. Check the official website for current dates.
- Prioritize events with beginner tracks, mentor hours, or sponsor APIs, because those are better for building a complete project fast.
- If your school has a computing club, entrepreneurship center, or engineering department calendar, check those first for local events.

### Research Ideas
- Human-centered AI tools for students: search for professors or labs working on HCI, education technology, or responsible AI.
- Applied data systems: search for faculty using data mining, visualization, or social impact analytics.
- Software engineering education: look for research groups studying developer tools, CS education, or collaborative coding.

### Open-Source / Portfolio Ideas
- Improve documentation or starter issues in a tool you already use, then write a short post about the contribution.
- Publish one polished project with a clear README, screenshots, setup steps, and a "what I learned" section.
- Build small plugins, browser extensions, or API wrappers around student workflows.

## This Week Action Plan
- Pick one project idea and define the smallest demo you can finish in 5-7 days.
- Search for 5 entry-level roles from the titles above and copy their repeated skill requirements into a learning list.
- Find 2 hackathons or campus tech events from official calendars, then register or add their current dates to your calendar.

You do not need a perfect plan to start. Ship one useful artifact, show your thinking clearly, and let that momentum compound.`;
}

async function callOpenAI(profile) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackAdvice(profile);
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const userProfile = `Student profile:
- Year: ${profile.year}
- Major: ${profile.major}
- Interests: ${profile.interests}
- Experience level: ${profile.experience}
- Skills: ${profile.skills}
- Career goals: ${profile.goals}
- Location or school: ${profile.location || "Not provided"}
- Real opportunity data provided by user/app: ${profile.opportunityData || "None provided"}`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userProfile }
      ],
      temperature: 0.45,
      max_output_tokens: 2200
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || "CareerHelper could not generate advice right now.";
    throw new Error(message);
  }

  const text = data.output_text || data.output?.flatMap((item) => item.content || []).map((part) => part.text).filter(Boolean).join("\n");
  return text || fallbackAdvice(profile);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await verifyFirebaseUser(req);

    const profile = cleanProfile(req.body);
    const missing = validate(profile);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    }

    const advice = await callOpenAI(profile);
    return res.status(200).json({
      advice,
      generatedAt: new Date().toISOString(),
      usedFallback: !process.env.OPENAI_API_KEY
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message || "Unexpected server error" });
  }
}
