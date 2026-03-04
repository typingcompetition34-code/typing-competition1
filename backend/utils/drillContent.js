
const getEffectiveLessonId = (courseType, lesson) => {
  const lessonNum = parseInt(lesson, 10);
  return courseType === 'advanced' ? lessonNum + 12 : lessonNum;
};

const wordDrillPatterns = {
  1: [
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
  ],
  2: Array(10).fill([
    "if if if ", "eel eel eel ", "led led led ", "aid aid aid ", "ski ski ski ", 
    "ill ill ill ", "side side side ", "keel keel keel ", "life life life ",
    "ellis isle ", "ellis isle ", "field file ", "field file ", "silk skill ", 
    "silk skill ", "elk else ", "elk else ", "desk lead ", "desk lead "
  ]).flat(),
  3: Array(10).fill([
    "red red red ", "run run run ", "rude rude rude ", "rule rule rule ", "user user user ",
    "sure sure sure ", "fire fire fire ", "ride ride ride ", "blue blue blue ", "fur fur fur ",
    "dear dear dear ", "fear fear fear ", "read read read ", "real real real ", "rear rear rear "
  ]).flat(),
  4: Array(10).fill([
    "too too too ", "toot toot toot ", "root root root ", "foot foot foot ", "took took took ",
    "told told told ", "door door door ", "road road road ", "boat boat boat ", "lost lost lost ",
    "told told told ", "toot toot toot ", "took took took ", "root root root ", "road road road "
  ]).flat(),
  5: Array(10).fill([
    "The. The. ", "Red. Red. ", "Run. Run. ", "Sure. Sure. ", "Fire. Fire. ",
    "Ride. Ride. ", "Blue. Blue. ", "Road. Road. ", "Boat. Boat. ", "Lost. Lost. ",
    "A. S. D. F. ", "J. K. L. ;. ", "E. I. R. U. ", "T. O. P. Q. ", "Z. X. C. V. "
  ]).flat(),
  6: Array(10).fill([
    "cat cat cat ", "car car car ", "call call call ", "care care care ", "case case case ",
    "cool cool cool ", "face face face ", "dice dice dice ", "rice rice rice ", "nice nice nice ",
    "can, can, ", "cold, cold, ", "car, car, ", "care, care, ", "case, case, "
  ]).flat(),
  7: Array(10).fill([
    "get get get ", "got got got ", "good good good ", "gold gold gold ", "glad glad glad ",
    "has has has ", "had had had ", "high high high ", "hold hold hold ", "hard hard hard ",
    "it's it's ", "he's he's ", "she's she's ", "dad's dad's ", "car's car's "
  ]).flat(),
  8: Array(10).fill([
    "van van van ", "very very very ", "vote vote vote ", "view view view ", "vast vast vast ",
    "new new new ", "now now now ", "not not not ", "near near near ", "name name name ",
    "who? who? ", "what? what? ", "when? when? ", "where? where? ", "why? why? "
  ]).flat(),
  9: Array(10).fill([
    "was was was ", "went went went ", "will will will ", "with with with ", "work work work ",
    "man man man ", "make make make ", "more more more ", "must must must ", "mind mind mind ",
    "went went ", "with with ", "work work ", "make make ", "must must "
  ]).flat(),
  10: Array(10).fill([
    "quick quick quick ", "quiet quiet quiet ", "queen queen queen ", "quit quit quit ", "quite quite quite ",
    "page page page ", "part part part ", "past past past ", "plan plan plan ", "play play play ",
    "quick quick ", "quiet quiet ", "page page ", "part part ", "plan plan "
  ]).flat(),
  11: Array(10).fill([
    "but but but ", "bad bad bad ", "big big big ", "book book book ", "back back back ",
    "you you you ", "your your your ", "yes yes yes ", "yet yet yet ", "year year year ",
    "back back ", "book book ", "your your ", "year year ", "yes yes "
  ]).flat(),
  12: Array(10).fill([
    "zero zero zero ", "zone zone zone ", "zoo zoo zoo ", "size size size ", "lazy lazy lazy ",
    "box box box ", "six six six ", "next next next ", "tax tax tax ", "fix fix fix ",
    "zero zero ", "size size ", "box box ", "six six ", "next next "
  ]).flat(),
  13: Array(10).fill([
    "sad. dad. lad. ", "all, fall, ball, ", "it's he's she's ", "is it? was it? ",
    "said: \"yes\" ", "said: \"no\" ", "wait... stop. ", "who? what? why? ",
    "it's fine. ", "he's here, see? ", "she's fast. ", "is it real? ",
    "\"hello!\" ", "said: \"hi\" ", "red, blue, green. ", "yes. no. maybe. "
  ]).flat(),
  14: Array(10).fill([
    "room 405 ", "year 1976 ", "level 7 ", "page 6 ",
    "4 5 6 7 ", "45 67 45 ", "67 54 76 ", "555 444 ",
    "666 777 ", "47 56 47 ", "room 607 ", "page 45 ",
    "test 5 ", "test 6 ", "4 4 4 4 ", "5 5 5 5 "
  ]).flat(),
  15: Array(10).fill([
    "1st 2nd 3rd ", "8th 9th 0th ", "10 20 30 ", "80 90 100 ",
    "123 890 ", "321 098 ", "19 28 30 ", "81 92 03 ",
    "1 2 3 8 9 0 ", "000 111 ", "222 333 ", "888 999 ",
    "phone 911 ", "code 123 ", "level 10 ", "rank 1 "
  ]).flat(),
  16: Array(10).fill([
    "save $500! ", "email@test.com ", "id #12345 ", "100% done! ",
    "! @ # $ % ", "!!! @@@ ### ", "$$$ %%% $$$ ", "!#! @$@ ",
    "cash $10 ", "item #1 ", "win! win! ", "done 100% ",
    "A! S@ D# F$ ", "F% A! S@ D# ", "100% $50 #1 ", "email@site "
  ]).flat(),
  17: Array(10).fill([
    "salt & pepper ", "5 * 5 = 25 ", "(parentheses) ", "power ^ 2 ",
    "^ & * ( ) ", "^^^ &&& *** ", "((( ))) ((( ", "^&^ *(* ",
    "you & me ", "rate * time ", "(yes) (no) ", "2 ^ 10 ",
    "J^ J& K* L( ", ";) J^ J& K* ", "(100) & (200) ", "stars *** "
  ]).flat(),
  18: Array(10).fill([
    "well-being ", "user_name ", "2 + 2 = 4 ", "10 / 2 = 5 ",
    "- _ = + ", "-- __ == ++ ", "// || \\\\ // ", "-= _+ /| ",
    "well-done ", "first_last ", "3 + 3 = 6 ", "8 / 4 = 2 ",
    "path/to/file ", "yes | no ", "up - down ", "sum = 10 "
  ]).flat(),
  19: Array(10).fill([
    "array[0] ", "object {id} ", "x < y ", "y > x ",
    "[ ] { } ", "[[ ]] {{ }} ", "<< >> << >> ", "[{< >}] ",
    "data[i] ", "main { } ", "a < b ", "b > a ",
    "list[1] ", "test { } ", "min < max ", "high > low "
  ]).flat()
};

const sentenceDrillPatterns = {
  2: Array(10).fill([
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
  ]).flat(),
  3: Array(10).fill([
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
  ]).flat(),
  4: Array(10).fill([
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
  ]).flat(),
  5: Array(10).fill([
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
  ]).flat(),
  6: Array(10).fill([
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
  ]).flat(),
  7: Array(10).fill([
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
  ]).flat(),
  8: Array(10).fill([
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
  ]).flat(),
  9: Array(10).fill([
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
  ]).flat(),
  10: Array(10).fill([
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
  ]).flat(),
  11: Array(10).fill([
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
  ]).flat(),
  12: Array(10).fill([
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
  ]).flat(),
  13: Array(10).fill([
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
  ]).flat(),
  14: Array(10).fill([
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
  ]).flat(),
  15: Array(10).fill([
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
  ]).flat(),
  16: Array(10).fill([
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
  ]).flat(),
  17: Array(10).fill([
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
  ]).flat(),
  18: Array(10).fill([
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
  ]).flat(),
  19: Array(10).fill([
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
  ]).flat()
};

const paragraphDrillPatterns = {
  1: [
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
  ],
  2: [
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
  ],
  3: [
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
    "dear friends are real and true\n"
  ],
  4: [
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
  ],
  5: [
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
  ],
  6: [
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
  ],
  7: [
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
  ],
  8: [
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
  ],
  9: [
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
  ],
  10: [
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
  ],
  11: [
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
  ],
  12: [
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
  ],
  13: [
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
  ],
  14: [
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
  ],
  15: [
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
  ],
  16: [
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
  ],
  17: [
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
  ],
  18: [
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
  ],
  19: [
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
  ]
};

const keyDrillPatterns = {
  1: [
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
  ],
  2: [
    "eee iii ", "e i i e ", "i e e i ", "ede kik ",
    "ded iki ", "dei ied ", "ee ii ee ", "ii ee ii ",
    "eie iei ", "ede iki ", "efe iji ", "ese ili ",
    "eae i;i ", "dee kii ", "eee iii ", "e i e i "
  ],
  3: [
    "rrr uuu ", "r u u r ", "u r r u ", "frf juj ",
    "rfr uju ", "ruu urr ", "rr uu rr ", "uu rr uu ",
    "rur uru ", "frf juj ", "grg huj ", "drd kuj ",
    "srs lul ", "fru jur ", "rrr uuu ", "r u r u "
  ],
  4: [
    "ttt ooo ", "t o o t ", "o t t o ", "ftf lol ",
    "tft olo ", "too ott ", "tt oo tt ", "oo tt oo ",
    "tot oto ", "ftf lol ", "gtg ho h ", "dtd ko k ",
    "sts lsl ", "fto lot ", "ttt ooo ", "t o t o "
  ],
  5: [
    "AAA SSS ", "DDD FFF ", "JJJ KKK ", "LLL ;;; ",
    "A S D F ", "J K L ; ", "E I R U ", "T O P Q ",
    "... ... ", "L.L K.K ", "J.J F.F ", "D.D S.S ",
    "A.A ;.; ", "E.E I.I ", "R.R U.U ", "T.T O.O "
  ],
  6: [
    "ccc ,,, ", "c , , c ", ", c c , ", "dcd k,k ",
    "cdc ,k, ", "c,, ,cc ", "cc ,, cc ", ",, cc ,, ",
    "c,c ,c, ", "dcd k,k ", "fcf j,j ", "scs l,l ",
    "aca ;.; ", "dc, k,c ", "ccc ,,, ", "c , c , "
  ],
  7: [
    "ggg hhh ", "g h h g ", "h g g h ", "fgf jhj ",
    "gfg hjh ", "ghh hgg ", "gg hh gg ", "hh gg hh ",
    "ghg hgh ", "fgf jhj ", "''' ;'; ", "l'l k'k ",
    "j'j f'f ", "g'g h'h ", "ggg hhh ", "g h g h "
  ],
  8: [
    "vvv nnn ", "v n n v ", "n v v n ", "fvf jnj ",
    "vfv njn ", "vnn nvv ", "vv nn vv ", "nn vv nn ",
    "vnv nvn ", "fvf jnj ", "??? ;?; ", "l?l k?k ",
    "j?j f?f ", "v?v n?n ", "vvv nnn ", "v n v n "
  ],
  9: [
    "www mmm ", "w m m w ", "m w w m ", "sws jmj ",
    "wsw mjm ", "wmm mww ", "ww mm ww ", "mm ww mm ",
    "wmw mwm ", "sws jmj ", "dwd kmk ", "awa ;m; ",
    "fwf hmh ", "swm jmw ", "www mmm ", "w m w m "
  ],
  10: [
    "qqq ppp ", "q p p q ", "p q q p ", "aqa ;p; ",
    "qaq p;p ", "qpp pqq ", "qq pp qq ", "pp qq pp ",
    "qpq pqp ", "aqa ;p; ", "sqs lpl ", "dqd kpk ",
    "fqf jpj ", "aqp ;pq ", "qqq ppp ", "q p q p "
  ],
  11: [
    "bbb yyy ", "b y y b ", "y b b y ", "fbf jyj ",
    "bfb yjy ", "byy ybb ", "bb yy bb ", "yy bb yy ",
    "byb yby ", "fbf jyj ", "gbg hyh ", "dbd kyk ",
    "sbs lyl ", "fby jyb ", "bbb yyy ", "b y b y "
  ],
  12: [
    "zzz xxx ", "z x x z ", "x z z x ", "aza sxs ",
    "zaz xsx ", "zxx xzz ", "zz xx zz ", "xx zz xx ",
    "zxz xzx ", "aza sxs ", "szs lxl ", "dzd kxk ",
    "fzf jxj ", "azx sxz ", "zzz xxx ", "z x z x "
  ],
  13: [
    ".. ,, ", "'' ?? ", ":: \"\" ", ". , ' ? ",
    ": \" : \" ", ". , . , ", "' ? ' ? ", ": \" : \" ",
    ".,' ? ", ".:\" ? ", "., ' : ", "\" ? . , ",
    ".. ,, '' ?? :: \"\" "
  ],
  14: [
    "44 55 ", "66 77 ", "4 5 6 7 ", "45 67 45 ",
    "f4f f5f ", "j6j j7j ", "456 745 ", "674 567 ",
    "44 55 66 77 ", "4567 4567 "
  ],
  15: [
    "11 22 ", "33 88 ", "99 00 ", "1 2 3 8 9 0 ",
    "a1a s2s ", "d3d k8k ", "l9l ;0; ", "123 890 ",
    "11 22 33 88 99 00 ", "123890 123890 "
  ],
  16: [
    "!! @@ ", "## $$ ", "%% !! ", "! @ # $ % ",
    "A! S@ ", "D# F$ ", "F% A! ", "!@#$% !@#$%"
  ],
  17: [
    "^^ && ", "** (( ", ")) ^^ ", "^ & * ( ) ",
    "J^ J& ", "K* L( ", ";) J^ ", "^&*() ^&*()"
  ],
  18: [
    "-- __ ", "== ++ ", "// || ", "\\\\ -- ", "`` ~~ ",
    "- _ = + ", "/ | \\ - ", "` ~ ` ~ ", "-= _+ ", "/| \\- `~ ",
    "--__==++ //||\\\\ ``~~"
  ],
  19: [
    "[[ ]] ", "{{ }} ", "<< >> ", "[ ] { } ",
    "< > < > ", "[[ {{ ", "]] }} ", "[] {} <> ",
    "[ ] { } < >"
  ]
};

// Fill in remaining paragraph patterns for lessons 4-19 with placeholders or repeats if needed
// For now, mirroring what was in the file, which seemed to stop explicit definition around lesson 3 in my read?
// Wait, I only read up to line 4879. I need to check if there are more.

module.exports = {
  getDrillContent: (type, courseType, lesson) => {
    const lessonId = getEffectiveLessonId(courseType, lesson);
    
    if (type === 'word') {
      return wordDrillPatterns[lessonId] || [];
    } else if (type === 'sentence') {
      return sentenceDrillPatterns[lessonId] || [];
    } else if (type === 'paragraph') {
      return paragraphDrillPatterns[lessonId] || [];
    } else if (type === 'key') {
      return keyDrillPatterns[lessonId] || [];
    }
    return [];
  }
};
