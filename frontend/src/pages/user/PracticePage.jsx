import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import '../../styles/PracticePage.css';
import typingImg from '../../assets/typing.jpeg'; 
import handsImg from '../../assets/hands.png';
import hrFingersImg from '../../assets/hr fingers.png';
import ugFingersImg from '../../assets/ug fingers.png';
import { handsPngFingerPositions } from './FingerPositions';


const typingTestContent = {
  "Aesop's fables": {
    title: "Aesop",
    text: "Aesop was one of the great Greek writers. He is best known for his fables, stories that have a moral. They teach us something about how we should live our lives. Aesop wrote thousands of these stories. Here are a few.\n\nThe Wolf in Sheep's Clothing\n\nOnce upon a time, a Wolf decided to disguise the way he looked. He thought it would help him get food more"
  },
  "Astronauts": {
    title: "Astronaut",
    text: "The term \"astronaut\" comes from the Greek words for \"star\" and \"sailor.\" Men and women like Alan Shepard, John Glenn, Jr., and Sally Ride have inspired generations with courage, curiosity, and adventure. They are modern explorers, helping humanity reach beyond our planet.\n\nWhen the U.S. space program officially started in 1959, only seven astronauts existed nationwide. All were"
  },
  "Behind the scene: Movie credits": {
    title: "Movie Credits",
    text: "The credits at the end of a movie are often ignored, but they represent the hard work of hundreds or even thousands of people. From the director and lead actors to the catering staff and digital effects artists, everyone plays a role in bringing a film to life."
  },
  "DNA Research -- the Human Genome Project": {
    title: "DNA",
    text: "The Human Genome Project was an international scientific research project with the goal of determining the sequence of nucleotide base pairs that make up human DNA, and of mapping all of the genes of the human genome from both a physical and a functional standpoint."
  },
  "Fairy Tales/The Emperor's New Clothes (adapted)": {
    title: "The Emperor",
    text: "Many years ago, there was an Emperor, who was so excessively fond of new clothes, that he spent all his money in dress. He did not trouble himself in the least about his soldiers; nor did he care to go to the theater, or the chase, except for the opportunities then afforded him for displaying his new clothes."
  },
  "History of Photography": {
    title: "Photography",
    text: "The word photography comes from two Greek words that mean writing with light. The first time the word was used was in 1839, the year the invention of the photographic process was made public. Photography is a method of recording images by the action of light, or related radiation, on a sensitive material. Joseph Nicephore Niepce, a French inventor, is credited with making the first permanent photograph in 1826 or 1827."
  },
  "Hubble Space Telescope": {
    title: "Hubble",
    text: "Scientists can see better with Hubble than with any telescope on the ground because Hubble travels above the atmosphere. On Earth, the atmosphere makes pictures taken by visible-light telescopes look smeary – clouds, precipitation, and atmospheric temperature changes get in the way. But in the near vacuum of space, Hubble can take very clear, crisp pictures -- no clouds or atmosphere exist between it and the star or galaxy it's observing."
  },
  "Legends of Abraham Lincoln": {
    title: "Lincoln",
    text: "Abraham Lincoln is one of the United States' best-known presidents. We know a great deal about him, both as a man and as a leader. He grew up in a log cabin. He was very honest. He was president during the Civil War, and he helped end slavery at that time. What's more interesting, though, are some of the stories told about him. Many of these are true. Others have become tall tales or legends."
  },
  "Netiquette": {
    title: "Netiquette",
    text: "Netiquette is a combination of the words network and etiquette and is defined as a set of rules for acceptable online behavior. Similarly, online ethics focuses on the acceptable use of online resources in an online social environment. When you use the internet, you are part of a global community. It is important to be respectful of others and to follow the rules of the community you are in."
  },
  "Professional Skills through Typing": {
    title: "Skills",
    text: "Typing is an essential skill for anyone who wants to work in an office or use a computer for work. It is important to be able to type quickly and accurately so that you can get your work done efficiently. There are many different ways to improve your typing skills, including taking typing tests and practicing on a regular basis. Developing good typing habits early on will help you in the long run."
  },
  "Speeding up the strategy process": {
    title: "Strategy",
    text: "In today's fast-paced business environment, the ability to rapidly develop and execute strategy is a key competitive advantage. Organizations that can shorten their strategy cycles are better positioned to respond to market changes and capitalize on new opportunities. This requires a shift from traditional, linear planning processes to more agile and iterative approaches that involve continuous learning and adaptation."
  },
  "Stinging Insects": {
    title: "Insects",
    text: "Many people are afraid of stinging insects like bees, wasps, and hornets. While their stings can be painful and, in some cases, dangerous for those with allergies, these insects play vital roles in our ecosystem. Bees are essential pollinators for many of the crops we rely on for food, while wasps and hornets help control populations of other insects that can be pests in gardens and farms."
  },
  "The Eight Tools for Creating New Value": {
    title: "Value",
    text: "Creating new value in a business context often involves the application of specific tools and methodologies. These eight tools provide a framework for identifying opportunities, developing innovative solutions, and delivering value to customers in new and meaningful ways. By mastering these tools, organizations can foster a culture of innovation and drive sustainable growth in increasingly competitive markets."
  },
  "The Importance of Touch Typing in Today's Jobs": {
    title: "Touch Typing",
    text: "In the digital age, touch typing has become a fundamental skill for many professions. The ability to type quickly and accurately without looking at the keyboard allows individuals to focus on the content of their work rather than the mechanics of data entry. This leads to increased productivity, reduced fatigue, and improved overall efficiency in a wide range of roles, from administrative positions to software development."
  },
  "The Life of Calamity Jane": {
    title: "Calamity Jane",
    text: "Martha Jane Canary, better known as Calamity Jane, was a well-known figure of the American Old West. She was a frontierswoman and professional scout who gained fame for her exploits in the Black Hills of South Dakota and her association with figures like Wild Bill Hickok. Calamity Jane was known for her sharpshooting, her preference for men's attire, and her colorful, often embellished stories of her own life."
  },
  "The Little Match Girl (adapted)": {
    title: "Match Girl",
    text: "It was terribly cold and nearly dark on the last evening of the old year, and the snow was falling fast. In the cold and the darkness, a poor little girl, with bare head and naked feet, roamed through the streets. She carried a quantity of matches in an old apron, and she held a bundle of them in her hand. Nobody had bought any of her matches during the whole long day, and no one had given her a single penny."
  },
  "The Tale of Peter Rabbit": {
    title: "The Tale of Peter Rabbit",
    text: "Once upon a time there were four little Rabbits, and their names were—Flopsy, Mopsy, Cotton-tail, and Peter. They lived with their Mother in a sand-bank, underneath the root of a very big fir-tree. 'Now, my dears,' said old Mrs. Rabbit one morning, 'you may go into the fields or down the lane, but don't go into Mr. McGregor's garden: your Father had an accident there; he was put in a pie by Mrs. McGregor.' 'Now run along, and don't get into mischief. I am going out.' Then old Mrs. Rabbit took a basket and her umbrella, and went through the wood to the baker's. She bought a loaf of brown bread and five currant buns. Flopsy, Mopsy, and Cotton-tail, who were good little bunnies, went down the lane to gather blackberries; but Peter, who was very naughty, ran straight away to Mr. McGregor's garden, and squeezed under the gate!"
  },
  "The Warlord": {
    title: "The Warlord",
    text: "The Warlord stood atop the rugged cliff, his eyes scanning the horizon where the sun began its slow descent. His armor, scarred by countless battles, reflected the orange hue of the fading light. Below, his army waited in silence, a sea of steel and determination. They had marched for weeks through treacherous terrain, driven by a singular purpose: to reclaim the lost city of Aethelgard. The wind howled through the mountain passes, carrying with it the scent of impending snow. He knew the coming night would be long, but his resolve was unshakable. The history of his people rested on his shoulders, and he would not falter."
  },
  "Thoughts of Benjamin Franklin": {
    title: "Thoughts of Benjamin Franklin",
    text: "Benjamin Franklin believed that good writing should be smooth, clear, and short. In his autobiography, he describes how he taught himself to write more elegantly by imitating the style of the Spectator. He would take a piece of writing he admired, make short notes on the sentiment of each sentence, and then lay them aside for a few days. Later, he would try to rewrite the passage in his own words, comparing his version with the original to discover his faults. This method helped him develop a style that was remarkably simple yet expressive, a characteristic that defined his many contributions to science, politics, and literature."
  },
  "Touch Typing – A Modern Essential Skill": {
    title: "Touch Typing – A Modern Essential Skill",
    text: "Touch typing is the ability to type without looking at the keyboard, relying on muscle memory to find the keys. In today's digital age, it has become an essential skill for professionals in almost every field. Journalists, programmers, and administrative staff all benefit from the increased speed and accuracy that touch typing provides. By using all ten fingers and maintaining a correct home row position, a typist can keep up with their thoughts, often reaching speeds of sixty to eighty words per minute. This efficiency not only saves time but also reduces physical strain, making it a valuable asset for anyone who spends significant time at a computer."
  },
  "What is a cast?": {
    title: "What is a cast?",
    text: "A medical cast is a protective shell made of plaster or fiberglass that encases a limb to stabilize and hold anatomical structures, most often a broken bone, in place until healing is confirmed. It serves a similar function to a splint but provides more complete immobilization. Plaster casts are made from gauze bandages impregnated with plaster of Paris, which hardens when wet. Fiberglass casts are lighter, more durable, and more breathable than plaster. While wearing a cast, it is important to keep it dry and avoid inserting objects inside to scratch an itch, as this can lead to skin infections or other complications."
  },
  "Yosemite National Park": {
    title: "Yosemite National Park",
    text: "Yosemite National Park is located in the Sierra Nevada Mountains of central California, a setting so spectacular that naturalist John Muir called it a landscape that seems to be newly created. The park is famous for its giant, ancient sequoia trees, and for Tunnel View, the iconic outlook of towering Bridalveil Fall and the granite cliffs of El Capitan and Half Dome. Its geological history has been evolving for some five hundred million years, resulting in unique features like hanging valleys, many waterfalls, and polished domes. Approximately ninety-five percent of the park is designated wilderness, providing a sanctuary for a great variety of flora and fauna."
  },
  "Advanced Symbols: Coding Syntax": {
    title: "Code Syntax",
    text: "function calculateTotal(price, tax) { return price * (1 + tax); } const items = ['apple', 'banana', 'cherry']; for (let i = 0; i < items.length; i++) { console.log(`Item ${i}: ${items[i]}`); } if (total > 100) { applyDiscount(); } else { chargeShipping(); }"
  },
  "Advanced Symbols: Financial Data": {
    title: "Financial Data",
    text: "The quarterly revenue for Q3 2023 was $4,500,000.50, a 12.5% increase from Q2. Operating expenses totaled $2,100,000.00 (up 3.2%). Net profit margin: 15.8%. Key metrics: ROI = 18%, EBITDA = $1.2M. Stock price closed at $145.67 (+1.23). Please transfer $500.00 to account #9876-5432-10."
  },
  "Advanced Symbols: Math & Logic": {
    title: "Math & Logic",
    text: "Solve for x: 2x + 5 = 15. Therefore, x = (15 - 5) / 2 = 5. The area of a circle is A = πr^2. If r = 3, then A ≈ 3.14 * 3^2 = 28.26. Boolean logic: (True && False) || (True && True) = True. 10 < 20 and 5 >= 5. The set S = {1, 2, 3, 4, 5}."
  },
  "Advanced Symbols: Internet & URLs": {
    title: "Web URLs",
    text: "Visit our website at https://www.example.com/login?user=guest&lang=en. Email support at: help-desk@company.co.uk. Connect via FTP: ftp://files.server.net:21. Search query: 'typing practice' + 'symbols' - 'beginner'. #coding #tech @developer."
  },
  "Advanced Symbols: Passwords & Keys": {
    title: "Security Keys",
    text: "Strong passwords use a mix of characters: P@ssw0rd123!, Secure#Key$2024, and User_Name.API_Key: abcd-1234-efgh-5678. SSH-RSA key: AAAAB3NzaC1yc2E...==. Config: { 'debug': true, 'timeout': 5000, 'retries': 3 }. Don't share your PIN: ****."
  },
  "Advanced Symbols: Bibliographic Citations": {
    title: "Citations",
    text: "Smith, J. (2020). 'The Future of AI'. Journal of Tech, 12(3), 45-67. Doe, A. & Lee, B. (Eds.). (2019). Modern Computing (2nd ed.). New York, NY: Tech Press. Retrieved from http://www.journal.org/vol12/issue3. [Online]. Accessed: Jan 1, 2024."
  },
  "Advanced Symbols: Scientific Units": {
    title: "Science Units",
    text: "Water boils at 100°C (212°F) at 1 atm pressure. Density = 1.0 g/cm³. Speed of light c ≈ 3.00 x 10^8 m/s. Gravity g = 9.8 m/s². The reaction requires 50ml of H2SO4 and 25g of NaCl. Result: 15.5 ± 0.2 kg. Energy E = mc^2."
  }
};

const testTopics = [
  "Aesop's fables",
  "Astronauts",
  "Behind the scene: Movie credits",
  "DNA Research -- the Human Genome Project",
  "Fairy Tales/The Emperor's New Clothes (adapted)",
  "History of Photography",
  "Hubble Space Telescope",
  "Legends of Abraham Lincoln",
  "Netiquette",
  "Professional Skills through Typing",
  "Speeding up the strategy process",
  "Stinging Insects",
  "The Eight Tools for Creating New Value",
  "The Importance of Touch Typing in Today's Jobs",
  "The Life of Calamity Jane",
  "The Little Match Girl (adapted)",
  "The Tale of Peter Rabbit",
  "The Warlord",
  "Thoughts of Benjamin Franklin",
  "Touch Typing – A Modern Essential Skill",
  "What is a cast?",
  "Yosemite National Park",
  "Advanced Symbols: Coding Syntax",
  "Advanced Symbols: Financial Data",
  "Advanced Symbols: Math & Logic",
  "Advanced Symbols: Internet & URLs",
  "Advanced Symbols: Passwords & Keys",
  "Advanced Symbols: Bibliographic Citations",
  "Advanced Symbols: Scientific Units"
];

const normalizeTestText = (text) => {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const normalizeTypedTextForWords = (text) => {
  const s = String(text || '').replace(/\r\n/g, '\n').replace(/\u00A0/g, ' ');
  const endsWithSpace = /[\s\u00A0]$/.test(s);
  const collapsed = s.replace(/\s+/g, ' ').trim();
  if (!collapsed) return endsWithSpace ? ' ' : '';
  return endsWithSpace ? `${collapsed} ` : collapsed;
};

const hashText = (text) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const PracticePage = () => {
  const { lessonName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentLesson, setCurrentLesson] = useState(() => {
    const saved = localStorage.getItem('currentLesson');
    return saved ? parseInt(saved) : 1;
  });

  const [view, setView] = useState('intro'); // intro, overview, lesson_detail, slide_1, slide_2, slide_3, slide_4, slide_5, homerow_1, homerow_2, homerow_3
  const [pressedKey, setPressedKey] = useState(null);
  const [courseType, setCourseType] = useState(() => {
    return localStorage.getItem('courseType') || 'main';
  }); // 'main' or 'advanced'

  // Handle navigation from footer links or other places passing state
  useEffect(() => {
    if (location.state && location.state.level) {
      const { level } = location.state;
      
      // Clear location state to prevent re-triggering on refresh/back navigation if desired
      // But React Router handles history state well.
      // We'll just update our local state based on the request.
      
      if (level === 'Home Row') {
        setCourseType('main');
        setView('overview');
        // Reset to first lesson if coming from footer link
        setCurrentLesson(1);
      } else if (level === 'Numeric') {
        setCourseType('advanced');
        setView('overview');
        setCurrentLesson(1);
      } else if (level === 'Full Keyboard') {
        // Assuming Full Keyboard refers to Typing Test or just advanced practice
        // Given the options, Typing Test is the most "full keyboard" activity
        setView('typing_test_selection');
      }
      
      // Optional: clear state so it doesn't persist if we navigate away and back?
      // window.history.replaceState({}, document.title); 
      // But we are using React Router location, so modifying window history directly might be tricky with router.
      // We'll leave it for now.
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem('currentView', view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('currentLesson', currentLesson);
  }, [currentLesson]);

  useEffect(() => {
    localStorage.setItem('courseType', courseType);
  }, [courseType]);

  const lessons = useMemo(() => {
    if (courseType === 'advanced') {
      return [
        "Basic Punctuation Masterclass",
        "Number Row (Index Reaches)",
        "Number Row (Outer Reaches)",
        "The Symbol Row (Shift + 1-5)",
        "The Symbol Row (Shift + 6-0)",
        "Technical & Math Keys",
        "Brackets, Comparison & Tilde",
        "Comprehensive Review"
      ];
    }
    return [
      "The Home Row", "Keys E and I", "Keys R and U", "Keys T and O", 
      "Capital letters and period", "Keys C and comma", "Keys G H and apostrophe",
      "Keys V N and question mark", "Keys W and M", "Keys Q and P",
      "Keys B and Y", "Keys Z and X"
    ];
  }, [courseType]);

  useEffect(() => {
    if (currentLesson > lessons.length) {
      setCurrentLesson(1);
    }
  }, [currentLesson, lessons]);

  const effectiveLessonId = courseType === 'advanced' ? currentLesson + 12 : currentLesson;

  // --- Key Drill Logic ---
  const [drillState, setDrillState] = useState(() => localStorage.getItem('drillState') || 'info'); // info, practice, results
  useEffect(() => { localStorage.setItem('drillState', drillState); }, [drillState]);

  const [drillTimeLeft, setDrillTimeLeft] = useState(300); // 5 minutes in seconds
  const [drillInitialTime, setDrillInitialTime] = useState(300);
  const [drillHasStarted, setDrillHasStarted] = useState(false);
  const [drillAccuracyGoal, setDrillAccuracyGoal] = useState(94);
  const [drillCurrentPatternIndex, setDrillCurrentPatternIndex] = useState(0);
  const [drillInput, setDrillInput] = useState('');
  const [drillHistory, setDrillHistory] = useState({ correct: 0, errors: 0, total: 0 });
  const [, setDrillTotalTyped] = useState(0);
  const [, setDrillCompletedRows] = useState([]);
  const [drillLastActivity, setDrillLastActivity] = useState(() => Date.now());
  const [drillErrorKey, setDrillErrorKey] = useState(null);
  const [drillShowErrorX, setDrillShowErrorX] = useState(false);
  const [drillKeyStats, setDrillKeyStats] = useState({}); // { 'A': { errors: 0, backspaces: 0, totalDelay: 0, count: 0 } }
  const [drillLastKeyTime, setDrillLastKeyTime] = useState(null);
  const [drillStartTime, setDrillStartTime] = useState(null);
  const [drillEndTime, setDrillEndTime] = useState(null);
  const [drillTimeUsed, setDrillTimeUsed] = useState(0);

  // --- Word Drill Logic ---
  const [wordDrillState, setWordDrillState] = useState('info'); // info, practice, results
  const [wordDrillTimeLeft, setWordDrillTimeLeft] = useState(300); // 5 minutes in seconds
  const [wordDrillInitialTime, setWordDrillInitialTime] = useState(300);
  const [wordDrillHasStarted, setWordDrillHasStarted] = useState(false);
  const [wordDrillAccuracyGoal, setWordDrillAccuracyGoal] = useState(94);
  const [wordDrillCurrentPatternIndex, setWordDrillCurrentPatternIndex] = useState(0);
  const [wordDrillInput, setWordDrillInput] = useState('');
  const [wordDrillHistory, setWordDrillHistory] = useState({ correct: 0, errors: 0, total: 0 });
  const [wordDrillLastActivity, setWordDrillLastActivity] = useState(() => Date.now());
  const [wordDrillErrorKey, setWordDrillErrorKey] = useState(null);
  const [wordDrillShowErrorX, setWordDrillShowErrorX] = useState(false);
  const [wordDrillKeyStats, setWordDrillKeyStats] = useState({});
  const [wordDrillLastKeyTime, setWordDrillLastKeyTime] = useState(null);
  const [wordDrillStartTime, setWordDrillStartTime] = useState(null);
  const [wordDrillEndTime, setWordDrillEndTime] = useState(null);
  const [wordDrillTimeUsed, setWordDrillTimeUsed] = useState(0);

  // --- Sentence Drill Logic ---
  const [sentenceDrillState, setSentenceDrillState] = useState('info'); // info, practice, results
  const [sentenceDrillTimeLeft, setSentenceDrillTimeLeft] = useState(300); // 5 minutes in seconds
  const [sentenceDrillInitialTime, setSentenceDrillInitialTime] = useState(300);
  const [sentenceDrillHasStarted, setSentenceDrillHasStarted] = useState(false);
  const [sentenceDrillAccuracyGoal, setSentenceDrillAccuracyGoal] = useState(94);
  const [sentenceDrillCurrentPatternIndex, setSentenceDrillCurrentPatternIndex] = useState(0);
  const [sentenceDrillInput, setSentenceDrillInput] = useState('');
  const [sentenceDrillHistory, setSentenceDrillHistory] = useState({ correct: 0, errors: 0, total: 0 });
  const [sentenceDrillLastActivity, setSentenceDrillLastActivity] = useState(() => Date.now());
  const [sentenceDrillErrorKey, setSentenceDrillErrorKey] = useState(null);
  const [sentenceDrillShowErrorX, setSentenceDrillShowErrorX] = useState(false);
  const [sentenceDrillKeyStats, setSentenceDrillKeyStats] = useState({});
  const [sentenceDrillLastKeyTime, setSentenceDrillLastKeyTime] = useState(null);
  const [sentenceDrillStartTime, setSentenceDrillStartTime] = useState(null);
  const [sentenceDrillEndTime, setSentenceDrillEndTime] = useState(null);
  const [sentenceDrillTimeUsed, setSentenceDrillTimeUsed] = useState(0);

  // --- Paragraph Drill State ---
  const [paragraphDrillState, setParagraphDrillState] = useState('intro'); // intro, info, practice, results
  const [paragraphDrillTimeLeft, setParagraphDrillTimeLeft] = useState(300);
  const [paragraphDrillInitialTime, setParagraphDrillInitialTime] = useState(300);
  const [paragraphDrillHasStarted, setParagraphDrillHasStarted] = useState(false);
  const [paragraphDrillAccuracyGoal, setParagraphDrillAccuracyGoal] = useState(94);
  const [paragraphDrillCurrentPatternIndex, setParagraphDrillCurrentPatternIndex] = useState(0);
  const [paragraphDrillInput, setParagraphDrillInput] = useState('');
  const [paragraphDrillHistory, setParagraphDrillHistory] = useState({ correct: 0, errors: 0, total: 0 });
  const [paragraphDrillLastActivity, setParagraphDrillLastActivity] = useState(() => Date.now());
  const [paragraphDrillErrorKey, setParagraphDrillErrorKey] = useState(null);
  const [paragraphDrillShowErrorX, setParagraphDrillShowErrorX] = useState(false);
  const [paragraphDrillKeyStats, setParagraphDrillKeyStats] = useState({});
  const [paragraphDrillLastKeyTime, setParagraphDrillLastKeyTime] = useState(null);
  const [paragraphDrillStartTime, setParagraphDrillStartTime] = useState(null);
  const [paragraphDrillEndTime, setParagraphDrillEndTime] = useState(null);
  const [paragraphDrillTimeUsed, setParagraphDrillTimeUsed] = useState(0);
  const [paragraphDrillCompletedRows, setParagraphDrillCompletedRows] = useState([]);
  const [paragraphDrillRowInputs, setParagraphDrillRowInputs] = useState({}); // Stores actual input for each row to preserve colors
  const [paragraphDrillCompletedWords, setParagraphDrillCompletedWords] = useState([]); // Array of completed words for current row
  const [paragraphDrillCurrentWordInput, setParagraphDrillCurrentWordInput] = useState(''); // Current word input

  // --- Typing Test State ---
  const [selectedTestTopic, setSelectedTestTopic] = useState(() => {
    return localStorage.getItem('selectedTestTopic') || "Aesop's fables";
  });
  useEffect(() => {
    localStorage.setItem('selectedTestTopic', selectedTestTopic);
  }, [selectedTestTopic]);

  const [testDuration, setTestDuration] = useState(() => {
    return localStorage.getItem('testDuration') || '2 min.';
  });
  useEffect(() => {
    localStorage.setItem('testDuration', testDuration);
  }, [testDuration]);

  const [testInput, setTestInput] = useState('');
  const [testLockedTypedWords, setTestLockedTypedWords] = useState([]);
  const [testLockedCurrentWord, setTestLockedCurrentWord] = useState('');
  const [testForcedBreakAfterWord, setTestForcedBreakAfterWord] = useState({});
  const [committedParagraphs, setCommittedParagraphs] = useState([]); // Store history of typed paragraphs { target: '', typed: '' }
  const [completedStats, setCompletedStats] = useState({ chars: 0, correctChars: 0 }); // To accumulate stats across paragraphs
  const [testViewportStartWord, setTestViewportStartWord] = useState(0);

  const [testTimeLeft, setTestTimeLeft] = useState(120);
  const [testIsActive, setTestIsActive] = useState(false);
  const [testHasStarted, setTestHasStarted] = useState(false);
  const [testInitialTime, setTestInitialTime] = useState(120);
  const [testStartTime, setTestStartTime] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [testKeyStats, setTestKeyStats] = useState({}); // { 'A': { errors: 0, count: 0 } }
  const [generatedText, setGeneratedText] = useState('');
  const [testParagraphs, setTestParagraphs] = useState([]);
  const [testCurrentParagraphIndex, setTestCurrentParagraphIndex] = useState(0);

  // Combine all paragraphs into a single text stream
  const fullTestText = useMemo(() => {
    const topicData = typingTestContent[selectedTestTopic] || typingTestContent[testTopics[0]];
    const fallbackText = normalizeTestText(generatedText || topicData.text);
    if (!testParagraphs.length) return fallbackText;
    return normalizeTestText(testParagraphs.join(' '));
  }, [testParagraphs, generatedText, selectedTestTopic]);

  const testTotalWords = useMemo(() => fullTestText.split(' ').filter(Boolean), [fullTestText]);

  const courseColor = courseType === 'advanced' ? '#009688' : '#1a73e8';
  const lightCourseColor = courseType === 'advanced' ? '#e0f2f1' : '#e8f0fe';
  const gradientStart = courseType === 'advanced' ? '#b2dfdb' : '#bbdefb';
  const sidebarBg = courseType === 'advanced' ? '#f1f8f7' : '#f0f7ff';
  const mainBg = courseType === 'advanced' ? '#f8fdfc' : '#f8fbff';
  const [completedTests, setCompletedTests] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Refs for tracking test state across effects and unmounts ---
  const testStateRef = useRef({ testIsActive, testHasStarted, testInput, selectedTestTopic, testInitialTime, testTimeLeft });
  
  useEffect(() => {
    testStateRef.current = { testIsActive, testHasStarted, testInput, selectedTestTopic, testInitialTime, testTimeLeft };
  }, [testIsActive, testHasStarted, testInput, selectedTestTopic, testInitialTime, testTimeLeft]);

  // Handle saving test on unmount if it was active
  useEffect(() => {
    return () => {
      const state = testStateRef.current;
      if (state.testIsActive && state.testInput.length > 0) {
        // Calculate results for the interrupted test
        const timeUsedMinutes = (state.testInitialTime - state.testTimeLeft) / 60 || 1/60;
        const grossWpm = Math.round((state.testInput.length / 5) / timeUsedMinutes);
        
        const topicData = typingTestContent[state.selectedTestTopic] || typingTestContent[testTopics[0]];
        const targetText = topicData.text;
        let correctChars = 0;
        const minLen = Math.min(targetText.length, state.testInput.length);
        for (let i = 0; i < minLen; i++) {
          if (targetText[i] === state.testInput[i]) correctChars++;
        }
        const accuracy = state.testInput.length > 0 ? Math.round((correctChars / state.testInput.length) * 100) : 0;
        const netWpm = Math.round((grossWpm * accuracy) / 100);

        const token = localStorage.getItem('token');
        if (token) {
          fetch('http://localhost:5000/api/practice/results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            },
            body: JSON.stringify({
              type: 'typing-test',
              level: `Typing Test: ${state.selectedTestTopic}`,
              wpm: netWpm,
              accuracy: accuracy
            }),
            keepalive: true
          }).catch(err => console.error('Error saving on unmount:', err));
        }
      }
    };
  }, []);

  const testTopicGenRef = useRef({
    topic: null,
    tokens: [],
    transitions: null,
    startTokens: [],
    keywords: [],
    pools: null,
    needs: null,
    usedHashes: null,
    seed: 1
  });



  const initTestTopicGenerator = (topic, rawText, existingParagraphs) => {
    const normalized = normalizeTestText(rawText);
    const topicTokens = String(topic || '').toLowerCase().match(/[a-z0-9]+/g) || [];
    const spaceTokens = normalized.length ? normalized.split(' ').filter(Boolean) : [];
    const alphaTokens = normalized.toLowerCase().match(/[a-z0-9]+(?:'[a-z0-9]+)?/g) || [];

    const stop = new Set([
      'a','an','and','are','as','at','be','but','by','can','could','did','do','does','for','from','had','has','have','he','her','hers','him','his','how','i','if','in','into','is','it','its','just','like','may','me','more','most','my','no','not','of','on','one','or','our','out','said','she','so','some','than','that','the','their','them','then','there','these','they','this','those','to','too','up','us','was','we','were','what','when','where','which','who','will','with','would','you','your'
    ]);

    const freq = new Map();
    for (const t of [...topicTokens, ...alphaTokens]) {
      if (!t || t.length < 4) continue;
      if (stop.has(t)) continue;
      freq.set(t, (freq.get(t) || 0) + 1);
    }
    const keywords = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([w]) => w)
      .slice(0, 48);

    const endsSentence = (tok) => tok === '.' || tok === '!' || tok === '?' || /[.!?]$/.test(tok);
    const transitions = new Map();
    for (let i = 0; i < spaceTokens.length - 1; i++) {
      const a = spaceTokens[i];
      const b = spaceTokens[i + 1];
      if (!transitions.has(a)) transitions.set(a, []);
      transitions.get(a).push(b);
    }
    const startTokens = [];
    let atStart = true;
    for (const tok of spaceTokens) {
      if (atStart) startTokens.push(tok);
      atStart = endsSentence(tok);
    }

    const pools = {
      numbers: spaceTokens.filter((t) => /\d/.test(t)),
      operators: spaceTokens.filter((t) => /(\+\+|--|==|!=|<=|>=|&&|\|\||[+\-*/=<>])/.test(t)),
      symbols: spaceTokens.filter((t) => /[!@#$%^&*()[\]{}<>]/.test(t)),
      punctuation: spaceTokens.filter((t) => /[.,;:!?]/.test(t))
    };
    const needs = {
      digits: /\d/.test(normalized),
      operators: /(\+\+|--|==|!=|<=|>=|&&|\|\||[+\-*/=<>])/.test(normalized),
      symbols: /[!@#$%^&*()[\]{}<>]/.test(normalized),
      punctuation: /[.,;:!?]/.test(normalized)
    };

    const usedHashes = new Set((existingParagraphs || []).map((p) => hashText(String(p || ''))));
    testTopicGenRef.current = {
      topic,
      tokens: spaceTokens,
      transitions,
      startTokens: startTokens.length ? startTokens : spaceTokens.slice(0, 25),
      keywords,
      pools,
      needs,
      usedHashes,
      seed: ((hashText(`${topic}||${normalized}`) ^ (Date.now() >>> 0)) >>> 0) || 1
    };
  };

  const generateMoreTopicParagraphs = (count) => {
    const gen = testTopicGenRef.current;
    if (!gen?.tokens?.length || !gen.usedHashes) return [];

    const rng = mulberry32(gen.seed);
    const tokens = gen.tokens;
    const transitions = gen.transitions || new Map();
    const startTokens = gen.startTokens?.length ? gen.startTokens : tokens;
    const pools = gen.pools || { numbers: [], operators: [], symbols: [], punctuation: [] };
    const needs = gen.needs || { digits: false, operators: false, symbols: false, punctuation: false };
    const next = [];

    const makeParagraph = () => {
      const pick = (arr) => arr[Math.floor(rng() * arr.length)];
      const length = 90 + Math.floor(rng() * 90);
      const out = [];
      let tok = pick(startTokens);

      for (let i = 0; i < length; i++) {
        out.push(tok);
        const nexts = transitions.get(tok);
        tok = nexts?.length ? pick(nexts) : pick(tokens);
      }

      let text = out.join(' ').replace(/\s+/g, ' ').trim();
      text = text
        .replace(/\s+([,.;:!?])/g, '$1')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')')
        .replace(/\[\s+/g, '[')
        .replace(/\s+\]/g, ']')
        .replace(/\{\s+/g, '{')
        .replace(/\s+\}/g, '}');

      if (needs.digits && !/\d/.test(text)) {
        const insert = pools.numbers.length ? pick(pools.numbers) : String(1 + Math.floor(rng() * 999));
        text = `${insert} ${text}`;
      }
      if (needs.operators && !/(\+\+|--|==|!=|<=|>=|&&|\|\||[+\-*/=<>])/.test(text)) {
        const insert = pools.operators.length ? pick(pools.operators) : '=';
        text = `${text} ${insert}`;
      }
      if (needs.symbols && !/[!@#$%^&*()[\]{}<>]/.test(text)) {
        const insert = pools.symbols.length ? pick(pools.symbols) : '( )';
        text = `${text} ${insert}`;
      }
      if (!/[.!?]$/.test(text)) text += '.';
      if (!text.length) return '';
      return text[0].toUpperCase() + text.slice(1);
    };

    let safety = 0;
    while (next.length < count && safety < count * 40) {
      safety++;
      const para = makeParagraph();
      if (!para) continue;
      const key = hashText(para);
      if (gen.usedHashes.has(key)) continue;
      gen.usedHashes.add(key);
      next.push(para);
    }

    gen.seed = (gen.seed + next.length + 1) >>> 0;
    return next;
  };

  // Review Difficult Keys State
  const [reviewProgress, setReviewProgress] = useState(0);
  const [reviewInput, setReviewInput] = useState('');
  const [reviewPatterns, setReviewPatterns] = useState([]);
  const [reviewPatternIndex, setReviewPatternIndex] = useState(0);
  const [reviewShowError, setReviewShowError] = useState(false);
  const [reviewStartTime, setReviewStartTime] = useState(null);
  const [reviewEndTime, setReviewEndTime] = useState(null);

  const [practiceState, setPracticeState] = useState({
    currentIndex: 0,
    feedback: null, // 'great', 'error'
    errorKey: null
  });

  // --- Timer Refs for activity tracking ---
  const drillLastActivityRef = useRef(Date.now());
  const wordDrillLastActivityRef = useRef(Date.now());
  const sentenceDrillLastActivityRef = useRef(Date.now());
  const paragraphDrillLastActivityRef = useRef(Date.now());

  // Sync view with URL
  useEffect(() => {
    if (!lessonName) {
      setView('intro');
      return;
    }

    const decodedName = decodeURIComponent(lessonName).toLowerCase();
    
    // Helper to reset all drills
    const resetDrills = () => {
        setDrillCurrentPatternIndex(0);
        setDrillInput('');
        setDrillHasStarted(false);
        setWordDrillCurrentPatternIndex(0);
        setWordDrillInput('');
        setWordDrillHasStarted(false);
        setSentenceDrillCurrentPatternIndex(0);
        setSentenceDrillInput('');
        setSentenceDrillHasStarted(false);
        setParagraphDrillCurrentPatternIndex(0);
        setParagraphDrillInput('');
        setParagraphDrillHasStarted(false);
        setParagraphDrillCompletedRows([]);
        setParagraphDrillRowInputs({});
        setParagraphDrillCompletedWords([]);
        setParagraphDrillCurrentWordInput('');
        setParagraphDrillHistory({ correct: 0, errors: 0, total: 0 });
    };

    // Mapping URL to view
    if (decodedName === 'overview') setView('overview');
    else if (decodedName.startsWith('lesson-')) {
        const lessonNum = parseInt(decodedName.split('-')[1]);
        if (lessonNum >= 1 && lessonNum <= 19) {
            if (currentLesson !== lessonNum) resetDrills();
            setCurrentLesson(lessonNum);
            setView('lesson_detail');
        }
    }
    else if (decodedName === 'touch typing basics') setView('slide_1');
    else if (decodedName === 'new keys: home row') setView('homerow_1');
    else if (decodedName.startsWith('new keys:') || decodedName.includes('capital letters') || ['basic punctuation', 'number row (index)', 'number row (outer)', 'symbols row (1-5)', 'symbols row (6-0)', 'technical & math', 'brackets & comparison'].includes(decodedName)) {
        // This is a bit generic but helps with lesson intros
        setView('lesson_intro');
    }
    else if (decodedName === 'understanding results') setView('results_1');
    else if (decodedName === 'key drill') {
        setDrillState('info');
        setView('key_drill');
    }
    else if (decodedName === 'tip: typing tests (online)') setView('slide_5');
    else if (decodedName === 'word drill') {
        setWordDrillState('info');
        setView('word_drill');
    }
    else if (decodedName === 'sentence drill') {
        setSentenceDrillState('info');
        setView('sentence_drill');
    }
    else if (decodedName === 'paragraph drill') {
        setParagraphDrillState('intro');
        setView('paragraph_drill');
    }
    else if (decodedName === 'typing-test-practice') setView('typing_test_practice');
    else if (decodedName === 'typing-test') setView('typing_test_selection');
    else if (decodedName === 'review difficult keys') setView('review_difficult');
  }, [lessonName, currentLesson]);

  const startTypingTest = () => {
    const durationMap = {
      '1 min.': 60,
      '2 min.': 120,
      '3 min.': 180,
      '5 min.': 300,
      '10 min.': 600
    };
    const duration = durationMap[testDuration] || 120;
    
    // Set initial text
    const topicData = typingTestContent[selectedTestTopic] || typingTestContent[testTopics[0]];
    // Split by double newline for paragraphs, or single if no double newlines exist but text is long
    const rawText = topicData.text.replace(/\r\n/g, '\n');
    let paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // If we have very long paragraphs, split them further to ensure "extension" behavior
    const MAX_CHUNK_LENGTH = 400;
    const processedParagraphs = [];

    paragraphs.forEach(para => {
         if (para.length > MAX_CHUNK_LENGTH) {
             // Split by sentences or roughly by length
             const sentences = para.match(/[^.!?]+[.!?]+(\s+|$)/g) || [para];
             let currentChunk = '';
             
             sentences.forEach(sentence => {
                 if (currentChunk.length + sentence.length > MAX_CHUNK_LENGTH && currentChunk.length > 0) {
                     processedParagraphs.push(normalizeTestText(currentChunk));
                     currentChunk = sentence;
                 } else {
                     currentChunk += sentence;
                 }
             });
             if (currentChunk.trim().length > 0) processedParagraphs.push(normalizeTestText(currentChunk));
         } else {
             processedParagraphs.push(normalizeTestText(para));
         }
    });

    initTestTopicGenerator(selectedTestTopic, rawText, processedParagraphs);
    const minParagraphs = 80;
    const extra = Math.max(0, minParagraphs - processedParagraphs.length);
    const extraParagraphs = extra > 0 ? generateMoreTopicParagraphs(extra) : [];
    const allParagraphs = [...processedParagraphs, ...extraParagraphs];

    setTestParagraphs(allParagraphs);
    setTestCurrentParagraphIndex(0);
    setGeneratedText(allParagraphs[0]);

    setTestTimeLeft(duration);
    setTestInitialTime(duration);
    setTestInput('');
    setTestLockedTypedWords([]);
    setTestLockedCurrentWord('');
    setTestForcedBreakAfterWord({});
    setCommittedParagraphs([]);
    setCompletedStats({ chars: 0, correctChars: 0 });
    setTestIsActive(true);
    setTestHasStarted(false);
    setTestStartTime(null);
    setTestResults(null);
    setTestKeyStats({});
    setView('typing_test_practice');
    changeView('typing_test_practice');
  };

  useEffect(() => {
    if (!testIsActive) return;
    if (!testParagraphs.length) return;
    const remaining = testParagraphs.length - testCurrentParagraphIndex - 1;
    if (remaining >= 3) return;
    const more = generateMoreTopicParagraphs(18);
    if (!more.length) return;
    setTestParagraphs((prev) => [...prev, ...more]);
  }, [testCurrentParagraphIndex, testIsActive, testParagraphs.length]);

  // Helper to change view and URL
  const changeView = (newView, urlParam = null) => {
    if (urlParam) {
        navigate(`/practice/${encodeURIComponent(urlParam)}`);
    } else {
        // Map some internal views to friendly URLs
        const viewToUrl = {
            'intro': '',
            'overview': 'overview',
            'lesson_detail': `lesson-${currentLesson}`,
            'slide_1': 'touch typing basics',
            'homerow_1': 'new keys: home row',
            'lesson_intro': subLessonsData[effectiveLessonId]?.[0]?.title.toLowerCase() || 'lesson-intro',
            'results_1': 'understanding results',
            'key_drill': 'key drill',
            'slide_5': 'tip: typing tests (online)',
            'word_drill': 'word drill',
            'sentence_drill': 'sentence drill',
            'paragraph_drill': 'paragraph drill',
            'review_difficult': 'review difficult keys',
            'typing_test_selection': 'typing-test',
            'typing_test_practice': 'typing-test-practice'
        };
        
        const path = viewToUrl[newView];
        if (path !== undefined) {
            if (path === '') navigate('/practice');
            else navigate(`/practice/${encodeURIComponent(path)}`);
        } else {
            setView(newView);
        }
    }
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}sec`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs} min.`;
  };

  // Mock Data
  const subLessonsData = {
    1: [
      { id: 1.1, title: "Touch typing basics", duration: "3 min.", view: "slide_1" },
      { id: 1.2, title: "New keys: Home row", duration: "3 - 5 min.", view: "homerow_1" },
      { id: 1.3, title: "Understanding results", duration: "3 min.", view: "results_1" },
      { id: 1.4, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 1.5, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 1.6, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    2: [
      { id: 2.1, title: "New keys: E and I", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 2.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 2.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 2.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 2.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    3: [
      { id: 3.1, title: "New keys: R and U", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 3.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 3.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 3.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 3.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    4: [
      { id: 4.1, title: "New keys: T and O", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 4.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 4.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 4.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 4.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    5: [
      { id: 5.1, title: "Capital letters and period", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 5.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 5.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 5.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 5.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    6: [
      { id: 6.1, title: "New keys: C and comma", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 6.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 6.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 6.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 6.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    7: [
      { id: 7.1, title: "New keys: G, H and apostrophe", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 7.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 7.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 7.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 7.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    8: [
      { id: 8.1, title: "New keys: V, N and question mark", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 8.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 8.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 8.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 8.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    9: [
      { id: 9.1, title: "New keys: W and M", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 9.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 9.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 9.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 9.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    10: [
      { id: 10.1, title: "New keys: Q and P", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 10.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 10.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 10.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 10.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    11: [
      { id: 11.1, title: "New keys: B and Y", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 11.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 11.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 11.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 11.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    12: [
      { id: 12.1, title: "New keys: Z and X", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 12.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 12.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 12.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 12.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    13: [
      { id: 13.1, title: "Basic Punctuation", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 13.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 13.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 13.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 13.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    14: [
      { id: 14.1, title: "Number Row (Index)", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 14.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 14.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 14.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 14.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    15: [
      { id: 15.1, title: "Number Row (Outer)", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 15.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 15.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 15.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 15.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    16: [
      { id: 16.1, title: "Symbols Row (1-5)", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 16.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 16.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 16.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 16.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    17: [
      { id: 17.1, title: "Symbols Row (6-0)", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 17.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 17.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 17.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 17.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    18: [
      { id: 18.1, title: "Technical & Math", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 18.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 18.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 18.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 18.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    19: [
      { id: 19.1, title: "Brackets & Comparison", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 19.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 19.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 19.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 19.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ],
    20: [
      { id: 20.1, title: "Comprehensive Review", duration: "3 - 5 min.", view: "lesson_intro" },
      { id: 20.2, title: "Key drill", duration: "3 - 5 min.", view: "key_drill" },
      { id: 20.3, title: "Word drill", duration: "3 - 5 min.", view: "word_drill" },
      { id: 20.4, title: "Sentence drill", duration: "3 - 5 min.", view: "sentence_drill" },
      { id: 20.5, title: "Paragraph drill", duration: "3 - 5 min.", view: "paragraph_drill" }
    ]
  };

  const subLessons = subLessonsData[effectiveLessonId] || [];

  const practiceKeys = useMemo(() => {
    const baseKeys = [
      { key: 'A', finger: 'left little finger', color: 'blue', dotPos: { left: '23%', top: '25%' } },
      { key: 'S', finger: 'left ring finger', color: 'red', dotPos: { left: '26%', top: '23%' } },
      { key: 'D', finger: 'left middle finger', color: 'green', dotPos: { left: '32%', top: '18%' } },
      { key: 'F', finger: 'left index finger', color: 'purple', dotPos: { left: '38%', top: '22%' } },
      { key: 'SPACE', finger: 'thumb', color: 'grey', dotPos: { left: '60%', top: '65%' } },
      { key: 'J', finger: 'right index finger', color: 'purple', dotPos: { left: '62%', top: '22%' } },
      { key: 'K', finger: 'right middle finger', color: 'green', dotPos: { left: '68%', top: '18%' } },
      { key: 'L', finger: 'right ring finger', color: 'red', dotPos: { left: '74%', top: '23%' } },
      { key: ';', finger: 'right little finger', color: 'blue', dotPos: { left: '79%', top: '35%' } }
    ];

    if (effectiveLessonId >= 2) {
      baseKeys.push(
        { key: 'E', finger: 'left middle finger', color: 'green', dotPos: { left: '30%', top: '10%' } },
        { key: 'I', finger: 'right middle finger', color: 'green', dotPos: { left: '70%', top: '10%' } }
      );
    }
    if (effectiveLessonId >= 3) {
      baseKeys.push(
        { key: 'R', finger: 'left index finger', color: 'purple', dotPos: { left: '36%', top: '10%' } },
        { key: 'U', finger: 'right index finger', color: 'purple', dotPos: { left: '64%', top: '10%' } }
      );
    }
    if (effectiveLessonId >= 4) {
      baseKeys.push(
        { key: 'T', finger: 'left index finger', color: 'purple', dotPos: { left: '42%', top: '10%' } },
        { key: 'O', finger: 'right ring finger', color: 'red', dotPos: { left: '76%', top: '10%' } }
      );
    }
    if (effectiveLessonId >= 5) {
      baseKeys.push(
        { key: '.', finger: 'right ring finger', color: 'red', dotPos: { left: '76%', top: '45%' } },
        { key: 'SHIFT', finger: 'little finger', color: 'blue', dotPos: { left: '10%', top: '55%' } }
      );
    }
    if (effectiveLessonId >= 6) {
      baseKeys.push(
        { key: 'C', finger: 'left middle finger', color: 'green', dotPos: { left: '34%', top: '45%' } },
        { key: ',', finger: 'right middle finger', color: 'green', dotPos: { left: '70%', top: '45%' } }
      );
    }
    if (effectiveLessonId >= 7) {
      baseKeys.push(
        { key: 'G', finger: 'left index finger', color: 'purple', dotPos: { left: '44%', top: '22%' } },
        { key: 'H', finger: 'right index finger', color: 'purple', dotPos: { left: '56%', top: '22%' } },
        { key: "'", finger: 'right little finger', color: 'blue', dotPos: { left: '85%', top: '35%' } }
      );
    }
    if (effectiveLessonId >= 8) {
      baseKeys.push(
        { key: 'V', finger: 'left index finger', color: 'purple', dotPos: { left: '40%', top: '45%' } },
        { key: 'N', finger: 'right index finger', color: 'purple', dotPos: { left: '62%', top: '45%' } },
        { key: '?', finger: 'right little finger', color: 'blue', dotPos: { left: '82%', top: '45%' } }
      );
    }
    if (effectiveLessonId >= 9) {
      baseKeys.push(
        { key: 'W', finger: 'left ring finger', color: 'red', dotPos: { left: '24%', top: '10%' } },
        { key: 'M', finger: 'right index finger', color: 'purple', dotPos: { left: '66%', top: '45%' } }
      );
    }
    if (effectiveLessonId >= 10) {
      baseKeys.push(
        { key: 'Q', finger: 'left little finger', color: 'blue', dotPos: { left: '18%', top: '10%' } },
        { key: 'P', finger: 'right little finger', color: 'blue', dotPos: { left: '82%', top: '10%' } }
      );
    }
    if (effectiveLessonId >= 11) {
      baseKeys.push(
        { key: 'B', finger: 'left index finger', color: 'purple', dotPos: { left: '46%', top: '45%' } },
        { key: 'Y', finger: 'right index finger', color: 'purple', dotPos: { left: '58%', top: '10%' } }
      );
    }
    if (effectiveLessonId >= 12) {
      baseKeys.push(
        { key: 'Z', finger: 'left little finger', color: 'blue', dotPos: { left: '22%', top: '45%' } },
        { key: 'X', finger: 'left ring finger', color: 'red', dotPos: { left: '28%', top: '45%' } }
      );
    }
    
    // Advanced Lessons (13-19)
    if (effectiveLessonId >= 13) {
      baseKeys.push(
        { key: ':', finger: 'right little finger', color: 'blue', dotPos: { left: '79%', top: '35%' } },
        { key: '"', finger: 'right little finger', color: 'blue', dotPos: { left: '85%', top: '35%' } }
      );
    }
    if (effectiveLessonId >= 14) {
      baseKeys.push(
        { key: '4', finger: 'left index finger', color: 'purple', dotPos: { left: '38%', top: '2%' } },
        { key: '5', finger: 'left index finger', color: 'purple', dotPos: { left: '44%', top: '2%' } },
        { key: '6', finger: 'right index finger', color: 'purple', dotPos: { left: '56%', top: '2%' } },
        { key: '7', finger: 'right index finger', color: 'purple', dotPos: { left: '62%', top: '2%' } }
      );
    }
    if (effectiveLessonId >= 15) {
      baseKeys.push(
        { key: '1', finger: 'left little finger', color: 'blue', dotPos: { left: '20%', top: '2%' } },
        { key: '2', finger: 'left ring finger', color: 'red', dotPos: { left: '26%', top: '2%' } },
        { key: '3', finger: 'left middle finger', color: 'green', dotPos: { left: '32%', top: '2%' } },
        { key: '8', finger: 'right middle finger', color: 'green', dotPos: { left: '68%', top: '2%' } },
        { key: '9', finger: 'right ring finger', color: 'red', dotPos: { left: '74%', top: '2%' } },
        { key: '0', finger: 'right little finger', color: 'blue', dotPos: { left: '80%', top: '2%' } }
      );
    }
    if (effectiveLessonId >= 16) {
      baseKeys.push(
        { key: '!', finger: 'left little finger', color: 'blue', dotPos: { left: '20%', top: '2%' } },
        { key: '@', finger: 'left ring finger', color: 'red', dotPos: { left: '26%', top: '2%' } },
        { key: '#', finger: 'left middle finger', color: 'green', dotPos: { left: '32%', top: '2%' } },
        { key: '$', finger: 'left index finger', color: 'purple', dotPos: { left: '38%', top: '2%' } },
        { key: '%', finger: 'left index finger', color: 'purple', dotPos: { left: '44%', top: '2%' } }
      );
    }
    if (effectiveLessonId >= 17) {
      baseKeys.push(
        { key: '^', finger: 'right index finger', color: 'purple', dotPos: { left: '56%', top: '2%' } },
        { key: '&', finger: 'right index finger', color: 'purple', dotPos: { left: '62%', top: '2%' } },
        { key: '*', finger: 'right middle finger', color: 'green', dotPos: { left: '68%', top: '2%' } },
        { key: '(', finger: 'right ring finger', color: 'red', dotPos: { left: '74%', top: '2%' } },
        { key: ')', finger: 'right little finger', color: 'blue', dotPos: { left: '80%', top: '2%' } }
      );
    }
    if (effectiveLessonId >= 18) {
      baseKeys.push(
        { key: '-', finger: 'right little finger', color: 'blue', dotPos: { left: '86%', top: '2%' } },
        { key: '_', finger: 'right little finger', color: 'blue', dotPos: { left: '86%', top: '2%' } },
        { key: '=', finger: 'right little finger', color: 'blue', dotPos: { left: '92%', top: '2%' } },
        { key: '+', finger: 'right little finger', color: 'blue', dotPos: { left: '92%', top: '2%' } },
        { key: '/', finger: 'right little finger', color: 'blue', dotPos: { left: '82%', top: '45%' } },
        { key: '|', finger: 'right little finger', color: 'blue', dotPos: { left: '92%', top: '10%' } },
        { key: '\\', finger: 'right little finger', color: 'blue', dotPos: { left: '92%', top: '10%' } }
      );
    }
    if (effectiveLessonId >= 19) {
      baseKeys.push(
        { key: '[', finger: 'right little finger', color: 'blue', dotPos: { left: '88%', top: '10%' } },
        { key: ']', finger: 'right little finger', color: 'blue', dotPos: { left: '94%', top: '10%' } },
        { key: '{', finger: 'right little finger', color: 'blue', dotPos: { left: '88%', top: '10%' } },
        { key: '}', finger: 'right little finger', color: 'blue', dotPos: { left: '94%', top: '10%' } },
        { key: '<', finger: 'right middle finger', color: 'green', dotPos: { left: '70%', top: '45%' } },
        { key: '>', finger: 'right ring finger', color: 'red', dotPos: { left: '76%', top: '45%' } }
      );
    }
    return baseKeys;
  }, [effectiveLessonId]);

  // --- Key Drill Logic ---

  // --- Word Drill Logic ---

  // --- Sentence Drill Logic ---

  // --- Typing Test State ---

  // Sentence Drill Info View
  const renderSentenceDrillInfo = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '600px', margin: '40px auto'}}>
      <div className="slide-header" style={{background: 'var(--light-course-color, #dff0d8)', color: 'var(--course-color, #3c763d)', borderBottom: '1px solid var(--gradient-start, #d6e9c6)'}}>
        <span>Drill Information</span>
      </div>
      <div className="slide-content" style={{padding: '30px', flexDirection: 'column', display: 'flex'}}>
        <div style={{display: 'flex', marginBottom: '20px', alignItems: 'center', width: '100%'}}>
            <strong style={{width: '120px'}}>Duration</strong>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span style={{color: 'var(--course-color, #666)'}}>📊</span>
                <span>3 - 5 minutes (based on progress)</span>
            </div>
        </div>
        <div style={{display: 'flex', marginBottom: '20px', alignItems: 'center', width: '100%'}}>
            <strong style={{width: '120px'}}>Accuracy Goal</strong>
            <select 
                style={{padding: '5px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer'}}
                value={sentenceDrillAccuracyGoal}
                onChange={(e) => setSentenceDrillAccuracyGoal(Number(e.target.value))}
            >
                <option value={98}>98% Advanced</option>
                <option value={94}>94% Intermediate</option>
                <option value={90}>90% Easy</option>
            </select>
        </div>
        <div style={{display: 'flex', marginBottom: '30px', alignItems: 'flex-start', width: '100%'}}>
            <strong style={{width: '120px'}}>Objective</strong>
            <span style={{flex: 1}}>Consolidation exercise to further develop muscle memory and strengthen technique.</span>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', width: 'fit-content'}}>
            <button 
                style={{
                    padding: '8px 25px',
                    borderRadius: '8px',
                    border: '1px solid var(--course-color, #1a73e8)',
                    background: 'white',
                    color: 'var(--course-color, #1a73e8)',
                    fontSize: '1rem',
                    fontWeight: '400',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    width: '100%'
                }}
                onClick={() => changeView('lesson_detail')}
            >
                <span style={{textDecoration: 'underline'}}>C</span>ancel
            </button>
            <button 
                className="begin-drill-btn"
                style={{
                    background: 'var(--light-course-color, #e9f7e9)', 
                    border: '1px solid var(--gradient-start, #c9e6c9)', 
                    color: 'var(--course-color, #3c763d)', 
                    padding: '10px 20px', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    fontSize: '1rem'
                }}
                onClick={() => {
                    const now = Date.now();
                    setSentenceDrillState('practice');
                    setSentenceDrillHasStarted(false);
                    setSentenceDrillTimeLeft(300);
                    setSentenceDrillTimeUsed(0);
                    setSentenceDrillLastActivity(now);
                    sentenceDrillLastActivityRef.current = now;
                    setSentenceDrillHistory({ correct: 0, errors: 0, total: 0 });
                    setSentenceDrillInput('');
                    setSentenceDrillCurrentPatternIndex(0);
                    setSentenceDrillKeyStats({});
                    setSentenceDrillLastKeyTime(now);
                }}
            >
                <span style={{fontSize: '0.8rem'}}>▶</span> Begin drill (Space)
            </button>
        </div>
      </div>
    </div>
  );

  // Helper to render sentence blocks for Sentence Drill
  const renderSentenceBlocks = (pattern, inputText, isError = false) => {
      const wordUnits = [];
      let currentWord = "";
      let startIdx = 0;
      
      for (let i = 0; i < pattern.length; i++) {
          if (pattern[i] === ' ') {
              if (currentWord.length > 0) {
                  wordUnits.push({ 
                      word: currentWord, 
                      start: startIdx, 
                      end: i, 
                      fullEnd: i + 1 
                  });
                  currentWord = "";
              }
              startIdx = i + 1;
          } else {
              if (currentWord.length === 0) startIdx = i;
              currentWord += pattern[i];
          }
      }
      if (currentWord.length > 0) {
          wordUnits.push({
              word: currentWord,
              start: startIdx,
              end: pattern.length,
              fullEnd: pattern.length
          });
      }

      const isAtEnd = inputText.length === pattern.length;

      return (
          <div style={{
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '10px', 
              alignItems: 'center', 
              justifyContent: 'flex-start',
              paddingLeft: '40px',
              fontSize: '2rem',
              lineHeight: '1.5',
              fontFamily: '"Georgia", serif',
              width: '100%'
          }}>
              {wordUnits.map((unit, wIdx) => {
                    const isWordCompleted = inputText.length >= unit.fullEnd;
                    if (isWordCompleted) return null;

                    const isCurrent = inputText.length >= unit.start && inputText.length < unit.fullEnd;
                    const showShadow = isCurrent && inputText.length < unit.end;
                    
                    return (
                        <div key={wIdx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: isCurrent ? courseColor : '#666',
                            backgroundColor: showShadow ? '#fff9c4' : 'transparent',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            transition: 'all 0.2s ease'
                        }}>
                          {unit.word.split('').map((char, cIdx) => {
                              const globalIdx = unit.start + cIdx;
                              const isTyped = globalIdx < inputText.length;
                              const isNextChar = globalIdx === inputText.length;
                              
                              if (isTyped) return null;

                              return (
                                  <span key={cIdx} style={{
                                      borderBottom: isNextChar ? `2px solid ${courseColor}` : 'none',
                                      color: (isNextChar && isError) ? '#d93025' : 'inherit',
                                      fontWeight: isNextChar ? 'bold' : 'normal'
                                  }}>
                                      {char}
                                  </span>
                              );
                          })}
                      </div>
                  );
              })}
              {isAtEnd && (
                  <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '1.5rem',
                      color: courseColor,
                      fontWeight: 'bold',
                      animation: 'pulse 1.5s infinite',
                      marginLeft: '5px'
                  }}>
                      ↵
                  </div>
              )}
          </div>
      );
  };

  // Sentence Drill Practice View
  const renderSentenceDrillPractice = () => {
    const currentPattern = sentenceDrillPatterns[sentenceDrillCurrentPatternIndex];
    if (!currentPattern) return <div className="practice-card">Loading drill...</div>;
    
    const isAtEnd = sentenceDrillInput.length === currentPattern.length;
    const targetChar = !isAtEnd ? currentPattern[sentenceDrillInput.length] : 'Enter';
    const activeKey = isAtEnd ? 'Enter' : (targetChar === ' ' ? 'Space' : targetChar.toUpperCase());
    
    const keyData = activeKey ? practiceKeys.find(k => k.key.toUpperCase() === (activeKey === 'Space' ? 'SPACE' : activeKey)) : null;
    const fingerPos = keyData ? { ...keyData.dotPos, color: keyData.color } : null;

    const minutes = Math.floor(sentenceDrillTimeLeft / 60);
    const seconds = sentenceDrillTimeLeft % 60;
    const timeString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    return (
      <div className="practice-card" style={{
          width: '100%',
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          height: '650px',
          maxHeight: '90vh',
          background: mainBg,
          border: `1px solid ${lightCourseColor}`,
          position: 'relative',
          overflow: 'hidden'
      }}>
          <div style={{flex: 1, padding: '10px 25px', display: 'flex', flexDirection: 'column'}}>
              <div style={{color: '#a5c48c', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '400'}}>
                  <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '1.5px solid #a5c48c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                  }}>
                      <div style={{width: '0', height: '0', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '8px solid #a5c48c', marginLeft: '2px'}}></div>
                  </div>
                  Type the sentence and press ↵
              </div>

              <div className="drill-patterns-area" style={{
                  marginBottom: '5px',
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  border: `1px solid ${courseColor}1a`,
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '10px'
              }}>
                  <div style={{width: '100%'}}>
                    {renderSentenceBlocks(
                        currentPattern, 
                        sentenceDrillInput, 
                        sentenceDrillShowErrorX
                    )}
                </div>
            </div>

              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '0', marginTop: '10px'}}>
                  {renderKeyboard(activeKey ? [activeKey] : null, sentenceDrillShowErrorX ? sentenceDrillErrorKey : null)}
              </div>
              
              {sentenceDrillShowErrorX && (
                  <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '10rem',
                      color: 'rgba(217, 48, 37, 0.4)',
                      fontWeight: 'bold',
                      zIndex: 10,
                      pointerEvents: 'none'
                  }}>X</div>
              )}
          </div>

          {/* Sidebar */}
          <div style={{width: '240px', background: sidebarBg, borderLeft: `1px solid ${lightCourseColor}`, padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: '#4a76a8', fontWeight: 'bold', marginBottom: '20px', marginTop: '10px'}}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end', width: '20px'}}>
                      <div style={{width: '5px', height: '12px', background: '#f28b82', border: '1px solid #d93025'}}></div>
                      <div style={{width: '5px', height: '16px', background: '#8ab4f8', border: `1px solid ${courseColor}`}}></div>
                      <div style={{width: '5px', height: '8px', background: '#81c995', border: '1px solid #188038'}}></div>
                  </div>
                  <span style={{fontSize: '1.1rem'}}>Your Progress</span>
              </div>
              
              <div style={{
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  gap: '4px', 
                  marginBottom: '20px', 
                  maxHeight: '120px', 
                  background: 'rgba(255,255,255,0.8)', 
                  padding: '15px 10px', 
                  borderRadius: '4px',
                  border: `1px solid ${lightCourseColor}`
              }}>
                  {Array.from({length: 20}).map((_, idx) => {
                      const totalTime = 300;
                      const timePercent = Math.max(0, Math.min(1, (totalTime - sentenceDrillTimeLeft) / totalTime));
                      const filledCount = Math.floor(timePercent * 20);
                      
                      const isCompleted = idx < filledCount;
                      const isCurrent = idx === filledCount;
                      const baseHeight = 15 + (idx * 4); // Linear increase for single graph effect
                      return (
                        <div key={idx} style={{
                            flex: 1,
                            height: `${baseHeight}%`,
                            background: isCompleted ? '#8dbd5b' : (isCurrent ? '#fff9c4' : '#f5f5dc'),
                            border: '1px solid #333',
                            boxShadow: isCurrent ? `0 0 5px ${courseColor}80` : 'none',
                            transition: 'all 0.3s ease'
                        }}></div>
                      );
                  })}
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div style={{display: 'flex', flexDirection: 'column'}}>
                          <span style={{color: '#666', fontSize: '0.9rem'}}>Time Left</span>
                          {Date.now() - sentenceDrillLastActivity >= 2000 && (
                              <div style={{fontSize: '0.8rem', color: courseColor, textDecoration: 'underline', cursor: 'pointer'}}>Pause</div>
                          )}
                      </div>
                      <span style={{fontWeight: 'bold', fontSize: '1.5rem', color: '#333'}}>{timeString}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span style={{color: '#666', fontSize: '0.9rem'}}>Accuracy</span>
                      <span style={{fontWeight: 'bold', color: '#333'}}>{sentenceDrillHistory.total > 0 ? Math.round((sentenceDrillHistory.correct / sentenceDrillHistory.total) * 100) : 100}%</span>
                  </div>
              </div>

              <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  <button 
                      style={{
                          background: 'white',
                          border: `1px solid ${courseColor}`,
                          padding: '12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          color: courseColor,
                          fontWeight: 'normal',
                          width: '100%'
                      }}
                      onClick={() => changeView('lesson_detail')}
                  >
                      Cancel
                  </button>
                  <button 
                      style={{
                          background: courseColor, 
                          color: 'white', 
                          border: 'none', 
                          padding: '12px', 
                          borderRadius: '4px', 
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          width: '100%'
                      }}
                      onClick={() => {
                          setSentenceDrillEndTime(Date.now());
                          setSentenceDrillState('results');
                      }}
                  >
                      Next
                  </button>
              </div>
          </div>
      </div>
    );
  };

  // --- Finger Mapping Helpers ---
  const fingerPositions = {
    'left_pinky': { left: '19%', top: '25%' },
    'left_ring': { left: '24%', top: '22%' },
    'left_middle': { left: '31%', top: '15%' },
    'left_index': { left: '38%', top: '22%' },
    'left_thumb': { left: '45%', top: '55%' },
    'right_thumb': { left: '55%', top: '55%' },
    'right_index': { left: '62%', top: '22%' },
    'right_middle': { left: '69%', top: '15%' },
    'right_ring': { left: '76%', top: '22%' },
    'right_pinky': { left: '90%', top: '25%' }
  };

  const keyToFinger = {
    'A': 'left_pinky', 'Q': 'left_pinky', 'Z': 'left_pinky', '1': 'left_pinky', '!': 'left_pinky', '`': 'left_pinky', '~': 'left_pinky',
    'S': 'left_ring', 'W': 'left_ring', 'X': 'left_ring', '2': 'left_ring', '@': 'left_ring',
    'D': 'left_middle', 'E': 'left_middle', 'C': 'left_middle', '3': 'left_middle', '#': 'left_middle',
    'F': 'left_index', 'R': 'left_index', 'V': 'left_index', '4': 'left_index', '$': 'left_index',
    'G': 'left_index', 'T': 'left_index', 'B': 'left_index', '5': 'left_index', '%': 'left_index',
    'H': 'right_index', 'Y': 'right_index', 'N': 'right_index', '6': 'right_index', '^': 'right_index',
    'J': 'right_index', 'U': 'right_index', 'M': 'right_index', '7': 'right_index', '&': 'right_index',
    'K': 'right_middle', 'I': 'right_middle', ',': 'right_middle', '8': 'right_middle', '*': 'right_middle', '<': 'right_middle',
    'L': 'right_ring', 'O': 'right_ring', '.': 'right_ring', '9': 'right_ring', '(': 'right_ring', '>': 'right_ring',
    ';': 'right_pinky', 'P': 'right_pinky', '/': 'right_pinky', '0': 'right_pinky', ')': 'right_pinky', 
    ':': 'right_pinky', '-': 'right_pinky', '_': 'right_pinky', '=': 'right_pinky', '+': 'right_pinky',
    '[': 'right_pinky', '{': 'right_pinky', ']': 'right_pinky', '}': 'right_pinky', '\\': 'right_pinky', '|': 'right_pinky',
    "'": 'right_pinky', '"': 'right_pinky', '?': 'right_pinky',
    'SPACE': 'right_thumb'
  };

  const renderHands = (activeKeys = [], fingers = [], showDots = false, style = {}, imgSrc = handsImg) => {
    const positions = imgSrc === handsImg ? handsPngFingerPositions : fingerPositions;
    const dotFingers = (() => {
      const set = new Set(Array.isArray(fingers) ? fingers : []);
      if (Array.isArray(activeKeys)) {
        for (const item of activeKeys) {
          const rawKey =
            typeof item === 'string'
              ? item
              : item && typeof item === 'object' && 'key' in item
                ? item.key
                : null;

          if (!rawKey) continue;

          const normalized = String(rawKey).toUpperCase();
          const lookupKey = normalized === 'SPACE' ? 'SPACE' : normalized;
          const finger = keyToFinger[lookupKey];
          if (finger) set.add(finger);
        }
      }

      return Array.from(set);
    })();

    const getDotColor = (fingerName) => {
      if (fingerName.includes('pinky')) return '#6c8cff';
      if (fingerName.includes('ring')) return '#ff6b6b';
      if (fingerName.includes('middle')) return '#51cf66';
      if (fingerName.includes('index')) return '#cc5de8';
      return '#999';
    };

    return (
      <div style={{position: 'relative', width: '520px', height: '208px', margin: '0 auto', ...style}}>
        <img src={imgSrc} alt="Hands" style={{width: '100%', height: '100%', display: 'block'}} />
        {showDots && dotFingers.map((f, i) => {
            const pos = positions[f];
            if (!pos) return null;
            const color = getDotColor(f);
            return (
                <div key={i} style={{
                    position: 'absolute',
                    left: pos.left,
                    top: pos.top,
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    transform: 'translate(-50%, -50%)',
                    border: '2px solid white',
                    opacity: 0.85
                }} />
            );
        })}
      </div>
    );
  };

  // Helper Components
  const renderKeyboard = (highlightedKeys = null, errorKey = null, keyHeight = '40px', noBackground = false, containerStyle = {}) => {
    const rows = [
      ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Back'],
      ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
      ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '\'', 'Enter'],
      ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
      ['Ctrl', 'Space', 'Ctrl']
    ];
    
    // Map shifted symbols to their base keys for highlighting
    const shiftMap = {
        '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', 
        '^': '6', '&': '7', '*': '8', '(': '9', ')': '0', '_': '-', '+': '=',
        '{': '[', '}': ']', '|': '\\', ':': ';', '"': '\'', '<': ',', '>': '.', '?': '/'
    };
    
    // Helper to get shift symbol for display
    const getShiftSymbol = (baseKey) => {
        return Object.keys(shiftMap).find(key => shiftMap[key] === baseKey);
    };

    // Reverse map for checking if a key is a base for a shifted symbol
    // (Used to decide if we should check for Shift highlight)

    const getKeyClass = (key) => {
      const base = 'key';
      let colorClass = '';
      
      // Determine potential color based on finger for consistent highlighting
      const finger = keyToFinger[key === 'Space' ? 'SPACE' : key];
      if (finger) {
         if (finger.includes('pinky')) colorClass = 'blue';
         else if (finger.includes('ring')) colorClass = 'red';
         else if (finger.includes('middle')) colorClass = 'green';
         else if (finger.includes('index')) colorClass = 'purple';
      } else {
         // Fallback for special keys
         if (['Tab', 'Caps', 'Shift', 'Ctrl', 'Alt', 'Back', 'Enter'].includes(key)) {
             colorClass = 'blue'; // Default modifier color
         }
      }
      
      let classes = base;
      if (key === 'Space') classes += ' space';

      // Physical key press highlight
      if (key === 'Space' && pressedKey === 'SPACE') return `${classes} space-active`;

      // If errorKey matches, add error class
      if (errorKey === key) return `${classes} error-key`;

      // Home row keys should always have a faint color
      const isHomeRow = ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'].includes(key);

      // If highlighting specific keys
      if (highlightedKeys) {
        const isSpaceHighlighted = highlightedKeys.includes('Space') || highlightedKeys.includes('SPACE');
        if (key === 'Space' && isSpaceHighlighted) return `${classes} space-active`;
        
        // Check if this key is highlighted directly OR via its shifted symbol
        let isKeyHighlighted = highlightedKeys.includes(key);
        
        // Check if any highlighted key maps to this base key via shift
        if (!isKeyHighlighted) {
            const shiftedSymbol = Object.keys(shiftMap).find(sym => shiftMap[sym] === key);
            if (shiftedSymbol && highlightedKeys.includes(shiftedSymbol)) {
                isKeyHighlighted = true;
            }
        }
        
        // Special case for Shift keys
        if (key === 'Shift') {
            const needsShift = highlightedKeys.some(k => shiftMap[k]);
            if (needsShift) isKeyHighlighted = true;
        }
        
        if (isKeyHighlighted) {
            return `${classes} ${colorClass} active`; // Bold/Strong highlight
        }
      }

      // Only apply faint color to home row keys, others remain white/default
      if (isHomeRow && !noBackground && colorClass) {
          return `${classes} ${colorClass}-faint`;
      }
      
      return classes;
    };

    return (
      <div className="keyboard-container" style={{ width: '100%', margin: '10px 0 10px 0', ...containerStyle }}>
        {rows.map((row, idx) => (
          <div key={idx} className="key-row">
            {row.map((key, kIdx) => {
              const className = getKeyClass(key);
              const isHighlighted = className.includes('active') || className.includes('space-active');
              const finger = keyToFinger[key === 'Space' ? 'SPACE' : key];
              
              const colorMap = {
                blue: '#6c8cff',
                red: '#ff6b6b',
                green: '#51cf66',
                purple: '#cc5de8',
                grey: '#999'
              };

              const fingerColor = finger ? (finger.includes('pinky') ? 'blue' :
                                       finger.includes('ring') ? 'red' :
                                       finger.includes('middle') ? 'green' :
                                       finger.includes('index') ? 'purple' : 'grey') : null;

              const textColor = (isHighlighted && noBackground) ? (fingerColor === 'blue' ? 'var(--course-color, #6c8cff)' : colorMap[fingerColor]) : 'inherit';

              const shiftChar = getShiftSymbol(key);
              
              return (
                <div 
                  key={kIdx} 
                  data-key={key} 
                  className={getKeyClass(key)} 
                  style={{
                    height: keyHeight,
                    flex: key === 'Space' ? 5 : (key.length > 1 ? 1.5 : 1),
                    color: textColor,
                    fontWeight: (isHighlighted && noBackground) ? 'bold' : 'normal',
                    borderColor: (isHighlighted && noBackground) ? (fingerColor === 'blue' ? 'var(--course-color, #6c8cff)' : colorMap[fingerColor]) : (noBackground ? 'transparent' : '#ccc'),
                    background: noBackground ? 'transparent' : undefined,
                    boxShadow: noBackground ? 'none' : undefined,
                    borderRadius: noBackground ? '4px' : '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  {shiftChar && (
                    <span style={{
                        position: 'absolute',
                        top: '2px',
                        left: '5px',
                        fontSize: '0.75rem',
                        fontWeight: 'normal',
                        opacity: 0.8
                    }}>
                        {shiftChar}
                    </span>
                  )}
                  <span style={{ marginTop: shiftChar ? '8px' : '0' }}>
                    {key === 'Back' ? '←' : key}
                  </span>
                  {errorKey === key && <div className="error-slash"></div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // --- Sentence Drill Results View ---
  const renderSentenceDrillResults = () => {
      // Metrics Calculation - Standard WPM Rules
      const durationSec = Math.max(1, sentenceDrillTimeUsed);
      const timeInMinutes = durationSec / 60;
      
      const grossSpeed = Math.round((sentenceDrillHistory.total / 5) / timeInMinutes);
      const netSpeed = Math.round((sentenceDrillHistory.correct / 5) / timeInMinutes);
      const accuracy = sentenceDrillHistory.total > 0 ? Math.round((sentenceDrillHistory.correct / sentenceDrillHistory.total) * 100) : 0;

      return (
        <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '20px auto', padding: '0'}}>
            <div className="slide-header" style={{background: courseColor, color: 'white', padding: '15px 20px'}}>
                <h2 style={{margin: 0, fontSize: '1.2rem'}}>Sentence Drill Results</h2>
            </div>
            <div style={{padding: '30px'}}>
                <div style={{marginBottom: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: accuracy >= sentenceDrillAccuracyGoal ? 'var(--course-color, #3c763d)' : '#8a6d3b'}}>
                        <span style={{fontSize: '1.2rem'}}>{accuracy >= sentenceDrillAccuracyGoal ? '☑' : '⚠'}</span>
                        <strong style={{fontSize: '1rem'}}>{accuracy >= sentenceDrillAccuracyGoal ? 'Exercise Completed' : 'Exercise Finished'}</strong>
                    </div>
                    <p style={{marginBottom: '10px', fontSize: '0.9rem', color: '#666'}}>
                        {accuracy >= sentenceDrillAccuracyGoal 
                            ? "Good job! You reached the accuracy goal and your typing speed was good. Keep up the good work!"
                            : `You didn't quite reach the accuracy goal of ${sentenceDrillAccuracyGoal}%. Focus on accuracy and try again to improve your results.`
                        }
                    </p>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px'}}>
                    <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eee'}}>
                        <h3 style={{marginTop: 0, color: courseColor, fontSize: '1rem', borderBottom: `2px solid ${courseColor}`, paddingBottom: '10px'}}>Performance</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <span style={{color: '#666', fontWeight: '500'}}>Net Speed:</span>
                                <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#333'}}>{netSpeed} WPM</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <span style={{color: '#666', fontWeight: '500'}}>Accuracy:</span>
                                <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: accuracy >= sentenceDrillAccuracyGoal ? '#2e7d32' : '#c62828'}}>{accuracy}%</span>
                            </div>
                        </div>
                    </div>

                    <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eee'}}>
                        <h3 style={{marginTop: 0, color: courseColor, fontSize: '1rem', borderBottom: `2px solid ${courseColor}`, paddingBottom: '10px'}}>Session Details</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span style={{color: '#666'}}>Gross Speed:</span>
                                <span style={{fontWeight: 'bold'}}>{grossSpeed} WPM</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span style={{color: '#666'}}>Time Used:</span>
                                <span style={{fontWeight: 'bold'}}>{formatTime(durationSec)}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span style={{color: '#666'}}>Total Errors:</span>
                                <span style={{fontWeight: 'bold', color: '#c62828'}}>{sentenceDrillHistory.errors}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style={{marginBottom: '30px'}}>
                    {renderDifficultKeysGraph(sentenceDrillKeyStats)}
                </div>

                <div style={{display: 'flex', flexDirection: 'row', gap: '20px', justifyContent: 'center', width: '100%'}}>
                    <button 
                        style={{
                            padding: '10px 0', 
                            fontSize: '1rem',
                            background: 'white',
                            color: courseColor,
                            border: `1px solid ${courseColor}`,
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            fontWeight: '400',
                            width: '200px',
                            textAlign: 'center',
                            boxSizing: 'border-box',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }} 
                        onClick={() => changeView('lesson_detail')}
                    >
                        <span style={{textDecoration: 'underline'}}>C</span>ancel
                    </button>
                    <button 
                        className="continue-btn"
                        style={{
                            padding: '10px 0',
                            fontSize: '1rem',
                            background: courseColor,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            width: '200px',
                            textAlign: 'center',
                            boxSizing: 'border-box',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onClick={() => changeView('lesson_detail')}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
      );
  };

  // --- Lesson Intro View (Generic) ---
  const renderLessonIntro = () => {
    const lessonData = {
      1: {
        title: "The Home Row",
        description: "In this lesson, you will learn the basics of touch typing and the home row keys: A, S, D, F, J, K, L, and ;.",
        keys: [
          { key: "A", finger: "left little finger", home: "A" },
          { key: "S", finger: "left ring finger", home: "S" },
          { key: "D", finger: "left middle finger", home: "D" },
          { key: "F", finger: "left index finger", home: "F" },
          { key: "J", finger: "right index finger", home: "J" },
          { key: "K", finger: "right middle finger", home: "K" },
          { key: "L", finger: "right ring finger", home: "L" },
          { key: ";", finger: "right little finger", home: ";" }
        ]
      },
      2: {
        title: "New keys: E and I",
        description: "In this lesson, you will learn how to type the letters E and I.",
        keys: [
          { key: "E", finger: "left middle finger", home: "D" },
          { key: "I", finger: "right middle finger", home: "K" }
        ]
      },
      3: {
        title: "New keys: R and U",
        description: "In this lesson, you will learn how to type the letters R and U.",
        keys: [
          { key: "R", finger: "left index finger", home: "F" },
          { key: "U", finger: "right index finger", home: "J" }
        ]
      },
      4: {
        title: "New keys: T and O",
        description: "In this lesson, you will learn how to type the letters T and O.",
        keys: [
          { key: "T", finger: "left index finger", home: "F" },
          { key: "O", finger: "right ring finger", home: "L" }
        ]
      },
      5: {
        title: "Capital letters and period",
        description: "In this lesson, you will learn how to type capital letters using the Shift key and the period key.",
        keys: [
          { key: "Shift", finger: "pinky finger (opposite hand)", home: "A or ;", shift: "left" },
          { key: ".", finger: "right ring finger", home: "L" }
        ]
      },
      6: {
        title: "New keys: C and comma",
        description: "In this lesson, you will learn how to type the letter C and the comma key.",
        keys: [
          { key: "C", finger: "left middle finger", home: "D" },
          { key: ",", finger: "right middle finger", home: "K" }
        ]
      },
      7: {
        title: "New keys: G, H and apostrophe",
        description: "In this lesson, you will learn how to type the letters G, H and the apostrophe key.",
        keys: [
          { key: "G", finger: "left index finger", home: "F" },
          { key: "H", finger: "right index finger", home: "J" },
          { key: "'", finger: "right pinky finger", home: ";" }
        ]
      },
      8: {
        title: "New keys: V, N and question mark",
        description: "In this lesson, you will learn how to type the letters V, N and the question mark (Shift + /).",
        keys: [
          { key: "V", finger: "left index finger", home: "F" },
          { key: "N", finger: "right index finger", home: "J" },
          { key: "?", finger: "right pinky finger", home: ";", shift: "left" }
        ]
      },
      9: {
        title: "New keys: W and M",
        description: "In this lesson, you will learn how to type the letters W and M.",
        keys: [
          { key: "W", finger: "left ring finger", home: "S" },
          { key: "M", finger: "right index finger", home: "J" }
        ]
      },
      10: {
        title: "New keys: Q and P",
        description: "In this lesson, you will learn how to type the letters Q and P.",
        keys: [
          { key: "Q", finger: "left pinky finger", home: "A" },
          { key: "P", finger: "right pinky finger", home: ";" }
        ]
      },
      11: {
        title: "New keys: B and Y",
        description: "In this lesson, you will learn how to type the letters B and Y.",
        keys: [
          { key: "B", finger: "left index finger", home: "F" },
          { key: "Y", finger: "right index finger", home: "J" }
        ]
      },
      12: {
        title: "New keys: Z and X",
        description: "In this lesson, you will learn how to type the letters Z and X.",
        keys: [
          { key: "Z", finger: "left pinky finger", home: "A", color: "blue" },
          { key: "X", finger: "left ring finger", home: "S", color: "red" }
        ]
      },
      13: {
        title: "Basic Punctuation",
        description: "In this lesson, you will learn how to type the colon, quotation mark, and other punctuation keys.",
        keys: [
          { key: ":", finger: "right little finger", home: ";", color: "blue", shift: "left" },
          { key: '"', finger: "right little finger", home: ";", color: "blue", shift: "left" }
        ]
      },
      14: {
        title: "Number Row (Index)",
        description: "In this lesson, you will learn how to type the numbers 4, 5, 6, and 7 using your index fingers.",
        keys: [
          { key: "4", finger: "left index finger", home: "F", color: "purple" },
          { key: "5", finger: "left index finger", home: "F", color: "purple" },
          { key: "6", finger: "right index finger", home: "J", color: "purple" },
          { key: "7", finger: "right index finger", home: "J", color: "purple" }
        ]
      },
      15: {
        title: "Number Row (Outer)",
        description: "In this lesson, you will learn how to type the remaining numbers on the number row.",
        keys: [
          { key: "1", finger: "left little finger", home: "A", color: "blue" },
          { key: "2", finger: "left ring finger", home: "S", color: "red" },
          { key: "3", finger: "left middle finger", home: "D", color: "green" },
          { key: "8", finger: "right middle finger", home: "K", color: "green" },
          { key: "9", finger: "right ring finger", home: "L", color: "red" },
          { key: "0", finger: "right little finger", home: ";", color: "blue" }
        ]
      },
      16: {
        title: "Symbols Row (1-5)",
        description: "In this lesson, you will learn how to type the symbols !, @, #, $, and %.",
        keys: [
          { key: "!", finger: "left little finger", home: "A", color: "blue", shift: "right" },
          { key: "@", finger: "left ring finger", home: "S", color: "red", shift: "right" },
          { key: "#", finger: "left middle finger", home: "D", color: "green", shift: "right" },
          { key: "$", finger: "left index finger", home: "F", color: "purple", shift: "right" },
          { key: "%", finger: "left index finger", home: "F", color: "purple", shift: "right" }
        ]
      },
      17: {
        title: "Symbols Row (6-0)",
        description: "In this lesson, you will learn how to type the symbols ^, &, *, (, and ).",
        keys: [
          { key: "^", finger: "right index finger", home: "J", color: "purple", shift: "left" },
          { key: "&", finger: "right index finger", home: "J", color: "purple", shift: "left" },
          { key: "*", finger: "right middle finger", home: "K", color: "green", shift: "left" },
          { key: "(", finger: "right ring finger", home: "L", color: "red", shift: "left" },
          { key: ")", finger: "right little finger", home: ";", color: "blue", shift: "left" }
        ]
      },
      18: {
        title: "Technical & Math",
        description: "In this lesson, you will learn how to type technical and math symbols.",
        keys: [
          { key: "-", finger: "right little finger", home: ";", color: "blue" },
          { key: "_", finger: "right little finger", home: ";", color: "blue", shift: "left" },
          { key: "=", finger: "right little finger", home: ";", color: "blue" },
          { key: "+", finger: "right little finger", home: ";", color: "blue", shift: "left" },
          { key: "/", finger: "right little finger", home: ";", color: "blue" },
          { key: "|", finger: "right little finger", home: ";", color: "blue", shift: "left" },
          { key: "\\", finger: "right little finger", home: ";", color: "blue" }
        ]
      },
      19: {
        title: "Brackets, Comparison & Tilde",
        description: "In this lesson, you will learn how to type brackets, comparison operators, and the tilde key.",
        keys: [
          { key: "[", finger: "right little finger", home: ";", color: "blue" },
          { key: "]", finger: "right little finger", home: ";", color: "blue" },
          { key: "{", finger: "right little finger", home: ";", color: "blue", shift: "left" },
          { key: "}", finger: "right little finger", home: ";", color: "blue", shift: "left" },
          { key: "<", finger: "right middle finger", home: "K", color: "green", shift: "left" },
          { key: ">", finger: "right ring finger", home: "L", color: "red", shift: "left" },
          { key: "`", finger: "left little finger", home: "1", color: "blue" },
          { key: "~", finger: "left little finger", home: "1", color: "blue", shift: "right" }
        ]
      },
      20: {
        title: "Comprehensive Review",
        description: "In this lesson, you will review all the keys you have learned so far.",
        keys: [
            { key: "A", finger: "left little finger", home: "A" },
            { key: "S", finger: "left ring finger", home: "S" },
            { key: "D", finger: "left middle finger", home: "D" },
            { key: "F", finger: "left index finger", home: "F" },
            { key: "J", finger: "right index finger", home: "J" },
            { key: "K", finger: "right middle finger", home: "K" },
            { key: "L", finger: "right ring finger", home: "L" },
            { key: ";", finger: "right little finger", home: ";" }
        ]
      }
    };

    const effectiveLessonId = courseType === 'advanced' ? currentLesson + 12 : currentLesson;
    const data = lessonData[effectiveLessonId] || lessonData[2];
    
    const isHomeRow = effectiveLessonId === 1;

    return (
      <div className="practice-card" style={{
          width: isHomeRow ? '100%' : '98vw',
          maxWidth: isHomeRow ? '850px' : '100%', 
          margin: '10px auto', 
          padding: '0', 
          boxShadow: '0 4px 25px rgba(0,0,0,0.15)',
          borderRadius: '8px',
          overflow: 'hidden',
          background: 'white',
          height: 'auto',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
      }}>
        <div className="slide-header" style={{
            background: courseColor, 
            color: 'white', 
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: 'none',
            flexShrink: 0
        }}>
          <h2 style={{margin: 0, fontSize: '1.2rem', fontWeight: '500'}}>{data.title}</h2>
          <button 
              style={{background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.8}}
              onClick={() => changeView('lesson_detail')}
          >×</button>
        </div>

        <div className="slide-content" style={{
            padding: '10px 20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            overflowY: 'auto'
        }}>
          <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '5px', color: '#333', fontSize: '0.95rem', lineHeight: '1.3'}}>
              <p style={{margin: '0 0 5px 0'}}>
                  {data.description}
              </p>
              {data.keys.map((k, idx) => {
                const bottomKeys = ['C', ',', 'V', 'N', 'M', 'B', 'Z', 'X', '.', '?', '/', '<', '>'];
                const homeRowKeys = [':', '"', "'", ';', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER'];
                const isBottom = bottomKeys.includes(k.key);
                const isHomeRow = homeRowKeys.includes(k.key);
                
                return (
                <p key={idx} style={{margin: 0}}>
                    <strong>{k.key}:</strong> {k.shift && k.key !== 'Shift' ? <span>Use your <strong>{k.shift === 'left' ? 'left pinky finger' : 'right pinky finger'}</strong> to hold <strong>Shift</strong> and </span> : ''}Use your <strong>{k.finger}</strong>{isHomeRow ? ' to press ' : ` to reach ${isBottom ? 'down' : 'up'} from the `}{isHomeRow ? '' : <strong>{k.home}</strong>}{isHomeRow ? '' : ' key to press '}<strong>{k.key}</strong>.
                </p>
                );
              })}
          </div>
        </div>

          <div style={{
              width: '100%', 
              display: 'flex', 
              flexDirection: isHomeRow ? 'column' : 'row', 
              alignItems: 'center', 
              gap: '15px',
              justifyContent: 'center',
              padding: '10px 15px',
              borderTop: '1px solid #eee',
              flexShrink: 0
          }}>
              <div style={{
                  flex: isHomeRow ? 'initial' : 1,
                  width: isHomeRow ? '100%' : 'auto',
                  maxWidth: '850px',
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  background: '#f8f9fa', 
                  padding: '5px 10px', 
                  borderRadius: '6px', 
                  border: '1px solid #ddd',
                  flexShrink: 0
              }}>
                      <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', transformOrigin: 'top center'}}>
                      {renderKeyboard(data.keys.map(k => k.key.toUpperCase()), null, '35px')}
                      {renderHands(
                        data.keys.map(k => k.key.toUpperCase()),
                        data.keys.filter(k => k.shift).map(k => k.shift === 'left' ? 'left_pinky' : 'right_pinky'),
                        true
                      )}
                  </div>
              </div>

              <div style={{
                  display: 'flex', 
                  flexDirection: isHomeRow ? 'row' : 'column',
                  gap: '10px',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: isHomeRow ? '100%' : 'auto'
              }}>
                  <button 
                      className="btn-cancel" 
                      style={{
                          padding: '10px 0',
                          borderRadius: '8px',
                          border: `1px solid ${courseColor}`,
                          background: 'white',
                          color: courseColor,
                          fontSize: '1rem',
                          fontWeight: '400',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          width: '200px',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                      }}
                      onClick={() => changeView('lesson_detail')}
                  >
                      Cancel
                  </button>
                  <button 
                      className="btn-next" 
                      style={{
                          padding: '10px 0',
                          borderRadius: '8px',
                          border: 'none',
                          background: courseColor,
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          width: '200px',
                          textAlign: 'center',
                          boxSizing: 'border-box'
                      }}
                      onClick={() => {
                          setDrillState('info');
                          setDrillTimeLeft(300);
                          setDrillInput('');
                          setDrillHistory({ correct: 0, errors: 0, total: 0 });
                          setDrillCurrentPatternIndex(0);
                          changeView('key_drill');
                      }}
                  >
                      Begin
                  </button>
              </div>
          </div>
      </div>
    );
  };

  const submitPracticeResult = async (type, stats, durationSec) => {
    const token = localStorage.getItem('token');
    if (isSubmitting || !token) return;
    setIsSubmitting(true);

    try {
      const timeInMinutes = Math.max(1, durationSec) / 60;
      const wpm = Math.round((stats.correct / 5) / timeInMinutes);
      const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

      const response = await fetch(`${API_BASE_URL}/api/practice/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          type,
          level: `Lesson ${currentLesson}: ${type.charAt(0).toUpperCase() + type.slice(1)} Drill`,
          wpm,
          accuracy
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save practice result');
      }
    } catch (err) {
      console.error('Error saving practice result:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Global keydown listener for Spacebar navigation and Practice
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        setPressedKey('SPACE');
      }

      if (view === 'homerow_4') {
          if (e.code === 'Space') {
            e.preventDefault();
            setView('homerow_practice');
          }
      } else if (view === 'homerow_practice') {
          // Prevent default browser actions for typing keys
          if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
             e.preventDefault();
          }

          const currentTarget = practiceKeys[practiceState.currentIndex];
          if (!currentTarget) return; // Finished

          // Map key to match (handling ; separately if needed)
          let pressed = e.key.toUpperCase();
          if (e.key === ';') pressed = ';';
          if (e.key === ' ') pressed = 'SPACE';
          
          if (pressed === currentTarget.key) {
              // Correct
              setPracticeState(prev => ({ ...prev, feedback: 'great', errorKey: null }));
              setTimeout(() => {
                  setPracticeState(prev => {
                  const nextIndex = prev.currentIndex + 1;
                  // Only practice the first 9 keys (A,S,D,F,Space,J,K,L,;)
                  if (nextIndex >= 9) {
                      return { ...prev, currentIndex: 0, feedback: null };
                  }
                  return { ...prev, currentIndex: nextIndex, feedback: null };
              });
              }, 1000);
          } else {
              // Incorrect
              setPracticeState(prev => ({ ...prev, feedback: 'error', errorKey: pressed }));
              setTimeout(() => {
                  setPracticeState(prev => ({ ...prev, feedback: null, errorKey: null }));
              }, 500);
          }
      }
    };

    const handleKeyUp = (e) => {
        if (e.code === 'Space') {
            setPressedKey(null);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [view, practiceState, practiceKeys]);

  // Auto-submit results when drill finishes
  useEffect(() => {
    if (drillState === 'results') {
      const durationSec = Math.max(1, drillTimeUsed);
      submitPracticeResult('key', drillHistory, durationSec);
    }
  }, [drillState]);

  useEffect(() => {
    if (wordDrillState === 'results') {
      const durationSec = Math.max(1, wordDrillTimeUsed);
      submitPracticeResult('word', wordDrillHistory, durationSec);
    }
  }, [wordDrillState]);

  useEffect(() => {
    if (sentenceDrillState === 'results') {
      const durationSec = Math.max(1, sentenceDrillTimeUsed);
      submitPracticeResult('sentence', sentenceDrillHistory, durationSec);
    }
  }, [sentenceDrillState]);

  useEffect(() => {
    if (paragraphDrillState === 'results') {
      const durationSec = Math.max(1, paragraphDrillTimeUsed);
      submitPracticeResult('paragraph', paragraphDrillHistory, durationSec);
    }
  }, [paragraphDrillState]);

  const fetchCompletedTests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setIsHistoryLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/practice/results', {
        headers: { 'x-auth-token': token }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched practice results:', data);
        // Filter results and sort by date descending
        const filtered = data
          .filter(res => {
            // If type is missing, check if level looks like a typing test
            if (!res.type) {
                return res.level && (res.level.toLowerCase().includes('test') || res.level.toLowerCase().includes('keyboard'));
            }
            return res.type === 'typing-test';
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        console.log('Filtered completed tests:', filtered);
        setCompletedTests(filtered);
      }
    } catch (err) {
      console.error('Error fetching completed tests:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedTests();
  }, []);

  useEffect(() => {
    if (view === 'typing_test_selection' || view === 'typing_test_results') {
      fetchCompletedTests();
    }
  }, [view]);

  // Typing Test Timer and Logic
  useEffect(() => {
    let timer;
    if (testIsActive && testStartTime && testTimeLeft > 0) {
      timer = setInterval(() => {
        setTestTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testIsActive, testStartTime]);

  // Handle Typing Test Completion
  useEffect(() => {
    if (testIsActive && testHasStarted && testTimeLeft === 0) {
      setTestIsActive(false);
      calculateTestResults();
    }
  }, [testTimeLeft, testIsActive, testHasStarted]);

  const calculateTestResults = async () => {
    const topicData = typingTestContent[selectedTestTopic] || typingTestContent[testTopics[0]];
    const targetText = fullTestText;
    const typedText = normalizeTestText(testInput);
    
    // Simple WPM calculation: (characters / 5) / minutes
    const timeUsedMinutes = (testInitialTime - testTimeLeft) / 60 || 1/60;
    
    // Accuracy calculation (Word-based) for CURRENT paragraph
    let currentCorrectChars = 0;
    const targetWords = targetText.split(' ');
    const typedWords = typedText.split(' ');

    for (let i = 0; i < typedWords.length; i++) {
        if (i >= targetWords.length) break;
        
        const word = typedWords[i];
        const target = targetWords[i];
        
        if (word === target) {
            currentCorrectChars += word.length;
            // Add space if it's not the last word or if there's a trailing space
            if (i < typedWords.length - 1) {
                currentCorrectChars += 1;
            }
        }
    }

    // Combine with completed stats
    const totalTypedLength = completedStats.chars + typedText.length;
    const totalCorrectChars = completedStats.correctChars + currentCorrectChars;

    const grossWpm = Math.round((totalTypedLength / 5) / timeUsedMinutes);
    const accuracy = totalTypedLength > 0 ? Math.round((totalCorrectChars / totalTypedLength) * 100) : 0;
    const netWpm = Math.round((totalCorrectChars / 5) / timeUsedMinutes);

    // Get top 6 difficult keys
    const difficultKeys = Object.entries(testKeyStats)
      .filter(([_, stats]) => stats.errors > 0)
      .sort((a, b) => (b[1].errors / b[1].count) - (a[1].errors / a[1].count))
      .slice(0, 6)
      .map(([key, stats]) => ({
        key,
        errorRate: Math.round((stats.errors / stats.count) * 100),
        errors: stats.errors
      }));

    setTestResults({
      timeUsed: formatTime(testInitialTime - testTimeLeft),
      grossWpm,
      accuracy,
      netWpm,
      interrupted: testTimeLeft > 0,
      difficultKeys
    });

    // Save typing test result
    const token = localStorage.getItem('token');
    if (token) {
        try {
            console.log('Saving typing test result...', {
                type: 'typing-test',
                level: `Typing Test: ${selectedTestTopic}`,
                wpm: netWpm,
                accuracy: accuracy
            });
            const response = await fetch(`${API_BASE_URL}/api/practice/results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    type: 'typing-test',
                    level: `Typing Test: ${selectedTestTopic}`,
                    wpm: netWpm,
                    accuracy: accuracy
                })
            });
            console.log('Save result response status:', response.status);
            const responseData = await response.json();
            console.log('Save result response data:', responseData);
             // Refresh history immediately after successful save
             fetchCompletedTests();
         } catch (err) {
            console.error('Error saving typing test result:', err);
        }
    }

    setView('typing_test_results');
  };

  // Render Functions
  const renderTypingTestResults = () => {
    if (!testResults) return null;

    return (
      <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '40px auto', padding: '0', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: '#fff'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', background: '#f8faff', borderBottom: '1px solid #eee'}}>
          <h2 style={{margin: 0, fontSize: '1.8rem', fontWeight: 'bold'}}>Typing Test Results</h2>
          <button 
            onClick={() => changeView('typing_test_selection')}
            style={{background: lightCourseColor, color: courseColor, border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}
          >
            ✕
          </button>
        </div>

        <div style={{padding: '30px', display: 'flex', gap: '40px'}}>
          <div style={{flex: 1}}>
            {testResults.interrupted && (
              <div style={{display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '25px', color: '#d32f2f'}}>
                <span style={{fontSize: '1.2rem'}}>⚠️</span>
                <div>
                  <div style={{fontWeight: 'bold'}}>Test Interrupted</div>
                  <div style={{fontSize: '0.9rem'}}>The test was interrupted before the time was up.</div>
                </div>
              </div>
            )}

            <div style={{display: 'flex', flexDirection: 'column', gap: '15px', borderTop: `1px solid ${courseColor}`, paddingTop: '20px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontWeight: 'bold', color: '#333'}}>Time Used</span>
                <span style={{color: '#000'}}>{testResults.timeUsed}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontWeight: 'bold', color: '#333'}}>Gross Speed</span>
                <span style={{color: '#000'}}>{testResults.grossWpm} wpm</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontWeight: 'bold', color: '#333'}}>Accuracy</span>
                <span style={{color: '#000'}}>{testResults.accuracy}%</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontWeight: 'bold', color: '#333'}}>Net Speed</span>
                <span style={{color: '#000'}}>{testResults.netWpm} wpm</span>
              </div>
            </div>

            <div style={{marginTop: '40px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                <h3 style={{fontSize: '1.1rem', margin: 0}}>Your Difficult Keys</h3>
                {testResults.difficultKeys && testResults.difficultKeys.length > 0 && (
                  <div style={{display: 'flex', gap: '15px', fontSize: '0.75rem'}}>
                    <div style={{color: '#ff1744'}}>● Problematic</div>
                    <div style={{color: '#ffc107'}}>● Difficult</div>
                    <div style={{color: '#8bc34a'}}>● OK</div>
                  </div>
                )}
              </div>
              
              <div style={{height: '200px', border: '1px solid #eee', background: '#fcfcfc', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '20px 15px', gap: '15px'}}>
                {testResults.difficultKeys && testResults.difficultKeys.length > 0 ? (
                  testResults.difficultKeys.map((item, idx) => {
                    // Height based on error rate (max 100%)
                    const height = Math.max(20, item.errorRate * 1.3); 
                    const color = item.errorRate > 50 ? '#ff1744' : (item.errorRate > 20 ? '#ffc107' : '#8bc34a');
                    
                    return (
                      <div key={idx} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'}}>
                        <div style={{
                          width: '30px', 
                          height: `${height}px`, 
                          background: color, 
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}></div>
                        <span style={{fontSize: '1rem', fontWeight: 'bold', color: '#333'}}>{item.key}</span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666'}}>
                    Great job! No significant errors detected.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{width: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
            <button 
              onClick={() => changeView('typing_test_selection')}
              style={{
                width: '100%',
                padding: '12px',
                background: courseColor,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Scroll active word into view - Removed as per user request for static view
  /*
  useEffect(() => {
    if (view === 'typing_test_practice') {
      const activeWord = document.getElementById('active-word');
      if (activeWord) {
        activeWord.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [testInput, view]);
  */

  const testTargetBoxRef = useRef(null);
  const testActiveTargetWordRef = useRef(null);
  const testVisibleTargetWordNodesRef = useRef(new Map());
  const testTargetLineEndsRef = useRef([]);

  useEffect(() => {
    if (!testIsActive) return;
    setTestViewportStartWord(0);
    testVisibleTargetWordNodesRef.current.clear();
    testActiveTargetWordRef.current = null;
  }, [generatedText, testCurrentParagraphIndex, testIsActive]);

  // Continuous scrolling logic - Update viewport based on active word line position
  useLayoutEffect(() => {
    if (!testIsActive) return;
    const box = testTargetBoxRef.current;
    const active = testActiveTargetWordRef.current;
    if (!box || !active) return;

    const map = testVisibleTargetWordNodesRef.current;
    const nodes = [];
    // Collect visible nodes in order
    for (let idx = testViewportStartWord; idx < testViewportStartWord + 240; idx++) {
      const n = map.get(idx);
      if (n) nodes.push({ index: idx, node: n });
    }
    if (!nodes.length) return;

    const firstTop = nodes[0].node.offsetTop;
    let firstLineWordCount = 0;
    let currentLineIndex = 0;
    let currentLineTop = firstTop;
    let activeWordLineIndex = -1;

    const lineEnds = [];
    let lastIndexInLine = nodes[0].index;
    for (const { index, node } of nodes) {
      const top = node.offsetTop;
      // Check for new line with a small buffer for sub-pixel rendering differences
      if (top > currentLineTop + 5) {
        lineEnds.push(lastIndexInLine);
        currentLineIndex++;
        currentLineTop = top;
      }

      // Count words in the first line
      if (currentLineIndex === 0) {
        firstLineWordCount++;
      }

      // Check if this is the active word
      if (node === active) {
        activeWordLineIndex = currentLineIndex;
      }

      lastIndexInLine = index;
    }
    testTargetLineEndsRef.current = lineEnds;

    // If active word is on the 6th line (index 5) or later, scroll one line
    if (activeWordLineIndex >= 5) {
      setTestViewportStartWord((prev) => prev + firstLineWordCount);
    }
  }, [testLockedTypedWords.length, testViewportStartWord, testIsActive, fullTestText]);

  const renderTypingTestPractice = () => {
    const topicData = typingTestContent[selectedTestTopic] || typingTestContent[testTopics[0]];
    const minutes = Math.floor(testTimeLeft / 60);
    const seconds = testTimeLeft % 60;
    const timeDisplay = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    // Constants for 5-line scrolling window
    const WORDS_PER_LINE = 12;
    const LINE_HEIGHT = 1.6;
    const FONT_SIZE = '1.3rem';
    const FONT_FAMILY = '"Times New Roman", Times, serif'; 
    
    // Chunk words into lines
    const targetWords = testTotalWords;
    const lines = [];
    for (let i = 0; i < targetWords.length; i += WORDS_PER_LINE) {
        lines.push(targetWords.slice(i, i + WORDS_PER_LINE));
    }
    
    // Calculate current position
    const activeWordIndex = testLockedTypedWords.length;
    const currentLineIndex = Math.floor(activeWordIndex / WORDS_PER_LINE);
    
    // Determine visible window (show 5 lines)
    const windowStartIndex = Math.max(0, currentLineIndex - 4);
    const visibleLines = lines.slice(windowStartIndex, windowStartIndex + 5);

    // Live Stats Calculation (Standardized to Chars/5)
    const timeElapsed = Math.max(1, testInitialTime - testTimeLeft);
    const minutesElapsed = timeElapsed / 60;
    
    let correctChars = 0;
    let totalChars = 0;
    testLockedTypedWords.forEach((word, idx) => {
        const wordLen = word.length + 1; // +1 for space
        totalChars += wordLen;
        if (word === testTotalWords[idx]) {
            correctChars += wordLen;
        }
    });

    const wpm = Math.round((correctChars / 5) / minutesElapsed) || 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    return (
      <div className="practice-view" style={{position: 'fixed', inset: 0, display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#fff', zIndex: 1000}}>
        {/* Main Content Area */}
        <div 
            style={{flex: 1, padding: '40px', background: '#f8faff', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}
            onClick={() => document.getElementById('typing-input')?.focus()}
        >
             {/* Title */}
             <h2 style={{margin: '0 0 20px 0', fontSize: '1.5rem', color: '#333', fontWeight: 'bold'}}>{selectedTestTopic}</h2>
            
            {/* Text Display (Target) */}
            <div style={{
                fontSize: FONT_SIZE, 
                lineHeight: LINE_HEIGHT, 
                color: '#333', 
                marginBottom: '20px', 
                fontFamily: FONT_FAMILY, 
                boxSizing: 'border-box',
                height: `calc(${FONT_SIZE} * ${LINE_HEIGHT} * 5 + 44px)`, // 5 lines + padding
                padding: '22px',
                background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 70%, #f6f3ff 100%)',
                border: '1px solid #e6ddff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {visibleLines.map((lineWords, lineIdx) => {
                    const actualLineIndex = windowStartIndex + lineIdx;
                    return (
                        <div key={actualLineIndex} style={{
                            display: 'flex', 
                            flexWrap: 'nowrap', 
                            gap: '12px',
                            height: `calc(${FONT_SIZE} * ${LINE_HEIGHT})`,
                            alignItems: 'center'
                        }}>
                            {lineWords.map((word, wordIdx) => {
                                const globalWordIndex = actualLineIndex * WORDS_PER_LINE + wordIdx;
                                const isTyped = globalWordIndex < activeWordIndex;
                                const isCurrent = globalWordIndex === activeWordIndex;
                                const typedWord = isTyped ? testLockedTypedWords[globalWordIndex] : (isCurrent ? testLockedCurrentWord : undefined);
                                
                                let color = '#555';
                                let bg = 'transparent';
                                let textDecor = 'none';

                                if (isTyped) {
                                    if (typedWord === word) {
                                        color = '#2e7d32'; // Correct
                                    } else {
                                        color = '#c62828'; // Error
                                        textDecor = 'underline';
                                    }
                                } else if (isCurrent) {
                                    bg = '#fff9c4'; // Current highlight
                                    if (testLockedCurrentWord && (!word.startsWith(testLockedCurrentWord) || testLockedCurrentWord.length > word.length)) {
                                        color = '#c62828';
                                        bg = '#ffcdd2';
                                    }
                                }

                                return (
                                    <span key={globalWordIndex} style={{
                                        color, 
                                        backgroundColor: bg, 
                                        textDecoration: textDecor, 
                                        textDecorationColor: color,
                                        borderRadius: '4px',
                                        padding: '0 2px'
                                    }}>
                                        {word}
                                    </span>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* Input Area (Typed) */}
            <div style={{borderTop: '2px solid #2196f3', paddingTop: '20px', position: 'relative'}}>
                <div
                  onClick={() => document.getElementById('typing-input')?.focus()}
                  style={{
                    width: '100%',
                    height: `calc(${FONT_SIZE} * ${LINE_HEIGHT} * 5 + 44px)`,
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    fontSize: FONT_SIZE,
                    lineHeight: LINE_HEIGHT,
                    background: '#fff',
                    color: '#333',
                    fontFamily: FONT_FAMILY,
                    padding: '22px',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {visibleLines.map((lineWords, lineIdx) => {
                      const actualLineIndex = windowStartIndex + lineIdx;
                      
                      return (
                        <div key={actualLineIndex} style={{
                            display: 'flex', 
                            flexWrap: 'nowrap', 
                            gap: '12px',
                            height: `calc(${FONT_SIZE} * ${LINE_HEIGHT})`,
                            alignItems: 'center'
                        }}>
                            {lineWords.map((targetWord, wordIdx) => {
                                const globalWordIndex = actualLineIndex * WORDS_PER_LINE + wordIdx;
                                const isTyped = globalWordIndex < activeWordIndex;
                                const isCurrent = globalWordIndex === activeWordIndex;
                                
                                let content = '\u00A0';
                                let style = { color: '#333' };
                                let showCursor = false;

                                if (isTyped) {
                                    content = testLockedTypedWords[globalWordIndex];
                                    if (content !== targetWord) {
                                        style.color = '#c62828';
                                        style.borderBottom = '2px solid #c62828';
                                    }
                                } else if (isCurrent) {
                                    content = testLockedCurrentWord;
                                    showCursor = true;
                                    if (content && (!targetWord.startsWith(content) || content.length > targetWord.length)) {
                                        style.color = '#c62828';
                                        style.borderBottom = '2px solid #c62828';
                                    }
                                }

                                return (
                                    <span key={globalWordIndex} style={{...style, whiteSpace: 'pre'}}>
                                        {content || (isCurrent ? '' : '\u00A0')}
                                        {showCursor && (
                                            <span className="cursor-blink" style={{ 
                                                display: 'inline-block', 
                                                width: '2px', 
                                                height: '1.2em', 
                                                backgroundColor: courseColor, 
                                                verticalAlign: 'middle',
                                                marginLeft: '1px'
                                            }} />
                                        )}
                                    </span>
                                );
                            })}
                        </div>
                      );
                  })}
                  
                  {!testHasStarted && !testInput && (
                    <div style={{position: 'absolute', top: '22px', left: '22px', color: '#999', pointerEvents: 'none'}}>
                        Start typing to begin...
                    </div>
                  )}
                </div>

                <textarea
                    id="typing-input"
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                    value={testInput}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 0,
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        cursor: 'text'
                    }}
                    onPaste={(e) => e.preventDefault()}
                    onClick={(e) => {
                      const el = e.currentTarget;
                      const end = el.value.length;
                      el.setSelectionRange(end, end);
                    }}
                    onChange={() => {}}
                    onKeyDown={(e) => {
                        if (e.ctrlKey || e.metaKey || e.altKey) return;
                        const key = e.key;
                        const navKeys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown','Delete'];
                        if (navKeys.includes(key) || key === 'Tab') {
                          e.preventDefault();
                          return;
                        }

                        const updateKeyStat = (typedChar) => {
                          const wordIdx = testLockedTypedWords.length;
                          const charIdx = testLockedCurrentWord.length;
                          const targetWord = testTotalWords[wordIdx];
                          
                          let targetChar = null;
                          if (typedChar === ' ') {
                               targetChar = ' ';
                          } else {
                               if (targetWord && charIdx < targetWord.length) {
                                   targetChar = targetWord[charIdx];
                               } else {
                                   targetChar = ' '; 
                               }
                          }
                          
                          const targetKey = targetChar ? (targetChar === ' ' ? 'SPACE' : targetChar.toUpperCase()) : null;
                          if (!targetKey) return;
                          
                          setTestKeyStats((prev) => {
                            const stats = prev[targetKey] || { errors: 0, count: 0 };
                            const isError = typedChar !== targetChar;
                            return {
                              ...prev,
                              [targetKey]: {
                                count: stats.count + 1,
                                errors: stats.errors + (isError ? 1 : 0)
                              }
                            };
                          });
                        };

                        const buildTypedText = (words, current) => {
                          if (!words.length) return current || '';
                          return `${words.join(' ')} ${current || ''}`;
                        };

                        const commitCompletedWord = (nextWords) => {
                           if (nextWords.length >= testTotalWords.length - 40) {
                              const more = generateMoreTopicParagraphs(18);
                              if (more.length) {
                                setTestParagraphs((prev) => [...prev, ...more]);
                              }
                           }
                        };

                        if (key === 'Backspace') {
                          e.preventDefault();
                          if (!testLockedCurrentWord) return;
                          const nextCurrent = testLockedCurrentWord.slice(0, -1);
                          setTestLockedCurrentWord(nextCurrent);
                          const nextText = buildTypedText(testLockedTypedWords, nextCurrent);
                          setTestInput(nextText);
                          return;
                        }

                        if (key === ' ') {
                          e.preventDefault();
                          updateKeyStat(' ');
                          const nextWords = [...testLockedTypedWords, testLockedCurrentWord];
                          setTestLockedTypedWords(nextWords);
                          setTestLockedCurrentWord('');
                          const nextText = `${nextWords.join(' ')} `;
                          setTestInput(nextText);
                          if (!testHasStarted) setTestHasStarted(true);
                          if (!testStartTime) setTestStartTime(Date.now());
                          commitCompletedWord(nextWords);
                          return;
                        }

                        if (key === 'Enter') {
                          e.preventDefault();
                          return;
                        }

                        if (key.length === 1) {
                            e.preventDefault();
                            updateKeyStat(key);
                            const nextCurrent = testLockedCurrentWord + key;
                            setTestLockedCurrentWord(nextCurrent);
                            const nextText = buildTypedText(testLockedTypedWords, nextCurrent);
                            setTestInput(nextText);
                            if (!testHasStarted) setTestHasStarted(true);
                            if (!testStartTime) setTestStartTime(Date.now());
                        }
                    }}
                />
            </div>
        </div>

        {/* Right Sidebar */}
        <div style={{
            width: '250px', 
            background: '#e8f5e9', 
            borderLeft: '1px solid #eee', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '40px 20px', 
            gap: '30px',
            boxShadow: '-2px 0 10px rgba(0,0,0,0.02)'
        }}>
            {/* Timer */}
            <div style={{
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                border: `4px solid ${testTimeLeft < 60 ? '#d32f2f' : courseColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#333',
                background: '#fff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
            }}>
                {timeDisplay}
            </div>

            {/* Buttons */}
            <div style={{marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                 <button 
                    onClick={() => {
                        setTestIsActive(false);
                        changeView('typing_test_selection');
                    }}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '25px',
                        border: '1px solid #ddd',
                        background: '#fff',
                        color: '#666',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                    }}
                 >
                    Cancel
                 </button>
                  <button 
                    onClick={() => {
                        setTestIsActive(false);
                        calculateTestResults();
                    }}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '25px',
                        border: 'none',
                        background: courseColor,
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                 >
                    Next
                 </button>
            </div>
        </div>
      </div>
    );
  };



  const renderTypingTestSelection = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '20px auto', padding: '30px', border: 'none', boxShadow: 'none', position: 'relative'}}>
      <button 
        onClick={() => changeView('intro')}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: '#666'
        }}
      >
        ✕
      </button>
      <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '30px', textAlign: 'left'}}>Typing Test</h1>
      
      <div style={{display: 'flex', gap: '40px', marginBottom: '40px', alignItems: 'flex-start'}}>
        {/* Topic Selection */}
        <div style={{flex: 1}}>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '20px'}}>
            <span style={{fontSize: '4rem', color: courseColor, fontWeight: 'bold', lineHeight: '1', opacity: '0.3'}}>1</span>
            <div style={{flex: 1}}>
              <label style={{display: 'block', fontWeight: 'bold', marginBottom: '10px', fontSize: '1.1rem'}}>Test Text</label>
              <div style={{border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden'}}>
                <div style={{height: '220px', overflowY: 'auto'}}>
                  {testTopics.map(topic => (
                    <div 
                      key={topic} 
                      onClick={() => setSelectedTestTopic(topic)}
                      style={{
                        padding: '10px 15px', 
                        cursor: 'pointer',
                        background: selectedTestTopic === topic ? courseColor : 'white',
                        color: selectedTestTopic === topic ? 'white' : '#333',
                        borderBottom: '1px solid #eee'
                      }}
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
              <p style={{fontSize: '0.9rem', color: '#666', marginTop: '10px', fontWeight: '500'}}>
              </p>
            </div>
          </div>
        </div>

        <div style={{width: '300px', display: 'flex', flexDirection: 'column', gap: '40px'}}>
          {/* Duration Selection */}
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '20px'}}>
            <span style={{fontSize: '4rem', color: courseColor, fontWeight: 'bold', lineHeight: '1', opacity: '0.3'}}>2</span>
            <div style={{flex: 1}}>
              <label style={{display: 'block', fontWeight: 'bold', marginBottom: '10px', fontSize: '1.1rem'}}>Duration</label>
              <select 
                style={{width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem'}}
                value={testDuration}
                onChange={(e) => setTestDuration(e.target.value)}
              >
                <option>1 min.</option>
                <option>2 min.</option>
                <option>3 min.</option>
                <option>5 min.</option>
                <option>10 min.</option>
              </select>
            </div>
          </div>

          {/* Start Button */}
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '20px'}}>
            <span style={{fontSize: '4rem', color: courseColor, fontWeight: 'bold', lineHeight: '1', opacity: '0.3'}}>3</span>
            <button 
              style={{
                flex: 1, 
                background: courseColor, 
                color: 'white', 
                border: 'none', 
                padding: '15px 20px', 
                borderRadius: '4px', 
                fontWeight: 'bold', 
                fontSize: '1.3rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onClick={startTypingTest}
            >
              Start test
            </button>
          </div>
        </div>
      </div>

      {/* Completed Tests Box */}
      <div style={{marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '30px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2 style={{fontSize: '1.8rem', fontWeight: 'normal', margin: 0}}>Completed Tests</h2>
          {isHistoryLoading && <span style={{fontSize: '0.9rem', color: '#666'}}>Refreshing...</span>}
        </div>

        {!localStorage.getItem('token') ? (
          <div style={{padding: '40px', textAlign: 'center', background: '#fff3e0', borderRadius: '8px', border: '1px solid #ffe0b2', color: '#e65100'}}>
            <span style={{fontSize: '1.2rem', marginRight: '10px'}}>👤</span>
            <strong>Log in to save and view your test history.</strong>
            <p style={{margin: '10px 0 0', fontSize: '0.9rem'}}>Your results will be recorded in your profile so you can track your progress.</p>
          </div>
        ) : completedTests.length > 0 ? (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem'}}>
              <thead>
                <tr style={{borderBottom: '2px solid #eee', textAlign: 'left'}}>
                  <th style={{padding: '12px 8px', color: '#666', fontWeight: '500'}}>Date</th>
                  <th style={{padding: '12px 8px', color: '#666', fontWeight: '500'}}>Test Name</th>
                  <th style={{padding: '12px 8px', color: '#666', fontWeight: '500'}}>Speed</th>
                  <th style={{padding: '12px 8px', color: '#666', fontWeight: '500'}}>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {completedTests.map((test, index) => (
                  <tr key={test._id || index} style={{borderBottom: '1px solid #f5f5f5'}}>
                    <td style={{padding: '12px 8px', color: '#333'}}>
                      {new Date(test.date).toLocaleDateString()}
                    </td>
                    <td style={{padding: '12px 8px', color: '#333'}}>
                      {test.level ? test.level.replace('Typing Test: ', '') : 'N/A'}
                    </td>
                    <td style={{padding: '12px 8px', color: '#333', fontWeight: 'bold'}}>
                      {test.wpm} wpm
                    </td>
                    <td style={{padding: '12px 8px', color: '#333'}}>
                      {test.accuracy}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px', color: '#666'}}>
            {isHistoryLoading ? 'Loading your test history...' : 'No tests completed yet. Start your first test above!'}
          </div>
        )}
      </div>
    </div>
  );

  const renderIntro = () => (
    <div className="intro-container">
      {/* 1st Section: Fast Touch Typing Course */}
      <div className="practice-card intro-section">
        <div className="card-header">
          Fast Touch Typing Course
        </div>
        <div className="card-body intro-content">
          <div className="intro-text-content">
            <h2>Learn to type faster and more accurately</h2>
            <p>Complete our comprehensive course to master touch typing skills.</p>
          </div>
          <div className="intro-action">
            <button 
              className="btn-start" 
              onClick={() => {
                setCourseType('main');
                localStorage.setItem('courseType', 'main');
                setCurrentLesson(1);
                localStorage.setItem('currentLesson', '1');
                changeView('overview');
              }}
            >
              Start Learning
            </button>
          </div>
        </div>
      </div>

      {/* 2nd Section: Advanced Keys & Symbols */}
      <div className="practice-card intro-section">
        <div className="card-header">
          Advanced Keys & Symbols Masterclass
        </div>
        <div className="card-body intro-content">
          <div className="intro-text-content">
            <h2>Master numbers, symbols, and punctuation</h2>
            <p>Go beyond letters and become a true typing expert with these advanced reaches.</p>
          </div>
          <div className="intro-action">
            <button 
              className="btn-start" 
              onClick={() => {
                setCourseType('advanced');
                localStorage.setItem('courseType', 'advanced');
                setCurrentLesson(1);
                localStorage.setItem('currentLesson', '1');
                changeView('overview');
              }}
            >
              Start Advanced Training
            </button>
          </div>
        </div>
      </div>

      {/* 3rd Section: Typing Test */}
      <div className="practice-card intro-section">
        <div className="card-header">
          Typing Test
        </div>
        <div className="card-body intro-content">
          <div className="intro-text-content">
            <h2>Test your typing speed</h2>
            <p>Choose from various topics and durations to measure your performance.</p>
          </div>
          <div className="intro-action">
            <button 
              className="btn-start" 
              onClick={() => changeView('typing_test_selection')}
              style={{ marginLeft: '0' }}
            >
              Start Typing Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="practice-card" style={{minHeight: '500px'}}>
      <div className="card-body" style={{padding: '30px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
            <h2 style={{marginTop: 0, fontWeight: 'normal', fontSize: '2rem'}}>
              {courseType === 'advanced' ? 'Advanced Keys & Symbols Masterclass' : 'Fast Touch Typing Course'}
            </h2>
            <button className="btn-cancel" style={{fontSize: '0.9rem', backgroundColor: '#A435F0', color: 'white', fontWeight: 'bold'}} onClick={() => changeView('intro')}>Change course</button>
        </div>
        
        <div className="overview-container">
          <div className="lessons-list">
            <h3>Lessons</h3>
            <ol style={{paddingLeft: '20px', margin: 0}}>
              {lessons.map((lesson, idx) => {
                const lessonNumber = idx + 1;
                return (
                  <li key={idx} className="lesson-item">
                      <a onClick={() => {
                          changeView('lesson_detail', `lesson-${lessonNumber}`);
                      }}>{lesson}</a>
                  </li>
                );
              })}
            </ol>
          </div>
          

        </div>

        <div className="course-progress-bar">
             <button className="btn-cancel" onClick={() => changeView('intro')}>Cancel</button>
             <button 
                className="btn-start" 
                style={{background: courseColor}}
                onClick={() => changeView('lesson_detail')}
             >
                Start Now
             </button>
        </div>
      </div>
    </div>
  );

  const renderLessonDetail = () => (
    <div className="practice-card">
      <div className="card-body" style={{padding: '30px'}}>
         <h2 style={{marginTop: 0, fontWeight: 'normal', fontSize: '2rem', marginBottom: '10px'}}>
            {courseType === 'advanced' ? 'Advanced Keys & Symbols Masterclass' : 'Fast Touch Typing Course'}
         </h2>
         <div style={{display: 'flex', gap: '5px', marginBottom: '20px'}}>
             {lessons.map((_, i) => {
                 const lessonNumber = i + 1;
                 return (
                    <div 
                        key={i} 
                        onClick={() => {
                            changeView('lesson_detail', `lesson-${lessonNumber}`);
                        }}
                        style={{
                            background: lessonNumber === currentLesson ? courseColor : 'transparent',
                            color: lessonNumber === currentLesson ? 'white' : '#ddd',
                            padding: '5px 12px',
                            border: lessonNumber === currentLesson ? 'none' : '1px solid #eee',
                            borderRadius: '2px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            opacity: 1
                        }}>
                        {lessonNumber}
                    </div>
                 );
             })}
         </div>

         <div className="lesson-detail-header" style={{background: 'transparent', border: 'none', textAlign: 'center', marginTop: '10px'}}>
            Lesson {currentLesson}: {lessons[currentLesson - 1]}
         </div>

         <div style={{border: '1px solid #ccc', borderRadius: '4px', padding: '0'}}>
             {subLessons.map((sub, idx) => (
                 <div key={idx} className="sub-lesson-item" style={{
                     padding: '10px 15px', 
                     borderBottom: idx === subLessons.length -1 ? 'none' : '1px solid #eee', 
                     background: idx === 0 ? lightCourseColor : 'white'
                 }}>
                     <div className="sub-lesson-icon" style={{
                         border: idx === 0 ? `2px solid ${courseColor}` : '2px solid #ccc'
                     }}></div>
                     <span style={{fontWeight: 'bold', marginRight: '10px'}}>{currentLesson}.{idx + 1}</span>
                     <span 
                       className="sub-lesson-title" 
                       style={{fontWeight: idx === 0 ? 'bold' : 'normal'}}
                       onClick={() => {
                           if (sub.view) {
                               if (sub.view === 'key_drill') {
                                   setDrillState('info');
                                   setDrillTimeLeft(300);
                                   setDrillInput('');
                                   setDrillHistory({ correct: 0, errors: 0, total: 0 });
                                   setDrillCurrentPatternIndex(0);
                               } else if (sub.view === 'word_drill') {
                                   setWordDrillState('info');
                                   setWordDrillTimeLeft(300);
                                   setWordDrillInput('');
                                   setWordDrillHistory({ correct: 0, errors: 0, total: 0 });
                                   setWordDrillCurrentPatternIndex(0);
                               } else if (sub.view === 'sentence_drill') {
                                   setSentenceDrillState('info');
                                   setSentenceDrillTimeLeft(300);
                                   setSentenceDrillInput('');
                                   setSentenceDrillHistory({ correct: 0, errors: 0, total: 0 });
                                   setSentenceDrillCurrentPatternIndex(0);
                               } else if (sub.view === 'paragraph_drill') {
                                   setParagraphDrillState('intro');
                                   setParagraphDrillTimeLeft(300);
                                   setParagraphDrillInput('');
                                   setParagraphDrillHistory({ correct: 0, errors: 0, total: 0 });
                                   setParagraphDrillCurrentPatternIndex(0);
                                   setParagraphDrillCompletedRows([]);
                               }
                               changeView(sub.view);
                           }
                       }}
                    >
                        {sub.title}
                     </span>
                     <span className="sub-lesson-duration">{sub.duration}</span>
                 </div>
             ))}
         </div>

         <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '20px'}}>
             <button 
                className="btn-start" 
                style={{backgroundColor: '#A435F0', color: 'white', fontWeight: 'bold'}}
                onClick={() => changeView('intro')}
             >
                Change course
             </button>
         </div>
      </div>
    </div>
  );

  // Slide 1: What is Touch Typing?
  const renderSlide1 = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '0 auto', height: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
      <div className="slide-header">
        <span>What Is Touch Typing?</span>
        <button className="close-btn" onClick={() => changeView('lesson_detail')}>×</button>
      </div>
      <div className="slide-content" style={{display: 'flex', flexDirection: 'row', gap: '40px', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px', overflow: 'hidden'}}>
        <div className="slide-text" style={{flex: 1, maxHeight: '100%', overflowY: 'auto', paddingRight: '20px'}}>
          <p style={{fontWeight: 'bold', marginBottom: '20px'}}>
            "Touch typing" is a technique for typing quicker and more accurately with all ten fingers - without ever having to look at the keyboard.
          </p>
          <p>After completing the Touch Typing Course you will know how to:</p>
          <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px'}}>
            <li>Type faster with 10 fingers</li>
            <li>Type without errors</li>
            <li>Type without looking at the keyboard</li>
            <li>Improve your computing habits for better ergonomics</li>
          </ul>
          <p>
            This means you will be able to type your documents and emails much faster with fewer errors -- saving you lots of time and making typing much more enjoyable.
          </p>
        </div>
        <div className="slide-image" style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
           <img src={typingImg} alt="Touch Typing" style={{maxWidth: '100%', maxHeight: '400px', width: 'auto', borderRadius: '8px', border: `1px solid ${gradientStart}`}} />
        </div>
      </div>
      <div className="slide-footer">
        <button className="btn-cancel" onClick={() => changeView('lesson_detail')}>Cancel</button>
        <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>1 of 5</span>
        <button className="btn-next" onClick={() => setView('slide_2')}>Next</button>
      </div>
    </div>
  );

 


  // Helper to render visual guide (Slide 2 & 3)
  const _renderFingerMappingGraphic = (type, showHands = true, showKeyboard = true, showLines = showHands) => {
    const width = 500;
    const padding = 12;
    const availableWidth = width - (padding * 2);
    const unit = availableWidth / 14; // Home row has 14 flex units
    
    // Adjusted key coordinates to match visual layout
    const keyCoords = {
            'A': { x: padding + (2.0 * unit), y: 142 },
            'S': { x: padding + (3.0 * unit), y: 142 },
            'D': { x: padding + (4.0 * unit), y: 142 },
            'F': { x: padding + (5.0 * unit), y: 142 },
            'J': { x: padding + (8.0 * unit), y: 142 },
            'K': { x: padding + (9.0 * unit), y: 142 },
            'L': { x: padding + (10.0 * unit), y: 142 },
            ';': { x: padding + (11.0 * unit), y: 142 },
            'U': { x: padding + (7.8 * unit), y: 92 }, // Slightly left of J due to stagger
            'Space': { x: width / 2, y: 242 }
        };

    const getFingerCoord = (fingerName) => {
        const pos = handsPngFingerPositions[fingerName];
        if (!pos) return { x: 0, y: 0 };
        const x = (parseFloat(pos.left) / 100) * width;
        // Adjust Y to start exactly at the finger dots
        const y = 290 + (parseFloat(pos.top) / 100) * 300;
        return { x, y };
    };

    const renderLines = () => {
        const colorMap = { 
            blue: '#6c8cff', 
            red: '#ff6b6b', 
            green: '#51cf66', 
            purple: '#cc5de8' 
        };

        if (type === 'home_row') {
            const mappings = [
                { key: 'A', finger: 'left_pinky', color: 'blue' },
                { key: 'S', finger: 'left_ring', color: 'red' },
                { key: 'D', finger: 'left_middle', color: 'green' },
                { key: 'F', finger: 'left_index', color: 'purple' },
                { key: 'J', finger: 'right_index', color: 'purple' },
                { key: 'K', finger: 'right_middle', color: 'green' },
                { key: 'L', finger: 'right_ring', color: 'red' },
                { key: ';', finger: 'right_pinky', color: 'blue' }
            ];

            return mappings.map((m, i) => {
                const k = keyCoords[m.key];
                const f = getFingerCoord(m.finger);
                const color = colorMap[m.color];

                return (
                    <g key={`mapping-group-${i}`}>
                        <line 
                            x1={f.x} y1={f.y}
                            x2={k.x} y2={k.y + 25} 
                            stroke={color} 
                            strokeWidth="4"
                            opacity="0.8"
                            strokeLinecap="round"
                        />
                        {/* Dot at finger end */}
                        <circle cx={f.x} cy={f.y} r="6" fill={color} />
                        {/* Dot at key end */}
                         <circle cx={k.x} cy={k.y + 25} r="5" fill={color} />
                    </g>
                );
            });
        } else if (type === 'j_to_u') {
            const kU = keyCoords['U'];
            const f = getFingerCoord('right_index'); 
            const color = '#cc5de8'; // purple for index finger
            
            return (
                <g>
                    <line 
                        x1={f.x} y1={f.y} 
                        x2={kU.x} y2={kU.y + 10} 
                        stroke={color} 
                        strokeWidth="4" 
                        strokeOpacity="0.8" 
                        strokeLinecap="round"
                    />
                     <circle cx={f.x} cy={f.y} r="6" fill={color} />
                     <circle cx={kU.x} cy={kU.y + 10} r="4" fill={color} />
                </g>
            );
        }
        return null;
    };

    const activeKeys = type === 'home_row' 
        ? ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'] 
        : ['J', 'U'];

    return (
        <div style={{
            position: 'relative', 
            width: `${width}px`, 
            margin: '0 auto',
            transform: 'scale(0.9)', // Slightly smaller to fit
            transformOrigin: 'top center',
            marginBottom: showHands ? '-40px' : '0',
            minHeight: showHands ? '550px' : 'auto'
        }}>
            {showKeyboard && (
                <div style={{position: 'relative', zIndex: 5, marginTop: '10px'}}>
                    {renderKeyboard(activeKeys, null, '45px', false)}
                </div>
            )}
            
            {/* SVG Layer for lines - placed between keyboard and hands visually, but z-index management is key */}
            {showLines && (
                <svg 
                    style={{
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        zIndex: 10, 
                        pointerEvents: 'none',
                        overflow: 'visible'
                    }}
                >
                    {renderLines()}
                </svg>
            )}

            {showHands && (
                <div style={{marginTop: '20px'}}>
                    {renderHands(activeKeys, [], false, {width: '100%', height: '300px', objectFit: 'contain'}, handsImg)}
                </div>
            )}
        </div>
    );
  };

  // Slide 2: Finger Positions
  const renderSlide2 = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '0 auto', height: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
      <div className="slide-header">
        <span>Finger Positions</span>
        <button className="close-btn" onClick={() => changeView('lesson_detail')}>×</button>
      </div>
      <div className="slide-content" style={{display: 'flex', flexDirection: 'row', gap: '40px', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px', overflow: 'hidden'}}>
        <div className="slide-text" style={{flex: 1, maxHeight: '100%', overflowY: 'auto', paddingRight: '20px'}}>
          <p style={{marginBottom: '15px', marginTop: 0}}>
            In their basic position, your fingers rest on the middle row of the keyboard - also called the "home row". The home row is the base from which all other keys can be reached.
          </p>
          <p style={{fontWeight: 'bold', marginBottom: '10px'}}>Now place your fingers on the home row:</p>
          <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px'}}>
             <li>Left hand fingers on keys <strong>A, S, D,</strong> and <strong>F</strong></li>
             <li>Right hand fingers on keys <strong>J, K, L,</strong> and <strong>;</strong> (semicolon)</li>
             <li>Let the thumbs rest lightly on the space bar</li>
             <li>Keep your wrists straight and fingers lightly curled</li>
          </ul>
          <div style={{marginTop: '20px'}}>
              <p><strong>Tip!</strong> Can you feel small bumps on the F and J keys? They are there to help you find the home row keys without looking at your hands.</p>
          </div>
        </div>
        <div className="slide-image" style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <img
            src={hrFingersImg}
            alt="Home Row Fingers"
            style={{ maxWidth: '100%', maxHeight: '420px', width: 'auto', height: 'auto', objectFit: 'contain' }}
          />
        </div>
      </div>
      <div className="slide-footer">
        <button className="btn-cancel" onClick={() => changeView('lesson_detail')}>Cancel</button>
        <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>2 of 5</span>
        <button className="btn-next" onClick={() => setView('slide_3')}>Next</button>
      </div>
    </div>
  );

  // Slide 3: Pressing Keys
  const renderSlide3 = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '0 auto', height: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
      <div className="slide-header">
        <span>Pressing Keys</span>
        <button className="close-btn" onClick={() => changeView('lesson_detail')}>×</button>
      </div>
      <div className="slide-content" style={{display: 'flex', flexDirection: 'row', gap: '40px', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px', overflow: 'hidden'}}>
        <div className="slide-text" style={{flex: 1, maxHeight: '100%', overflowY: 'auto', paddingRight: '20px'}}>
          <p style={{marginBottom: '20px', marginTop: 0}}>
            Each key is pressed by the finger on the home row that is closest. After reaching a key away from the home row, the finger needs to return to its home row key.
          </p>
          <p style={{fontWeight: 'bold', marginBottom: '5px'}}>Example: How to Type Letter U</p>
          <ol style={{paddingLeft: '20px', marginBottom: '20px'}}>
            <li>Make sure that your fingers are on home row</li>
            <li>Move your right index finger from J upwards to U. Your hand may move slightly to make it easier to reach U.</li>
            <li>Press U with a quick and light touch keeping your hand relaxed.</li>
            <li>Move the index finger back to its home key J.</li>
          </ol>
          <p style={{fontWeight: 'bold', marginBottom: '5px'}}>The Space Bar</p>
          <p>
            Most people use their right thumb for the Space bar. Left-handed people may find it easier to use their left thumb. Whichever thumb you decide to use, stick with it. Never use both thumbs.
          </p>
        </div>
        <div className="slide-image" style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <img
            src={ugFingersImg}
            alt="U Key Finger Guide"
            style={{ width: '100%', maxWidth: '440px', maxHeight: '400px', height: 'auto', objectFit: 'contain' }}
          />
        </div>
      </div>
      <div className="slide-footer">
        <button className="btn-cancel" onClick={() => changeView('lesson_detail')}>Cancel</button>
        <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>3 of 5</span>
        <button className="btn-next" onClick={() => setView('slide_4')}>Next</button>
      </div>
    </div>
  );

  // Slide 4: Learning Tips
  const renderSlide4 = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '0 auto', height: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
      <div className="slide-header">
        <span>Learning Tips</span>
        <button className="close-btn" onClick={() => changeView('lesson_detail')}>×</button>
      </div>
      <div className="slide-content" style={{display: 'flex', flexDirection: 'row', gap: '40px', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px', overflow: 'hidden'}}>
        <div className="slide-text" style={{flex: 1, maxHeight: '100%', overflowY: 'auto', paddingRight: '20px'}}>
          <div style={{marginBottom: '20px'}}>
             <h3 style={{margin: '0 0 5px 0', fontSize: '1.1rem'}}>Keep Your Eyes on the Monitor</h3>
             <p style={{margin: 0}}>You will learn the key positions faster if you don't peek at the keyboard when training.</p>
          </div>
          
          <div style={{marginBottom: '20px'}}>
             <h3 style={{margin: '0 0 5px 0', fontSize: '1.1rem'}}>Keep Wrists Up</h3>
             <p style={{margin: 0}}>
                Keep your wrists up and straight when typing. Resting your wrists on the wrist rest or the desk will create an uncomfortable angle making it more difficult to move your fingers. This causes errors and slows you down. Holding your wrists too high has the same effect increasing the tension in the shoulders.
             </p>
          </div>

          <div style={{marginBottom: '20px'}}>
             <h3 style={{margin: '0 0 5px 0', fontSize: '1.1rem'}}>Focus on Accuracy</h3>
             <p style={{margin: 0}}>
                We believe that good accuracy is the building block of fluent typing. This is why you'll have an accuracy target throughout the course. Your speed will develop over time as you practice.
             </p>
          </div>
        </div>
        <div className="slide-image" style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
           <img src={typingImg} alt="Typing Posture" style={{maxWidth: '100%', maxHeight: '400px', width: 'auto', borderRadius: '8px', border: '1px solid #ddd'}} />
        </div>
      </div>
      <div className="slide-footer">
        <button className="btn-cancel" onClick={() => changeView('lesson_detail')}>Cancel</button>
        <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>4 of 5</span>
        <button className="btn-next" onClick={() => setView('slide_5')}>Next</button>
      </div>
    </div>
  );

  // Slide 5: Ready to Start
  const renderSlide5 = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '0 auto', height: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
      <div className="slide-header">
        <span>Ready to Start</span>
        <button className="close-btn" onClick={() => changeView('lesson_detail')}>×</button>
      </div>
      <div className="slide-content" style={{display: 'flex', flexDirection: 'row', gap: '40px', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px', overflow: 'hidden'}}>
        <div className="slide-text" style={{flex: 1, maxHeight: '100%', overflowY: 'auto', paddingRight: '20px'}}>
          <p style={{fontSize: '1.2rem', marginBottom: '20px'}}>Just a few more tips!</p>

          <div style={{marginBottom: '20px'}}>
             <h3 style={{margin: '0 0 5px 0', fontSize: '1.1rem'}}>Relaxed Posture</h3>
             <p style={{margin: 0}}>
                Sit up straight, elbows close to the body. Try to keep shoulders, arms and hands relaxed to avoid tension and discomfort.
             </p>
          </div>
          
          <div style={{marginBottom: '20px'}}>
             <h3 style={{margin: '0 0 5px 0', fontSize: '1.1rem'}}>Taking Breaks</h3>
             <p style={{margin: 0}}>
                Take breaks between exercises to relieve tension and regain your concentration. Don't overdo training. We recommend doing only 1-2 lessons a day.
             </p>
          </div>

          <div style={{marginBottom: '20px'}}>
             <h3 style={{margin: '0 0 5px 0', fontSize: '1.1rem'}}>Pausing an Exercise</h3>
             <p style={{margin: 0}}>To pause an exercise, click the Pause button.</p>
          </div>

          <div style={{marginTop: '30px'}}>
             <p style={{margin: '0 0 5px 0'}}>We hope you enjoy learning to type!</p>
             <p style={{margin: 0, fontFamily: 'cursive', color: courseColor, fontSize: '1.2rem'}}>edUnity</p>
          </div>
        </div>
        <div className="slide-image" style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
           <img src={typingImg} alt="Ready to Start" style={{maxWidth: '100%', maxHeight: '400px', width: 'auto', borderRadius: '8px', border: '1px solid #ddd'}} />
        </div>
      </div>
      <div className="slide-footer">
        <button className="btn-cancel" onClick={() => changeView('lesson_detail')}>Cancel</button>
        <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>5 of 5</span>
        <button className="btn-next" onClick={() => changeView('lesson_detail')}>OK</button>
      </div>
    </div>
  );

  // Home Row 1
  const renderHomeRow1 = () => (
    <div className="practice-card practice-split-layout" style={{maxHeight: '90vh', height: '650px', position: 'relative'}}>
        <div className="practice-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{marginTop: 0, fontWeight: 'normal', fontSize: '1.8rem', lineHeight: '1.4', width: '100%', textAlign: 'center'}}>In this lesson you will learn the home row : <br/> A S D F and J K L ;</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
                {renderKeyboard(['A', 'S', 'D', 'F', 'J', 'K', 'L', ';', 'Enter', 'Shift', 'Back'], null, '30px', false, { margin: '0' })}
                {renderHands(['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'], [], true, { marginTop: '0px' })}
            </div>
        </div>
        <div className="practice-sidebar">
             <button className="close-btn" style={{alignSelf: 'flex-end', color: '#333', fontSize: '2rem'}} onClick={() => changeView('lesson_detail')}>×</button>
             <div style={{flex: 1}}></div>
        </div>
        <div style={{ position: 'absolute', right: '16px', bottom: '16px', display: 'flex', gap: '10px', zIndex: 50 }}>
            <button className="btn-cancel" style={{ width: 'auto', padding: '8px 14px', fontSize: '0.95rem', borderRadius: '8px' }} onClick={() => changeView('lesson_detail')}>Cancel</button>
            <button className="btn-next" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.95rem', borderRadius: '8px' }} onClick={() => setView('homerow_2')}>Next</button>
        </div>
    </div>
  );

  // Home Row 2
  const renderHomeRow2 = () => (
    <div className="practice-card practice-split-layout" style={{maxHeight: '90vh', height: '650px', position: 'relative'}}>
        <div className="practice-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{marginTop: 0, fontWeight: 'normal', width: '100%', textAlign: 'center'}}>Left hand position</h2>
            <p style={{fontWeight: 'bold', width: '100%', textAlign: 'center'}}>Place your fingers on A S D F</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
                {renderKeyboard(['A', 'S', 'D', 'F'], null, '30px', false, { margin: '0' })}
                {renderHands(['A', 'S', 'D', 'F'], [], true, { marginTop: '0px' })}
            </div>
        </div>
        <div className="practice-sidebar">
             <button className="close-btn" style={{alignSelf: 'flex-end', color: '#333', fontSize: '2rem'}} onClick={() => changeView('lesson_detail')}>×</button>
             <div style={{flex: 1}}></div>
        </div>
        <div style={{ position: 'absolute', right: '16px', bottom: '16px', display: 'flex', gap: '10px', zIndex: 50 }}>
            <button className="btn-cancel" style={{ width: 'auto', padding: '8px 14px', fontSize: '0.95rem', borderRadius: '8px' }} onClick={() => changeView('lesson_detail')}>Cancel</button>
            <button className="btn-next" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.95rem', borderRadius: '8px' }} onClick={() => setView('homerow_3')}>Next</button>
        </div>
    </div>
  );

  // Home Row 3
  const renderHomeRow3 = () => (
    <div className="practice-card practice-split-layout" style={{maxHeight: '90vh', height: '650px', position: 'relative'}}>
        <div className="practice-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{marginTop: 0, fontWeight: 'normal', width: '100%', textAlign: 'center'}}>Right hand position</h2>
            <p style={{fontWeight: 'bold', width: '100%', textAlign: 'center'}}>Place your fingers on J K L ;</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
                {renderKeyboard(['J', 'K', 'L', ';'], null, '30px', false, { margin: '0' })}
                {renderHands(['J', 'K', 'L', ';'], [], true, { marginTop: '0px' })}
            </div>
        </div>
        <div className="practice-sidebar">
             <button className="close-btn" style={{alignSelf: 'flex-end', color: '#333', fontSize: '2rem'}} onClick={() => changeView('lesson_detail')}>×</button>
             <div style={{flex: 1}}></div>
        </div>
        <div style={{ position: 'absolute', right: '16px', bottom: '16px', display: 'flex', gap: '10px', zIndex: 50 }}>
            <button className="btn-cancel" style={{ width: 'auto', padding: '8px 14px', fontSize: '0.95rem', borderRadius: '8px' }} onClick={() => changeView('lesson_detail')}>Cancel</button>
            <button className="btn-next" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.95rem', borderRadius: '8px' }} onClick={() => setView('homerow_4')}>Next</button>
        </div>
    </div>
  );

  // Home Row 4: Thumb Position
  const renderHomeRow4 = () => (
    <div className="practice-card practice-split-layout" style={{maxHeight: '90vh', height: '800px', position: 'relative'}}>
        <div className="practice-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
            <h2 style={{marginTop: '20px', fontWeight: 'normal', width: '100%', textAlign: 'center', fontSize: '1.8rem'}}>Let your thumbs rest on the space bar.</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '20px' }}>
                <div style={{ width: '100%', padding: '0' }}>
                    {renderKeyboard(['Space'], null, '30px', false, { margin: '0 auto' })}
                </div>
                <div style={{ marginTop: '0px', width: '100%' }}>
                     {renderHands(['Space'], ['left_thumb', 'right_thumb'], true, { marginTop: '0' })}
                 </div>
            </div>

            <p 
                style={{fontWeight: 'bold', fontSize: '1.2rem', marginTop: '30px', marginBottom: '20px', cursor: 'pointer', color: courseColor, width: '100%', textAlign: 'center'}}
                onClick={() => setView('homerow_practice')}
            >
                Press Space to start the lesson
            </p>
        </div>
        <div className="practice-sidebar">
             <button className="close-btn" style={{alignSelf: 'flex-end', color: '#333', fontSize: '2rem'}} onClick={() => changeView('lesson_detail')}>×</button>
             <div style={{flex: 1}}></div>
        </div>
        <div style={{ position: 'absolute', right: '16px', bottom: '16px', display: 'flex', gap: '10px', zIndex: 50 }}>
            <button className="btn-cancel" style={{ width: 'auto', padding: '8px 14px', fontSize: '0.95rem', borderRadius: '8px' }} onClick={() => changeView('lesson_detail')}>Cancel</button>
            <button className="btn-next" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.95rem', borderRadius: '8px' }} onClick={() => setView('homerow_practice')}>Start</button>
        </div>
    </div>
  );

  // Helper for starting a review session with difficult keys
  const startReviewForKeys = (keyStats) => {
    // Process stats to find difficult keys (exclude SPACE and ENTER as they are common)
    const sortedKeys = Object.entries(keyStats)
      .filter(([key]) => key !== 'SPACE' && key !== 'ENTER')
      .sort((a, b) => {
        const scoreA = (a[1].errors * 10) + (a[1].backspaces * 5);
        const scoreB = (b[1].errors * 10) + (b[1].backspaces * 5);
        return scoreB - scoreA;
      })
      .slice(0, 5) // Top 5 difficult keys
      .map(entry => entry[0].toLowerCase());
    
    if (sortedKeys.length === 0) return;

    const generated = [];
    const homeRow = ['f', 'j', 'd', 'k', 's', 'l', 'a']; // lowercase home row
    
    // Create challenging combinations for each difficult key
    sortedKeys.forEach(k => {
      // 1. Repeat patterns (long - 10 characters per row)
      generated.push(`${k}${k}${k}${k}${k} ${k}${k}${k}${k}${k} `);
      generated.push(`${k}${k} ${k}${k} ${k}${k} ${k}${k} ${k}${k} `);
      
      // 2. Mix with other difficult keys or neighbors
      const others = sortedKeys.filter(ok => ok !== k);
      if (others.length > 0) {
          others.forEach(ok => {
              // Challenging alternation patterns
              generated.push(`${k}${ok}${k}${ok} ${ok}${k}${ok}${k} `);
              generated.push(`${k}${k}${ok}${ok} ${ok}${ok}${k}${k} `);
          });
      } else {
          // If only one difficult key, mix with home row keys
          homeRow.slice(0, 4).forEach(hr => {
              if (hr !== k) {
                  generated.push(`${k}${hr}${k}${hr} ${hr}${k}${hr}${k} `);
                  generated.push(`${k}${k}${hr}${hr} ${hr}${hr}${k}${k} `);
              }
          });
      }
    });

    // Add more variety to ensure length (at least 20 patterns)
    while (generated.length < 20 && sortedKeys.length > 0) {
        const k1 = sortedKeys[Math.floor(Math.random() * sortedKeys.length)];
        const k2 = sortedKeys[Math.floor(Math.random() * sortedKeys.length)];
        const hr = homeRow[Math.floor(Math.random() * homeRow.length)];
        
        if (k1 === k2) {
            generated.push(`${k1}${hr}${k1} ${hr}${k1}${hr} ${k1}${hr}${k1} `);
        } else {
            generated.push(`${k1}${k2}${hr} ${hr}${k2}${k1} ${k1}${hr}${k2} `);
        }
    }

    setReviewPatterns(generated.slice(0, 24)); // Up to 24 patterns for substantial practice
    setReviewPatternIndex(0);
    setReviewInput('');
    setReviewProgress(0);
    setReviewStartTime(Date.now());
    setReviewEndTime(null);
    changeView('review_difficult');
  };

  // Helper for Difficult Keys Graph
  const renderDifficultKeysGraph = (statsData = drillKeyStats, onReview = null) => {
    // Process stats to find difficult keys
    const statsArray = Object.entries(statsData)
      .map(([key, stats]) => {
        const avgDelay = stats.count > 0 ? stats.totalDelay / stats.count : 0;
        // Difficulty Score: Errors (10pts), Backspaces (5pts), Delay > 500ms (1pt per 100ms)
        const delayScore = Math.max(0, (avgDelay - 500) / 100);
        const score = (stats.errors * 10) + (stats.backspaces * 5) + delayScore;
        return { key, score, stats };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Show top 5 difficult keys

    if (statsArray.length === 0) return null;

    // Calculate dynamic scale based on max score
    const maxScore = Math.max(...statsArray.map(item => item.score));
    const scale = Math.max(50, maxScore * 1.2); // Buffer of 20% or at least 50

    return (
      <div style={{
        padding: '10px 15px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        margin: '5px auto',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#333' }}>
            Difficult Keys in this Exercise
          </h3>
        </div>

        <div style={{
          position: 'relative',
          height: '140px',
          background: '#f9f9f9',
          border: '1px solid #eee',
          borderRadius: '4px',
          padding: '5px 85px 30px 15px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '5px',
          marginBottom: '10px',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>
          {/* Y-Axis Labels */}
          <div style={{ position: 'absolute', right: '5px', top: '10px', bottom: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', textAlign: 'right', width: '75px', zIndex: 10 }}>
            <span>Problematic</span>
            <span>Difficult</span>
            <span>OK</span>
          </div>

          {/* Grid Lines */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', height: '1px', background: '#eee' }}></div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: '60%', height: '1px', background: '#eee' }}></div>

          {/* Bars */}
          {statsArray.map((item, idx) => {
            const heightPercent = Math.min(100, (item.score / scale) * 100);
            return (
              <div key={idx} style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  height: '100%', 
                  justifyContent: 'flex-end',
                  minWidth: '20px',
                  maxWidth: '45px'
              }}>
                <div style={{
                  width: '100%',
                  height: `${heightPercent}%`,
                  background: '#c5d5e5',
                  border: '1px solid #9fb5c9',
                  borderRadius: '2px 2px 0 0',
                  position: 'relative'
                }}></div>
                <div style={{ marginTop: '4px', fontWeight: 'bold', fontSize: '0.8rem', color: '#333', whiteSpace: 'nowrap' }}>
                  {item.key === 'SPACE' ? '␣' : item.key.toLowerCase()}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            style={{ padding: '6px 20px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
            onClick={() => {
              if (onReview) {
                  onReview();
                  return;
              }
              startReviewForKeys(statsData);
            }}
          >
            Review Difficult Keys
          </button>
          <button 
            style={{ padding: '6px 15px', background: 'white', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
            onClick={() => changeView('lesson_detail')}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Helper to render word blocks for Word Drill
  const renderWordBlocks = (pattern, inputText, isCurrentRow, isError = false, isSuccess = false) => {
      // Find all word positions in the pattern (including their following spaces)
      const wordUnits = [];
      let currentWord = "";
      let startIdx = 0;
      
      for (let i = 0; i < pattern.length; i++) {
          if (pattern[i] === ' ') {
              if (currentWord.length > 0) {
                  wordUnits.push({ 
                      word: currentWord, 
                      start: startIdx, 
                      end: i, // index of the space
                      fullEnd: i + 1 // index after the space
                  });
                  currentWord = "";
              }
              startIdx = i + 1;
          } else {
              if (currentWord.length === 0) startIdx = i;
              currentWord += pattern[i];
          }
      }
      
      // Add the last word if there is one
      if (currentWord.length > 0) {
          wordUnits.push({
              word: currentWord,
              start: startIdx,
              end: pattern.length,
              fullEnd: pattern.length
          });
      }
      
      return (
          <div style={{display: 'flex', gap: '40px', marginBottom: '5px', flexWrap: 'wrap', alignItems: 'center', padding: '5px 0'}}>
              {wordUnits.map((unit, wIdx) => {
                  // A word is completed and removed as soon as the space after it is typed
                  const isWordCompleted = isSuccess || (isCurrentRow && inputText.length >= unit.fullEnd);
                  
                  // If word is completed, remove it from the DOM to allow shifting from left
                  if (isWordCompleted) return null;
                  
                  return (
                      <div key={wIdx} style={{
                          display: 'flex', 
                          alignItems: 'center', 
                          position: 'relative',
                          // We still want it to take up space to avoid shifting identical words
                          // which makes it look like the last word was removed instead of the first
                          minWidth: 'fit-content'
                      }}>
                          {(isCurrentRow && !isWordCompleted && inputText.length >= unit.start && inputText.length < unit.fullEnd) && (
                              <span style={{
                                  position: 'absolute',
                                  left: '-25px',
                                  color: courseType === 'advanced' ? '#009688' : '#1a73e8',
                                  fontSize: '1.5rem',
                                  fontWeight: 'bold'
                              }}>▶</span>
                          )}
                          <div style={{
                              display: 'flex',
                              fontSize: '2.5rem',
                              fontFamily: 'serif',
                              fontWeight: (isCurrentRow && inputText.length >= unit.start && inputText.length < unit.fullEnd) ? 'bold' : '500',
                              color: (isCurrentRow && inputText.length >= unit.start && inputText.length < unit.fullEnd) ? (courseType === 'advanced' ? '#009688' : '#1a73e8') : '#666'
                          }}>
                              {unit.word.split('').map((char, cIdx) => {
                                  const globalIdx = unit.start + cIdx;
                                  const isCharCurrent = isCurrentRow && globalIdx === inputText.length;
                                  const isCharError = isCharCurrent && isError;
                                  
                                  return (
                                      <span key={cIdx} style={{
                                          position: 'relative',
                                          borderBottom: isCharCurrent ? `3px solid ${courseType === 'advanced' ? '#009688' : '#1a73e8'}` : 'none',
                                          color: isCharError ? 'red' : 'inherit'
                                      }}>
                                          {char}
                                      </span>
                                  );
                              })}
                              {/* Space character logic */}
                              {isCurrentRow && inputText.length === unit.end && (
                                  <span style={{
                                      width: '10px',
                                      borderBottom: `3px solid ${courseType === 'advanced' ? '#009688' : '#1a73e8'}`,
                                      marginLeft: '2px'
                                  }}>&nbsp;</span>
                              )}
                          </div>
                      </div>
                  );
              })}
          </div>
      );
  };

  // Helper to render paragraph blocks for Paragraph Drill
  const renderParagraphBlocks = (pattern, inputText, isCurrentRow, isError = false, isSuccess = false, fontSize = '1.8rem') => {
    // Word-based rendering for Current Row
    if (isCurrentRow) {
        const targetWords = pattern.split(' ');
        
        return (
            <div style={{
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0px', 
                marginBottom: '8px', 
                alignItems: 'center', 
                fontSize: fontSize, 
                fontFamily: '"Georgia", serif', 
                fontWeight: '400', 
                whiteSpace: 'pre-wrap', 
                letterSpacing: '0.5px', 
                lineHeight: '1.5'
            }}>
                {targetWords.map((word, wIdx) => {
                    const cleanTargetWord = word.replace('\n', '');
                    const isLastWord = wIdx === targetWords.length - 1;
                    
                    const isCompleted = wIdx < paragraphDrillCompletedWords.length;
                    const isCurrent = wIdx === paragraphDrillCompletedWords.length;
                    
                    // Style determination
                    let wordColor = '#333';
                    let wordBg = 'transparent';
                    
                    if (isCompleted) {
                        const typedWord = paragraphDrillCompletedWords[wIdx];
                        if (typedWord === cleanTargetWord) {
                             wordColor = courseType === 'advanced' ? '#009688' : '#1a73e8';
                        } else {
                             wordColor = '#d93025'; // Error color
                        }
                    } else if (isCurrent) {
                        wordBg = 'rgba(0,0,0,0.05)'; // Light shadow for current word
                    }
                    
                    return (
                        <span key={wIdx} style={{marginRight: isLastWord ? '0' : '0.5ch', backgroundColor: wordBg, borderRadius: '3px', padding: '0 2px'}}>
                            {word.split('').map((char, cIdx) => {
                                let charColor = wordColor;
                                
                                if (isCurrent) {
                                    // Character level logic for current word
                                    const inputChar = paragraphDrillCurrentWordInput[cIdx];
                                    if (inputChar) {
                                        if (inputChar === char) {
                                            charColor = courseType === 'advanced' ? '#009688' : '#1a73e8';
                                        } else {
                                            charColor = '#d93025';
                                        }
                                    }
                                }
                                
                                return (
                                    <span key={cIdx} style={{color: charColor}}>{char === '\n' ? '↵' : char}</span>
                                );
                            })}
                        </span>
                    );
                })}
            </div>
        );
    }

    // Standard rendering for other rows (completed or future)
    const displayPattern = pattern.replace('\n', '↵');
    const chars = displayPattern.split('');
    
    return (
        <div style={{display: 'flex', gap: '0px', marginBottom: '8px', alignItems: 'center', fontSize: fontSize, fontFamily: '"Georgia", serif', fontWeight: '400', whiteSpace: 'pre', letterSpacing: '0.5px'}}>
            {chars.map((char, idx) => {
                const isCorrect = idx < inputText.length && inputText[idx] === pattern[idx];
                const isIncorrect = idx < inputText.length && inputText[idx] !== pattern[idx];
                
                let color = '#333'; 
                if (isCorrect) color = courseType === 'advanced' ? '#009688' : '#1a73e8';
                else if (isIncorrect) color = '#d93025';
                else if (isSuccess) color = '#a5c48c'; 

                return (
                    <span key={idx} style={{
                        color: color,
                        textDecoration: isIncorrect ? 'underline' : 'none',
                    }}>
                        {char === ' ' ? '\u00A0' : char}
                    </span>
                );
            })}
        </div>
    );
  };

  // Helper to render key blocks
  const renderKeyBlocks = (pattern, inputText, isCurrentRow, isError = false, isSuccess = false) => {
      const blocks = pattern.split(' ');

      return (
          <div style={{display: 'flex', gap: '20px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center'}}>
              {blocks.map((block, bIdx) => {
                  // Calculate start index of this block in the full pattern string
                  const blockStartIdx = pattern.split(' ').slice(0, bIdx).join(' ').length + (bIdx > 0 ? 1 : 0);
                  
                  return (
                      <div key={bIdx} style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                          <div style={{display: 'flex', gap: '4px'}}>
                              {block.split('').map((char, cIdx) => {
                                  const globalIdx = blockStartIdx + cIdx;
                                  let status = 'pending';
                                  if (isCurrentRow) {
                                      if (globalIdx < inputText.length) status = 'correct';
                                      else if (globalIdx === inputText.length) {
                                          status = isError ? 'error' : 'current';
                                      }
                                  } else if (isSuccess) {
                                      status = 'correct'; 
                                  }
                                  
                                  return (
                                      <div key={cIdx} style={{
                                          width: '40px', height: '40px', 
                                          display: 'flex', justifyContent: 'center', alignItems: 'center',
                                          background: status === 'current' ? (courseType === 'advanced' ? '#009688' : '#1a73e8') : (status === 'error' ? '#ffcccc' : (status === 'correct' ? '#e9f7e9' : 'white')),
                                          color: status === 'current' ? 'white' : (status === 'error' ? 'red' : (status === 'correct' ? '#3c763d' : '#333')),
                                          border: status === 'current' ? `2px solid ${courseType === 'advanced' ? '#009688' : '#1a73e8'}` : (status === 'error' ? '2px solid red' : '1px solid #ccc'),
                                          borderRadius: '4px',
                                          fontWeight: 'bold',
                                          fontSize: '1.2rem',
                                          boxShadow: status === 'current' ? `0 0 5px ${courseType === 'advanced' ? 'rgba(0,150,136,0.5)' : 'rgba(26,115,232,0.5)'}` : 'none',
                                          position: 'relative'
                                      }}>
                                          {char}
                                          {status === 'error' && <div className="error-slash"></div>}
                                      </div>
                                  );
                              })}
                              
                              {/* Space block after each block (except the last one if it's empty from a trailing space) */}
                              {bIdx < blocks.length - 1 && (
                                <div style={{
                                    padding: '2px 8px',
                                    background: (isCurrentRow && (blockStartIdx + block.length === inputText.length)) ? (isError ? '#ffcccc' : (courseType === 'advanced' ? '#009688' : '#1a73e8')) : ((isCurrentRow && (blockStartIdx + block.length < inputText.length)) || isSuccess ? '#e9f7e9' : 'white'),
                                    color: (isCurrentRow && (blockStartIdx + block.length === inputText.length)) ? (isError ? 'red' : 'white') : ((isCurrentRow && (blockStartIdx + block.length < inputText.length)) || isSuccess ? '#3c763d' : '#666'),
                                    border: (isCurrentRow && (blockStartIdx + block.length === inputText.length)) ? (isError ? '2px solid red' : `2px solid ${courseType === 'advanced' ? '#009688' : '#1a73e8'}`) : '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    boxShadow: (isCurrentRow && (blockStartIdx + block.length === inputText.length)) ? `0 0 5px ${courseType === 'advanced' ? 'rgba(0,150,136,0.5)' : 'rgba(26,115,232,0.5)'}` : 'none',
                                    position: 'relative'
                                }}>
                                    Space
                                    {isError && isCurrentRow && (inputText.length === blockStartIdx + block.length) && <div className="error-slash"></div>}
                                </div>
                              )}
                          </div>

                          {/* Error Slash between blocks if this is where the error happened */}
                          {isError && isCurrentRow && (inputText.length === blockStartIdx + block.length) && bIdx < blocks.length - 1 && (
                              <div style={{
                                  width: '20px', 
                                  height: '20px', 
                                  position: 'relative', 
                                  marginLeft: '5px'
                              }}>
                                  <div style={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      width: '100%',
                                      height: '2px',
                                      background: 'red',
                                      transform: 'translate(-50%, -50%) rotate(45deg)'
                                  }}></div>
                              </div>
                          )}
                      </div>
                  );
              })}
              {isSuccess && <div style={{color: '#7aa93c', fontWeight: 'bold', fontSize: '1.5rem', marginLeft: '10px'}}>✔</div>}
          </div>
      );
  };
  
  // Drill Patterns based on user description
  const drillPatterns = useMemo(() => {
    const effectiveLessonId = courseType === 'advanced' ? currentLesson + 12 : currentLesson;

    if (effectiveLessonId === 1) {
      return [
          "ajja ajja ", "akka akka ",
          "alla alla ", "a;;a a;;a ",
          "jaaj jaaj ", "jssj jssj ",
          "jddj jddj ", "jffj jffj ",
          "skks skks ", "dlld dlld ",
          "djjd djjd ", "f;;f f;;f ",
          "asjk asjk ", "asl; asl; ",
          "dfl; dfl; ", "dfjk dfjk ",
          "jasd jasd ", "ksdf ksdf ",
          "fjkl fjkl ", "dkl; dkl; "
      ];
    } else if (effectiveLessonId === 2) {
      return [
        "eee iii ", "e i i e ", "i e e i ", "ede kik ",
        "ded iki ", "dei ied ", "ee ii ee ", "ii ee ii ",
        "eie iei ", "ede iki ", "efe iji ", "ese ili ",
        "eae i;i ", "dee kii ", "eee iii ", "e i e i "
      ];
    } else if (effectiveLessonId === 3) {
      return [
        "rrr uuu ", "r u u r ", "u r r u ", "frf juj ",
        "rfr uju ", "ruu urr ", "rr uu rr ", "uu rr uu ",
        "rur uru ", "frf juj ", "grg huj ", "drd kuj ",
        "srs lul ", "fru jur ", "rrr uuu ", "r u r u "
      ];
    } else if (effectiveLessonId === 4) {
      return [
        "ttt ooo ", "t o o t ", "o t t o ", "ftf lol ",
        "tft olo ", "too ott ", "tt oo tt ", "oo tt oo ",
        "tot oto ", "ftf lol ", "gtg ho h ", "dtd ko k ",
        "sts lsl ", "fto lot ", "ttt ooo ", "t o t o "
      ];
    } else if (effectiveLessonId === 5) {
      return [
        "AAA SSS ", "DDD FFF ", "JJJ KKK ", "LLL ;;; ",
        "A S D F ", "J K L ; ", "E I R U ", "T O P Q ",
        "... ... ", "L.L K.K ", "J.J F.F ", "D.D S.S ",
        "A.A ;.; ", "E.E I.I ", "R.R U.U ", "T.T O.O "
      ];
    } else if (effectiveLessonId === 6) {
      return [
        "ccc ,,, ", "c , , c ", ", c c , ", "dcd k,k ",
        "cdc ,k, ", "c,, ,cc ", "cc ,, cc ", ",, cc ,, ",
        "c,c ,c, ", "dcd k,k ", "fcf j,j ", "scs l,l ",
        "aca ;.; ", "dc, k,c ", "ccc ,,, ", "c , c , "
      ];
    } else if (effectiveLessonId === 7) {
      return [
        "ggg hhh ", "g h h g ", "h g g h ", "fgf jhj ",
        "gfg hjh ", "ghh hgg ", "gg hh gg ", "hh gg hh ",
        "ghg hgh ", "fgf jhj ", "''' ;'; ", "l'l k'k ",
        "j'j f'f ", "g'g h'h ", "ggg hhh ", "g h g h "
      ];
    } else if (effectiveLessonId === 8) {
      return [
        "vvv nnn ", "v n n v ", "n v v n ", "fvf jnj ",
        "vfv njn ", "vnn nvv ", "vv nn vv ", "nn vv nn ",
        "vnv nvn ", "fvf jnj ", "??? ;?; ", "l?l k?k ",
        "j?j f?f ", "v?v n?n ", "vvv nnn ", "v n v n "
      ];
    } else if (effectiveLessonId === 9) {
      return [
        "www mmm ", "w m m w ", "m w w m ", "sws jmj ",
        "wsw mjm ", "wmm mww ", "ww mm ww ", "mm ww mm ",
        "wmw mwm ", "sws jmj ", "dwd kmk ", "awa ;m; ",
        "fwf hmh ", "swm jmw ", "www mmm ", "w m w m "
      ];
    } else if (effectiveLessonId === 10) {
      return [
        "qqq ppp ", "q p p q ", "p q q p ", "aqa ;p; ",
        "qaq p;p ", "qpp pqq ", "qq pp qq ", "pp qq pp ",
        "qpq pqp ", "aqa ;p; ", "sqs lpl ", "dqd kpk ",
        "fqf jpj ", "aqp ;pq ", "qqq ppp ", "q p q p "
      ];
    } else if (effectiveLessonId === 11) {
      return [
        "bbb yyy ", "b y y b ", "y b b y ", "fbf jyj ",
        "bfb yjy ", "byy ybb ", "bb yy bb ", "yy bb yy ",
        "byb yby ", "fbf jyj ", "gbg hyh ", "dbd kyk ",
        "sbs lyl ", "fby jyb ", "bbb yyy ", "b y b y "
      ];
    } else if (effectiveLessonId === 12) {
      return [
        "zzz xxx ", "z x x z ", "x z z x ", "aza sxs ",
        "zaz xsx ", "zxx xzz ", "zz xx zz ", "xx zz xx ",
        "zxz xzx ", "aza sxs ", "szs lxl ", "dzd kxk ",
        "fzf jxj ", "azx sxz ", "zzz xxx ", "z x z x "
      ];
    } else if (effectiveLessonId === 13) {
      return [
        ".. ,, ", "'' ?? ", ":: \"\" ", ". , ' ? ",
        ": \" : \" ", ". , . , ", "' ? ' ? ", ": \" : \" ",
        ".,' ? ", ".:\" ? ", "., ' : ", "\" ? . , ",
        ".. ,, '' ?? :: \"\" "
      ];
    } else if (effectiveLessonId === 14) {
      return [
        "44 55 ", "66 77 ", "4 5 6 7 ", "45 67 45 ",
        "f4f f5f ", "j6j j7j ", "456 745 ", "674 567 ",
        "44 55 66 77 ", "4567 4567 "
      ];
    } else if (effectiveLessonId === 15) {
      return [
        "11 22 ", "33 88 ", "99 00 ", "1 2 3 8 9 0 ",
        "a1a s2s ", "d3d k8k ", "l9l ;0; ", "123 890 ",
        "11 22 33 88 99 00 ", "123890 123890 "
      ];
    } else if (effectiveLessonId === 16) {
      return [
        "!! @@ ", "## $$ ", "%% !! ", "! @ # $ % ",
        "A! S@ ", "D# F$ ", "F% A! ", "!@#$% !@#$%"
      ];
    } else if (effectiveLessonId === 17) {
      return [
        "^^ && ", "** (( ", ")) ^^ ", "^ & * ( ) ",
        "J^ J& ", "K* L( ", ";) J^ ", "^&*() ^&*()"
      ];
    } else if (effectiveLessonId === 18) {
      return [
        "-- __ ", "== ++ ", "// || ", "\\\\ -- ", "`` ~~ ",
        "- _ = + ", "/ | \\ - ", "` ~ ` ~ ", "-= _+ ", "/| \\- `~ ",
        "--__==++ //||\\\\ ``~~"
      ];
    } else if (effectiveLessonId === 19) {
      return [
        "[[ ]] {{ }} ", "<< >> ", "[ ] { } ",
        "< > < > ", "[[ {{ ", "]] }} ", "[] {} <> ",
        "[ ] { } < >"
      ];
    } else if (effectiveLessonId === 20) {
      return [
        "A1 B2 C3 D4 ", "E5 F6 G7 H8 ", "I9 J0 K- L= ",
        "!@ #$ %^ &* ", "() _+ {} |: ", "\"< >? ~` ",
        "Aa Bb Cc Dd ", "1! 2@ 3# 4$ ", "Review All Keys ",
        "The quick brown fox ", "jumps over the lazy dog "
      ];
    }
    return [];
  }, [currentLesson, courseType]);

  // Word Drill Patterns using asdfjkl;
  const wordDrillPatterns = useMemo(() => {
    const effectiveLessonId = courseType === 'advanced' ? currentLesson + 12 : currentLesson;

    if (effectiveLessonId === 1) {
      return [
          // 2 letters - mixed combinations, no repeats
          "as ad al ak ", "la da sa fa ",
          "ja ka sl dk ", "fj ks la df ",
          "as df jk ls ", "da fa ja ka ",
          // 3 letters - mixed combinations, no repeats
          "ask add dad ", "sad lad all ",
          "fad aka ala ", "jak las als ",
          "ads fad jak ", "dal sal fal ",
          // 4 letters - mixed combinations, no repeats
          "adds alas fall ", "lass asks dada ",
          "jaka sals lads ", "flak kaff slag ",
          "alfas flask salad ", "falls skald dallas ",
          // 5+ letters - mixed combinations
          "jaffa kafka alfalfa ", "sakaal flassad dajal ",
          "asdfjkl asdfjkl "
      ];
    } else if (effectiveLessonId === 2) {
      const basePatterns = [
        "if if if ", "eel eel eel ", "led led led ", "aid aid aid ", "ski ski ski ", 
        "ill ill ill ", "side side side ", "keel keel keel ", "life life life ",
        "ellis isle ", "ellis isle ", "field file ", "field file ", "silk skill ", 
        "silk skill ", "elk else ", "elk else ", "desk lead ", "desk lead "
      ];
      // Repeat to ensure 5 minutes of content
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 3) {
      const basePatterns = [
        "red red red ", "run run run ", "rude rude rude ", "rule rule rule ", "user user user ",
        "sure sure sure ", "fire fire fire ", "ride ride ride ", "blue blue blue ", "fur fur fur ",
        "dear dear dear ", "fear fear fear ", "read read read ", "real real real ", "rear rear rear "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 4) {
      const basePatterns = [
        "too too too ", "toot toot toot ", "root root root ", "foot foot foot ", "took took took ",
        "told told told ", "door door door ", "road road road ", "boat boat boat ", "lost lost lost ",
        "told told told ", "toot toot toot ", "took took took ", "root root root ", "road road road "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 5) {
      const basePatterns = [
        "The. The. ", "Red. Red. ", "Run. Run. ", "Sure. Sure. ", "Fire. Fire. ",
        "Ride. Ride. ", "Blue. Blue. ", "Road. Road. ", "Boat. Boat. ", "Lost. Lost. ",
        "A. S. D. F. ", "J. K. L. ;. ", "E. I. R. U. ", "T. O. P. Q. ", "Z. X. C. V. "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 6) {
      const basePatterns = [
        "cat cat cat ", "car car car ", "call call call ", "care care care ", "case case case ",
        "cool cool cool ", "face face face ", "dice dice dice ", "rice rice rice ", "nice nice nice ",
        "can, can, ", "cold, cold, ", "car, car, ", "care, care, ", "case, case, "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 7) {
      const basePatterns = [
        "get get get ", "got got got ", "good good good ", "gold gold gold ", "glad glad glad ",
        "has has has ", "had had had ", "high high high ", "hold hold hold ", "hard hard hard ",
        "it's it's ", "he's he's ", "she's she's ", "dad's dad's ", "car's car's "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 8) {
      const basePatterns = [
        "van van van ", "very very very ", "vote vote vote ", "view view view ", "vast vast vast ",
        "new new new ", "now now now ", "not not not ", "near near near ", "name name name ",
        "who? who? ", "what? what? ", "when? when? ", "where? where? ", "why? why? "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 9) {
      const basePatterns = [
        "was was was ", "went went went ", "will will will ", "with with with ", "work work work ",
        "man man man ", "make make make ", "more more more ", "must must must ", "mind mind mind ",
        "went went ", "with with ", "work work ", "make make ", "must must "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 10) {
      const basePatterns = [
        "quick quick quick ", "quiet quiet quiet ", "queen queen queen ", "quit quit quit ", "quite quite quite ",
        "page page page ", "part part part ", "past past past ", "plan plan plan ", "play play play ",
        "quick quick ", "quiet quiet ", "page page ", "part part ", "plan plan "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 11) {
      const basePatterns = [
        "but but but ", "bad bad bad ", "big big big ", "book book book ", "back back back ",
        "you you you ", "your your your ", "yes yes yes ", "yet yet yet ", "year year year ",
        "back back ", "book book ", "your your ", "year year ", "yes yes "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 12) {
      const basePatterns = [
        "zero zero zero ", "zone zone zone ", "zoo zoo zoo ", "size size size ", "lazy lazy lazy ",
        "box box box ", "six six six ", "next next next ", "tax tax tax ", "fix fix fix ",
        "zero zero ", "size size ", "box box ", "six six ", "next next "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 13) {
      const basePatterns = [
        "sad. dad. lad. ", "all, fall, ball, ", "it's he's she's ", "is it? was it? ",
        "said: \"yes\" ", "said: \"no\" ", "wait... stop. ", "who? what? why? ",
        "it's fine. ", "he's here, see? ", "she's fast. ", "is it real? ",
        "\"hello!\" ", "said: \"hi\" ", "red, blue, green. ", "yes. no. maybe. "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 14) {
      const basePatterns = [
        "room 405 ", "year 1976 ", "level 7 ", "page 6 ",
        "4 5 6 7 ", "45 67 45 ", "67 54 76 ", "555 444 ",
        "666 777 ", "47 56 47 ", "room 607 ", "page 45 ",
        "test 5 ", "test 6 ", "4 4 4 4 ", "5 5 5 5 "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 15) {
      const basePatterns = [
        "1st 2nd 3rd ", "8th 9th 0th ", "10 20 30 ", "80 90 100 ",
        "123 890 ", "321 098 ", "19 28 30 ", "81 92 03 ",
        "1 2 3 8 9 0 ", "000 111 ", "222 333 ", "888 999 ",
        "phone 911 ", "code 123 ", "level 10 ", "rank 1 "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 16) {
      const basePatterns = [
        "save $500! ", "email@test.com ", "id #12345 ", "100% done! ",
        "! @ # $ % ", "!!! @@@ ### ", "$$$ %%% $$$ ", "!#! @$@ ",
        "cash $10 ", "item #1 ", "win! win! ", "done 100% ",
        "A! S@ D# F$ ", "F% A! S@ D# ", "100% $50 #1 ", "email@site "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 17) {
      const basePatterns = [
        "salt & pepper ", "5 * 5 = 25 ", "(parentheses) ", "power ^ 2 ",
        "^ & * ( ) ", "^^^ &&& *** ", "((( ))) ((( ", "^&^ *(* ",
        "you & me ", "rate * time ", "(yes) (no) ", "2 ^ 10 ",
        "J^ J& K* L( ", ";) J^ J& K* ", "(100) & (200) ", "stars *** "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 18) {
      const basePatterns = [
        "well-being ", "user_name ", "2 + 2 = 4 ", "10 / 2 = 5 ",
        "- _ = + ", "-- __ == ++ ", "// || \\\\ // ", "-= _+ /| ",
        "well-done ", "first_last ", "3 + 3 = 6 ", "8 / 4 = 2 ",
        "path/to/file ", "yes | no ", "up - down ", "sum = 10 "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 19) {
      const basePatterns = [
        "array[0] ", "object {id} ", "x < y ", "y > x ",
        "[ ] { } ", "[[ ]] {{ }} ", "<< >> << >> ", "[{< >}] ",
        "data[i] ", "main { } ", "a < b ", "b > a ",
        "list[1] ", "test { } ", "min < max ", "high > low "
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 20) {
      const basePatterns = [
        "quick brown fox ", "jumps over lazy ", "dog packs box ", "five dozen jugs ",
        "sphinx black quartz ", "judge my vow ", "boxing wizards jump ", "quickly complex user ",
        "password secret review ", "email contact site ", "date time final ", "mastery skill life ",
        "1st 2nd 3rd ", "100% $50 #1 ", "test { } [ ] ", "x < y > z "
      ];
      return Array(10).fill(basePatterns).flat();
    }
    return [];
  }, [currentLesson, courseType]);

  // Sentence Drill Patterns (New for Lesson 2)
  const sentenceDrillPatterns = useMemo(() => {
    const effectiveLessonId = courseType === 'advanced' ? currentLesson + 12 : currentLesson;

    if (effectiveLessonId === 2) {
      const basePatterns = [
        "all lads sell dill salad",
        "alike silas sal feels sad",
        "jeff likes sea lakes fields",
        "lila jade is fake said kafka",
        "eddie likes lilies daisies",
        "elsie leads jill fiji seaside",
        "jill sees eddie aside lislie",
        "all see aidless lassie is sad",
        "feed lassie adelia",
        "lassie is fed said adelia",
        "laddies lasses like daisies",
        "idle deeds fill seasides",
        "fiddledeeddee said all lasses",
        "fiddledeeddee said laddies",
        "lasses lads like sea life",
        "lake life see life lakeside",
        "all kids like added deeds",
        "dad jeff sees eddie is safe",
        "a fled flee is fake idea",
        "i see falsified deals said jeff"
      ];
      // Repeat to ensure 5 minutes of content
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 3) {
      const basePatterns = [
        "red roses are rare",
        "run for the blue sky",
        "ride the surf",
        "user rules are clear",
        "sure fire ways to win",
        "dear friends are real",
        "fear no evil today",
        "read the real rules",
        "rear the blue birds",
        "real life is here"
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 4) {
      const basePatterns = [
        "too many roads to take",
        "the boat is at the door",
        "told you to go fast",
        "root for the team",
        "lost at the lake",
        "toot the horn loud",
        "took the long road",
        "foot on the gas",
        "road to the sea",
        "boat on the lake"
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 5) {
      const basePatterns = [
        "The red rose is rare.",
        "Run to the blue sky.",
        "Ride the boat now.",
        "Sure it is real.",
        "Fire is hot today.",
        "Lost at the sea.",
        "The boat is fast.",
        "A road to take.",
        "Read the book.",
        "Real life is good."
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 6) {
      const basePatterns = [
        "the cat is on the car",
        "call for the nice dice",
        "care for the cold ice",
        "case of the rice",
        "nice car to drive",
        "cool face in the cold",
        "can you call me",
        "cold ice is nice",
        "rice is good food",
        "car is at the door"
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 7) {
      const basePatterns = [
        "get the gold today",
        "good has come to us",
        "had a high goal",
        "hold the gold hard",
        "glad to be here",
        "it's a good day",
        "he's a good man",
        "she's a good lass",
        "dad's car is gold",
        "has he got the gold"
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 8) {
      const basePatterns = [
        "very vast view here",
        "vote for the new name",
        "near the new van",
        "who is at the door?",
        "what is your name?",
        "when will you go?",
        "where is the van?",
        "why is it new?",
        "not now but soon",
        "name the new van"
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 9) {
      const basePatterns = [
        "was with the man",
        "went with the work",
        "will make more today",
        "must mind the work",
        "man made a move",
        "more work to do",
        "make it with me",
        "went to the work",
        "will you go with me?",
        "was it with you?"
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 10) {
      const basePatterns = [
        "quick play at the park",
        "quiet queen at the palace",
        "quite a good plan",
        "quit the game now",
        "page of the book",
        "part of the plan",
        "past the park now",
        "play the game well",
        "quick move to win",
        "quiet place to play"
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 11) {
      const basePatterns = [
        "but you are here",
        "bad year for us",
        "big book for you",
        "back to the house",
        "yes it is yet",
        "your book is here",
        "yet you are back",
        "year of the bird",
        "yes you can go",
        "big year for you"
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 12) {
      const basePatterns = [
        "zero size for the box",
        "zone of the zoo",
        "lazy six at the zoo",
        "next tax to pay",
        "fix the box now",
        "six boxes to go",
        "next to the zoo",
        "size of the tax",
        "fix it next time",
        "zero taxes today"
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 13) {
      const basePatterns = [
        "He said, \"Is it true?\"",
        "The list includes: apples, pears, and plums.",
        "It's a beautiful day, isn't it?",
        "Wait... did you hear that?",
        "She asked, \"Where are you going?\"",
        "The colors were: red, blue, and gold.",
        "It's not easy, but it's worth it.",
        "Who is there? Please answer me.",
        "They said: \"We will be there soon.\"",
        "Is this yours? I found it here."
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 14) {
      const basePatterns = [
        "The room number is 405.",
        "He was born in 1976.",
        "Please turn to page 67.",
        "The total count is 54.",
        "There are 7 days in a week.",
        "The year 1954 was a long time ago.",
        "Call me at extension 456.",
        "The temperature is 75 degrees.",
        "I have 6 apples and 4 oranges.",
        "Level 7 is harder than level 5."
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 15) {
      const basePatterns = [
        "The code is 123890.",
        "Her phone number ends in 9110.",
        "He finished in 1st place.",
        "The year is 2023.",
        "The price is $19.99.",
        "There are 365 days in a year.",
        "The count is 80, 90, 100.",
        "I need 2 more items.",
        "The bus number is 88.",
        "He is 10 years old today."
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 16) {
      const basePatterns = [
        "Save 100% on your next order!",
        "Send an email to contact@shop.com",
        "The item ID is #12345.",
        "You saved $50.00 today!",
        "Check out our 20% discount.",
        "The password is #Safe!123",
        "Follow us @TypingMaster",
        "The total is $150.75.",
        "We are 90% finished with the project.",
        "Use the tag #typing for your post."
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 17) {
      const basePatterns = [
        "The result is (10 * 5) = 50.",
        "He used a & to join the words.",
        "The power is 2 ^ 10.",
        "Parentheses are (used) for extra info.",
        "The stars are shining *** tonight.",
        "8 & 9 are consecutive numbers.",
        "The area is (length * width).",
        "He said (maybe) it will rain.",
        "Use the & symbol for 'and'.",
        "The rating is 5 * stars."
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 18) {
      const basePatterns = [
        "The well-being of the staff is key.",
        "My user_name is typing_pro.",
        "The equation is 2 + 2 = 4.",
        "The path is ~/docs/work.",
        "Choose either yes | no.",
        "Use backticks ` for code.",
        "The sum is 5 + 5 = 10.",
        "The file is in the /temp folder.",
        "Use a ~ for approximately.",
        "The result is 10 / 2 = 5."
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 19) {
      const basePatterns = [
        "The first item is array[0].",
        "The function is test{}.",
        "The condition is x < y.",
        "The result is y > x.",
        "Use [ ] for arrays and { } for objects.",
        "The value is within < > tags.",
        "The list[i] is empty.",
        "The code block is inside { }.",
        "Is a < b true or false?",
        "The brackets [ ] are square."
      ];
      return Array(10).fill(basePatterns).flat();
    } else if (effectiveLessonId === 20) {
      const basePatterns = [
        "The quick brown fox jumps over the lazy dog.",
        "Pack my box with five dozen liquor jugs.",
        "The 5 boxing wizards jump quickly.",
        "Sphinx of black quartz, judge my vow.",
        "Complex: User_ID #4592 & Password = (Secret)!",
        "Review: 10 + 20 = 30; [Array] {Object}.",
        "Email: contact@example.com | www.site.org",
        "Date: 12/25/2024 - Time: 11:59 PM.",
        "Final Test: Mastery of all keys is the goal.",
        "Typing is a skill that lasts a lifetime."
      ];
      return Array(10).fill(basePatterns).flat();
    }
    return [];
  }, [currentLesson, courseType]);

  // Paragraph Drill Patterns (asdfjkl; combinations)
  const paragraphDrillPatterns = useMemo(() => {
    const effectiveLessonId = courseType === 'advanced' ? currentLesson + 12 : currentLesson;

    if (effectiveLessonId === 1) {
      return [
          // Slide 1 (3-letter focus)
          "add ads dad\n",
          "da as sad\n",
          "alas salad ada\n",
          // Slide 2 (Mixed lengths)
          "dallas lads dadaa\n",
          "all fall alfalfa\n",
          "jaffa salad flask\n",
          // Slide 3 (Mixed lengths)
          "lass asks salad\n",
          "salsa lada lalalaa\n",
          "alaska flasks fall\n",
          // Slide 4 (More complex)
          "akkaf kafka kaffals\n",
          "dajal alfa flassad\n",
          "kaff falls kals sakaal\n",
          // Slide 5 (Advanced home row)
          "faja sallas sakkad\n",
          "jassa dallas kassal\n",
          "flakka assaa ajaks\n",
          "dadda klaff alla jalla\n"
      ];
    } else if (effectiveLessonId === 2) {
      return [
        "ed likes seals sleek as silk\n",
        "fiji fields aid all feels adelia\n",
        "sail idle alkali seas said eddie\n",
        "feed delia alfalfa seed sadie\n",
        "dad likes ideal dada fads\n",
        "leased sidesaddle slid like a slide\n",
        "skilled jeff did lessee a deal\n",
        "diseased sessile flake like jade\n",
        "add alfalfa seeds salad leafs\n",
        "fake lifelike flake did fall\n",
        "leek field lessee lies idle\n",
        "assess sleek jade flasks ida\n",
        "adelia like skilled sea seals\n",
        "sea dike side did flake\n",
        "leila filled a jade salad flask\n",
        "jessie a jade lass fled seaside fields\n",
        "life like life is as sleek as silk\n",
        "is kaskaskia seaside asked silas\n",
        "a lad kissed a sad lass\n",
        "ed likes seals sleek as silk\n",
        "fiji fields aid all feels adelia\n",
        "sail idle alkali seas said eddie\n",
        "feed delia alfalfa seed sadie\n",
        "dad likes ideal dada fads\n",
        "leased sidesaddle slid like a slide\n",
        "skilled jeff did lessee a deal\n",
        "diseased sessile flake like jade\n",
        "add alfalfa seeds salad leafs\n",
        "fake lifelike flake did fall\n",
        "leek field lessee lies idle\n"
      ];
    } else if (effectiveLessonId === 3) {
      return [
        "red roses are rare and real\n",
        "run for the blue sky today\n",
        "ride the surf at the seaside\n",
        "user rules are clear and sure\n",
        "sure fire ways to win a deal\n",
        "dear friends are real and true\n",
        "fear no evil in the dark today\n",
        "read the real rules of the game\n",
        "rear the blue birds in the nest\n",
        "real life is here for you now\n",
        "red roses are rare and real\n",
        "run for the blue sky today\n",
        "ride the surf at the seaside\n",
        "user rules are clear and sure\n",
        "sure fire ways to win a deal\n",
        "dear friends are real and true\n",
        "fear no evil in the dark today\n",
        "read the real rules of the game\n",
        "rear the blue birds in the nest\n",
        "real life is here for you now\n"
      ];
    } else if (effectiveLessonId === 4) {
      return [
        "too many roads to take today\n",
        "the boat is at the door now\n",
        "told you to go fast and far\n",
        "root for the team to win\n",
        "lost at the lake in the dark\n",
        "toot the horn loud for all\n",
        "took the long road to home\n",
        "foot on the gas to go fast\n",
        "road to the sea is long\n",
        "boat on the lake is blue\n",
        "too many roads to take today\n",
        "the boat is at the door now\n",
        "told you to go fast and far\n",
        "root for the team to win\n",
        "lost at the lake in the dark\n",
        "toot the horn loud for all\n",
        "took the long road to home\n",
        "foot on the gas to go fast\n",
        "road to the sea is long\n",
        "boat on the lake is blue\n"
      ];
    } else if (effectiveLessonId === 5) {
      return [
        "The red rose is rare and real.\n",
        "Run to the blue sky today.\n",
        "Ride the boat now at the sea.\n",
        "Sure it is real and true.\n",
        "Fire is hot today in the sun.\n",
        "Lost at the sea in the dark.\n",
        "The boat is fast and blue.\n",
        "A road to take to the house.\n",
        "Read the book for the rules.\n",
        "Real life is good and fair.\n",
        "The red rose is rare and real.\n",
        "Run to the blue sky today.\n",
        "Ride the boat now at the sea.\n",
        "Sure it is real and true.\n",
        "Fire is hot today in the sun.\n",
        "Lost at the sea in the dark.\n",
        "The boat is fast and blue.\n",
        "A road to take to the house.\n",
        "Read the book for the rules.\n",
        "Real life is good and fair.\n"
      ];
    } else if (effectiveLessonId === 6) {
      return [
        "the cat is on the car today\n",
        "call for the nice dice now\n",
        "care for the cold ice here\n",
        "case of the rice is good\n",
        "nice car to drive to the sea\n",
        "cool face in the cold air\n",
        "can you call me later today\n",
        "cold ice is nice in the heat\n",
        "rice is good food for us\n",
        "car is at the door for you\n",
        "the cat is on the car today\n",
        "call for the nice dice now\n",
        "care for the cold ice here\n",
        "case of the rice is good\n",
        "nice car to drive to the sea\n",
        "cool face in the cold air\n",
        "can you call me later today\n",
        "cold ice is nice in the heat\n",
        "rice is good food for us\n",
        "car is at the door for you\n"
      ];
    } else if (effectiveLessonId === 7) {
      return [
        "get the gold today in the mine\n",
        "good has come to us now\n",
        "had a high goal to reach\n",
        "hold the gold hard in hand\n",
        "glad to be here with you\n",
        "it's a good day for the gold\n",
        "he's a good man and true\n",
        "she's a good lass and fair\n",
        "dad's car is gold and fast\n",
        "has he got the gold for us\n",
        "get the gold today in the mine\n",
        "good has come to us now\n",
        "had a high goal to reach\n",
        "hold the gold hard in hand\n",
        "glad to be here with you\n",
        "it's a good day for the gold\n",
        "he's a good man and true\n",
        "she's a good lass and fair\n",
        "dad's car is gold and fast\n",
        "has he got the gold for us\n"
      ];
    } else if (effectiveLessonId === 8) {
      return [
        "very vast view here today\n",
        "vote for the new name now\n",
        "near the new van in the lot\n",
        "who is at the door for me?\n",
        "what is your name today?\n",
        "when will you go to the van?\n",
        "where is the van for me?\n",
        "why is it new and fast?\n",
        "not now but soon we go\n",
        "name the new van for me\n",
        "very vast view here today\n",
        "vote for the new name now\n",
        "near the new van in the lot\n",
        "who is at the door for me?\n",
        "what is your name today?\n",
        "when will you go to the van?\n",
        "where is the van for me?\n",
        "why is it new and fast?\n",
        "not now but soon we go\n",
        "name the new van for me\n"
      ];
    } else if (effectiveLessonId === 9) {
      return [
        "was with the man at the work\n",
        "went with the work to do\n",
        "will make more today for us\n",
        "must mind the work at hand\n",
        "man made a move to the work\n",
        "more work to do for the man\n",
        "make it with me today\n",
        "went to the work in the van\n",
        "will you go with me today?\n",
        "was it with you at the work?\n",
        "was with the man at the work\n",
        "went with the work to do\n",
        "will make more today for us\n",
        "must mind the work at hand\n",
        "man made a move to the work\n",
        "more work to do for the man\n",
        "make it with me today\n",
        "went to the work in the van\n",
        "will you go with me today?\n",
        "was it with you at the work?\n"
      ];
    } else if (effectiveLessonId === 10) {
      return [
        "quick play at the park today\n",
        "quiet queen at the palace now\n",
        "quite a good plan for us\n",
        "quit the game now and go\n",
        "page of the book is read\n",
        "part of the plan is good\n",
        "past the park now in the van\n",
        "play the game well to win\n",
        "quick move to win the game\n",
        "quiet place to play today\n",
        "quick play at the park today\n",
        "quiet queen at the palace now\n",
        "quite a good plan for us\n",
        "quit the game now and go\n",
        "page of the book is read\n",
        "part of the plan is good\n",
        "past the park now in the van\n",
        "play the game well to win\n",
        "quick move to win the game\n",
        "quiet place to play today\n"
      ];
    } else if (effectiveLessonId === 11) {
      return [
        "but you are here today for us\n",
        "bad year for us in the van\n",
        "big book for you to read\n",
        "back to the house now to go\n",
        "yes it is yet a good day\n",
        "your book is here for you\n",
        "yet you are back at the work\n",
        "year of the bird is here\n",
        "yes you can go to the park\n",
        "big year for you and me\n",
        "but you are here today for us\n",
        "bad year for us in the van\n",
        "big book for you to read\n",
        "back to the house now to go\n",
        "yes it is yet a good day\n",
        "your book is here for you\n",
        "yet you are back at the work\n",
        "year of the bird is here\n",
        "yes you can go to the park\n",
        "big year for you and me\n"
      ];
    } else if (effectiveLessonId === 12) {
      return [
        "zero size for the box today\n",
        "zone of the zoo is large\n",
        "lazy six at the zoo now\n",
        "next tax to pay for the van\n",
        "fix the box now for the man\n",
        "six boxes to go to the zoo\n",
        "next to the zoo is the park\n",
        "size of the tax is high\n",
        "fix it next time we go\n",
        "zero taxes today for us\n",
        "zero size for the box today\n",
        "zone of the zoo is large\n",
        "lazy six at the zoo now\n",
        "next tax to pay for the van\n",
        "fix the box now for the man\n",
        "six boxes to go to the zoo\n",
        "next to the zoo is the park\n",
        "size of the tax is high\n",
        "fix it next time we go\n",
        "zero taxes today for us\n"
      ];
    } else if (effectiveLessonId === 13) {
      return [
        "Punctuation is vital for clear communication.\n",
        "Without it, sentences would run together.\n",
        "Master these symbols, and your writing improves.\n",
        "It's a beautiful day, isn't it?\n",
        "Wait... did you hear that sound?\n",
        "She asked, \"Where are you going?\"\n",
        "The colors were: red, blue, and gold.\n",
        "It's not easy, but it's worth it.\n",
        "Who is there? Please answer me.\n",
        "They said: \"We will be there soon.\"\n",
        "Punctuation is vital for clear communication.\n",
        "Without it, sentences would run together.\n",
        "Master these symbols, and your writing improves.\n",
        "It's a beautiful day, isn't it?\n",
        "Wait... did you hear that sound?\n",
        "She asked, \"Where are you going?\"\n",
        "The colors were: red, blue, and gold.\n",
        "It's not easy, but it's worth it.\n",
        "Who is there? Please answer me.\n",
        "They said: \"We will be there soon.\"\n"
      ];
    } else if (effectiveLessonId === 14) {
      return [
        "The number row is often challenging to learn.\n",
        "Lessons 14 and 15 focus on mastering these keys.\n",
        "Practice the index fingers on keys 4, 5, 6, and 7.\n",
        "Typing a date like 07/04/1976 uses these keys.\n",
        "Learning the top row is essential for laptops.\n",
        "Keep your hands in the home row position.\n",
        "Reach up with confidence to hit the keys.\n",
        "The room number is 405 on the fourth floor.\n",
        "He was born in the year 1976 in June.\n",
        "Please turn to page 67 in your textbook.\n",
        "The number row is often challenging to learn.\n",
        "Lessons 14 and 15 focus on mastering these keys.\n",
        "Practice the index fingers on keys 4, 5, 6, and 7.\n",
        "Typing a date like 07/04/1976 uses these keys.\n",
        "Learning the top row is essential for laptops.\n",
        "Keep your hands in the home row position.\n",
        "Reach up with confidence to hit the keys.\n",
        "The room number is 405 on the fourth floor.\n",
        "He was born in the year 1976 in June.\n",
        "Please turn to page 67 in your textbook.\n"
      ];
    } else if (effectiveLessonId === 15) {
      return [
        "Focus on the outer keys: 1, 2, 3, 8, 9, and 0.\n",
        "These keys require a longer reach from home row.\n",
        "A phone number like 1-800-555-0199 uses these.\n",
        "It takes practice to develop muscle memory.\n",
        "Return to the home row after each stroke.\n",
        "Type numbers as easily as you type letters.\n",
        "The code is 123890 for the secure door.\n",
        "Her phone number ends in 9110 today.\n",
        "He finished in 1st place in the race.\n",
        "The year is 2023 and the price is $19.\n",
        "Focus on the outer keys: 1, 2, 3, 8, 9, and 0.\n",
        "These keys require a longer reach from home row.\n",
        "A phone number like 1-800-555-0199 uses these.\n",
        "It takes practice to develop muscle memory.\n",
        "Return to the home row after each stroke.\n",
        "Type numbers as easily as you type letters.\n",
        "The code is 123890 for the secure door.\n",
        "Her phone number ends in 9110 today.\n",
        "He finished in 1st place in the race.\n",
        "The year is 2023 and the price is $19.\n"
      ];
    } else if (effectiveLessonId === 16) {
      return [
        "Symbols like $, %, and @ are very common.\n",
        "Use the shift key with the number row.\n",
        "An email like user@example.com is standard.\n",
        "Maintain speed even with complex data.\n",
        "Use the opposite hand for the shift key.\n",
        "Save 100% on your next order today!\n",
        "Send an email to contact@shop.com now.\n",
        "The item ID is #12345 in the system.\n",
        "You saved $50.00 today on your purchase!\n",
        "Check out our 20% discount on all items.\n",
        "Symbols like $, %, and @ are very common.\n",
        "Use the shift key with the number row.\n",
        "An email like user@example.com is standard.\n",
        "Maintain speed even with complex data.\n",
        "Use the opposite hand for the shift key.\n",
        "Save 100% on your next order today!\n",
        "Send an email to contact@shop.com now.\n",
        "The item ID is #12345 in the system.\n",
        "You saved $50.00 today on your purchase!\n",
        "Check out our 20% discount on all items.\n"
      ];
    } else if (effectiveLessonId === 17) {
      return [
        "Mathematical symbols are essential for work.\n",
        "The ampersand (&) and asterisk (*) are used.\n",
        "Parentheses () are used for extra information.\n",
        "Mastering these keys requires precision.\n",
        "The result is (10 * 5) = 50 in the test.\n",
        "He used a & to join the two words together.\n",
        "The power is 2 ^ 10 in the math problem.\n",
        "The stars are shining *** tonight in sky.\n",
        "8 & 9 are consecutive numbers in the list.\n",
        "The area is (length * width) for the room.\n",
        "Mathematical symbols are essential for work.\n",
        "The ampersand (&) and asterisk (*) are used.\n",
        "Parentheses () are used for extra information.\n",
        "Mastering these keys requires precision.\n",
        "The result is (10 * 5) = 50 in the test.\n",
        "He used a & to join the two words together.\n",
        "The power is 2 ^ 10 in the math problem.\n",
        "The stars are shining *** tonight in sky.\n",
        "8 & 9 are consecutive numbers in the list.\n",
        "The area is (length * width) for the room.\n"
      ];
    } else if (effectiveLessonId === 18) {
      return [
        "Technical keys like - and _ are very useful.\n",
        "The equals (=) and plus (+) are also common.\n",
        "A path like /home/user/docs uses slashes.\n",
        "These keys are on the right side of keyboard.\n",
        "The well-being of the staff is very key.\n",
        "My user_name is typing_pro in the game.\n",
        "The equation is 2 + 2 = 4 for the child.\n",
        "The path is /home/user/docs on the disk.\n",
        "Choose either yes | no for the question.\n",
        "The value is -10 in the final result.\n",
        "Technical keys like - and _ are very useful.\n",
        "The equals (=) and plus (+) are also common.\n",
        "A path like /home/user/docs uses slashes.\n",
        "These keys are on the right side of keyboard.\n",
        "The well-being of the staff is very key.\n",
        "My user_name is typing_pro in the game.\n",
        "The equation is 2 + 2 = 4 for the child.\n",
        "The path is /home/user/docs on the disk.\n",
        "Choose either yes | no for the question.\n",
        "The value is -10 in the final result.\n"
      ];
    } else if (effectiveLessonId === 19) {
      return [
        "Brackets [], braces {}, and angle brackets <>.\n",
        "These are crucial for anyone learning to code.\n",
        "An array might look like [1, 2, 3] in code.\n",
        "Congratulations on reaching the final lesson!\n",
        "The first item is array[0] in the list.\n",
        "The function is test{} in the script file.\n",
        "The condition is x < y in the logic block.\n",
        "The result is y > x in the calculation.\n",
        "Use [ ] for arrays and { } for objects.\n",
        "The value is within < > tags in the HTML.\n",
        "Brackets [], braces {}, and angle brackets <>.\n",
        "These are crucial for anyone learning to code.\n",
        "An array might look like [1, 2, 3] in code.\n",
        "Congratulations on reaching the final lesson!\n",
        "The first item is array[0] in the list.\n",
        "The function is test{} in the script file.\n",
        "The condition is x < y in the logic block.\n",
        "The result is y > x in the calculation.\n",
        "Use [ ] for arrays and { } for objects.\n",
        "The value is within < > tags in the HTML.\n"
      ];
    } else if (effectiveLessonId === 20) {
      return [
        "The quick brown fox jumps over the lazy dog.\n",
        "Pack my box with five dozen liquor jugs.\n",
        "The 5 boxing wizards jump quickly.\n",
        "Sphinx of black quartz, judge my vow.\n",
        "Complex: User_ID #4592 & Password = (Secret)!\n",
        "Review: 10 + 20 = 30; [Array] {Object}.\n",
        "Email: contact@example.com | www.site.org\n",
        "Date: 12/25/2024 - Time: 11:59 PM.\n",
        "Final Test: Mastery of all keys is the goal.\n",
        "Typing is a skill that lasts a lifetime.\n",
        "The quick brown fox jumps over the lazy dog.\n",
        "Pack my box with five dozen liquor jugs.\n",
        "The 5 boxing wizards jump quickly.\n",
        "Sphinx of black quartz, judge my vow.\n",
        "Complex: User_ID #4592 & Password = (Secret)!\n",
        "Review: 10 + 20 = 30; [Array] {Object}.\n",
        "Email: contact@example.com | www.site.org\n",
        "Date: 12/25/2024 - Time: 11:59 PM.\n",
        "Final Test: Mastery of all keys is the goal.\n",
        "Typing is a skill that lasts a lifetime.\n"
      ];
    }
    return [];
  }, [currentLesson, courseType]);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (drillState === 'practice' && drillHasStarted) {
      interval = setInterval(() => {
         const now = Date.now();
         if (now - drillLastActivityRef.current < 2000) {
           setDrillTimeUsed(prev => {
               const nextUsed = prev + 1;
               setDrillTimeLeft(Math.max(0, 300 - nextUsed));
               
               if (nextUsed >= 300) {
                   setDrillEndTime(Date.now());
                   setDrillState('results');
                   clearInterval(interval);
               }
               return nextUsed;
           });
         }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [drillState, drillHasStarted]);

  // Update refs when state changes
  useEffect(() => { drillLastActivityRef.current = drillLastActivity; }, [drillLastActivity]);
  useEffect(() => { wordDrillLastActivityRef.current = wordDrillLastActivity; }, [wordDrillLastActivity]);
  useEffect(() => { sentenceDrillLastActivityRef.current = sentenceDrillLastActivity; }, [sentenceDrillLastActivity]);
  useEffect(() => { paragraphDrillLastActivityRef.current = paragraphDrillLastActivity; }, [paragraphDrillLastActivity]);

  // Word Drill Timer Effect
  useEffect(() => {
    let interval = null;
    if (wordDrillState === 'practice' && wordDrillHasStarted) {
      interval = setInterval(() => {
         const now = Date.now();
         if (now - wordDrillLastActivityRef.current < 2000) {
           setWordDrillTimeUsed(prev => {
               const nextUsed = prev + 1;
               setWordDrillTimeLeft(Math.max(0, 300 - nextUsed));
               
               if (nextUsed >= 300) {
                   setWordDrillEndTime(Date.now());
                   setWordDrillState('results');
                   clearInterval(interval);
               }
               return nextUsed;
           });
         }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [wordDrillState, wordDrillHasStarted]);

  // Sentence Drill Timer Effect
  useEffect(() => {
    let interval = null;
    if (sentenceDrillState === 'practice' && sentenceDrillHasStarted) {
      interval = setInterval(() => {
         const now = Date.now();
         if (now - sentenceDrillLastActivityRef.current < 2000) {
           setSentenceDrillTimeUsed(prev => {
               const nextUsed = prev + 1;
               setSentenceDrillTimeLeft(Math.max(0, 300 - nextUsed));
               
               if (nextUsed >= 300) {
                   setSentenceDrillEndTime(Date.now());
                   setSentenceDrillState('results');
                   clearInterval(interval);
               }
               return nextUsed;
           });
         }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sentenceDrillState, sentenceDrillHasStarted]);

  // Paragraph Drill Timer Effect
  useEffect(() => {
    let interval = null;
    if (paragraphDrillState === 'practice' && paragraphDrillHasStarted) {
      interval = setInterval(() => {
         const now = Date.now();
         if (now - paragraphDrillLastActivityRef.current < 2000) {
           setParagraphDrillTimeUsed(prev => {
               const nextUsed = prev + 1;
               setParagraphDrillTimeLeft(Math.max(0, 300 - nextUsed));
               
               if (nextUsed >= 300) {
                   setParagraphDrillEndTime(Date.now());
                   setParagraphDrillState('results');
                   clearInterval(interval);
               }
               return nextUsed;
           });
         }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paragraphDrillState, paragraphDrillHasStarted]);

  // Key Handler for Drill
  useEffect(() => {
    const handleDrillKeyDown = (e) => {
        if (e.repeat) return;
        if (view !== 'key_drill') return;

        // Handle Begin Drill shortcut (Space) when in 'info' state
        if (drillState === 'info') {
            if (e.key === ' ') {
                e.preventDefault();
                const now = Date.now();
                setDrillStartTime(now);
                setDrillEndTime(null);
                setDrillState('practice');
                setDrillHasStarted(false);
                setDrillTimeLeft(300); // Reset to 5 mins
                setDrillTimeUsed(0);
                setDrillLastActivity(now);
                drillLastActivityRef.current = now;
                setDrillHistory({ correct: 0, errors: 0, total: 0 });
                setDrillInput('');
                setDrillCurrentPatternIndex(0);
                setDrillKeyStats({});
                setDrillLastKeyTime(now);
                setDrillTotalTyped(0);
            }
            return;
        }

        if (drillState !== 'practice') return;

        // Update activity timestamp to resume timer
        const now = Date.now();
        setDrillLastActivity(now);
        drillLastActivityRef.current = now;
        if (!drillHasStarted) setDrillHasStarted(true);
        
        // Prevent default for typing keys to avoid scrolling
        if (e.key === ' ' || e.key.length === 1 || e.key === 'Backspace') {
            e.preventDefault();
        }

        const delay = drillLastKeyTime ? now - drillLastKeyTime : 0;
        setDrillLastKeyTime(now);

        if (e.key === 'Backspace') {
            // Track backspace if they were in an error state
            if (drillShowErrorX) {
                const currentPattern = drillPatterns[drillCurrentPatternIndex];
                const targetChar = currentPattern[drillInput.length].toUpperCase();
                setDrillKeyStats(prev => {
                    const stats = prev[targetChar] || { errors: 0, backspaces: 0, totalDelay: 0, count: 0 };
                    return { ...prev, [targetChar]: { ...stats, backspaces: stats.backspaces + 1 } };
                });
                setDrillShowErrorX(false);
                setDrillErrorKey(null);
            }
            return;
        }

        if (e.key.length === 1) {
            const char = e.key;
            const currentPattern = drillPatterns[drillCurrentPatternIndex];
            const targetChar = currentPattern[drillInput.length];
            const targetKeyUpper = targetChar === ' ' ? 'SPACE' : targetChar.toUpperCase();

            if (char === targetChar) {
                // Correct
                const newInput = drillInput + char;
                setDrillInput(newInput);
                setDrillHistory(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
                setDrillShowErrorX(false);
                setDrillErrorKey(null);
                
                // Track stats for the correct key
                setDrillKeyStats(prev => {
                    const stats = prev[targetKeyUpper] || { errors: 0, backspaces: 0, totalDelay: 0, count: 0 };
                    return { ...prev, [targetKeyUpper]: { 
                        ...stats, 
                        count: stats.count + 1,
                        totalDelay: stats.totalDelay + delay
                    }};
                });
                setDrillTotalTyped(prev => prev + 1);

                // Check if pattern complete
                if (newInput.length === currentPattern.length) {
                    setDrillInput('');
                    setDrillCurrentPatternIndex((prev) => (prev + 1) % drillPatterns.length);
                    setDrillCompletedRows(prev => [...prev, drillCurrentPatternIndex]);
                }
            } else {
                // Incorrect
                setDrillHistory(prev => ({ ...prev, errors: prev.errors + 1, total: prev.total + 1 }));
                setDrillShowErrorX(true);
                setDrillErrorKey(char.toUpperCase());

                // Track error for the intended key
                setDrillKeyStats(prev => {
                    const stats = prev[targetKeyUpper] || { errors: 0, backspaces: 0, totalDelay: 0, count: 0 };
                    return { ...prev, [targetKeyUpper]: { ...stats, errors: stats.errors + 1 } };
                });
                
                // Auto-hide error after a short delay (optional, but keep for UX)
                setTimeout(() => {
                    setDrillShowErrorX(false);
                    setDrillErrorKey(null);
                }, 1000);
            }
        }
    };

    window.addEventListener('keydown', handleDrillKeyDown);
    return () => window.removeEventListener('keydown', handleDrillKeyDown);
  }, [view, drillState, drillInput, drillCurrentPatternIndex, drillPatterns, drillLastKeyTime, drillShowErrorX, drillHasStarted]);

  // Key Handler for Word Drill
  useEffect(() => {
    const handleWordDrillKeyDown = (e) => {
        if (e.repeat) return;
        if (view !== 'word_drill') return;

        if (wordDrillState === 'info') {
            if (e.key === ' ') {
                e.preventDefault();
                const now = Date.now();
                setWordDrillStartTime(now);
                setWordDrillEndTime(null);
                setWordDrillState('practice');
                setWordDrillHasStarted(false);
                setWordDrillTimeLeft(300);
                setWordDrillTimeUsed(0);
                setWordDrillLastActivity(now);
                wordDrillLastActivityRef.current = now;
                setWordDrillHistory({ correct: 0, errors: 0, total: 0 });
                setWordDrillInput('');
                setWordDrillCurrentPatternIndex(0);
                setWordDrillKeyStats({});
                setWordDrillLastKeyTime(now);
            }
            return;
        }

        if (wordDrillState !== 'practice') return;

        const now = Date.now();
        setWordDrillLastActivity(now);
        wordDrillLastActivityRef.current = now;
        if (!wordDrillHasStarted) setWordDrillHasStarted(true);
        
        if (e.key === ' ' || e.key.length === 1 || e.key === 'Backspace') {
            e.preventDefault();
        }

        const delay = wordDrillLastKeyTime ? now - wordDrillLastKeyTime : 0;
        setWordDrillLastKeyTime(now);

        if (e.key === 'Backspace') {
            if (wordDrillShowErrorX) {
                setWordDrillShowErrorX(false);
                setWordDrillErrorKey(null);
            }
            return;
        }

        if (e.key.length === 1) {
            const char = e.key;
            const currentPattern = wordDrillPatterns[wordDrillCurrentPatternIndex];
            const targetChar = currentPattern[wordDrillInput.length];
            const targetKeyUpper = targetChar === ' ' ? 'SPACE' : targetChar.toUpperCase();

            if (char === targetChar) {
                const newInput = wordDrillInput + char;
                setWordDrillInput(newInput);
                setWordDrillHistory(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
                setWordDrillShowErrorX(false);
                setWordDrillErrorKey(null);
                
                setWordDrillKeyStats(prev => {
                    const stats = prev[targetKeyUpper] || { errors: 0, backspaces: 0, totalDelay: 0, count: 0 };
                    return { ...prev, [targetKeyUpper]: { 
                        ...stats, 
                        count: stats.count + 1,
                        totalDelay: stats.totalDelay + delay
                    }};
                });

                if (newInput.length === currentPattern.length) {
                    setWordDrillInput('');
                    setWordDrillCurrentPatternIndex((prev) => (prev + 1) % wordDrillPatterns.length);
                }
            } else {
                setWordDrillHistory(prev => ({ ...prev, errors: prev.errors + 1, total: prev.total + 1 }));
                setWordDrillShowErrorX(true);
                setWordDrillErrorKey(char.toUpperCase());

                setWordDrillKeyStats(prev => {
                    const stats = prev[targetKeyUpper] || { errors: 0, backspaces: 0, totalDelay: 0, count: 0 };
                    return { ...prev, [targetKeyUpper]: { ...stats, errors: stats.errors + 1 } };
                });
                
                setTimeout(() => {
                    setWordDrillShowErrorX(false);
                    setWordDrillErrorKey(null);
                }, 1000);
            }
        }
    };

    window.addEventListener('keydown', handleWordDrillKeyDown);
    return () => window.removeEventListener('keydown', handleWordDrillKeyDown);
  }, [view, wordDrillState, wordDrillInput, wordDrillCurrentPatternIndex, wordDrillPatterns, wordDrillLastKeyTime, wordDrillShowErrorX, wordDrillHasStarted]);

  // Key Handler for Sentence Drill
  useEffect(() => {
    const handleSentenceDrillKeyDown = (e) => {
        if (e.repeat) return;
        if (view !== 'sentence_drill') return;

        if (sentenceDrillState === 'info') {
            if (e.key === ' ') {
                e.preventDefault();
                const now = Date.now();
                setSentenceDrillStartTime(now);
                setSentenceDrillEndTime(null);
                setSentenceDrillState('practice');
                setSentenceDrillHasStarted(false);
                setSentenceDrillTimeLeft(300);
                setSentenceDrillTimeUsed(0);
                setSentenceDrillLastActivity(now);
                sentenceDrillLastActivityRef.current = now;
                setSentenceDrillHistory({ correct: 0, errors: 0, total: 0 });
                setSentenceDrillInput('');
                setSentenceDrillCurrentPatternIndex(0);
                setSentenceDrillKeyStats({});
                setSentenceDrillLastKeyTime(now);
            }
            return;
        }

        if (sentenceDrillState !== 'practice') return;

        const now = Date.now();
        setSentenceDrillLastActivity(now);
        sentenceDrillLastActivityRef.current = now;
        if (!sentenceDrillHasStarted) setSentenceDrillHasStarted(true);
        
        if (e.key === ' ' || e.key.length === 1 || e.key === 'Backspace') {
            e.preventDefault();
        }

        const delay = sentenceDrillLastKeyTime ? now - sentenceDrillLastKeyTime : 0;
        setSentenceDrillLastKeyTime(now);

        if (e.key === 'Backspace') {
            if (sentenceDrillShowErrorX) {
                setSentenceDrillShowErrorX(false);
                setSentenceDrillErrorKey(null);
            }
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            const currentPattern = sentenceDrillPatterns[sentenceDrillCurrentPatternIndex];
            if (sentenceDrillInput.length === currentPattern.length) {
                setSentenceDrillInput('');
                setSentenceDrillCurrentPatternIndex(prev => (prev + 1) % sentenceDrillPatterns.length);
                setSentenceDrillShowErrorX(false);
                setSentenceDrillErrorKey(null);
            }
            return;
        }

        if (e.key.length === 1) {
            const char = e.key;
            const currentPattern = sentenceDrillPatterns[sentenceDrillCurrentPatternIndex];
            
            // If already at end of sentence, must press Enter
            if (sentenceDrillInput.length >= currentPattern.length) {
                return;
            }

            const targetChar = currentPattern[sentenceDrillInput.length];
            const targetKeyUpper = targetChar === ' ' ? 'SPACE' : targetChar.toUpperCase();

            if (char === targetChar) {
                const newInput = sentenceDrillInput + char;
                setSentenceDrillInput(newInput);
                setSentenceDrillHistory(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
                setSentenceDrillShowErrorX(false);
                setSentenceDrillErrorKey(null);
                
                setSentenceDrillKeyStats(prev => {
                    const stats = prev[targetKeyUpper] || { errors: 0, backspaces: 0, totalDelay: 0, count: 0 };
                    return { ...prev, [targetKeyUpper]: { 
                        ...stats, 
                        count: stats.count + 1,
                        totalDelay: stats.totalDelay + delay
                    }};
                });
            } else {
                setSentenceDrillHistory(prev => ({ ...prev, errors: prev.errors + 1, total: prev.total + 1 }));
                setSentenceDrillShowErrorX(true);
                setSentenceDrillErrorKey(char.toUpperCase());

                setSentenceDrillKeyStats(prev => {
                    const stats = prev[targetKeyUpper] || { errors: 0, backspaces: 0, totalDelay: 0, count: 0 };
                    return { ...prev, [targetKeyUpper]: { ...stats, errors: stats.errors + 1 } };
                });
                
                setTimeout(() => {
                    setSentenceDrillShowErrorX(false);
                    setSentenceDrillErrorKey(null);
                }, 1000);
            }
        }
    };

    window.addEventListener('keydown', handleSentenceDrillKeyDown);
    return () => window.removeEventListener('keydown', handleSentenceDrillKeyDown);
  }, [view, sentenceDrillState, sentenceDrillInput, sentenceDrillCurrentPatternIndex, sentenceDrillPatterns, sentenceDrillLastKeyTime, sentenceDrillShowErrorX, sentenceDrillHasStarted]);

  // Key Handler for Review Difficult Keys
  useEffect(() => {
    if (view !== 'review_difficult') return;

    const handleReviewKeyDown = (e) => {
        if (!reviewPatterns || reviewPatterns.length === 0) return;
        
        const currentPattern = reviewPatterns[reviewPatternIndex];
        const targetChar = currentPattern[reviewInput.length];
        
        if (e.key === ' ' || e.key.length === 1 || e.key === 'Backspace') {
            e.preventDefault();
        }

        if (e.key === 'Backspace') {
            setReviewShowError(false);
            return;
        }

        if (e.key === targetChar) {
            const newInput = reviewInput + e.key;
            setReviewInput(newInput);
            setReviewShowError(false);
            
            // Calculate progress 0 - 100%
            const totalPatterns = reviewPatterns.length;
            const completedPatterns = reviewPatternIndex;
            const currentPatternProgress = (newInput.length / currentPattern.length) * (1 / totalPatterns);
            const totalProgress = Math.round(((completedPatterns / totalPatterns) + currentPatternProgress) * 100);
            
            setReviewProgress(Math.min(100, totalProgress));

            if (newInput.length === currentPattern.length) {
                if (reviewPatternIndex < reviewPatterns.length - 1) {
                    setReviewInput('');
                    setReviewPatternIndex(prev => prev + 1);
                } else {
                    setReviewProgress(100);
                    setReviewEndTime(Date.now());
                }
            }
        } else if (e.key.length === 1 || e.key === ' ') {
            // Incorrect key
            setReviewShowError(true);
        }
    };

    window.addEventListener('keydown', handleReviewKeyDown);
    return () => window.removeEventListener('keydown', handleReviewKeyDown);
  }, [view, reviewInput, reviewPatternIndex, reviewPatterns]);

  // Key Handler for Paragraph Drill
  useEffect(() => {
    const handleParagraphDrillKeyDown = (e) => {
        if (e.repeat) return;
        if (view !== 'paragraph_drill') return;

        if (paragraphDrillState === 'intro') {
            if (e.key === 'Enter') {
                e.preventDefault();
                setParagraphDrillState('info');
            }
            return;
        }

        if (paragraphDrillState === 'info') {
            if (e.key === ' ') {
                e.preventDefault();
                const now = Date.now();
                setParagraphDrillStartTime(now);
                setParagraphDrillEndTime(null);
                setParagraphDrillState('practice');
                setParagraphDrillHasStarted(false);
                setParagraphDrillTimeLeft(300);
                setParagraphDrillTimeUsed(0);
                setParagraphDrillLastActivity(now);
                paragraphDrillLastActivityRef.current = now;
                setParagraphDrillHistory({ correct: 0, errors: 0, total: 0 });
                setParagraphDrillInput('');
                setParagraphDrillCurrentPatternIndex(0);
                setParagraphDrillKeyStats({});
                setParagraphDrillLastKeyTime(now);
                setParagraphDrillCompletedRows([]);
                setParagraphDrillRowInputs({});
                setParagraphDrillCompletedWords([]);
                setParagraphDrillCurrentWordInput('');
            }
            return;
        }

        if (paragraphDrillState !== 'practice') return;

        const now = Date.now();
        setParagraphDrillLastActivity(now);
        paragraphDrillLastActivityRef.current = now;
        if (!paragraphDrillHasStarted) setParagraphDrillHasStarted(true);
        
        if (e.key === ' ' || e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
            e.preventDefault();
        }

        const delay = paragraphDrillLastKeyTime ? now - paragraphDrillLastKeyTime : 0;
        setParagraphDrillLastKeyTime(now);

        const currentPattern = paragraphDrillPatterns[paragraphDrillCurrentPatternIndex];
        const targetWords = currentPattern.split(' ');
        const currentWordIndex = paragraphDrillCompletedWords.length;
        
        // Safety check
        if (currentWordIndex >= targetWords.length && e.key !== 'Enter') return;

        if (e.key === 'Backspace') {
            if (paragraphDrillCurrentWordInput.length > 0) {
                setParagraphDrillCurrentWordInput(prev => prev.slice(0, -1));
            }
            return;
        }

        if (e.key === ' ') {
            if (currentWordIndex < targetWords.length) {
                const targetWord = targetWords[currentWordIndex];
                // Check if it's the last word
                if (currentWordIndex === targetWords.length - 1) {
                    // Cannot use space to finish last word, must use Enter
                    return;
                }

                // Commit word
                const committedWord = paragraphDrillCurrentWordInput;
                setParagraphDrillCompletedWords(prev => [...prev, committedWord]);
                setParagraphDrillCurrentWordInput('');
                
                // Update stats
                const isCorrect = committedWord === targetWord;
                const wordLen = targetWord.length;
                
                setParagraphDrillHistory(prev => ({
                    ...prev,
                    correct: prev.correct + (isCorrect ? wordLen + 1 : 0),
                    errors: prev.errors + (isCorrect ? 0 : wordLen + 1),
                    total: prev.total + wordLen + 1
                }));
            }
            return;
        }

        if (e.key === 'Enter') {
             // Only valid if we are at the last word
             if (currentWordIndex === targetWords.length - 1) {
                  const targetWord = targetWords[currentWordIndex].replace('\n', '');
                  const committedWord = paragraphDrillCurrentWordInput;
                  const isCorrect = committedWord === targetWord;
                  
                  setParagraphDrillHistory(prev => ({
                      ...prev,
                      correct: prev.correct + (isCorrect ? targetWord.length + 1 : 0),
                      errors: prev.errors + (isCorrect ? 0 : targetWord.length + 1),
                      total: prev.total + targetWord.length + 1
                  }));

                  const nextIndex = (paragraphDrillCurrentPatternIndex + 1) % paragraphDrillPatterns.length;
                  
                  if (nextIndex === 0) {
                      setParagraphDrillCompletedRows([]);
                      setParagraphDrillRowInputs({});
                  } else {
                      setParagraphDrillCompletedRows(prev => [...prev, paragraphDrillCurrentPatternIndex]);
                      // Store full row input for display in completed rows
                      const fullRow = [...paragraphDrillCompletedWords, committedWord].join(' ') + '\n';
                      setParagraphDrillRowInputs(prev => ({ ...prev, [paragraphDrillCurrentPatternIndex]: fullRow }));
                  }

                  setParagraphDrillInput('');
                  setParagraphDrillCurrentPatternIndex(nextIndex);
                  setParagraphDrillCompletedWords([]);
                  setParagraphDrillCurrentWordInput('');
                  setParagraphDrillShowErrorX(false);
                  setParagraphDrillErrorKey(null);
             }
             return;
        }

        if (e.key.length === 1) {
            const char = e.key;
            setParagraphDrillCurrentWordInput(prev => prev + char);
            
            // Check current char correctness for immediate feedback if needed
            // But main feedback is via rendering
        }
    };

    window.addEventListener('keydown', handleParagraphDrillKeyDown);
    return () => window.removeEventListener('keydown', handleParagraphDrillKeyDown);
  }, [view, paragraphDrillState, paragraphDrillCurrentPatternIndex, paragraphDrillPatterns, paragraphDrillLastKeyTime, paragraphDrillHasStarted, paragraphDrillCompletedWords, paragraphDrillCurrentWordInput]);

  // Render Drill Info
  const renderDrillInfo = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1000px', margin: '40px auto'}}>
      <div className="slide-header" style={{background: '#dff0d8', color: '#3c763d', borderBottom: '1px solid #d6e9c6'}}>
        <span>Drill Information</span>
      </div>
      <div className="slide-content" style={{padding: '30px', flexDirection: 'column', display: 'flex'}}>
        <div style={{display: 'flex', marginBottom: '20px', alignItems: 'center', width: '100%'}}>
            <strong style={{width: '120px'}}>Duration</strong>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span style={{color: '#666'}}>📊</span>
                <span>3 - 5 minutes (based on progress)</span>
            </div>
        </div>
        <div style={{display: 'flex', marginBottom: '20px', alignItems: 'center', width: '100%'}}>
            <strong style={{width: '120px'}}>Accuracy Goal</strong>
            <select 
                style={{padding: '5px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer'}}
                value={drillAccuracyGoal}
                onChange={(e) => setDrillAccuracyGoal(Number(e.target.value))}
            >
                <option value={98}>98% Advanced</option>
                <option value={94}>94% Intermediate</option>
                <option value={90}>90% Easy</option>
            </select>
        </div>
        <div style={{display: 'flex', marginBottom: '30px', width: '100%'}}>
            <strong style={{width: '120px'}}>Objective</strong>
            <p style={{margin: 0, flex: 1, color: '#333'}}>
                Reinforcement practice to further develop smooth and accurate keystrokes and even rhythm.
            </p>
        </div>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', width: 'fit-content'}}>
            <button 
                style={{
                    padding: '8px 25px',
                    borderRadius: '8px',
                    border: `1px solid ${courseColor}`,
                    background: 'white',
                    color: courseColor,
                    fontSize: '1rem',
                    fontWeight: '400',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    width: '100%'
                }}
                onClick={() => changeView('lesson_detail')}
            >
                <span style={{textDecoration: 'underline'}}>C</span>ancel
            </button>
            <button 
                style={{
                    background: lightCourseColor, 
                    border: `1px solid ${gradientStart}`, 
                    color: courseColor, 
                    padding: '10px 20px', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    fontSize: '1rem'
                }}
                onClick={() => {
                    setDrillState('practice');
                    setDrillHasStarted(false);
                    setDrillTimeLeft(300); // Reset to 5 mins
                    setDrillTimeUsed(0);
                    setDrillLastActivity(Date.now());
                    setDrillHistory({ correct: 0, errors: 0, total: 0 });
                    setDrillInput('');
                    setDrillCurrentPatternIndex(0);
                }}
            >
                <span style={{fontSize: '0.8rem'}}>▶</span> Begin drill (Space)
            </button>
        </div>
      </div>
    </div>
  );

  // Render Word Drill Info
  const renderWordDrillInfo = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1000px', margin: '40px auto'}}>
      <div className="slide-header" style={{background: lightCourseColor, color: courseColor, borderBottom: `1px solid ${gradientStart}`}}>
        <span>Drill Information</span>
      </div>
      <div className="slide-content" style={{padding: '30px', flexDirection: 'column', display: 'flex'}}>
        <div style={{display: 'flex', marginBottom: '20px', alignItems: 'center', width: '100%'}}>
            <strong style={{width: '120px'}}>Duration</strong>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span style={{color: '#666'}}>📊</span>
                <span>3 - 5 minutes (based on progress)</span>
            </div>
        </div>
        <div style={{display: 'flex', marginBottom: '20px', alignItems: 'center', width: '100%'}}>
            <strong style={{width: '120px'}}>Accuracy Goal</strong>
            <select 
                style={{padding: '5px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer'}}
                value={wordDrillAccuracyGoal}
                onChange={(e) => setWordDrillAccuracyGoal(Number(e.target.value))}
            >
                <option value={98}>98% Advanced</option>
                <option value={94}>94% Intermediate</option>
                <option value={90}>90% Easy</option>
            </select>
        </div>
        <div style={{display: 'flex', marginBottom: '30px', alignItems: 'flex-start', width: '100%'}}>
            <strong style={{width: '120px'}}>Objective</strong>
            <span style={{flex: 1}}>Consolidation exercise to further develop muscle memory and strengthen technique.</span>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', width: 'fit-content'}}>
            <button 
                style={{
                    padding: '8px 25px',
                    borderRadius: '8px',
                    border: `1px solid ${courseColor}`,
                    background: 'white',
                    color: courseColor,
                    fontSize: '1rem',
                    fontWeight: '400',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    width: '100%'
                }}
                onClick={() => changeView('lesson_detail')}
            >
                <span style={{textDecoration: 'underline'}}>C</span>ancel
            </button>
            <button 
                className="begin-drill-btn"
                style={{
                    background: lightCourseColor, 
                    border: `1px solid ${gradientStart}`, 
                    color: courseColor, 
                    padding: '10px 20px', 
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    fontSize: '1rem'
                }}
                onClick={() => {
                    setWordDrillState('practice');
                    setWordDrillHasStarted(false);
                    setWordDrillTimeLeft(300);
                    setWordDrillTimeUsed(0);
                    setWordDrillLastActivity(Date.now());
                    setWordDrillHistory({ correct: 0, errors: 0, total: 0 });
                    setWordDrillInput('');
                    setWordDrillCurrentPatternIndex(0);
                }}
            >
                <span style={{fontSize: '0.8rem'}}>▶</span> Begin drill (Space)
            </button>
        </div>
      </div>
    </div>
  );

  // Render Word Drill Practice
  const renderWordDrillPractice = () => {
      const currentPattern = wordDrillPatterns[wordDrillCurrentPatternIndex];
      if (!currentPattern) return <div className="practice-card">Loading drill...</div>;

      let row1Idx, row2Idx;
      // All lessons now use the 2-row layout consistently
      const pageIndex = Math.floor(wordDrillCurrentPatternIndex / 2);
      row1Idx = pageIndex * 2;
      row2Idx = pageIndex * 2 + 1;
      
      const pattern1 = wordDrillPatterns[row1Idx];
      const pattern2 = row2Idx >= 0 && row2Idx < wordDrillPatterns.length ? wordDrillPatterns[row2Idx] : null;

      const targetChar = wordDrillInput.length < currentPattern.length ? currentPattern[wordDrillInput.length] : null;
      const activeKey = targetChar === ' ' ? 'Space' : (targetChar ? targetChar.toUpperCase() : null);
      
      const keyData = activeKey ? practiceKeys.find(k => k.key.toUpperCase() === (activeKey === 'Space' ? 'SPACE' : activeKey)) : null;
      const fingerPos = keyData ? { ...keyData.dotPos, color: keyData.color } : null;

      const minutes = Math.floor(wordDrillTimeLeft / 60);
      const seconds = wordDrillTimeLeft % 60;
      const timeString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      return (
        <div className="practice-card" style={{
            width: '100%',
            maxWidth: '1200px', 
            margin: '0 auto', 
            display: 'flex', 
            height: '100vh', 
            maxHeight: '650px',
            background: mainBg,
            border: `1px solid ${lightCourseColor}`,
            overflow: 'hidden',
            position: 'relative'
        }}>
            <div style={{flex: 1, padding: '10px 25px', display: 'flex', flexDirection: 'column'}}>
                <div style={{color: '#7aa93c', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'}}>
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid #7aa93c',
                        fontSize: '0.65rem'
                    }}>▶</span>
                    Type the highlighted word and press space
                </div>

                <div className="drill-patterns-area" style={{marginBottom: '5px'}}>
                    <div style={{marginBottom: '10px'}}>
                        {renderWordBlocks(
                            pattern1, 
                            wordDrillCurrentPatternIndex === row1Idx ? wordDrillInput : (wordDrillCurrentPatternIndex > row1Idx ? pattern1 : ''), 
                            wordDrillCurrentPatternIndex === row1Idx, 
                            wordDrillCurrentPatternIndex === row1Idx ? wordDrillShowErrorX : false, 
                            wordDrillCurrentPatternIndex > row1Idx
                        )}
                        {pattern2 && (
                            renderWordBlocks(
                                pattern2, 
                                wordDrillCurrentPatternIndex === row2Idx ? wordDrillInput : (wordDrillCurrentPatternIndex > row2Idx ? pattern2 : ''), 
                                wordDrillCurrentPatternIndex === row2Idx, 
                                wordDrillCurrentPatternIndex === row2Idx ? wordDrillShowErrorX : false, 
                                wordDrillCurrentPatternIndex > row2Idx
                            )
                        )}
                    </div>
                </div>

                <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0', marginTop: '60px'}}>
                      {renderKeyboard(activeKey ? [activeKey] : null, wordDrillShowErrorX ? wordDrillErrorKey : null)}
                </div>
                
              {wordDrillShowErrorX && (
                  <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '10rem',
                      color: 'rgba(255, 0, 0, 0.4)',
                      fontWeight: 'bold',
                      zIndex: 10,
                      pointerEvents: 'none'
                  }}>X</div>
              )}
          </div>

          {/* Sidebar */}
          <div style={{width: '240px', background: sidebarBg, borderLeft: `1px solid ${lightCourseColor}`, padding: '20px', display: 'flex', flexDirection: 'column', position: 'relative'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: '#4a76a8', fontWeight: 'bold', marginBottom: '20px', marginTop: '10px'}}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end', width: '20px'}}>
                      <div style={{width: '5px', height: '12px', background: '#f28b82', border: '1px solid #d93025'}}></div>
                      <div style={{width: '5px', height: '16px', background: '#8ab4f8', border: `1px solid ${courseColor}`}}></div>
                      <div style={{width: '5px', height: '8px', background: '#81c995', border: '1px solid #188038'}}></div>
                  </div>
                  <span style={{fontSize: '1.1rem'}}>Your Progress</span>
              </div>
              
              <div style={{
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  gap: '4px', 
                  marginBottom: '20px', 
                  maxHeight: '120px', 
                  background: 'rgba(255,255,255,0.8)', 
                  padding: '15px 10px', 
                  borderRadius: '4px',
                  border: `1px solid ${lightCourseColor}`
              }}>
                  {Array.from({length: 20}).map((_, i) => {
                      const totalTime = 300;
                      const timePercent = Math.max(0, Math.min(1, (totalTime - wordDrillTimeLeft) / totalTime));
                      const filledCount = Math.floor(timePercent * 20);
                      
                      const isCompleted = i < filledCount;
                      const isCurrent = i === filledCount;
                      const baseHeight = 15 + (i * 4); // Linear increase for single graph effect
                      return (
                          <div key={i} style={{
                              flex: 1, 
                              height: `${baseHeight}%`, 
                              background: isCompleted ? '#8dbd5b' : (isCurrent ? '#fff9c4' : '#f5f5dc'), 
                              border: '1px solid #333',
                              boxShadow: isCurrent ? `0 0 5px ${courseColor}80` : 'none',
                              transition: 'all 0.3s ease'
                          }}></div>
                      );
                  })}
              </div>

                <div style={{marginBottom: '15px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px'}}>
                        <div style={{fontSize: '0.85rem', color: '#666', fontWeight: 'bold'}}>Time</div>
                        {Date.now() - wordDrillLastActivity >= 2000 && (
                            <div style={{fontSize: '0.85rem', color: courseColor, cursor: 'pointer', textDecoration: 'underline'}}>Pause</div>
                        )}
                    </div>
                    <div style={{fontSize: '1.8rem', fontWeight: 'bold', color: '#333'}}>
                        {timeString}
                    </div>
                </div>

                <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <button 
                        style={{
                            background: 'white', 
                            color: courseColor, 
                            border: `1px solid ${courseColor}`, 
                            padding: '12px', 
                            borderRadius: '4px', 
                            fontWeight: 'normal',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '1rem'
                        }}
                        onClick={() => changeView('lesson_detail')}
                    >
                        Cancel
                    </button>
                    <button 
                        style={{
                            background: courseColor, 
                            color: 'white', 
                            border: 'none', 
                            padding: '12px', 
                            borderRadius: '4px', 
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            width: '100%',
                            fontSize: '1rem'
                        }}
                        onClick={() => {
                            setWordDrillEndTime(Date.now());
                            setWordDrillState('results');
                        }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
      );
  };

  // Render Word Drill Results
  const renderWordDrillResults = () => {
      // Metrics Calculation - Standard WPM Rules
      const durationSec = Math.max(1, wordDrillTimeUsed);
      const timeInMinutes = durationSec / 60;
      
      const grossSpeed = Math.round((wordDrillHistory.total / 5) / timeInMinutes);
      const netSpeed = Math.round((wordDrillHistory.correct / 5) / timeInMinutes);
      const accuracy = wordDrillHistory.total > 0 ? Math.round((wordDrillHistory.correct / wordDrillHistory.total) * 100) : 0;

      return (
        <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '20px auto', padding: '0'}}>
            <div className="slide-header" style={{background: courseColor, color: 'white', padding: '15px 20px'}}>
                <h2 style={{margin: 0, fontSize: '1.2rem'}}>Word Drill Results</h2>
            </div>
            <div style={{padding: '30px'}}>
                <div style={{marginBottom: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: accuracy >= wordDrillAccuracyGoal ? '#3c763d' : '#8a6d3b'}}>
                        <span style={{fontSize: '1.2rem'}}>{accuracy >= wordDrillAccuracyGoal ? '☑' : '⚠'}</span>
                        <strong style={{fontSize: '1rem'}}>{accuracy >= wordDrillAccuracyGoal ? 'Exercise Completed' : 'Exercise Finished'}</strong>
                    </div>
                    <p style={{marginBottom: '10px', fontSize: '0.9rem', color: '#666'}}>
                        {accuracy >= wordDrillAccuracyGoal 
                            ? "Good job! You reached the accuracy goal and your typing speed was good. Keep up the good work!"
                            : `You didn't quite reach the accuracy goal of ${wordDrillAccuracyGoal}%. Focus on accuracy and try again to improve your results.`
                        }
                    </p>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px'}}>
                    <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eee'}}>
                        <h3 style={{marginTop: 0, color: courseColor, fontSize: '1rem', borderBottom: `2px solid ${courseColor}`, paddingBottom: '10px'}}>Performance</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <span style={{color: '#666', fontWeight: '500'}}>Net Speed:</span>
                                <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#333'}}>{netSpeed} WPM</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <span style={{color: '#666', fontWeight: '500'}}>Accuracy:</span>
                                <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: accuracy >= wordDrillAccuracyGoal ? '#2e7d32' : '#c62828'}}>{accuracy}%</span>
                            </div>
                        </div>
                    </div>

                    <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eee'}}>
                        <h3 style={{marginTop: 0, color: courseColor, fontSize: '1rem', borderBottom: `2px solid ${courseColor}`, paddingBottom: '10px'}}>Session Details</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span style={{color: '#666'}}>Gross Speed:</span>
                                <span style={{fontWeight: 'bold'}}>{grossSpeed} WPM</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span style={{color: '#666'}}>Time Used:</span>
                                <span style={{fontWeight: 'bold'}}>{formatTime(durationSec)}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span style={{color: '#666'}}>Total Errors:</span>
                                <span style={{fontWeight: 'bold', color: '#c62828'}}>{wordDrillHistory.errors}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{marginBottom: '30px'}}>
                    {renderDifficultKeysGraph(wordDrillKeyStats)}
                </div>

                <div style={{display: 'flex', flexDirection: 'row', gap: '20px', justifyContent: 'center', width: '100%'}}>
                    <button 
                        style={{
                            padding: '12px 40px',
                            fontSize: '1rem',
                            background: 'white',
                            color: courseColor,
                            border: `1px solid ${courseColor}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '200px'
                        }}
                        onClick={() => changeView('lesson_detail')}
                    >
                        Cancel
                    </button>
                    <button 
                        className="continue-btn"
                        style={{
                            padding: '12px 40px',
                            fontSize: '1rem',
                            background: courseColor,
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '200px'
                        }}
                        onClick={() => changeView('lesson_detail')}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
      );
  };

  // Render Paragraph Drill Intro
  const renderParagraphDrillIntro = () => (
    <div className="practice-card" style={{
        width: '98vw',
        maxWidth: '100%', 
        margin: '10px auto', 
        padding: '0', 
        boxShadow: '0 4px 25px rgba(0,0,0,0.15)',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'white',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
    }}>
      <div className="slide-header" style={{
          background: courseColor, 
          color: 'white', 
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: 'none',
          flexShrink: 0
      }}>
        <h2 style={{margin: 0, fontSize: '1.3rem', fontWeight: '500'}}>Backspace and Enter</h2>
        <button 
            style={{background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', opacity: 0.8}}
            onClick={() => changeView('lesson_detail')}
        >×</button>
      </div>

      <div className="slide-content" style={{
          padding: '10px 25px 10px 25px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '5px',
          overflowY: 'auto'
      }}>
        <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', color: '#333', fontSize: '0.95rem', lineHeight: '1.4'}}>
            <p style={{margin: 0}}>
                Paragraph drills offer you more of a challenge. The program will no longer stop you if you make a mistake. It lets you go forward without forcing you to fix errors.
            </p>
            <p style={{margin: 0}}>
                You can use the Backspace key to correct mistakes in a word. However, you must do this before hitting Space. Once you press Space you can no longer make changes to a word.
            </p>
            <p style={{margin: 0}}>
                The reason for not letting you go back in the text to correct all mistakes is that we want you to concentrate on typing accurately and go forward without interrupting your typing. Also, learning to rely on the Backspace key can prevent you from typing your best later on.
            </p>
            <p style={{margin: 0}}>
                <strong>Enter:</strong> In this drill, you will also start using the Enter key. Enter is marked with ↵ symbol. Always use your right little finger to press ↵.
            </p>
        </div>
      </div>

      <div style={{
          width: '100%', 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: '15px',
          justifyContent: 'center',
          padding: '10px 15px',
          borderTop: '1px solid #eee',
          flexShrink: 0
      }}>
            <div style={{
              flex: 1, 
              maxWidth: '1200px',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              background: '#eef6e8', 
              padding: '15px 10px', 
              borderRadius: '4px', 
              border: '1px solid #d0e0c0'
          }}>
                <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5px'}}>
                    {renderKeyboard(['Back', 'Enter'], null, '45px')}
                </div>
            </div>

            <div style={{
                display: 'flex', 
                flexDirection: 'column',
                gap: '10px',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <button 
                  style={{
                      padding: '10px 0',
                      borderRadius: '8px',
                      border: `1px solid ${courseColor}`,
                      background: 'white',
                      color: courseColor,
                      fontSize: '1rem',
                      fontWeight: '400',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      width: '200px',
                      textAlign: 'center',
                      boxSizing: 'border-box'
                  }}
                  onClick={() => changeView('lesson_detail')}
                >
                    <span style={{textDecoration: 'underline'}}>C</span>ancel
                </button>
                <button 
                  style={{
                      padding: '10px 0',
                      borderRadius: '8px',
                      border: 'none',
                      background: courseColor,
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      width: '200px',
                      textAlign: 'center',
                      boxSizing: 'border-box'
                  }}
                  onClick={() => setParagraphDrillState('info')}
                >
                    OK
                </button>
            </div>
      </div>
    </div>
  );

  // Render Paragraph Drill Info
  const renderParagraphDrillInfo = () => (
    <div className="practice-card" style={{
        width: '100%',
        maxWidth: '1000px', 
        margin: '40px auto',
        maxHeight: '90vh',
        overflowY: 'auto'
    }}>
      <div className="slide-header" style={{background: '#dff0d8', color: '#3c763d', borderBottom: '1px solid #d6e9c6'}}>
        <span>Drill Information</span>
      </div>
      <div className="slide-content" style={{padding: '20px', flexDirection: 'column', display: 'flex'}}>
        <div style={{display: 'flex', marginBottom: '15px', alignItems: 'center', width: '100%'}}>
            <strong style={{width: '120px'}}>Duration</strong>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span style={{color: '#666'}}>📊</span>
                <span>3 - 5 minutes (based on progress)</span>
            </div>
        </div>
        <div style={{display: 'flex', marginBottom: '15px', alignItems: 'center', width: '100%'}}>
            <strong style={{width: '120px'}}>Accuracy Goal</strong>
            <select 
                style={{padding: '5px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer'}}
                value={paragraphDrillAccuracyGoal}
                onChange={(e) => setParagraphDrillAccuracyGoal(Number(e.target.value))}
            >
                <option value={98}>98% Advanced</option>
                <option value={94}>94% Intermediate</option>
                <option value={90}>90% Easy</option>
            </select>
        </div>
        <div style={{display: 'flex', marginBottom: '20px', width: '100%'}}>
            <strong style={{width: '120px'}}>Objective</strong>
            <p style={{margin: 0, flex: 1, color: '#333'}}>
                Reinforcement practice to further develop smooth and accurate keystrokes and even rhythm in paragraph format.
            </p>
        </div>
        
        <div style={{display: 'flex', flexDirection: 'row', gap: '20px', width: '100%', justifyContent: 'center'}}>
            <button 
                style={{
                    padding: '10px 0',
                    borderRadius: '8px',
                    border: `1px solid ${courseColor}`,
                    background: 'white',
                    color: courseColor,
                    fontSize: '1rem',
                    fontWeight: '400',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    width: '200px',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                }}
                onClick={() => changeView('lesson_detail')}
            >
                <span style={{textDecoration: 'underline'}}>C</span>ancel
            </button>
            <button 
                style={{
                    background: courseColor, 
                    border: 'none', 
                    color: 'white', 
                    padding: '10px 0', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '200px',
                    fontSize: '1rem',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onClick={() => {
                    setParagraphDrillStartTime(Date.now());
                    setParagraphDrillEndTime(null);
                    setParagraphDrillState('practice');
                    setParagraphDrillHasStarted(false);
                    setParagraphDrillTimeLeft(300);
                    setParagraphDrillTimeUsed(0);
                    setParagraphDrillLastActivity(Date.now());
                    setParagraphDrillHistory({ correct: 0, errors: 0, total: 0 });
                    setParagraphDrillInput('');
                    setParagraphDrillCurrentPatternIndex(0);
                    setParagraphDrillCompletedRows([]);
                    setParagraphDrillRowInputs({});
                    setParagraphDrillCompletedWords([]);
                    setParagraphDrillCurrentWordInput('');
                    setParagraphDrillKeyStats({});
                }}
            >
                <span style={{fontSize: '0.8rem'}}>▶</span> Begin drill (Space)
            </button>
        </div>
      </div>
    </div>
  );

  // Render Paragraph Drill Practice
  const renderParagraphDrillPractice = () => {
    const currentPattern = paragraphDrillPatterns[paragraphDrillCurrentPatternIndex];
    if (!currentPattern) return <div className="practice-card">Loading drill...</div>;

    // Calculate Active Key (Target Char) based on word index
    const targetWords = currentPattern.split(' ');
    const currentWordIndex = paragraphDrillCompletedWords.length;
    let targetChar = null;
    
    if (currentWordIndex < targetWords.length) {
        const targetWord = targetWords[currentWordIndex];
        // Are we typing the word or the space after it?
        if (paragraphDrillCurrentWordInput.length < targetWord.length) {
             targetChar = targetWord[paragraphDrillCurrentWordInput.length];
        } else {
             // Word finished (length-wise), target is Space (or Enter if last word)
             if (currentWordIndex === targetWords.length - 1) {
                 targetChar = '\n';
             } else {
                 targetChar = ' ';
             }
        }
    }

    const activeKey = targetChar === ' ' ? 'Space' : (targetChar === '\n' ? 'Enter' : (targetChar ? targetChar.toUpperCase() : null));
    
    const keyData = activeKey ? practiceKeys.find(k => k.key.toUpperCase() === (activeKey === 'Space' ? 'SPACE' : (activeKey === 'Enter' ? 'ENTER' : activeKey))) : null;
    const fingerPos = keyData ? { ...keyData.dotPos, color: keyData.color } : null;

    const minutes = Math.floor(paragraphDrillTimeLeft / 60);
    const seconds = paragraphDrillTimeLeft % 60;
    const timeString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    // Sliding window: always show current + next 2 lines
    const slideRows = [
        paragraphDrillCurrentPatternIndex, 
        paragraphDrillCurrentPatternIndex + 1, 
        paragraphDrillCurrentPatternIndex + 2
    ];

    return (
      <div className="practice-card" style={{
          width: '100%',
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          height: '85vh', // Fixed height for single viewport
          maxHeight: '700px',
          background: '#f0f7ff',
          border: '1px solid #cce0ff',
          overflow: 'hidden',
          position: 'relative'
      }}>
          <div style={{flex: 1, padding: '15px 25px', display: 'flex', flexDirection: 'column'}}>
              <div style={{color: '#a5c48c', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '400'}}>
                  <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: '1.5px solid #a5c48c',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                  }}>
                      <div style={{width: '0', height: '0', borderTop: '3px solid transparent', borderBottom: '3px solid transparent', borderLeft: '5px solid #a5c48c', marginLeft: '2px'}}></div>
                  </div>
                  Type the rows and press ↵ at the end of each row
              </div>

              {/* Target Text Area (3 Lines - Sliding Window) */}
              <div className="drill-patterns-area" style={{
                  marginBottom: '10px',
                  padding: '15px 20px',
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: '8px',
                  border: '1px solid rgba(26, 115, 232, 0.1)',
                  flexShrink: 0,
                  minHeight: '120px', // Ensure space for 3 lines
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
              }}>
                  <div style={{marginBottom: '0'}}>
                      {slideRows.map((idx, i) => {
                          if (idx >= paragraphDrillPatterns.length) return null;
                          const isCurrent = idx === paragraphDrillCurrentPatternIndex;
                          return (
                              <div key={idx} style={{
                                  opacity: isCurrent ? 1 : 0.5,
                                  transform: isCurrent ? 'scale(1.02)' : 'scale(1)',
                                  transformOrigin: 'left center',
                                  transition: 'all 0.3s ease',
                                  marginBottom: '8px'
                              }}>
                                  {renderParagraphBlocks(
                                      paragraphDrillPatterns[idx], 
                                      isCurrent ? paragraphDrillInput : '', 
                                      isCurrent, 
                                      isCurrent ? paragraphDrillShowErrorX : false, 
                                      false, // Never show as completed in the sliding view as it disappears
                                      '1.4rem' 
                                  )}
                              </div>
                          );
                      })}
                  </div>
              </div>

              {/* User Typing Area (Current Line Only) */}
              <div style={{
                  fontSize: '1.4rem', 
                  fontFamily: '"Georgia", serif', 
                  textAlign: 'left',
                  padding: '15px 20px',
                  color: '#333',
                  background: 'white',
                  borderRadius: '4px',
                  border: `1px solid ${lightCourseColor}`,
                  width: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '60px',
                  marginBottom: '10px',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
              }}>
                  {(() => {
                      const rowIdx = paragraphDrillCurrentPatternIndex;
                      if (rowIdx >= paragraphDrillPatterns.length) return null;
                      
                      const currentRowPattern = paragraphDrillPatterns[rowIdx];
                      const currentRowTargets = currentRowPattern.split(' ');

                      return (
                          <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', width: '100%'}}>
                              {/* Render Completed Words for Current Row */}
                              {paragraphDrillCompletedWords.map((word, idx) => {
                                  const target = currentRowTargets[idx] ? currentRowTargets[idx].replace('\n', '') : '';
                                  const isCorrect = word === target;
                                  
                                  return (
                                      <span key={idx} style={{
                                          marginRight: '0.5ch',
                                          color: isCorrect ? '#333' : '#d93025',
                                          textDecoration: isCorrect ? 'none' : 'underline'
                                      }}>
                                          {word}
                                      </span>
                                  );
                              })}
                              
                              {/* Render Current Word Input */}
                              {(() => {
                                  let isWordError = false;
                                  if (currentWordIndex < currentRowTargets.length) {
                                      const targetWord = currentRowTargets[currentWordIndex].replace('\n', '');
                                      if (!targetWord.startsWith(paragraphDrillCurrentWordInput)) {
                                          isWordError = true;
                                      }
                                  }

                                  return (
                                      <span style={{
                                          borderBottom: `2px solid ${isWordError ? '#d93025' : '#1a73e8'}`,
                                          color: isWordError ? '#d93025' : '#333',
                                          textDecoration: isWordError ? 'underline' : 'none', 
                                          display: 'inline-flex',
                                          alignItems: 'center'
                                      }}>
                                          {paragraphDrillCurrentWordInput.split('').map((char, cIdx) => (
                                              <span key={cIdx}>{char}</span>
                                          ))}
                                          {/* Cursor */}
                                          <span style={{
                                              borderLeft: `2px solid ${courseColor}`,
                                              marginLeft: '0px',
                                              height: '1.4rem',
                                              animation: 'blink 1s step-end infinite'
                                          }}></span>
                                      </span>
                                  );
                              })()}
                          </div>
                      );
                  })()}
              </div>

              {/* Keyboard - Compact */}
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: 'auto', transform: 'scale(0.9)', transformOrigin: 'bottom center'}}>
                  {renderKeyboard(activeKey ? [activeKey] : null, paragraphDrillShowErrorX ? paragraphDrillErrorKey : null)}
              </div>
              
              {/* Removed large X popup as requested */}
          </div>

          {/* Sidebar */}
          <div style={{width: '220px', background: sidebarBg, borderLeft: '1px solid #cce0ff', padding: '15px', display: 'flex', flexDirection: 'column', position: 'relative'}}>
              {/* Sidebar Content same as before... */}
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: courseColor, fontWeight: 'bold', marginBottom: '15px', marginTop: '5px'}}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end', width: '20px'}}>
                      <div style={{width: '5px', height: '12px', background: '#f28b82', border: '1px solid #d93025'}}></div>
                      <div style={{width: '5px', height: '16px', background: lightCourseColor, border: `1px solid ${courseColor}`}}></div>
                      <div style={{width: '5px', height: '8px', background: '#81c995', border: '1px solid #188038'}}></div>
                  </div>
                  <span style={{fontSize: '1rem'}}>Your Progress</span>
              </div>
              
              <div style={{
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  gap: '3px', 
                  marginBottom: '15px', 
                  maxHeight: '120px', 
                  background: 'rgba(255,255,255,0.8)', 
                  padding: '10px 8px', 
                  borderRadius: '4px',
                  border: '1px solid #cce0ff'
              }}>
                  {Array.from({length: 20}).map((_, i) => {
                      const totalTime = 300;
                      const timePercent = Math.max(0, Math.min(1, (totalTime - paragraphDrillTimeLeft) / totalTime));
                      const filledCount = Math.floor(timePercent * 20);
                      
                      const isCompleted = i < filledCount;
                      const isCurrent = i === filledCount;
                      const baseHeight = 15 + (i * 4); 
                      return (
                          <div key={i} style={{
                              flex: 1, 
                              height: `${baseHeight}%`, 
                              background: isCompleted ? '#8dbd5b' : (isCurrent ? '#fff9c4' : '#f5f5dc'), 
                              border: '1px solid #333',
                              boxShadow: isCurrent ? '0 0 5px rgba(26, 115, 232, 0.5)' : 'none',
                              transition: 'all 0.3s ease'
                          }}></div>
                      );
                  })}
              </div>

              <div style={{marginBottom: '15px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px'}}>
                      <div style={{fontSize: '0.8rem', color: '#666', fontWeight: 'bold'}}>Time</div>
                      {Date.now() - paragraphDrillLastActivity >= 2000 && (
                          <div style={{fontSize: '0.8rem', color: '#1a73e8', cursor: 'pointer', textDecoration: 'underline'}}>Pause</div>
                      )}
                  </div>
                  <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#333', marginTop: '0'}}>
                      {timeString}
                  </div>
              </div>

              <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <button 
                      style={{
                          background: 'white',
                          border: '1px solid #1a73e8',
                          padding: '10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          color: '#1a73e8',
                          fontWeight: 'normal',
                          width: '100%'
                      }}
                      onClick={() => changeView('lesson_detail')}
                  >
                      Cancel
                  </button>
                  <button 
                      style={{
                          background: '#1a73e8', 
                          color: 'white', 
                          border: 'none', 
                          padding: '10px', 
                          borderRadius: '4px', 
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          width: '100%'
                      }}
                      onClick={() => {
                          setParagraphDrillEndTime(Date.now());
                          setParagraphDrillState('results');
                      }}
                  >
                      Next
                  </button>
              </div>
          </div>
      </div>
    );
  };

  // Render Paragraph Drill Results
  const renderParagraphDrillResults = () => {
    // Metrics Calculation - Standard WPM Rules
    const durationSec = Math.max(1, paragraphDrillTimeUsed);
    const timeInMinutes = durationSec / 60;
    
    const grossSpeed = Math.round((paragraphDrillHistory.total / 5) / timeInMinutes);
    const netSpeed = Math.round((paragraphDrillHistory.correct / 5) / timeInMinutes);
    const accuracy = paragraphDrillHistory.total > 0 ? Math.round((paragraphDrillHistory.correct / paragraphDrillHistory.total) * 100) : 0;

    return (
      <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '20px auto', padding: '0'}}>
          <div className="slide-header" style={{background: courseColor, color: 'white', padding: '15px 20px'}}>
              <h2 style={{margin: 0, fontSize: '1.2rem'}}>Paragraph Drill Results</h2>
          </div>
          <div style={{padding: '30px'}}>
              <div style={{marginBottom: '20px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: accuracy >= paragraphDrillAccuracyGoal ? '#3c763d' : '#8a6d3b'}}>
                      <span style={{fontSize: '1.2rem'}}>{accuracy >= paragraphDrillAccuracyGoal ? '☑' : '⚠'}</span>
                      <strong style={{fontSize: '1rem'}}>{accuracy >= paragraphDrillAccuracyGoal ? 'Exercise Completed' : 'Exercise Finished'}</strong>
                  </div>
                  <p style={{marginBottom: '10px', fontSize: '0.9rem', color: '#666'}}>
                      {accuracy >= paragraphDrillAccuracyGoal 
                          ? "Good job! You reached the accuracy goal and your typing speed was good. Keep up the good work!"
                          : `You didn't quite reach the accuracy goal of ${paragraphDrillAccuracyGoal}%. Focus on accuracy and try again to improve your results.`
                      }
                  </p>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px'}}>
                  <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eee'}}>
                      <h3 style={{marginTop: 0, color: courseColor, fontSize: '1rem', borderBottom: `2px solid ${courseColor}`, paddingBottom: '10px'}}>Performance</h3>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                              <span style={{color: '#666', fontWeight: '500'}}>Net Speed:</span>
                              <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#333'}}>{netSpeed} WPM</span>
                          </div>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                              <span style={{color: '#666', fontWeight: '500'}}>Accuracy:</span>
                              <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: accuracy >= paragraphDrillAccuracyGoal ? '#2e7d32' : '#c62828'}}>{accuracy}%</span>
                          </div>
                      </div>
                  </div>

                  <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eee'}}>
                      <h3 style={{marginTop: 0, color: courseColor, fontSize: '1rem', borderBottom: `2px solid ${courseColor}`, paddingBottom: '10px'}}>Session Details</h3>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between'}}>
                              <span style={{color: '#666'}}>Gross Speed:</span>
                              <span style={{fontWeight: 'bold'}}>{grossSpeed} WPM</span>
                          </div>
                          <div style={{display: 'flex', justifyContent: 'space-between'}}>
                              <span style={{color: '#666'}}>Time Used:</span>
                              <span style={{fontWeight: 'bold'}}>{formatTime(durationSec)}</span>
                          </div>
                          <div style={{display: 'flex', justifyContent: 'space-between'}}>
                              <span style={{color: '#666'}}>Total Errors:</span>
                              <span style={{fontWeight: 'bold', color: '#c62828'}}>{paragraphDrillHistory.errors}</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div style={{marginBottom: '30px'}}>
                  {renderDifficultKeysGraph(paragraphDrillKeyStats)}
              </div>

              <div style={{display: 'flex', flexDirection: 'row', gap: '20px', justifyContent: 'center', width: '100%'}}>
                  <button 
                      style={{
                          padding: '10px 0',
                          fontSize: '1rem',
                          background: 'white',
                          color: courseColor,
                          border: `1px solid ${courseColor}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '400',
                          width: '200px',
                          textAlign: 'center',
                          boxSizing: 'border-box',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}
                      onClick={() => changeView('lesson_detail')}
                  >
                      <span style={{textDecoration: 'underline'}}>C</span>ancel
                  </button>
                  <button 
                      className="continue-btn"
                      style={{
                          padding: '10px 0',
                          fontSize: '1rem',
                          background: courseColor,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          width: '200px',
                          textAlign: 'center',
                          boxSizing: 'border-box',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onClick={() => changeView('lesson_detail')}
                  >
                      Continue
                  </button>
              </div>
          </div>
      </div>
    );
  };

  // Render Drill Practice
  const renderDrillPractice = () => {
      const currentPattern = drillPatterns[drillCurrentPatternIndex];
      if (!currentPattern) return <div className="practice-card">Loading drill...</div>;

      const pageIndex = Math.floor(drillCurrentPatternIndex / 2);
      const row1Idx = pageIndex * 2;
      const row2Idx = pageIndex * 2 + 1;
      
      const pattern1 = drillPatterns[row1Idx];
      const pattern2 = row2Idx < drillPatterns.length ? drillPatterns[row2Idx] : null;

      const targetChar = drillInput.length < currentPattern.length ? currentPattern[drillInput.length] : null;
      const activeKey = targetChar === ' ' ? 'Space' : (targetChar ? targetChar.toUpperCase() : null);
      
      // Find finger to highlight
      const keyData = activeKey ? practiceKeys.find(k => k.key.toUpperCase() === (activeKey === 'Space' ? 'SPACE' : activeKey)) : null;
      const fingerPos = keyData ? keyData.dotPos : null;

      // Calculate display time
      const minutes = Math.floor(drillTimeLeft / 60);
      const seconds = drillTimeLeft % 60;
      const timeString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      return (
      <div className="practice-card" style={{
            width: '100%',
            maxWidth: '1200px', 
            margin: '10px auto', 
            display: 'flex', 
            maxHeight: '95vh', 
            height: '650px', 
            background: '#f0f7ff',
            border: '1px solid #cce0ff',
            overflow: 'hidden'
        }}>
            {/* Main Content Area */}
            <div style={{flex: 1, padding: '25px', display: 'flex', flexDirection: 'column'}}>
                <div style={{marginBottom: '10px'}}>
                    <div style={{color: '#7aa93c', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem'}}>
                        <div style={{width: '18px', height: '18px', borderRadius: '50%', border: '1px solid #7aa93c', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.65rem'}}>▶</div>
                        Type the key sequences, follow the highlighted key
                    </div>
                    
                    {/* Two Rows of Blocks - Page-based */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        {pattern1 && (
                            renderKeyBlocks(
                                pattern1, 
                                drillCurrentPatternIndex === row1Idx ? drillInput : (drillCurrentPatternIndex > row1Idx ? pattern1 : ''), 
                                drillCurrentPatternIndex === row1Idx, 
                                drillCurrentPatternIndex === row1Idx ? drillShowErrorX : false, 
                                drillCurrentPatternIndex > row1Idx
                            )
                        )}
                        {pattern2 && (
                            renderKeyBlocks(
                                pattern2, 
                                drillCurrentPatternIndex === row2Idx ? drillInput : (drillCurrentPatternIndex > row2Idx ? pattern2 : ''), 
                                drillCurrentPatternIndex === row2Idx, 
                                drillCurrentPatternIndex === row2Idx ? drillShowErrorX : false, 
                                drillCurrentPatternIndex > row2Idx
                            )
                        )}
                    </div>

                    <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0', marginTop: '60px'}}>
                        {renderKeyboard([activeKey], drillErrorKey)}
                    </div>
                </div>
            </div>
            
            {/* Sidebar */}
            <div style={{width: '240px', background: '#e6f2ff', borderLeft: '1px solid #cce0ff', padding: '15px', display: 'flex', flexDirection: 'column'}}>
                <div style={{marginTop: '10px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#1a73e8'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '2px', width: '12px'}}>
                            <div style={{height: '4px', width: '4px', background: '#d9534f'}}></div>
                            <div style={{height: '8px', width: '4px', background: '#1a73e8'}}></div>
                            <div style={{height: '4px', width: '4px', background: '#5cb85c'}}></div>
                        </div>
                        <strong style={{fontSize: '0.9rem', color: '#444'}}>Your Progress</strong>
                    </div>
                    
                    {/* Bar Chart from Image */}
                    <div style={{height: '100px', display: 'flex', alignItems: 'flex-end', gap: '3px', padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '4px', border: '1px solid #cce0ff'}}>
                        {Array.from({length: 20}).map((_, i) => {
                            const totalTime = 300;
                            const timePercent = Math.max(0, Math.min(1, (totalTime - drillTimeLeft) / totalTime));
                            const filledCount = Math.floor(timePercent * 20);
                            
                            const isCompleted = i < filledCount;
                            const isCurrent = i === filledCount;
                            const baseHeight = 15 + (i * 4); // Linear increase for single graph effect
                            return (
                                <div key={i} style={{
                                    flex: 1, 
                                    background: isCompleted ? '#8dbd5b' : (isCurrent ? '#fff9c4' : '#f9f9e0'), 
                                    border: '1px solid #333', 
                                    height: `${baseHeight}%`,
                                    boxShadow: isCurrent ? '0 0 5px rgba(26, 115, 232, 0.5)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}></div>
                            );
                        })}
                    </div>
                </div>
                
                <div style={{marginTop: '30px', borderTop: '1px solid #cce0ff', paddingTop: '15px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px'}}>
                        <div style={{fontSize: '0.9rem', color: '#666'}}>Time</div>
                        {Date.now() - drillLastActivity >= 2000 && (
                            <div style={{fontSize: '0.85rem', color: '#1a73e8', cursor: 'pointer', textDecoration: 'underline'}}>Pause</div>
                        )}
                    </div>
                    <div style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#333'}}>{timeString}</div>
                </div>

                <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <button 
                        style={{
                            background: 'white',
                            border: '1px solid #1a73e8',
                            padding: '12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            color: '#1a73e8',
                            fontWeight: 'normal',
                            width: '100%'
                        }}
                        onClick={() => changeView('lesson_detail')}
                    >
                        Cancel
                    </button>
                    <button 
                        style={{
                            background: '#1a73e8', 
                            color: 'white', 
                            border: 'none', 
                            padding: '12px', 
                            borderRadius: '4px', 
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            width: '100%'
                        }}
                        onClick={() => {
                             setDrillEndTime(Date.now());
                             setDrillTimeLeft(0);
                             setDrillState('results');
                        }}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
      );
  };

  // Render Review Difficult Keys (Layout like the 3rd image)
  const renderReviewDifficult = () => {
    if (!reviewPatterns || reviewPatterns.length === 0) {
        return (
            <div className="practice-card" style={{width: '100%', maxWidth: '1000px', margin: '40px auto', textAlign: 'center', padding: '50px'}}>
                <h2>No difficult keys to review!</h2>
                <button className="btn-next" onClick={() => changeView('lesson_detail')}>Back to Lessons</button>
            </div>
        );
    }

    const currentPattern = reviewPatterns[reviewPatternIndex];
    const targetChar = reviewInput.length < currentPattern.length ? currentPattern[reviewInput.length] : null;
    
    const pageIndex = Math.floor(reviewPatternIndex / 2);
    const row1Idx = pageIndex * 2;
    const row2Idx = pageIndex * 2 + 1;
    
    const pattern1 = reviewPatterns[row1Idx];
    const pattern2 = row2Idx < reviewPatterns.length ? reviewPatterns[row2Idx] : null;
    
    // Determine which key is active for keyboard highlighting
    const activeKey = targetChar === ' ' ? 'Space' : (targetChar ? targetChar.toUpperCase() : null);
    
    // Find finger to highlight
    const keyData = activeKey ? practiceKeys.find(k => k.key.toUpperCase() === (activeKey === 'Space' ? 'SPACE' : activeKey)) : null;
    const fingerPos = keyData ? keyData.dotPos : null;

    return (
      <div className="practice-card" style={{
          width: '100%',
          maxWidth: '1200px', 
          margin: '5px auto', 
          display: 'flex', 
          maxHeight: '98vh',
          height: '580px', 
          padding: 0, 
          background: '#f0f7ff',
          overflow: 'hidden',
          border: '1px solid #cce0ff'
      }}>
          {/* Main Practice Area */}
          <div style={{flex: 1, padding: '20px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden'}}>
              {/* Exercise Blocks */}
              <div style={{
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px', 
                  width: '100%', 
                  marginBottom: '15px',
                  padding: '10px 15px',
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: '10px',
                  boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)'
              }}>
                  {pattern1 && (
                      <div className={row1Idx === reviewPatternIndex ? 'review-active-row' : ''}>
                          {renderKeyBlocks(
                              pattern1, 
                              row1Idx === reviewPatternIndex ? reviewInput : (reviewPatternIndex > row1Idx ? pattern1 : ''), 
                              row1Idx === reviewPatternIndex, 
                              row1Idx === reviewPatternIndex ? reviewShowError : false, 
                              reviewPatternIndex > row1Idx
                          )}
                      </div>
                  )}
                  {pattern2 && (
                      <div className={row2Idx === reviewPatternIndex ? 'review-active-row' : ''}>
                          {renderKeyBlocks(
                              pattern2, 
                              row2Idx === reviewPatternIndex ? reviewInput : (reviewPatternIndex > row2Idx ? pattern2 : ''), 
                              row2Idx === reviewPatternIndex, 
                              row2Idx === reviewPatternIndex ? reviewShowError : false, 
                              reviewPatternIndex > row2Idx
                          )}
                      </div>
                  )}
              </div>

              {/* Keyboard Visualization */}
              <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0', marginTop: '60px', opacity: reviewProgress === 100 ? 0.3 : 1}}>
                      {renderKeyboard(activeKey ? [activeKey] : [])}
                  </div>

              {/* Success Message when 100% */}
              {reviewProgress === 100 && (
                  <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      padding: '30px',
                      borderRadius: '10px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                      textAlign: 'center',
                      zIndex: 100,
                      border: '2px solid #5cb85c'
                  }}>
                      <div style={{fontSize: '3rem', color: '#5cb85c', marginBottom: '10px'}}>✓</div>
                      <h2 style={{margin: '0 0 15px 0', color: '#333'}}>Review Completed!</h2>
                      <p style={{margin: '0 0 20px 0', color: '#666'}}>You've practiced your difficult keys.</p>
                      <button 
                          className="btn-next" 
                          onClick={() => changeView('lesson_detail')}
                          style={{padding: '10px 30px'}}
                      >
                          Finish
                      </button>
                  </div>
              )}
          </div>

          {/* Right Sidebar */}
          <div style={{
              width: '200px', 
              background: '#e6f2ff', 
              borderLeft: '1px solid #cce0ff', 
              padding: '15px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
          }}>
              <button 
                  style={{alignSelf: 'flex-end', background: 'none', border: 'none', fontSize: '1.5rem', color: '#337ab7', cursor: 'pointer'}}
                  onClick={() => changeView('lesson_detail')}
              >
                  ×
              </button>
              
              <div style={{textAlign: 'left', width: '100%', marginTop: '20px'}}>
                  <h3 style={{margin: 0, color: '#333', fontSize: '1.1rem'}}>Completed</h3>
                  <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#333'}}>{reviewProgress} %</div>
              </div>

              {reviewEndTime && (
                <div style={{textAlign: 'left', width: '100%', marginTop: '15px'}}>
                    <h3 style={{margin: 0, color: '#333', fontSize: '1.1rem'}}>Time Used</h3>
                    <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#3c763d'}}>
                        {Math.floor((reviewEndTime - reviewStartTime) / 1000)} sec
                    </div>
                </div>
              )}

              <div style={{marginTop: 'auto', width: '100%'}}>
                  <button 
                      style={{
                          width: '100%', 
                          padding: '10px', 
                          background: 'white', 
                          color: '#1a73e8', 
                          border: '1px solid #1a73e8', 
                          borderRadius: '4px', 
                          fontWeight: 'bold', 
                          cursor: 'pointer'
                      }}
                      onClick={() => changeView('lesson_detail')}
                  >
                      Cancel
                  </button>
              </div>
          </div>
      </div>
    );
  };

  // Render Drill Results
  const renderDrillResults = () => {
      // Metrics Calculation - Standard WPM Rules
      const durationSec = Math.max(1, drillTimeUsed);
      const timeInMinutes = durationSec / 60;
      
      const grossSpeed = Math.round((drillHistory.total / 5) / timeInMinutes);
      const netSpeed = Math.round((drillHistory.correct / 5) / timeInMinutes);
      const accuracy = drillHistory.total > 0 ? Math.round((drillHistory.correct / drillHistory.total) * 100) : 0;

      return (
        <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '20px auto', padding: '0'}}>
            <div className="slide-header" style={{background: courseColor, color: 'white', padding: '15px 20px'}}>
                <h2 style={{margin: 0, fontSize: '1.2rem'}}>Exercise Results</h2>
            </div>
            <div style={{padding: '30px'}}>
                <div style={{marginBottom: '20px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', color: accuracy >= drillAccuracyGoal ? '#3c763d' : '#8a6d3b'}}>
                        <span style={{fontSize: '1.2rem'}}>{accuracy >= drillAccuracyGoal ? '☑' : '⚠'}</span>
                        <strong style={{fontSize: '1rem'}}>{accuracy >= drillAccuracyGoal ? 'Exercise Completed' : 'Exercise Finished'}</strong>
                    </div>
                    <p style={{marginBottom: '10px', fontSize: '0.9rem', color: '#666'}}>
                        {accuracy >= drillAccuracyGoal 
                            ? "Good job! You reached the accuracy goal and your typing speed was good. Keep up the good work!"
                            : `You didn't quite reach the accuracy goal of ${drillAccuracyGoal}%. Focus on accuracy and try again to improve your results.`
                        }
                    </p>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px'}}>
                    <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eee'}}>
                        <h3 style={{marginTop: 0, color: courseColor, fontSize: '1rem', borderBottom: `2px solid ${courseColor}`, paddingBottom: '10px'}}>Performance</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <span style={{color: '#666', fontWeight: '500'}}>Net Speed:</span>
                                <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#333'}}>{netSpeed} WPM</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <span style={{color: '#666', fontWeight: '500'}}>Accuracy:</span>
                                <span style={{fontSize: '1.5rem', fontWeight: 'bold', color: accuracy >= drillAccuracyGoal ? '#2e7d32' : '#c62828'}}>{accuracy}%</span>
                            </div>
                        </div>
                    </div>

                    <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eee'}}>
                        <h3 style={{marginTop: 0, color: courseColor, fontSize: '1rem', borderBottom: `2px solid ${courseColor}`, paddingBottom: '10px'}}>Session Details</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span style={{color: '#666'}}>Gross Speed:</span>
                                <span style={{fontWeight: 'bold'}}>{grossSpeed} WPM</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span style={{color: '#666'}}>Time Used:</span>
                                <span style={{fontWeight: 'bold'}}>{formatTime(durationSec)}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span style={{color: '#666'}}>Total Errors:</span>
                                <span style={{fontWeight: 'bold', color: '#c62828'}}>{drillHistory.errors}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style={{marginBottom: '30px'}}>
                    {renderDifficultKeysGraph(drillKeyStats)}
                </div>

                <div style={{display: 'flex', flexDirection: 'row', gap: '20px', justifyContent: 'center', width: '100%'}}>
                    <button 
                        style={{
                            padding: '12px 40px', 
                            fontSize: '1rem',
                            background: 'white',
                            color: courseColor,
                            border: `1px solid ${courseColor}`,
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '200px'
                        }} 
                        onClick={() => changeView('lesson_detail')}
                    >
                        Cancel
                    </button>
                    <button 
                        className="continue-btn"
                        style={{
                            padding: '12px 40px',
                            fontSize: '1rem',
                            background: courseColor,
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            width: '200px'
                        }}
                        onClick={() => changeView('lesson_detail')}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
      );
  };


    const renderResultCard = () => {
    return (
      <div style={{
          background: '#e0e4e8', 
          border: '1px solid #ccc', 
          borderRadius: '4px', 
          padding: '10px', 
          width: '100%', 
          maxWidth: '500px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '0.9rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
          <div style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
              <div style={{flex: 1}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                      <span style={{fontWeight: 'bold'}}>Time Used</span>
                      <span>1:39 min.</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                      <span style={{fontWeight: 'bold'}}>Gross Speed</span>
                      <span>27 wpm</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                      <span style={{fontWeight: 'bold'}}>Accuracy</span>
                      <span>81%</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                      <span style={{fontWeight: 'bold'}}>Net Speed</span>
                      <span>22 wpm</span>
                  </div>
              </div>
              <div style={{flex: 0.8, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                   <div style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem'}}>
                       <span style={{color: '#d9534f', fontWeight: 'bold'}}>!</span> Interrupted
                   </div>
                   <div style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem'}}>
                       <span style={{color: '#5cb85c', fontWeight: 'bold'}}>✓</span> Great
                   </div>
                   <div style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem'}}>
                       <span style={{color: '#f0ad4e', fontWeight: 'bold'}}>!</span> Goal 94%
                   </div>
              </div>
          </div>
          
          <div style={{borderTop: '1px solid #ccc', paddingTop: '10px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                  <span style={{fontWeight: 'bold'}}>Difficult Keys in this Exercise</span>
                  <span style={{color: '#0056b3', cursor: 'pointer', textDecoration: 'underline'}}>Review</span>
              </div>
              
              <div style={{position: 'relative', marginTop: '10px'}}>
                  {/* Y-Axis Labels (Right Side Overlay) */}
                  <div style={{position: 'absolute', right: '5px', top: '0', bottom: '0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.7rem', color: '#4a7e4a', fontWeight: 'bold', height: '100px', pointerEvents: 'none', zIndex: 5}}>
                      <span style={{marginTop: '-2px'}}>Problematic</span>
                      <span>Difficult</span>
                      <span style={{marginBottom: '5px'}}>OK</span>
                  </div>

                  {/* Graph Area */}
                  <div style={{
                      background: '#e0e0e0', 
                      height: '100px', 
                      position: 'relative', 
                      border: '1px solid #999',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '0 80px 0 10px', 
                      gap: '8px'
                  }}>
                      {/* Grid Lines */}
                      <div style={{position: 'absolute', top: '33%', left: 0, right: 0, borderTop: '1px solid #999'}}></div>
                      <div style={{position: 'absolute', top: '66%', left: 0, right: 0, borderTop: '1px solid #999'}}></div>

                      {/* Bars */}
                      {['i', 'l', 'a', 'k', 'u', 'r', 'd', 's', 'e'].map((key, idx) => {
                          const heights = [95, 85, 80, 70, 55, 45, 40, 30, 25]; 
                          return (
                              <div key={idx} style={{flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
                                  <div style={{
                                      width: '50%', 
                                      height: `${heights[idx]}%`, 
                                      background: idx < 2 ? '#e0a800' : '#7d92c7', 
                                      border: '1px solid #555',
                                      borderBottom: 'none'
                                  }}></div>
                              </div>
                          )
                      })}
                  </div>
                  
                  {/* X-Axis Labels */}
                  <div style={{
                      display: 'flex', 
                      padding: '0 80px 0 10px', 
                      gap: '8px',
                      marginTop: '2px'
                  }}>
                       {['i', 'l', 'a', 'k', 'u', 'r', 'd', 's', 'e'].map((key, idx) => (
                           <div key={idx} style={{flex: 1, textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: '#333'}}>{key}</div>
                       ))}
                  </div>
              </div>
          </div>
      </div>
    );
  };

  // Result Slide 1
  const renderResultsSlide1 = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '0 auto'}}>
      <div className="slide-header">
        <span>Typing results</span>
        <button className="close-btn" onClick={() => changeView('lesson_detail')}>×</button>
      </div>
      <div className="slide-content" style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', paddingTop: '20px', overflowY: 'auto', flex: 1}}>
        <div className="slide-text" style={{width: '100%', padding: '0 20px'}}>
          <p style={{marginBottom: '15px', marginTop: 0}}>
            The Tutor automatically calculates and stores your typing results. For each exercise, you will get the following scores of your typing skills:
          </p>
          <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '20px'}}>
             <li>Gross typing speed</li>
             <li>Accuracy percentage</li>
             <li>Net typing speed</li>
             <li>Difficult keys graph</li>
          </ul>
          <p>
            We will briefly explain these on the following screens.
          </p>
        </div>
        <div className="slide-image" style={{width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
           {renderResultCard()}
        </div>
      </div>
      <div className="slide-footer">
        <button className="btn-cancel" onClick={() => changeView('lesson_detail')}>Cancel</button>
        <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>1 of 5</span>
        <button className="btn-next" onClick={() => setView('results_2')}>Next</button>
      </div>
    </div>
  );

  // Result Slide 2
  const renderResultsSlide2 = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '0 auto'}}>
      <div className="slide-header">
        <span>Typing speed</span>
        <button className="close-btn" onClick={() => changeView('lesson_detail')}>×</button>
      </div>
      <div className="slide-content" style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', paddingTop: '20px', overflowY: 'auto', flex: 1}}>
        <div className="slide-text" style={{width: '100%', padding: '0 20px'}}>
          <p style={{marginBottom: '15px', marginTop: 0}}>
            Typing speed is usually measured in Words per Minute, WPM.
          </p>
          <p style={{marginBottom: '15px'}}>
            Words per Minute is calculated using Standard Word Length where five keystrokes, including spaces and punctuation, make one word.
          </p>
          <p style={{marginBottom: '15px'}}>
            For example, the three word sentence "She likes elephants!" counts as four standard words as it takes 20 keystrokes to type.
          </p>
          <p style={{marginBottom: '15px'}}>
            The five keystroke standard word is used in all typing tutors and typing tests to give comparable results.
          </p>
          <p>
            Typing speed can also be measured in Keystrokes per Minute, KPM (Characters per Minute, CPM). Data entry speed is measured in Keystrokes per Hour, KPH.
          </p>
        </div>
        <div className="slide-image" style={{width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
           {renderResultCard()}
        </div>
      </div>
      <div className="slide-footer">
        <button className="btn-cancel" onClick={() => changeView('lesson_detail')}>Cancel</button>
        <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>2 of 5</span>
        <button className="btn-next" onClick={() => setView('results_3')}>Next</button>
      </div>
    </div>
  );

  // Result Slide 3
  const renderResultsSlide3 = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '0 auto'}}>
      <div className="slide-header">
        <span>Gross and net speed</span>
        <button className="close-btn" onClick={() => changeView('lesson_detail')}>×</button>
      </div>
      <div className="slide-content" style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', paddingTop: '20px', overflowY: 'auto', flex: 1}}>
        <div className="slide-text" style={{width: '100%', padding: '0 20px'}}>
          <p style={{marginBottom: '15px', marginTop: 0}}>
            Gross speed is the number of keys typed converted into Words per Minute. It is a simple score showing how fast you were typing the keys. This is how fast you would type if you didn't make any mistakes.
          </p>
          <p style={{marginBottom: '15px'}}>
            Net speed is more interesting and useful as it gives your typing speed with errors calculated in the result.
          </p>
          <p style={{marginBottom: '15px'}}>
            Net speed can also be called Adjusted Typing Speed.
          </p>
          <p>
            Usually, if a job opening has a typing speed requirement, it is for net typing speed, even if this is not specifically stated. Your typing speed after errors is what counts.
          </p>
        </div>
        <div className="slide-image" style={{width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
           {renderResultCard()}
        </div>
      </div>
      <div className="slide-footer">
        <button className="btn-cancel" onClick={() => changeView('lesson_detail')}>Cancel</button>
        <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>3 of 5</span>
        <button className="btn-next" onClick={() => setView('results_4')}>Next</button>
      </div>
    </div>
  );

  // Result Slide 4
  const renderResultsSlide4 = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '0 auto'}}>
      <div className="slide-header">
        <span>Accuracy percentage</span>
        <button className="close-btn" onClick={() => changeView('lesson_detail')}>×</button>
      </div>
      <div className="slide-content" style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', paddingTop: '20px', overflowY: 'auto', flex: 1}}>
        <div className="slide-text" style={{width: '100%', padding: '0 20px'}}>
          <p style={{marginBottom: '15px', marginTop: 0}}>
            Accuracy is a score that represents the number of errors made.
          </p>
          <p style={{marginBottom: '15px'}}>
            Accuracy percentage is the ratio of keys typed correctly to all keys typed. The higher the percentage, the fewer errors you have made. 100% means no mistakes.
          </p>
          <p style={{marginBottom: '15px'}}>
            Accuracy is calculated using the standard word length. For each word with an error you get a five keystroke penalty, regardless of the number of errors in the word.
          </p>
          <p>
            To develop fluent typing, you should try to reach at least 90% accuracy at the end of each lesson. Goals used are 90% (easy), 94% (intermediary) and 98% (advanced).
          </p>
        </div>
        <div className="slide-image" style={{width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
           {renderResultCard()}
        </div>
      </div>
      <div className="slide-footer">
        <button className="btn-cancel" onClick={() => changeView('lesson_detail')}>Cancel</button>
        <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>4 of 5</span>
        <button className="btn-next" onClick={() => setView('results_5')}>Next</button>
      </div>
    </div>
  );

  // Result Slide 5
  const renderResultsSlide5 = () => (
    <div className="practice-card" style={{width: '100%', maxWidth: '1200px', margin: '0 auto'}}>
      <div className="slide-header">
        <span>Difficult Keys</span>
        <button className="close-btn" onClick={() => changeView('lesson_detail')}>×</button>
      </div>
      <div className="slide-content" style={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', paddingTop: '20px', overflowY: 'auto', flex: 1}}>
        <div className="slide-text" style={{width: '100%', padding: '0 20px'}}>
          <p style={{marginBottom: '15px', marginTop: 0}}>
            The Tutor also tracks the keys you have trouble typing and recommends reviewing those ones that keep coming up or have a high index.
          </p>
          <p style={{marginBottom: '15px'}}>
            The analysis is based on the amount of mistyped keys, corrections with Backspace and delays relative to your typing speed.
          </p>
          <p style={{marginBottom: '15px'}}>
            After an exercise, the result screen shows difficult keys in that exercise -- from the most difficult to the easiest.
          </p>
          <p>
            You'll also find the difficult keys on the "Review" screen. This graph shows the accumulated data from all exercises in the course.
          </p>
        </div>
        <div className="slide-image" style={{width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
           {renderResultCard()}
        </div>
      </div>
      <div className="slide-footer">
        <button className="btn-cancel" onClick={() => changeView('lesson_detail')}>Cancel</button>
        <span style={{fontWeight: 'bold', fontSize: '1.2rem'}}>5 of 5</span>
        <button className="btn-next" onClick={() => changeView('lesson_detail')}>OK</button>
      </div>
    </div>
  );

  // Home Row Practice
  const renderPracticeSession = () => {
      const currentTarget = practiceKeys[practiceState.currentIndex];
      if (!currentTarget) return null;

      // Create a pattern string of first 9 keys (including Space)
      const homeRowKeys = practiceKeys.slice(0, 9);
      const pattern = homeRowKeys.map(k => k.key === 'SPACE' ? ' ' : k.key.toLowerCase()).join('');
      const inputText = homeRowKeys.map(k => k.key === 'SPACE' ? ' ' : k.key.toLowerCase()).join('').slice(0, practiceState.currentIndex);

      return (
        <div className="practice-card practice-split-layout" style={{maxHeight: '90vh', height: 'auto', minHeight: 'auto', paddingBottom: '0'}}>
            <div className="practice-main" style={{padding: '0', display: 'flex', flexDirection: 'column'}}>
                <h2 style={{marginTop: '15px', marginBottom: '15px', fontWeight: 'normal', fontSize: '1.2rem', textAlign: 'center'}}>
                    Now try typing "{currentTarget.key === 'SPACE' ? 'Space' : currentTarget.key.toLowerCase()}" with {currentTarget.finger}
                </h2>
                
                <div style={{marginBottom: '0px', padding: '0 15px'}}>
                    {renderKeyBlocks(pattern, inputText, true)}
                </div>

                {/* Visual Feedback Message */}
                {practiceState.feedback === 'great' && (
                    <div style={{
                        position: 'absolute', 
                        top: '80px', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        fontSize: '4rem', 
                        color: '#28a745', 
                        fontWeight: 'bold',
                        zIndex: 10
                    }}>
                        Great!
                    </div>
                )}
                {practiceState.feedback === 'error' && (
                    <div style={{
                        position: 'absolute', 
                        top: '80px', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        fontSize: '4rem', 
                        color: '#dc3545', 
                        fontWeight: 'bold',
                        zIndex: 10
                    }}>
                        WRONG
                    </div>
                )}

                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '0', marginTop: '10px'}}>
                    <div style={{width: '100%'}}>
                        {renderKeyboard([currentTarget.key], practiceState.errorKey, '40px', false, { margin: '0 auto' })}
                    </div>
                    <div style={{marginTop: '0px'}}>
                        {renderHands([currentTarget.key], [], true)}
                    </div>
                </div>
            </div>
            <div className="practice-sidebar" style={{padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'flex-start'}}>
                 <button className="close-btn" style={{alignSelf: 'flex-end', color: '#333', fontSize: '2rem', marginBottom: '10px'}} onClick={() => changeView('lesson_detail')}>×</button>
                 <div style={{flex: 1}}></div>
                 <button className="btn-next" style={{width: '100%'}} onClick={() => changeView('key_drill')}>Begin Drill</button>
                 <button className="btn-cancel" style={{width: '100%', marginBottom: '10px'}} onClick={() => changeView('lesson_detail')}>Cancel</button>
            </div>
        </div>
      );
  };


  return (
    <div className="practice-page-wrapper" style={{
      '--course-color': courseColor,
      '--light-course-color': lightCourseColor,
      '--gradient-start': gradientStart,
      '--sidebar-bg': sidebarBg,
      '--main-bg': mainBg
    }}>
      {view === 'intro' && renderIntro()}
      {view === 'overview' && renderOverview()}
      {view === 'lesson_detail' && renderLessonDetail()}
      {view === 'slide_1' && renderSlide1()}
      {view === 'slide_2' && renderSlide2()}
      {view === 'slide_3' && renderSlide3()}
      {view === 'slide_4' && renderSlide4()}
      {view === 'slide_5' && renderSlide5()}
      {view === 'results_1' && renderResultsSlide1()}
      {view === 'results_2' && renderResultsSlide2()}
      {view === 'results_3' && renderResultsSlide3()}
      {view === 'results_4' && renderResultsSlide4()}
      {view === 'results_5' && renderResultsSlide5()}
      {view === 'lesson_intro' && renderLessonIntro()}
      {view === 'key_drill' && (
          <>
            {drillState === 'info' && renderDrillInfo()}
            {drillState === 'practice' && renderDrillPractice()}
            {drillState === 'results' && renderDrillResults()}
          </>
      )}
      {view === 'word_drill' && (
          <>
            {wordDrillState === 'info' && renderWordDrillInfo()}
            {wordDrillState === 'practice' && renderWordDrillPractice()}
            {wordDrillState === 'results' && renderWordDrillResults()}
          </>
      )}
      {view === 'sentence_drill' && (
          <>
            {sentenceDrillState === 'info' && renderSentenceDrillInfo()}
            {sentenceDrillState === 'practice' && renderSentenceDrillPractice()}
            {sentenceDrillState === 'results' && renderSentenceDrillResults()}
          </>
      )}
      {view === 'paragraph_drill' && (
          <>
            {paragraphDrillState === 'intro' && renderParagraphDrillIntro()}
            {paragraphDrillState === 'info' && renderParagraphDrillInfo()}
            {paragraphDrillState === 'practice' && renderParagraphDrillPractice()}
            {paragraphDrillState === 'results' && renderParagraphDrillResults()}
          </>
      )}
      {view === 'typing_test_selection' && renderTypingTestSelection()}
      {view === 'typing_test_practice' && renderTypingTestPractice()}
      {view === 'typing_test_results' && renderTypingTestResults()}
      {view === 'homerow_1' && renderHomeRow1()}
      {view === 'homerow_2' && renderHomeRow2()}
      {view === 'homerow_3' && renderHomeRow3()}
      {view === 'homerow_4' && renderHomeRow4()}
      {view === 'homerow_practice' && renderPracticeSession()}
      {view === 'review_difficult' && renderReviewDifficult()}
    </div>
  );
}

export default PracticePage;
