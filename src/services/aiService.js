import OpenAI from 'openai';

const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

function buildPrompt(profile) {
  return `
You are an expert student career guidance counselor and college course adviser.

Analyze this undecided student profile and provide:

1. Career direction clarity score from 0 to 100
2. Main personal strengths
3. Possible concerns, blind spots, or decision conflicts
4. Top 5 recommended college courses or programs
5. Practical career exploration advice
6. Top 5 suitable future career paths or job families
7. College and career discovery roadmap

Profile Data:
${JSON.stringify(profile, null, 2)}

Return result in JSON structured format with these exact keys:
directionScore, strengths, concerns, courseSuggestions, explorationAdvice, recommendedJobs, roadmap.
Each list field must be an array of concise strings.
`;
}

const fallbackAnalysis = {
  directionScore: 78,
  strengths: [
    'Shows curiosity about practical, real-world work',
    'Has enough interests to compare several college course options',
    'Can make a better decision by matching subjects, strengths, and preferred work style'
  ],
  concerns: [
    'May need more exposure to actual college subjects before choosing one course',
    'Could be influenced by pressure instead of personal strengths and interests',
    'Needs to compare daily tasks, required skills, and long-term opportunities'
  ],
  courseSuggestions: [
    'BS Information Technology',
    'BS Computer Science',
    'BS Information Systems',
    'BS Business Administration major in Marketing Management',
    'BS Psychology'
  ],
  explorationAdvice: [
    'Interview one student or graduate from each course you are considering',
    'Watch beginner lectures or course previews before deciding',
    'Try one small project or activity connected to your top two choices'
  ],
  recommendedJobs: [
    'Software Developer',
    'Business Analyst',
    'UI/UX Designer',
    'Digital Marketing Specialist',
    'Guidance or HR Professional'
  ],
  roadmap: [
    'Week 1: Rank your favorite subjects, hobbies, strengths, and non-negotiables',
    'Weeks 2-3: Compare course curricula, tuition requirements, and possible careers',
    'Week 4: Choose a first-choice and backup course, then plan skills to try before enrollment'
  ]
};

export async function analyzeCareerProfile(profile) {
  // Keeps the demo usable even before an API key is configured.
  if (!apiKey) {
    return {
      ...fallbackAnalysis,
      courseSuggestions: [
        ...fallbackAnalysis.courseSuggestions,
        'Add VITE_OPENAI_API_KEY in .env to enable live AI-generated analysis'
      ]
    };
  }

  let finalModel = model;
  const isOpenRouter = apiKey.startsWith('sk-or');
  if (isOpenRouter && !finalModel.includes('/')) {
    finalModel = `openai/${finalModel}`;
  }

  const openai = new OpenAI({
    apiKey,
    baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
    // For production, move this call to a Firebase Cloud Function or server API route.
    dangerouslyAllowBrowser: true
  });

  const response = await openai.chat.completions.create({
    model: finalModel,
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
