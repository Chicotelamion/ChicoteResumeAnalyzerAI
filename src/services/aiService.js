import OpenAI from 'openai';

const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

function buildPrompt(profile) {
  return `
You are an expert HR recruiter and IT career consultant.

Analyze this IT student/job seeker profile and provide:

1. Employability score from 0 to 100
2. Main strengths
3. Missing skills or weaknesses
4. Resume improvement suggestions
5. Interview readiness advice
6. Top 5 suitable IT job roles
7. Career growth roadmap

Profile Data:
${JSON.stringify(profile, null, 2)}

Return result in JSON structured format with these exact keys:
employabilityScore, strengths, weaknesses, suggestions, interviewAdvice, recommendedJobs, roadmap.
Each list field must be an array of concise strings.
`;
}

const fallbackAnalysis = {
  employabilityScore: 74,
  strengths: [
    'Clear IT career interest and foundational academic background',
    'Practical project experience that can be expanded into portfolio evidence',
    'Technical skills show readiness for entry-level specialization'
  ],
  weaknesses: [
    'Needs more measurable project outcomes and role-specific achievements',
    'Could strengthen cloud, database, testing, and deployment experience',
    'Interview examples should be prepared using real project scenarios'
  ],
  suggestions: [
    'Add project links, tools used, responsibilities, and measurable results',
    'Group technical skills by category such as frontend, backend, database, and tools',
    'Earn one role-aligned certification or complete a capstone deployment'
  ],
  interviewAdvice: [
    'Prepare STAR answers for teamwork, debugging, deadlines, and learning new tools',
    'Practice explaining each project architecture, tradeoffs, and challenges',
    'Review fundamentals in programming, databases, APIs, Git, and problem solving'
  ],
  recommendedJobs: [
    'Junior Web Developer',
    'Frontend Developer',
    'QA Tester',
    'IT Support Specialist',
    'Junior Systems Analyst'
  ],
  roadmap: [
    'Month 1: Polish resume, GitHub, LinkedIn, and portfolio project descriptions',
    'Months 2-3: Build and deploy one full-stack project with authentication and database features',
    'Months 4-6: Apply to internships or junior roles while practicing interviews weekly'
  ]
};

export async function analyzeCareerProfile(profile) {
  // Keeps the demo usable even before an API key is configured.
  if (!apiKey) {
    return {
      ...fallbackAnalysis,
      suggestions: [
        ...fallbackAnalysis.suggestions,
        'Add VITE_OPENAI_API_KEY in .env to enable live AI-generated analysis'
      ]
    };
  }

  const openai = new OpenAI({
    apiKey,
    // For production, move this call to a Firebase Cloud Function or server API route.
    dangerouslyAllowBrowser: true
  });

  const response = await openai.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You return valid JSON only. Do not include markdown.'
      },
      {
        role: 'user',
        content: buildPrompt(profile)
      }
    ],
    temperature: 0.35
  });

  const content = response.choices[0]?.message?.content;
  return JSON.parse(content);
}
