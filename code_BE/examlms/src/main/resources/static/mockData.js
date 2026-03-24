function nowIso() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16).slice(-6)}`;
}

export function buildSeed() {
  const questions = [
    {
      id: id('q'),
      type: 'SINGLE',
      topic: 'Java',
      difficulty: 'EASY',
      points: 1,
      content: 'Which keyword is used to inherit a class in Java?',
      options: [
        { id: 'A', text: 'extends', isCorrect: true },
        { id: 'B', text: 'implements', isCorrect: false },
        { id: 'C', text: 'inherits', isCorrect: false },
        { id: 'D', text: 'super', isCorrect: false }
      ],
      explanation: 'Classes inherit via the extends keyword.',
      createdAt: nowIso()
    },
    {
      id: id('q'),
      type: 'MULTI',
      topic: 'Spring',
      difficulty: 'MEDIUM',
      points: 2,
      content: 'Which annotations are used for dependency injection in Spring?',
      options: [
        { id: 'A', text: '@Autowired', isCorrect: true },
        { id: 'B', text: '@Inject', isCorrect: true },
        { id: 'C', text: '@ComponentScan', isCorrect: false },
        { id: 'D', text: '@Value', isCorrect: true }
      ],
      explanation: '@Autowired/@Inject inject beans; @Value injects config values.',
      createdAt: nowIso()
    },
    {
      id: id('q'),
      type: 'SINGLE',
      topic: 'MongoDB',
      difficulty: 'HARD',
      points: 3,
      content: 'In MongoDB, which structure is used to store documents?',
      options: [
        { id: 'A', text: 'Row', isCorrect: false },
        { id: 'B', text: 'Collection', isCorrect: true },
        { id: 'C', text: 'Table', isCorrect: false },
        { id: 'D', text: 'Schema', isCorrect: false }
      ],
      explanation: 'MongoDB stores documents inside collections.',
      createdAt: nowIso()
    }
  ];

  const exams = [
    {
      id: id('exam'),
      name: 'Java Basics - Demo Exam',
      durationMinutes: 15,
      passScore: 60,
      mode: 'MANUAL',
      questionIds: questions.slice(0, 3).map((q) => q.id),
      createdAt: nowIso()
    }
  ];

  const attempts = [];

  return { questions, exams, attempts };
}

export function generateImportPreview() {
  return [
    {
      content: 'What is the default value of an int in Java?',
      type: 'SINGLE',
      topic: 'Java',
      difficulty: 'EASY',
      points: 1,
      options: ['0', 'null', 'undefined', '1'],
      correct: ['A']
    },
    {
      content: 'Select HTTP methods that are idempotent.',
      type: 'MULTI',
      topic: 'Web',
      difficulty: 'MEDIUM',
      points: 2,
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correct: ['A', 'C', 'D']
    }
  ];
}
