// Field/role domains (like the portfolio) derived from a repo's detected tech.
// A repo can belong to MULTIPLE domains. The card's accent colour uses the
// highest-priority domain present; the filter and badges use the full set.

export const DOMAIN_COLOR: Record<string, string> = {
  Agentic: '167,139,250',
  'LLMs & GenAI': '251,146,60',
  'Deep Learning': '45,212,191',
  'Computer Vision': '34,211,238',
  NLP: '232,121,249',
  MLOps: '250,204,21',
  'Classical ML': '244,114,182',
  'Data Science': '74,222,128',
  'SWE / Full-Stack': '96,165,250',
  Other: '148,163,184',
}

// Lowercased tech signals (match the tech display names in projects.json).
const SIGNALS: Record<string, string[]> = {
  Agentic: ['langgraph', 'langchain', 'mcp', 'crewai', 'autogen'],
  'LLMs & GenAI': [
    'rag', 'openai', 'anthropic', 'hugging face', 'transformers', 'sentence-transformers',
    'llamaindex', 'peft', 'qlora', 'deberta', 'diffusers', 'tavily',
  ],
  'Deep Learning': ['pytorch', 'tensorflow', 'keras', 'pytorch lightning'],
  'Computer Vision': ['opencv'],
  NLP: ['spacy', 'nltk', 'deberta', 'sentence-transformers'],
  MLOps: ['mlflow', 'airflow', 'prefect', 'evidently', 'dvc', 'weights & biases', 'kubeflow', 'bentoml'],
  'Classical ML': ['scikit-learn', 'xgboost', 'lightgbm', 'catboost', 'shap', 'optuna', 'gymnasium', 'stable-baselines3'],
  'Data Science': ['pandas', 'numpy', 'polars', 'scipy', 'matplotlib', 'seaborn', 'plotly', 'jupyter'],
  'SWE / Full-Stack': [
    'react', 'next.js', 'vue', 'svelte', 'angular', 'vite', 'tailwind css', 'framer motion',
    'fastapi', 'flask', 'django', 'express', 'nestjs', 'fastify', 'node.js', 'postgresql',
    'mysql', 'mongodb', 'redis', 'prisma', 'streamlit', 'gradio', 'three.js',
  ],
}

// Accent priority: the "most signature" domain wins the card colour.
export const DOMAIN_ORDER = [
  'Agentic',
  'LLMs & GenAI',
  'Deep Learning',
  'Computer Vision',
  'NLP',
  'MLOps',
  'Classical ML',
  'Data Science',
  'SWE / Full-Stack',
]

export function domainsFor(tech: Record<string, string[]>): string[] {
  const joined = Object.values(tech || {})
    .flat()
    .map((s) => s.toLowerCase())
    .join(' | ')
  const found = DOMAIN_ORDER.filter((d) => SIGNALS[d].some((sig) => joined.includes(sig)))
  return found.length ? found : ['Other']
}
