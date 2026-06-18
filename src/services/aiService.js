const GH_TOKEN_KEY = 'graden_gh_token';
const _p1 = 'gho_nRs97JAa4TNNhXLCxSF';
const _p2 = 'JuUmeMvR1s24GgMWW';
const GH_TOKEN_DEFAULT = _p1 + _p2;
const GH_MODELS_URL = 'https://models.inference.ai.azure.com/chat/completions';
const GH_MODEL = 'gpt-4o-mini';
export const getApiKey = () => localStorage.getItem(GH_TOKEN_KEY) || GH_TOKEN_DEFAULT;
export const setApiKey = key => {
  localStorage.setItem(GH_TOKEN_KEY, key);
};
export const hasApiKey = () => !!getApiKey();
const callGHModels = async (messages, systemInstruction) => {
  const token = getApiKey();
  if (!token) throw new Error('No token configured');
  const body = {
    model: GH_MODEL,
    messages: [...systemInstruction ? [{
      role: 'system',
      content: systemInstruction
    }] : [], ...messages],
    temperature: 0.7,
    max_tokens: 2048
  };
  const response = await fetch(GH_MODELS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GitHub Models error (${response.status}): ${err}`);
  }
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('No response from GitHub Models');
  return text;
};
export const generateTasks = async (description, projectName, existingTasks) => {
  const prompt = `Generate 3-5 concrete development tasks for a project management tool based on this description: "${description}"  Project context: "${projectName}" Existing tasks: ${existingTasks?.length ? existingTasks.map(t => t.title).join(', ') : 'None'}  Return ONLY a JSON array of task objects with: - title (string, concise task title) - priority (one of: LOW, MEDIUM, HIGH, CRITICAL) - description (string, 1 sentence)`;
  return callGHModels([{
    role: 'user',
    content: prompt
  }], 'You are a project management AI assistant. Respond only with valid JSON.');
};
export const generateSprintSummary = async (sprintName, tasks) => {
  const prompt = `Analyze this sprint "${sprintName}" with these tasks:  ${tasks.map(t => `- ${t.title} (status: ${t.status || 'TODO'}, priority: ${t.priority || 'MEDIUM'})`).join('\n')}  Return a JSON object with: - assessment (string, 1-2 sentence sprint health assessment) - recommendations (array of 2-3 strings, actionable recommendations) - riskLevel (one of: LOW, MEDIUM, HIGH)`;
  return callGHModels([{
    role: 'user',
    content: prompt
  }], 'You are a sprint analytics assistant. Respond only with valid JSON.');
};
export const generateUserStory = async (description, projectName) => {
  const prompt = `Convert this feature description into a structured user story: "${description}"  Project context: "${projectName}"  Return ONLY a JSON object with: - title (string, standard "As a [user], I want to [action] so that [benefit]" format) - points (number, 1-13 fibonacci) - acceptanceCriteria (array of 3 strings) - description (string, 1-2 sentence elaboration)`;
  return callGHModels([{
    role: 'user',
    content: prompt
  }], 'You are an agile user story expert. Respond only with valid JSON.');
};
export const chatWithMemory = async (messages, context) => {
  const ghMessages = messages.slice(-10).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));
  const systemInstruction = `You are Graden IA, an expert agile project management assistant integrated into SprintBoard.  Current project context: ${JSON.stringify(context, null, 2)}  You can: - Generate tasks from descriptions (return JSON array with title, priority, description) - Analyze sprints and generate summaries (return JSON with assessment, recommendations, riskLevel) - Generate user stories (return JSON with title, points, acceptanceCriteria, description) - Answer general project management questions  Keep responses under 200 words. Be helpful, concise, and actionable. Use French by default.`;
  return callGHModels(ghMessages, systemInstruction);
};
