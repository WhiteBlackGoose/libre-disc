export const DISC_COLORS = {
  D: '#E63946',
  I: '#F4A261',
  S: '#2A9D8F',
  C: '#457B9D'
};

export const PERSONALITIES = {
  D: {
    id: 'D', name: 'The Director', primary: 'D', secondary: null, color: '#E63946',
    description: 'Bold, decisive, and results-driven. You take charge naturally and thrive on challenge. You cut through ambiguity and push for outcomes with relentless energy.',
    strengths: ['Decisive leadership', 'Goal-oriented focus', 'Thrives under pressure', 'Direct communication', 'Big-picture thinking'],
    challenges: ['Can overlook details', 'May seem impatient', 'Risk of steamrolling others', 'Difficulty delegating'],
    keywords: ['Authority', 'Results', 'Speed', 'Challenge'],
    approach: {
      giving_feedback: 'Be direct and concise. Skip the preamble — state the issue, the impact, and what needs to change. They respect bluntness.',
      criticism: 'Frame it as a challenge to overcome, not a personal failing. Focus on results: "This approach isn\'t producing the outcomes we need."',
      supporting: 'Give them autonomy and clear goals. Remove obstacles from their path and let them drive. Recognize their wins publicly.',
      collaborating: 'Come prepared with a clear agenda. Be decisive and action-oriented. Don\'t waste their time with excessive detail or small talk.',
      motivating: 'Set ambitious targets and competitive benchmarks. They thrive on challenge and the opportunity to prove themselves.'
    }
  },
  Di: {
    id: 'Di', name: 'The Maverick', primary: 'D', secondary: 'I', color: '#E84D50',
    description: 'A bold leader with infectious charisma. You combine drive with persuasion, rallying people toward ambitious goals. You move fast and bring others along for the ride.',
    strengths: ['Charismatic leadership', 'Persuasive communication', 'Action-oriented creativity', 'Competitive spirit', 'Entrepreneurial mindset'],
    challenges: ['May overpromise', 'Can be impulsive', 'Dislikes routine tasks', 'May dominate conversations'],
    keywords: ['Ambition', 'Persuasion', 'Action', 'Energy'],
    approach: {
      giving_feedback: 'Be energetic but specific. Acknowledge their vision first, then redirect: "Love the ambition — let\'s adjust the execution."',
      criticism: 'Keep it brief and forward-looking. They lose interest in dwelling on past mistakes. Suggest a better approach rather than dissecting the old one.',
      supporting: 'Fuel their energy with new challenges and visibility. Pair them with detail-oriented partners to balance their big-picture thinking.',
      collaborating: 'Match their pace and enthusiasm. Bring bold ideas to the table — they enjoy brainstorming with people who keep up.',
      motivating: 'Offer high-visibility projects and public recognition. They want to be seen leading the charge.'
    }
  },
  Dc: {
    id: 'Dc', name: 'The Architect', primary: 'D', secondary: 'C', color: '#7A5A72',
    description: 'A strategic powerhouse who combines determination with analytical precision. You build systems, solve complex problems, and execute with methodical intensity.',
    strengths: ['Strategic planning', 'Systematic problem-solving', 'High standards with drive', 'Independent execution', 'Critical thinking'],
    challenges: ['Can be overly critical', 'May seem cold or distant', 'Perfectionism slows decisions', 'Difficulty with ambiguity'],
    keywords: ['Strategy', 'Precision', 'Control', 'Excellence'],
    approach: {
      giving_feedback: 'Use data and evidence. They respect logical arguments far more than emotional appeals. Be precise about what and why.',
      criticism: 'Present it as a quality gap with a clear path to fix it. They\'ll respect factual critique but resist vague disapproval.',
      supporting: 'Give them complex problems with clear ownership. They need autonomy and the freedom to design their own systems.',
      collaborating: 'Come with well-reasoned proposals. They value competence — demonstrate yours through preparation and logic.',
      motivating: 'Challenge them with technically complex, high-stakes projects. Recognition of their expertise matters more than social praise.'
    }
  },
  DI: {
    id: 'DI', name: 'The Trailblazer', primary: 'D', secondary: 'I', color: '#ED6E54',
    description: 'Equal parts drive and enthusiasm. You are a natural innovator who leads with vision and energy. You inspire teams to push boundaries and embrace bold ideas.',
    strengths: ['Visionary leadership', 'Infectious enthusiasm', 'Quick decision-making', 'Risk-taking confidence', 'Motivational presence'],
    challenges: ['May neglect follow-through', 'Can be overwhelming', 'Impatient with slow processes', 'Struggles with routine'],
    keywords: ['Innovation', 'Vision', 'Influence', 'Boldness'],
    approach: {
      giving_feedback: 'Lead with the big picture impact, then get specific. They need to see why it matters before they\'ll engage with details.',
      criticism: 'Be direct but inspiring — frame it as untapped potential. "You\'re capable of more, and here\'s what\'s holding you back."',
      supporting: 'Give them room to innovate and a stage to present. Handle the operational follow-through so they can focus on vision.',
      collaborating: 'Bring energy and ideas. They love co-creating with passionate people. Keep meetings dynamic and outcome-focused.',
      motivating: 'Offer breakthrough opportunities and platform to influence. They want to leave a mark and be recognized for innovation.'
    }
  },
  I: {
    id: 'I', name: 'The Enthusiast', primary: 'I', secondary: null, color: '#F4A261',
    description: 'Warm, expressive, and naturally magnetic. You light up every room and build connections effortlessly. Your optimism and energy are contagious.',
    strengths: ['Relationship building', 'Creative brainstorming', 'Motivating others', 'Adaptable communication', 'Positive energy'],
    challenges: ['Can be disorganized', 'May avoid conflict', 'Tendency to over-commit', 'Difficulty with details'],
    keywords: ['Connection', 'Optimism', 'Expression', 'Fun'],
    approach: {
      giving_feedback: 'Start by affirming the relationship. Make it conversational, not formal. They hear criticism better when they feel safe.',
      criticism: 'Be warm but honest. Avoid public criticism at all costs — their reputation and social standing matter deeply to them.',
      supporting: 'Provide social opportunities and creative freedom. Help them with structure and follow-through systems they won\'t build themselves.',
      collaborating: 'Be open, enthusiastic, and collaborative. Let them talk through ideas verbally. Schedule fun alongside the work.',
      motivating: 'Public recognition, team activities, and the chance to inspire others. They thrive on appreciation and connection.'
    }
  },
  Id: {
    id: 'Id', name: 'The Spark', primary: 'I', secondary: 'D', color: '#ED8B51',
    description: 'A dynamic communicator with competitive fire. You combine social magnetism with drive, excelling at rallying teams and pushing for results through sheer enthusiasm.',
    strengths: ['Dynamic presentation skills', 'Competitive socializing', 'Quick rapport building', 'Persuasive energy', 'Resilient optimism'],
    challenges: ['Can be scattered', 'May prioritize charm over substance', 'Impatient with process', 'Restless energy'],
    keywords: ['Charisma', 'Drive', 'Spontaneity', 'Impact'],
    approach: {
      giving_feedback: 'Keep it fast-paced and action-oriented. They want solutions, not long discussions. Be positive but push for accountability.',
      criticism: 'Be direct but maintain rapport. They can handle tough feedback if it doesn\'t feel like a personal attack on their character.',
      supporting: 'Give them variety, competition, and social interaction. They wither in isolation or monotony.',
      collaborating: 'Bring energy and decisiveness. They like fast collaborators who can match their spontaneity with substance.',
      motivating: 'Competitive challenges, networking opportunities, and chances to shine. They love being the energizing force in any room.'
    }
  },
  Is: {
    id: 'Is', name: 'The Harmonizer', primary: 'I', secondary: 'S', color: '#BBA078',
    description: 'A warm, empathetic connector who builds deep relationships. You combine social grace with genuine care, creating harmonious environments where everyone feels valued.',
    strengths: ['Deep relationship building', 'Empathetic listening', 'Team cohesion', 'Conflict mediation', 'Emotional intelligence'],
    challenges: ['Difficulty saying no', 'May avoid hard truths', 'Can be too accommodating', 'Struggles with tough decisions'],
    keywords: ['Warmth', 'Harmony', 'Empathy', 'Trust'],
    approach: {
      giving_feedback: 'Be gentle and sincere. They need to feel that your feedback comes from a place of caring, not judgment.',
      criticism: 'Sandwich it with genuine positives. Give them time to process — don\'t push for an immediate response.',
      supporting: 'Create a stable, supportive environment. Acknowledge their emotional labor and the harmony they maintain.',
      collaborating: 'Prioritize the relationship alongside the task. Check in on how they\'re feeling, not just what they\'re doing.',
      motivating: 'Meaningful work that helps others. They\'re motivated by impact on people, not metrics or competition.'
    }
  },
  IS: {
    id: 'IS', name: 'The Counselor', primary: 'I', secondary: 'S', color: '#9BA17A',
    description: 'Equal parts heart and stability. You are the team\'s emotional anchor — warm, supportive, and deeply invested in people. You create safe spaces for growth and collaboration.',
    strengths: ['Exceptional empathy', 'Patient mentoring', 'Team harmony building', 'Supportive leadership', 'Genuine warmth'],
    challenges: ['May avoid necessary conflict', 'Can be indecisive', 'Over-invests emotionally', 'Difficulty with change'],
    keywords: ['Support', 'Patience', 'Care', 'Stability'],
    approach: {
      giving_feedback: 'Be patient and caring. Frame feedback as growth, not correction. Give them time and a private setting.',
      criticism: 'Avoid being blunt or abrupt. They internalize criticism deeply — be measured and emphasize your belief in them.',
      supporting: 'Give them meaningful mentoring roles. Protect them from abrupt changes and value their steady contribution.',
      collaborating: 'Move at their pace. Build trust before pushing for action. They give their best when they feel emotionally safe.',
      motivating: 'Roles where they can nurture others\' growth. They light up when they see the people they\'ve helped succeed.'
    }
  },
  S: {
    id: 'S', name: 'The Supporter', primary: 'S', secondary: null, color: '#2A9D8F',
    description: 'Calm, reliable, and deeply loyal. You are the steady foundation others depend on. Your patience and consistency make you an invaluable team member and friend.',
    strengths: ['Unwavering reliability', 'Active listening', 'Patient persistence', 'Team loyalty', 'Calm under pressure'],
    challenges: ['Resistant to change', 'May suppress own needs', 'Difficulty with confrontation', 'Can be too passive'],
    keywords: ['Loyalty', 'Patience', 'Consistency', 'Service'],
    approach: {
      giving_feedback: 'Be calm, consistent, and specific. They need a safe space to hear feedback. Avoid surprises — give them time to prepare.',
      criticism: 'Be kind but clear. They may agree outwardly but struggle internally. Follow up to ensure they\'ve truly processed it.',
      supporting: 'Provide stability and clear expectations. Express genuine appreciation — they rarely ask for recognition but deeply need it.',
      collaborating: 'Be reliable and follow through on commitments. They lose trust quickly if you\'re inconsistent or unpredictable.',
      motivating: 'Stability, clear purpose, and team belonging. They want to know their steady work matters and is noticed.'
    }
  },
  Si: {
    id: 'Si', name: 'The Peacemaker', primary: 'S', secondary: 'I', color: '#5EA090',
    description: 'A gentle diplomat with social warmth. You combine stability with approachability, creating environments where people feel safe to express themselves and collaborate.',
    strengths: ['Diplomatic communication', 'Inclusive leadership', 'Conflict resolution', 'Patient encouragement', 'Building consensus'],
    challenges: ['May be too agreeable', 'Avoids rocking the boat', 'Can be indecisive', 'Difficulty asserting boundaries'],
    keywords: ['Peace', 'Inclusion', 'Diplomacy', 'Gentleness'],
    approach: {
      giving_feedback: 'Use a warm, conversational tone. They respond to "we" language: "How can we improve this together?"',
      criticism: 'Be diplomatic and constructive. They\'ll shut down if they feel attacked. Emphasize the goal, not the fault.',
      supporting: 'Value their mediating skills. Give them roles where they can bridge divides and include diverse voices.',
      collaborating: 'Be inclusive and patient. They work best in collaborative, non-competitive environments.',
      motivating: 'Harmony and inclusion. They\'re driven by the desire to see everyone working well together.'
    }
  },
  Sc: {
    id: 'Sc', name: 'The Technician', primary: 'S', secondary: 'C', color: '#378C89',
    description: 'A methodical and dependable specialist. You combine steadiness with precision, excelling at tasks that require patience, accuracy, and careful attention to process.',
    strengths: ['Meticulous attention to detail', 'Reliable execution', 'Process-oriented thinking', 'Calm persistence', 'Quality focus'],
    challenges: ['Resistant to rapid change', 'May over-analyze', 'Can be too cautious', 'Difficulty with ambiguity'],
    keywords: ['Precision', 'Process', 'Reliability', 'Thoroughness'],
    approach: {
      giving_feedback: 'Be specific and process-oriented. They want to know exactly what to fix and how — vague feedback frustrates them.',
      criticism: 'Present evidence calmly. They can handle factual critique but need time to verify and adjust. Don\'t rush them.',
      supporting: 'Give them clear processes and time to do quality work. Don\'t surprise them with sudden pivots or ambiguity.',
      collaborating: 'Respect their process and pace. They deliver excellent work when not pressured to cut corners.',
      motivating: 'Mastery and recognition of their expertise. They want to be the go-to person for quality in their domain.'
    }
  },
  SC: {
    id: 'SC', name: 'The Specialist', primary: 'S', secondary: 'C', color: '#388C8C',
    description: 'Equal parts patience and precision. You are a deep expert who masters your domain through careful study and consistent effort. Quality and accuracy are your hallmarks.',
    strengths: ['Deep expertise', 'Systematic approach', 'Consistent quality', 'Thoughtful analysis', 'Reliable output'],
    challenges: ['Slow to adapt', 'May over-prepare', 'Difficulty with improvisation', 'Can seem reserved'],
    keywords: ['Expertise', 'Quality', 'Depth', 'Consistency'],
    approach: {
      giving_feedback: 'Be thorough and factual. Provide written feedback they can review on their own time. They prefer data over opinions.',
      criticism: 'Be patient and detailed. They need to understand the full picture before they can accept and act on criticism.',
      supporting: 'Respect their need for depth. Give them space to become true experts rather than spreading them thin.',
      collaborating: 'Be prepared and organized. They appreciate collaborators who value quality and won\'t push for shortcuts.',
      motivating: 'Deep mastery, stable environment, and recognition of their specialized knowledge. Quality is their love language.'
    }
  },
  C: {
    id: 'C', name: 'The Analyst', primary: 'C', secondary: null, color: '#457B9D',
    description: 'Precise, logical, and quality-driven. You excel at analyzing complex information and ensuring accuracy. Your high standards and systematic thinking produce exceptional work.',
    strengths: ['Analytical thinking', 'Quality assurance', 'Systematic planning', 'Data-driven decisions', 'Attention to detail'],
    challenges: ['Can be overly cautious', 'May seem detached', 'Analysis paralysis', 'Difficulty with spontaneity'],
    keywords: ['Accuracy', 'Logic', 'Standards', 'Analysis'],
    approach: {
      giving_feedback: 'Use facts, data, and specific examples. They distrust vague or emotional feedback. Be precise and logical.',
      criticism: 'Present it as a gap analysis: here\'s the standard, here\'s the gap, here\'s the path to close it. Keep emotion out.',
      supporting: 'Provide clear expectations, quality standards, and the resources to meet them. Respect their need for thoroughness.',
      collaborating: 'Be organized, factual, and prepared. They lose respect for sloppy thinking or poorly supported arguments.',
      motivating: 'Intellectual challenge, quality recognition, and the autonomy to set and maintain high standards.'
    }
  },
  Cs: {
    id: 'Cs', name: 'The Perfectionist', primary: 'C', secondary: 'S', color: '#3D8593',
    description: 'A patient perfectionist who combines analytical rigor with steady dedication. You produce high-quality work through careful methodology and unwavering commitment.',
    strengths: ['Exceptional quality output', 'Patient problem-solving', 'Thorough documentation', 'Consistent methodology', 'Dependable accuracy'],
    challenges: ['Perfectionism can slow progress', 'May resist delegation', 'Overly cautious with risk', 'Difficulty with ambiguity'],
    keywords: ['Perfection', 'Method', 'Dedication', 'Rigor'],
    approach: {
      giving_feedback: 'Be detailed and methodical. Show your work — they need to trust your analysis before they\'ll accept your conclusions.',
      criticism: 'Be patient and factual. They already hold themselves to high standards, so criticism lands heavily. Be measured.',
      supporting: 'Give them ownership over quality standards. They thrive when they can build and maintain systems of excellence.',
      collaborating: 'Match their thoroughness. They appreciate partners who share their commitment to getting things right.',
      motivating: 'The pursuit of excellence itself. They\'re intrinsically motivated by doing exceptional, meticulous work.'
    }
  },
  Cd: {
    id: 'Cd', name: 'The Strategist', primary: 'C', secondary: 'D', color: '#6A5F72',
    description: 'A sharp analytical mind with decisive edge. You combine deep analysis with the drive to act on your conclusions. You excel at strategy and critical problem-solving.',
    strengths: ['Strategic analysis', 'Data-driven leadership', 'Critical evaluation', 'Independent thinking', 'Decisive conclusions'],
    challenges: ['Can be overly blunt', 'May seem cold', 'Impatient with emotional reasoning', 'Difficulty collaborating'],
    keywords: ['Strategy', 'Data', 'Logic', 'Determination'],
    approach: {
      giving_feedback: 'Be concise, logical, and solution-oriented. Skip the pleasantries — they prefer efficient, evidence-based communication.',
      criticism: 'Challenge them intellectually. They respect well-reasoned critique but dismiss emotional or poorly supported pushback.',
      supporting: 'Give them strategic problems with real consequences. They want impact, not busywork.',
      collaborating: 'Come with data and a clear position. They enjoy productive debate with well-prepared collaborators.',
      motivating: 'Complex strategic challenges and the authority to act on their analysis. They want their insights to drive decisions.'
    }
  },
  CD: {
    id: 'CD', name: 'The Challenger', primary: 'C', secondary: 'D', color: '#6B5B72',
    description: 'Equal parts logic and force. You challenge assumptions with data and push for excellence with determination. You are a formidable problem-solver and critical thinker.',
    strengths: ['Rigorous critical thinking', 'Driving quality standards', 'Fearless problem-solving', 'Evidence-based leadership', 'Decisive analysis'],
    challenges: ['Can intimidate others', 'May dismiss emotional input', 'Overly demanding', 'Difficulty with compromise'],
    keywords: ['Rigor', 'Challenge', 'Evidence', 'Force'],
    approach: {
      giving_feedback: 'Be direct, factual, and unafraid. They respect people who can stand their ground with evidence.',
      criticism: 'Don\'t sugarcoat it. Present data, state the problem, propose the fix. They appreciate efficiency and honesty.',
      supporting: 'Give them the hardest problems and the authority to solve them. They need challenge and respect, not hand-holding.',
      collaborating: 'Bring your A-game. They push back hard on weak ideas — be prepared to defend your position with evidence.',
      motivating: 'High-stakes, complex challenges where quality and results both matter. They want to be the best and prove it.'
    }
  }
};

export function getPersonality(id) {
  return PERSONALITIES[id] || PERSONALITIES['D'];
}

export function getAllPersonalities() {
  return Object.values(PERSONALITIES);
}
