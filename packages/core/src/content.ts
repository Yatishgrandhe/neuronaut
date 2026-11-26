import type { Lesson, Module } from "./types.ts";

/* ------------------------------------------------------------------ */
/* Module 1 — How AI Works (fundamental concepts)                      */
/* ------------------------------------------------------------------ */

const foundations: Lesson[] = [
  {
    id: "f1-what-is-ai",
    moduleId: "foundations",
    title: "What counts as AI?",
    summary: "Separate real AI from sci-fi, and narrow AI from generative AI.",
    minutes: 4,
    cards: [
      {
        title: "AI is a family of techniques",
        body: "Artificial intelligence means computer systems that perform tasks we usually associate with human thinking: recognizing images, understanding speech, making predictions, or generating text. Most AI today is narrow: it does one kind of task well and nothing else.",
      },
      {
        title: "Generative AI makes new content",
        body: "Generative AI (chatbots, image generators) produces new text, images, audio, or code by learning patterns from huge amounts of examples. It is powerful, but it predicts what is likely, not what is true.",
      },
    ],
    exercises: [
      {
        kind: "choice",
        id: "q1",
        prompt: "Which of these is an example of narrow AI?",
        options: [
          "A robot that can do any job a human can",
          "A spam filter that sorts your email",
          "A calculator adding two numbers",
          "A light switch on a timer",
        ],
        answer: 1,
        explain: "A spam filter learned patterns from examples to do one task. A calculator follows fixed rules written by people, so it is not usually called AI.",
      },
      {
        kind: "truefalse",
        id: "q2",
        statement: "Today's AI systems can do any intellectual task a human can.",
        answer: false,
        explain: "That idea is called artificial general intelligence (AGI). Current systems are narrow, even very capable chatbots.",
      },
      {
        kind: "match",
        id: "q3",
        prompt: "Match each tool to what it does.",
        pairs: [
          ["Image generator", "Creates new pictures from a description"],
          ["Recommendation system", "Predicts which video you will watch next"],
          ["Speech recognition", "Turns spoken words into text"],
          ["Chatbot", "Generates text replies to messages"],
        ],
        explain: "All four are AI, but only the image generator and chatbot are generative.",
      },
      {
        kind: "choice",
        id: "q4",
        prompt: "What does a generative AI model mainly do when it writes an answer?",
        options: [
          "Looks the answer up in a verified database",
          "Predicts likely words based on patterns it learned",
          "Copies a single website word for word",
          "Asks a human expert in real time",
        ],
        answer: 1,
        explain: "Language models predict likely next words. That is why answers can sound confident and still be wrong.",
      },
      {
        kind: "truefalse",
        id: "q5",
        statement: "You probably used AI today before opening this lesson.",
        answer: true,
        explain: "Phone face unlock, autocorrect, search ranking, and feed recommendations all use AI.",
      },
    ],
  },
  {
    id: "f2-learning-from-data",
    moduleId: "foundations",
    title: "How machines learn",
    summary: "Training data, features, and why examples shape everything a model does.",
    minutes: 5,
    cards: [
      {
        title: "Learning = finding patterns in examples",
        body: "In machine learning, people don't write every rule. They give a model many labeled examples (photos marked \"cat\" or \"dog\") and it adjusts itself until its guesses match the labels. This is called training.",
      },
      {
        title: "Data in, behavior out",
        body: "A model can only learn what its data shows. If the training photos only show golden retrievers, it may not recognize a poodle. Missing or skewed data leads to mistakes and bias.",
      },
    ],
    exercises: [
      {
        kind: "order",
        id: "q1",
        prompt: "Put the machine learning steps in order.",
        tiles: ["Collect examples", "Train the model", "Test on new data", "Use it in an app", "Delete the data"],
        answer: [0, 1, 2, 3],
        explain: "Collect, train, test on data the model hasn't seen, then deploy. Testing on new data checks whether it really learned the pattern.",
      },
      {
        kind: "choice",
        id: "q2",
        prompt: "A model trained only on daytime street photos struggles at night. Why?",
        options: [
          "Cameras don't work at night",
          "Its training data didn't include night examples",
          "AI models get tired",
          "Night photos are illegal to use",
        ],
        answer: 1,
        explain: "Models learn from the examples they're given. Gaps in the data become gaps in the model.",
      },
      {
        kind: "truefalse",
        id: "q3",
        statement: "In machine learning, programmers write a rule for every possible situation.",
        answer: false,
        explain: "The model infers patterns from data. That's what makes it flexible, and also harder to fully predict.",
      },
      {
        kind: "match",
        id: "q4",
        prompt: "Match each term to its meaning.",
        pairs: [
          ["Training data", "Examples the model learns from"],
          ["Label", "The correct answer attached to an example"],
          ["Test data", "New examples used to check the model"],
        ],
        explain: "Keeping test data separate is how builders check that a model generalizes.",
      },
      {
        kind: "choice",
        id: "q5",
        prompt: "Which change would most likely make a plant-disease detector fairer across regions?",
        options: [
          "Train it longer on the same photos",
          "Add labeled photos of plants from more regions and climates",
          "Make the app's buttons bigger",
          "Remove the labels",
        ],
        answer: 1,
        explain: "More representative data is the most direct fix for a model that only works well for some people or places.",
      },
    ],
  },
  {
    id: "f3-how-llms-work",
    moduleId: "foundations",
    title: "Inside a chatbot",
    summary: "Tokens, next-word prediction, and why chatbots can sound sure and be wrong.",
    minutes: 5,
    cards: [
      {
        title: "Text becomes tokens",
        body: "A large language model (LLM) splits text into tokens, small chunks such as words or word pieces. It was trained on enormous amounts of text to predict which token comes next.",
      },
      {
        title: "One token at a time",
        body: "When you ask a question, the model generates an answer token by token, each time picking from likely options. It has no built-in fact checker, so it can produce fluent text that is false. This is called a hallucination.",
      },
    ],
    exercises: [
      {
        kind: "choice",
        id: "q1",
        prompt: "\"The capital of France is ___\". What is an LLM doing when it fills the blank?",
        options: [
          "Calling the French government",
          "Choosing the most likely next token from patterns in its training",
          "Searching a map",
          "Guessing completely at random",
        ],
        answer: 1,
        explain: "\"Paris\" is overwhelmingly likely after that phrase in its training text, so the model predicts it.",
      },
      {
        kind: "truefalse",
        id: "q2",
        statement: "If a chatbot sounds confident, its answer has been fact-checked.",
        answer: false,
        explain: "Confidence is a writing style, not evidence. Fluent text can still be fabricated.",
      },
      {
        kind: "choice",
        id: "q3",
        prompt: "What is a hallucination in AI?",
        options: [
          "When the app crashes",
          "When the model produces false or made-up information presented as fact",
          "When the AI refuses a request",
          "When images look blurry",
        ],
        answer: 1,
        explain: "Hallucinations include invented quotes, statistics, and citations to sources that don't exist.",
      },
      {
        kind: "order",
        id: "q4",
        prompt: "Order what happens when you send a message to a chatbot.",
        tiles: ["Your text is split into tokens", "The model predicts the next token", "It repeats, one token at a time", "The tokens are shown as text", "A librarian checks the answer"],
        answer: [0, 1, 2, 3],
        explain: "No human checks each reply. That's your job as the reader.",
      },
      {
        kind: "truefalse",
        id: "q5",
        statement: "A chatbot may not know about events that happened after its training data was collected.",
        answer: true,
        explain: "Models have a knowledge cutoff unless they are connected to search or other live tools.",
      },
    ],
  },
  {
    id: "f4-limits",
    moduleId: "foundations",
    title: "Strengths and limits",
    summary: "Where AI shines, where it fails, and why it doesn't \"understand\" like you do.",
    minutes: 4,
    cards: [
      {
        title: "Great at patterns",
        body: "AI is strong at tasks with lots of examples: summarizing, translating, spotting patterns in images, drafting text, and suggesting code.",
      },
      {
        title: "Weak at truth and judgment",
        body: "AI can struggle with precise math, recent facts, rare situations, and anything requiring values or lived experience. It has no goals or feelings of its own, even when its words sound human.",
      },
    ],
    exercises: [
      {
        kind: "choice",
        id: "q1",
        prompt: "Which task is a chatbot most reliable at?",
        options: [
          "Telling you yesterday's game score with no internet access",
          "Rewording your own paragraph to be clearer",
          "Deciding what's morally right for your family",
          "Citing exact page numbers from a book it hasn't seen",
        ],
        answer: 1,
        explain: "Rewriting text you supply plays to its strengths. The others need live data, judgment, or sources it can't verify.",
      },
      {
        kind: "truefalse",
        id: "q2",
        statement: "A chatbot that writes \"I feel happy\" is experiencing happiness.",
        answer: false,
        explain: "It's producing words that fit the conversation. There's no evidence current models have feelings.",
      },
      {
        kind: "match",
        id: "q3",
        prompt: "Strength or limit? Match each one.",
        pairs: [
          ["Summarizing a long article", "Usually a strength"],
          ["Exact citations without sources", "Common failure"],
          ["Brainstorming ideas", "Usually a strength"],
          ["Personal values decisions", "Needs human judgment"],
        ],
        explain: "Use AI for drafts and ideas; keep facts and decisions grounded in sources and people.",
      },
      {
        kind: "choice",
        id: "q4",
        prompt: "Why might an AI image detector fail on a rare medical condition?",
        options: [
          "There were few examples of it in the training data",
          "The image file was too colorful",
          "Rare conditions are not real",
          "Doctors hid the images",
        ],
        answer: 0,
        explain: "Rare cases are underrepresented, so the model has little to learn from.",
      },
      {
        kind: "truefalse",
        id: "q5",
        statement: "Knowing AI's limits is part of using it well.",
        answer: true,
        explain: "That's the whole idea of the next module.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Module 2 — Using AI Well (practical tools & techniques)              */
/* ------------------------------------------------------------------ */

const toolkit: Lesson[] = [
  {
    id: "t1-prompt-basics",
    moduleId: "toolkit",
    title: "Prompts that work",
    summary: "Give AI a role, context, a clear task, and the format you want.",
    minutes: 5,
    cards: [
      {
        title: "The RCTF pattern",
        body: "Strong prompts usually include a Role (\"Act as a chemistry tutor\"), Context (\"I'm in 10th grade, studying for a quiz on bonds\"), a Task (\"Quiz me with 5 questions\"), and a Format (\"one at a time, wait for my answer\").",
      },
      {
        title: "Constraints keep it useful",
        body: "Add limits: reading level, length, what to avoid, or \"say 'I'm not sure' if you don't know.\" Vague prompts get generic answers.",
      },
    ],
    exercises: [
      {
        kind: "choice",
        id: "q1",
        prompt: "Which prompt will most likely get a useful study aid?",
        options: [
          "biology",
          "Explain cells",
          "Act as a biology tutor. I'm in 9th grade and confused about mitosis vs. meiosis. Compare them in a 4-row table, then ask me one check question.",
          "Do my biology homework",
        ],
        answer: 2,
        explain: "It has a role, context, a task, and a format, and it keeps you doing the thinking.",
      },
      {
        kind: "order",
        id: "q2",
        prompt: "Build a prompt in RCTF order.",
        tiles: ["Act as a history tutor.", "I'm studying WWI causes for a test.", "Quiz me with 5 questions,", "one at a time.", "Write my essay."],
        answer: [0, 1, 2, 3],
        explain: "Role, Context, Task, Format. \"Write my essay\" hands off the learning, so it's the distractor.",
      },
      {
        kind: "match",
        id: "q3",
        prompt: "Match each prompt part to an example.",
        pairs: [
          ["Role", "You are a patient math coach"],
          ["Context", "I keep mixing up slope formulas"],
          ["Task", "Give me 3 practice problems"],
          ["Format", "Show answers only after I try"],
        ],
        explain: "Each part removes guesswork for the model.",
      },
      {
        kind: "truefalse",
        id: "q4",
        statement: "Telling the AI it may say \"I'm not sure\" can reduce made-up answers.",
        answer: true,
        explain: "It doesn't eliminate hallucinations, but it gives the model a permitted alternative to inventing something.",
      },
      {
        kind: "choice",
        id: "q5",
        prompt: "Which detail should you NOT include in a prompt?",
        options: [
          "Your grade level",
          "The topic you're studying",
          "Your home address and phone number",
          "How long you want the answer",
        ],
        answer: 2,
        explain: "Never share personal information an AI tool doesn't need. You'll learn more in the Ethics module.",
      },
    ],
  },
  {
    id: "t2-iterate",
    moduleId: "toolkit",
    title: "Iterate, don't accept",
    summary: "Follow-up prompts, examples, and asking AI to critique itself.",
    minutes: 4,
    cards: [
      {
        title: "The first answer is a draft",
        body: "Treat AI output like a first draft. Ask follow-ups: \"Make it simpler,\" \"Give an example from sports,\" \"What did you leave out?\"",
      },
      {
        title: "Show, don't just tell",
        body: "Giving one example of what you want (few-shot prompting) often works better than describing it. Asking the model to list weaknesses in its own answer can reveal gaps, but you still verify.",
      },
    ],
    exercises: [
      {
        kind: "choice",
        id: "q1",
        prompt: "The AI's explanation of photosynthesis is too advanced. Best next step?",
        options: [
          "Give up on AI",
          "Ask: \"Explain it again for a 9th grader using a kitchen analogy.\"",
          "Copy it anyway",
          "Ask the same question again word for word",
        ],
        answer: 1,
        explain: "A specific follow-up with a reading level and an analogy steers it toward what you need.",
      },
      {
        kind: "truefalse",
        id: "q2",
        statement: "Giving the AI an example of the style you want is called few-shot prompting.",
        answer: true,
        explain: "\"Shots\" are examples. Zero-shot means no examples.",
      },
      {
        kind: "order",
        id: "q3",
        prompt: "Order a smart iteration loop.",
        tiles: ["Ask a clear first prompt", "Read the answer critically", "Ask a targeted follow-up", "Verify key facts yourself", "Paste it into your assignment unread"],
        answer: [0, 1, 2, 3],
        explain: "Reading critically and verifying are the steps that turn AI output into learning.",
      },
      {
        kind: "choice",
        id: "q4",
        prompt: "Which follow-up best helps you find gaps in an AI summary?",
        options: [
          "\"Great job!\"",
          "\"What important points or counterarguments did this summary leave out?\"",
          "\"Make it longer.\"",
          "\"Use more emojis.\"",
        ],
        answer: 1,
        explain: "Asking what's missing pushes the model to surface omissions you can then check.",
      },
      {
        kind: "truefalse",
        id: "q5",
        statement: "If you ask the AI to check its own answer, you no longer need to verify it.",
        answer: false,
        explain: "Self-critique can help, but the model can also confirm its own mistakes. Check with real sources.",
      },
    ],
  },
  {
    id: "t3-verify",
    moduleId: "toolkit",
    title: "The verification lab",
    summary: "Catch fake citations and check claims with lateral reading.",
    minutes: 6,
    cards: [
      {
        title: "Lateral reading",
        body: "Fact-checkers don't just read one page closely. They open new tabs and check what other trusted sources say about a claim. Do the same with AI answers: confirm key facts in at least two reliable sources.",
      },
      {
        title: "Citations can be invented",
        body: "AI tools sometimes produce references that look real (authors, journals, page numbers) but don't exist. Always search for the source itself before you cite it.",
      },
    ],
    exercises: [
      {
        kind: "choice",
        id: "q1",
        prompt: "Spot the red flag in this AI answer.",
        passage: "\"Studies show students who nap learn 47% faster (Johnson & Lee, Journal of Teen Sleep Science, 2019, p. 212).\"",
        options: [
          "Nothing, it has a citation so it's verified",
          "A very precise statistic plus a citation you haven't confirmed exists",
          "It mentions sleep",
          "It's too short",
        ],
        answer: 1,
        explain: "Precise numbers and official-looking citations are exactly what hallucinations often look like. Search for the journal and article first.",
      },
      {
        kind: "order",
        id: "q2",
        prompt: "Order the steps to verify an AI claim.",
        tiles: ["Identify the key claim", "Search for the original source", "Compare with other trusted sources", "Decide whether to use it", "Trust it because it sounds smart"],
        answer: [0, 1, 2, 3],
        explain: "That's lateral reading in action.",
      },
      {
        kind: "match",
        id: "q3",
        prompt: "Match each source to how much you'd trust it for a science fact.",
        pairs: [
          ["Peer-reviewed journal article", "Strong, check it exists"],
          ["Government health agency site", "Strong for public data"],
          ["Anonymous social post", "Weak, needs confirmation"],
          ["AI chatbot answer alone", "A lead, not a source"],
        ],
        explain: "AI output is a starting point for research, never the final citation.",
      },
      {
        kind: "truefalse",
        id: "q4",
        statement: "If you can't find a cited article anywhere online or in a library database, you should not cite it.",
        answer: true,
        explain: "An unfindable source is a strong sign it was fabricated.",
      },
      {
        kind: "choice",
        id: "q5",
        prompt: "What is lateral reading?",
        options: [
          "Reading a page sideways",
          "Leaving the page to check what other trusted sources say",
          "Reading only the first and last paragraphs",
          "Reading faster than normal",
        ],
        answer: 1,
        explain: "Professional fact-checkers rely on it because it's fast and effective.",
      },
    ],
  },
  {
    id: "t4-ai-as-tutor",
    moduleId: "toolkit",
    title: "AI as a tutor, not a ghostwriter",
    summary: "Use AI to understand and practice, without outsourcing your thinking.",
    minutes: 4,
    cards: [
      {
        title: "Learning tasks vs. shortcut tasks",
        body: "AI helps learning when it quizzes you, explains a step you're stuck on, or gives feedback on your draft. It hurts learning when it does the thinking the assignment was designed to build.",
      },
      {
        title: "Ask for hints, not answers",
        body: "Try: \"Don't give me the answer. Give me a hint for the next step.\" You get unstuck and still build the skill the test will check.",
      },
    ],
    exercises: [
      {
        kind: "choice",
        id: "q1",
        prompt: "Which use builds your own skills the most?",
        options: [
          "\"Write my lab report.\"",
          "\"Here's my lab report draft. Point out unclear sections, but don't rewrite them.\"",
          "\"Solve all 20 problems.\"",
          "\"Summarize the book so I don't have to read it.\"",
        ],
        answer: 1,
        explain: "Feedback on your own work keeps you in charge of the thinking.",
      },
      {
        kind: "truefalse",
        id: "q2",
        statement: "Asking for a hint instead of the full answer is a good way to use AI on practice problems.",
        answer: true,
        explain: "Hints give you productive struggle, the part that builds memory.",
      },
      {
        kind: "match",
        id: "q3",
        prompt: "Tutor use or ghostwriter use?",
        pairs: [
          ["Quiz me on vocab", "Tutor"],
          ["Write my reflection for me", "Ghostwriter"],
          ["Explain why step 3 works", "Tutor"],
          ["Answer the take-home test", "Ghostwriter"],
        ],
        explain: "Tutor uses support learning. Ghostwriter uses replace it and often break school rules.",
      },
      {
        kind: "order",
        id: "q4",
        prompt: "Build a hint-only prompt.",
        tiles: ["I'm stuck on this algebra problem.", "Don't give me the answer.", "Give me a hint for the next step.", "Just solve it."],
        answer: [0, 1, 2],
        explain: "Context, a boundary, then a precise request.",
      },
      {
        kind: "choice",
        id: "q5",
        prompt: "Before using AI on an assignment, what should you check first?",
        options: [
          "Which AI is the most popular",
          "Your teacher's or school's AI-use policy for that assignment",
          "Whether your friends used it",
          "How fast the AI responds",
        ],
        answer: 1,
        explain: "Rules vary by class and assignment. When in doubt, ask.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Module 3 — AI Ethics & Integrity                                     */
/* ------------------------------------------------------------------ */

const ethics: Lesson[] = [
  {
    id: "e1-integrity",
    moduleId: "ethics",
    title: "Academic integrity",
    summary: "School AI policies, disclosure, and the honest way to get help.",
    minutes: 4,
    cards: [
      {
        title: "Policies differ",
        body: "Some assignments allow AI for brainstorming, some for editing, some not at all. Presenting AI-generated work as your own when it isn't allowed is academic dishonesty, just like copying a classmate.",
      },
      {
        title: "Disclose what you used",
        body: "When AI is allowed, be transparent: say which tool you used, what you asked, and how you used the output. A short disclosure note protects your credibility.",
      },
    ],
    exercises: [
      {
        kind: "choice",
        id: "q1",
        prompt: "Your teacher allows AI for brainstorming only. What's honest?",
        options: [
          "Use AI to write the essay, then change a few words",
          "Use AI to list possible topics, then write the essay yourself and note that you used AI for brainstorming",
          "Don't mention AI at all",
          "Ask a friend to rewrite the AI essay",
        ],
        answer: 1,
        explain: "Stay inside the allowed use and disclose it.",
      },
      {
        kind: "truefalse",
        id: "q2",
        statement: "Rewording an AI-written essay makes it your original work.",
        answer: false,
        explain: "The ideas and structure still came from the AI. Disguising them is dishonest.",
      },
      {
        kind: "order",
        id: "q3",
        prompt: "Order a good AI disclosure statement.",
        tiles: ["I used ChatGPT", "to brainstorm three possible thesis statements.", "I chose one and wrote all paragraphs myself.", "AI wrote most of this."],
        answer: [0, 1, 2],
        explain: "Name the tool, the purpose, and what you did yourself.",
      },
      {
        kind: "choice",
        id: "q4",
        prompt: "You're unsure whether AI is allowed on a project. Best move?",
        options: [
          "Assume yes",
          "Assume no and never use AI again",
          "Ask your teacher before you start",
          "Use it and hope no one notices",
        ],
        answer: 2,
        explain: "Asking first is always the safe and honest choice.",
      },
      {
        kind: "truefalse",
        id: "q5",
        statement: "AI detectors are always accurate, so they're the main reason to be honest.",
        answer: false,
        explain: "Detectors make mistakes in both directions. Integrity is about your learning and trust, not about getting caught.",
      },
    ],
  },
  {
    id: "e2-citing-ai",
    moduleId: "ethics",
    title: "Citing AI",
    summary: "How MLA and APA suggest citing generative AI, and keeping a prompt log.",
    minutes: 4,
    cards: [
      {
        title: "Cite the tool and the prompt",
        body: "MLA and APA both publish guidance for citing generative AI. In general, you name the tool, the company, the date, and describe the prompt you used. Check the current guide your teacher requires.",
      },
      {
        title: "Keep a prompt log",
        body: "Save your prompts and the parts of the output you used. If anyone asks how AI shaped your work, you can show them.",
      },
    ],
    exercises: [
      {
        kind: "choice",
        id: "q1",
        prompt: "Which details does an AI citation usually include?",
        options: [
          "Only your name",
          "The tool, its maker, the date, and a description of your prompt",
          "Just the website URL",
          "The AI's favorite color",
        ],
        answer: 1,
        explain: "Exact formats differ by style guide, but these are the common pieces.",
      },
      {
        kind: "truefalse",
        id: "q2",
        statement: "You should cite the original sources an AI mentions, after confirming they exist, instead of citing only the AI.",
        answer: true,
        explain: "AI is not a primary source. Find, read, and cite the real source.",
      },
      {
        kind: "match",
        id: "q3",
        prompt: "Match each item to its purpose.",
        pairs: [
          ["Prompt log", "Shows exactly what you asked"],
          ["Disclosure note", "Explains how AI was used"],
          ["Works cited entry", "Credits the tool formally"],
        ],
        explain: "Together they make your process transparent.",
      },
      {
        kind: "choice",
        id: "q4",
        prompt: "An AI gives you a quote from a famous scientist. What should you do?",
        options: [
          "Cite the AI as the source of the quote",
          "Find the quote in a reliable original source before using it",
          "Use it and add quotation marks",
          "Change the scientist's name",
        ],
        answer: 1,
        explain: "AI tools often misattribute or invent quotes.",
      },
      {
        kind: "truefalse",
        id: "q5",
        statement: "Citation rules for AI are the same in every class and never change.",
        answer: false,
        explain: "Style guides update their guidance, and teachers may have their own rules.",
      },
    ],
  },
  {
    id: "e3-bias",
    moduleId: "ethics",
    title: "Bias and fairness",
    summary: "How bias enters AI systems and what responsible builders do about it.",
    minutes: 5,
    cards: [
      {
        title: "Bias comes from people and data",
        body: "If training data over-represents some groups or reflects past unfair decisions, a model can repeat those patterns: for example, a resume screener that favors one gender because past hires did.",
      },
      {
        title: "Fairness takes testing",
        body: "Responsible teams test how a model performs for different groups, publish its limits, and keep humans involved in high-stakes decisions like hiring, loans, or school discipline.",
      },
    ],
    exercises: [
      {
        kind: "choice",
        id: "q1",
        prompt: "A face-recognition system works worse on darker skin tones. A likely cause?",
        options: [
          "Cameras can't photograph dark colors",
          "Training data had fewer images of people with darker skin",
          "The software is sleepy",
          "Bias is impossible in computers",
        ],
        answer: 1,
        explain: "Research has documented exactly this pattern when datasets were unbalanced.",
      },
      {
        kind: "truefalse",
        id: "q2",
        statement: "Because computers use math, AI decisions are automatically neutral.",
        answer: false,
        explain: "Math applied to biased data produces biased results.",
      },
      {
        kind: "match",
        id: "q3",
        prompt: "Match the problem to a fix.",
        pairs: [
          ["Unbalanced training data", "Collect more representative examples"],
          ["High-stakes decision", "Keep a human in the loop"],
          ["Unknown weaknesses", "Test results across groups"],
        ],
        explain: "No single fix solves bias; it takes several.",
      },
      {
        kind: "choice",
        id: "q4",
        prompt: "You ask an image AI for \"a scientist\" and every result looks the same. What's the best response?",
        options: [
          "Assume that's what all scientists look like",
          "Notice the pattern, and prompt for diversity or question the output",
          "Stop using images",
          "Report yourself",
        ],
        answer: 1,
        explain: "Noticing and questioning stereotypes in outputs is a core AI-literacy skill.",
      },
      {
        kind: "truefalse",
        id: "q5",
        statement: "Using AI for decisions about people, like hiring or grading, needs extra care.",
        answer: true,
        explain: "Errors there can unfairly affect people's lives.",
      },
    ],
  },
  {
    id: "e4-privacy-impact",
    moduleId: "ethics",
    title: "Privacy, deepfakes, and you",
    summary: "What not to share, how to spot synthetic media, and writing your AI code.",
    minutes: 5,
    cards: [
      {
        title: "What you type may be stored",
        body: "Many AI tools keep conversations and may use them to improve their models, depending on the tool's terms and settings. Don't paste personal details, passwords, or other people's private information.",
      },
      {
        title: "Synthetic media is convincing",
        body: "AI can create realistic fake images, voices, and videos (deepfakes). Check the source, look for the original, and be careful before sharing something shocking. Creating deepfakes of real people without consent can cause real harm.",
      },
    ],
    exercises: [
      {
        kind: "choice",
        id: "q1",
        prompt: "Which is safe to paste into a public AI chatbot?",
        options: [
          "Your friend's private messages",
          "Your password, to \"check if it's strong\"",
          "A paragraph of your own essay draft",
          "Your full name, address, and school schedule",
        ],
        answer: 2,
        explain: "Your own non-sensitive schoolwork is generally fine, if your class allows AI. Never share secrets or other people's private data.",
      },
      {
        kind: "truefalse",
        id: "q2",
        statement: "A viral video showing a celebrity saying something shocking could be AI-generated.",
        answer: true,
        explain: "Check whether trusted news outlets or the person's official channels confirm it.",
      },
      {
        kind: "order",
        id: "q3",
        prompt: "Order what to do before sharing a surprising image.",
        tiles: ["Pause before reacting", "Check who posted it originally", "Look for trusted coverage", "Share only if confirmed", "Share it first, check later"],
        answer: [0, 1, 2, 3],
        explain: "Pausing is the most underrated media-literacy skill.",
      },
      {
        kind: "match",
        id: "q4",
        prompt: "Match each concern to the right action.",
        pairs: [
          ["Tool stores chats", "Read the privacy settings"],
          ["Suspected deepfake", "Find the original source"],
          ["Friend's photo", "Ask consent before editing it with AI"],
        ],
        explain: "Privacy and consent apply to other people, not just you.",
      },
      {
        kind: "choice",
        id: "q5",
        prompt: "What belongs in a personal AI code of ethics?",
        options: [
          "\"I'll use AI however I want.\"",
          "\"I'll follow class AI rules, disclose my use, verify facts, and protect privacy.\"",
          "\"I'll never think about AI.\"",
          "\"I'll only use AI when no one is watching.\"",
        ],
        answer: 1,
        explain: "Write your own version. It's the capstone of this course.",
      },
    ],
  },
];

export const modules: Module[] = [
  {
    id: "foundations",
    title: "How AI Works",
    tagline: "From data to predictions",
    description:
      "What AI is and isn't, how machines learn from data, what happens inside a chatbot, and where today's systems fall short.",
    color: "ink",
    lessons: foundations,
    sources: [
      { label: "AI4K12: Five Big Ideas in AI", url: "https://ai4k12.org/" },
      { label: "UNESCO AI Competency Framework for Students (2024)", url: "https://www.unesco.org/en/articles/ai-competency-framework-students" },
      { label: "Day of AI (MIT RAISE)", url: "https://www.dayofai.org/" },
    ],
  },
  {
    id: "toolkit",
    title: "Using AI Well",
    tagline: "Prompt, iterate, verify",
    description:
      "Practical techniques for school: writing clear prompts, refining answers, catching fabricated sources, and using AI as a tutor instead of a shortcut.",
    color: "spark",
    lessons: toolkit,
    sources: [
      { label: "AI Literacy Framework (European Commission & OECD)", url: "https://ailiteracyframework.org/" },
      { label: "Stanford History Education Group / Digital Inquiry Group: lateral reading", url: "https://cor.inquirygroup.org/" },
      { label: "TeachAI toolkit", url: "https://www.teachai.org/" },
    ],
  },
  {
    id: "ethics",
    title: "AI Ethics & Integrity",
    tagline: "Honest, fair, and safe",
    description:
      "Academic integrity, citing AI, bias and fairness, privacy, and deepfakes, ending with your own code for using AI responsibly.",
    color: "leaf",
    lessons: ethics,
    sources: [
      { label: "MLA Style Center: citing generative AI", url: "https://style.mla.org/citing-generative-ai/" },
      { label: "APA Style: how to cite ChatGPT", url: "https://apastyle.apa.org/blog/how-to-cite-chatgpt" },
      { label: "UNESCO Guidance for Generative AI in Education and Research", url: "https://www.unesco.org/en/digital-education/artificial-intelligence" },
      { label: "Common Sense Education: AI literacy lessons", url: "https://www.commonsense.org/education/collections/ai-literacy-lessons-for-grades-6-12" },
    ],
  },
];

export const allLessons: Lesson[] = modules.flatMap((m) => m.lessons);

export function getModule(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

export function getLesson(id: string): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

export function totalExercises(): number {
  return allLessons.reduce((n, l) => n + l.exercises.length, 0);
}
