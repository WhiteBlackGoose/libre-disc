export const DISC_COLORS = {
  D: '#E63946',
  I: '#F4A261',
  S: '#2A9D8F',
  C: '#457B9D'
};

export const PERSONALITIES = {
  D: {
    id: 'D',
    name: 'The Director',
    primary: 'D',
    secondary: null,
    color: '#E63946',
    emoji: '🔥',
    description: 'Bold, decisive, and results-driven. You take charge naturally and thrive on challenge. You cut through ambiguity and push for outcomes with relentless energy.',
    strengths: ['Decisive leadership', 'Goal-oriented focus', 'Thrives under pressure', 'Direct communication', 'Big-picture thinking'],
    challenges: ['Can overlook details', 'May seem impatient', 'Risk of steamrolling others', 'Difficulty delegating'],
    keywords: ['Authority', 'Results', 'Speed', 'Challenge']
  },
  Di: {
    id: 'Di',
    name: 'The Maverick',
    primary: 'D',
    secondary: 'I',
    color: '#E84D50',
    emoji: '⚡',
    description: 'A bold leader with infectious charisma. You combine drive with persuasion, rallying people toward ambitious goals. You move fast and bring others along for the ride.',
    strengths: ['Charismatic leadership', 'Persuasive communication', 'Action-oriented creativity', 'Competitive spirit', 'Entrepreneurial mindset'],
    challenges: ['May overpromise', 'Can be impulsive', 'Dislikes routine tasks', 'May dominate conversations'],
    keywords: ['Ambition', 'Persuasion', 'Action', 'Energy']
  },
  Dc: {
    id: 'Dc',
    name: 'The Architect',
    primary: 'D',
    secondary: 'C',
    color: '#7A5A72',
    emoji: '🏗️',
    description: 'A strategic powerhouse who combines determination with analytical precision. You build systems, solve complex problems, and execute with methodical intensity.',
    strengths: ['Strategic planning', 'Systematic problem-solving', 'High standards with drive', 'Independent execution', 'Critical thinking'],
    challenges: ['Can be overly critical', 'May seem cold or distant', 'Perfectionism slows decisions', 'Difficulty with ambiguity'],
    keywords: ['Strategy', 'Precision', 'Control', 'Excellence']
  },
  DI: {
    id: 'DI',
    name: 'The Trailblazer',
    primary: 'D',
    secondary: 'I',
    color: '#ED6E54',
    emoji: '🚀',
    description: 'Equal parts drive and enthusiasm. You are a natural innovator who leads with vision and energy. You inspire teams to push boundaries and embrace bold ideas.',
    strengths: ['Visionary leadership', 'Infectious enthusiasm', 'Quick decision-making', 'Risk-taking confidence', 'Motivational presence'],
    challenges: ['May neglect follow-through', 'Can be overwhelming', 'Impatient with slow processes', 'Struggles with routine'],
    keywords: ['Innovation', 'Vision', 'Influence', 'Boldness']
  },
  I: {
    id: 'I',
    name: 'The Enthusiast',
    primary: 'I',
    secondary: null,
    color: '#F4A261',
    emoji: '☀️',
    description: 'Warm, expressive, and naturally magnetic. You light up every room and build connections effortlessly. Your optimism and energy are contagious.',
    strengths: ['Relationship building', 'Creative brainstorming', 'Motivating others', 'Adaptable communication', 'Positive energy'],
    challenges: ['Can be disorganized', 'May avoid conflict', 'Tendency to over-commit', 'Difficulty with details'],
    keywords: ['Connection', 'Optimism', 'Expression', 'Fun']
  },
  Id: {
    id: 'Id',
    name: 'The Spark',
    primary: 'I',
    secondary: 'D',
    color: '#ED8B51',
    emoji: '✨',
    description: 'A dynamic communicator with competitive fire. You combine social magnetism with drive, excelling at rallying teams and pushing for results through sheer enthusiasm.',
    strengths: ['Dynamic presentation skills', 'Competitive socializing', 'Quick rapport building', 'Persuasive energy', 'Resilient optimism'],
    challenges: ['Can be scattered', 'May prioritize charm over substance', 'Impatient with process', 'Restless energy'],
    keywords: ['Charisma', 'Drive', 'Spontaneity', 'Impact']
  },
  Is: {
    id: 'Is',
    name: 'The Harmonizer',
    primary: 'I',
    secondary: 'S',
    color: '#BBA078',
    emoji: '🤝',
    description: 'A warm, empathetic connector who builds deep relationships. You combine social grace with genuine care, creating harmonious environments where everyone feels valued.',
    strengths: ['Deep relationship building', 'Empathetic listening', 'Team cohesion', 'Conflict mediation', 'Emotional intelligence'],
    challenges: ['Difficulty saying no', 'May avoid hard truths', 'Can be too accommodating', 'Struggles with tough decisions'],
    keywords: ['Warmth', 'Harmony', 'Empathy', 'Trust']
  },
  IS: {
    id: 'IS',
    name: 'The Counselor',
    primary: 'I',
    secondary: 'S',
    color: '#9BA17A',
    emoji: '💚',
    description: 'Equal parts heart and stability. You are the team\'s emotional anchor — warm, supportive, and deeply invested in people. You create safe spaces for growth and collaboration.',
    strengths: ['Exceptional empathy', 'Patient mentoring', 'Team harmony building', 'Supportive leadership', 'Genuine warmth'],
    challenges: ['May avoid necessary conflict', 'Can be indecisive', 'Over-invests emotionally', 'Difficulty with change'],
    keywords: ['Support', 'Patience', 'Care', 'Stability']
  },
  S: {
    id: 'S',
    name: 'The Supporter',
    primary: 'S',
    secondary: null,
    color: '#2A9D8F',
    emoji: '🌿',
    description: 'Calm, reliable, and deeply loyal. You are the steady foundation others depend on. Your patience and consistency make you an invaluable team member and friend.',
    strengths: ['Unwavering reliability', 'Active listening', 'Patient persistence', 'Team loyalty', 'Calm under pressure'],
    challenges: ['Resistant to change', 'May suppress own needs', 'Difficulty with confrontation', 'Can be too passive'],
    keywords: ['Loyalty', 'Patience', 'Consistency', 'Service']
  },
  Si: {
    id: 'Si',
    name: 'The Peacemaker',
    primary: 'S',
    secondary: 'I',
    color: '#5EA090',
    emoji: '🕊️',
    description: 'A gentle diplomat with social warmth. You combine stability with approachability, creating environments where people feel safe to express themselves and collaborate.',
    strengths: ['Diplomatic communication', 'Inclusive leadership', 'Conflict resolution', 'Patient encouragement', 'Building consensus'],
    challenges: ['May be too agreeable', 'Avoids rocking the boat', 'Can be indecisive', 'Difficulty asserting boundaries'],
    keywords: ['Peace', 'Inclusion', 'Diplomacy', 'Gentleness']
  },
  Sc: {
    id: 'Sc',
    name: 'The Technician',
    primary: 'S',
    secondary: 'C',
    color: '#378C89',
    emoji: '🔧',
    description: 'A methodical and dependable specialist. You combine steadiness with precision, excelling at tasks that require patience, accuracy, and careful attention to process.',
    strengths: ['Meticulous attention to detail', 'Reliable execution', 'Process-oriented thinking', 'Calm persistence', 'Quality focus'],
    challenges: ['Resistant to rapid change', 'May over-analyze', 'Can be too cautious', 'Difficulty with ambiguity'],
    keywords: ['Precision', 'Process', 'Reliability', 'Thoroughness']
  },
  SC: {
    id: 'SC',
    name: 'The Specialist',
    primary: 'S',
    secondary: 'C',
    color: '#388C8C',
    emoji: '🔬',
    description: 'Equal parts patience and precision. You are a deep expert who masters your domain through careful study and consistent effort. Quality and accuracy are your hallmarks.',
    strengths: ['Deep expertise', 'Systematic approach', 'Consistent quality', 'Thoughtful analysis', 'Reliable output'],
    challenges: ['Slow to adapt', 'May over-prepare', 'Difficulty with improvisation', 'Can seem reserved'],
    keywords: ['Expertise', 'Quality', 'Depth', 'Consistency']
  },
  C: {
    id: 'C',
    name: 'The Analyst',
    primary: 'C',
    secondary: null,
    color: '#457B9D',
    emoji: '📊',
    description: 'Precise, logical, and quality-driven. You excel at analyzing complex information and ensuring accuracy. Your high standards and systematic thinking produce exceptional work.',
    strengths: ['Analytical thinking', 'Quality assurance', 'Systematic planning', 'Data-driven decisions', 'Attention to detail'],
    challenges: ['Can be overly cautious', 'May seem detached', 'Analysis paralysis', 'Difficulty with spontaneity'],
    keywords: ['Accuracy', 'Logic', 'Standards', 'Analysis']
  },
  Cs: {
    id: 'Cs',
    name: 'The Perfectionist',
    primary: 'C',
    secondary: 'S',
    color: '#3D8593',
    emoji: '🎯',
    description: 'A patient perfectionist who combines analytical rigor with steady dedication. You produce high-quality work through careful methodology and unwavering commitment.',
    strengths: ['Exceptional quality output', 'Patient problem-solving', 'Thorough documentation', 'Consistent methodology', 'Dependable accuracy'],
    challenges: ['Perfectionism can slow progress', 'May resist delegation', 'Overly cautious with risk', 'Difficulty with ambiguity'],
    keywords: ['Perfection', 'Method', 'Dedication', 'Rigor']
  },
  Cd: {
    id: 'Cd',
    name: 'The Strategist',
    primary: 'C',
    secondary: 'D',
    color: '#6A5F72',
    emoji: '♟️',
    description: 'A sharp analytical mind with decisive edge. You combine deep analysis with the drive to act on your conclusions. You excel at strategy and critical problem-solving.',
    strengths: ['Strategic analysis', 'Data-driven leadership', 'Critical evaluation', 'Independent thinking', 'Decisive conclusions'],
    challenges: ['Can be overly blunt', 'May seem cold', 'Impatient with emotional reasoning', 'Difficulty collaborating'],
    keywords: ['Strategy', 'Data', 'Logic', 'Determination']
  },
  CD: {
    id: 'CD',
    name: 'The Challenger',
    primary: 'C',
    secondary: 'D',
    color: '#6B5B72',
    emoji: '⚔️',
    description: 'Equal parts logic and force. You challenge assumptions with data and push for excellence with determination. You are a formidable problem-solver and critical thinker.',
    strengths: ['Rigorous critical thinking', 'Driving quality standards', 'Fearless problem-solving', 'Evidence-based leadership', 'Decisive analysis'],
    challenges: ['Can intimidate others', 'May dismiss emotional input', 'Overly demanding', 'Difficulty with compromise'],
    keywords: ['Rigor', 'Challenge', 'Evidence', 'Force']
  }
};

export function getPersonality(id) {
  return PERSONALITIES[id] || PERSONALITIES['D'];
}

export function getAllPersonalities() {
  return Object.values(PERSONALITIES);
}
