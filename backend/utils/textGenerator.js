const practiceContent = require('./practiceContent');

const normalizeText = (text) => {
    return String(text || '').replace(/\r\n/g, '\n').replace(/\u00A0/g, ' ');
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

const pad2 = (n) => String(n).padStart(2, '0');

const generateContestText = (contestType, seedKey) => {
    const type = String(contestType || '').trim();

    if (practiceContent[type]) {
        return practiceContent[type].text;
    }

    const seed = hashText(`${seedKey || ''}||${type}`) || 1;
    const rng = mulberry32(seed);
    const randInt = (min, max) => min + Math.floor(rng() * (max - min + 1));
    const pick = (arr) => arr[randInt(0, arr.length - 1)];

    const makeNumericToken = (() => {
        const usedExpr = new Set();
        const makePlain = () => {
            const len = randInt(1, 6);
            let out = '';
            for (let i = 0; i < len; i++) out += String(randInt(0, 9));
            if (out.length >= 5 && rng() < 0.35) {
                const withComma = out.split('').reverse().join('').replace(/(\d{3})(?=\d)/g, '$1,').split('').reverse().join('');
                return withComma;
            }
            return out;
        };
        const makeDecimal = () => {
            const integer = randInt(0, 999);
            const decimal = randInt(0, 99);
            return `${integer}.${pad2(decimal)}`;
        };
        const makePercent = () => {
            const val = randInt(0, 100);
            return rng() < 0.5 ? `${val}%` : `${val}.${randInt(0, 9)}%`;
        };
        const makeMoney = () => {
            const val = randInt(1, 9999);
            return `$${val}`; // Simplified money
        };
        const makeDate = () => {
            const y = randInt(1995, 2036);
            const m = randInt(1, 12);
            const d = randInt(1, 28);
            const mode = randInt(0, 2);
            if (mode === 0) return `${y}-${pad2(m)}-${pad2(d)}`;
            if (mode === 1) return `${pad2(d)}/${pad2(m)}/${y}`;
            return `${pad2(m)}/${pad2(d)}/${y}`;
        };
        const makeTime = () => {
            const hh = randInt(0, 23);
            const mm = randInt(0, 59);
            const ss = randInt(0, 59);
            return rng() < 0.5 ? `${pad2(hh)}:${pad2(mm)}` : `${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
        };
        const makeHex = () => {
            const len = randInt(2, 6);
            const hexChars = '0123456789ABCDEF';
            let out = '';
            for (let i = 0; i < len; i++) out += hexChars[randInt(0, hexChars.length - 1)];
            return `0x${out}`;
        };
        const makePhone = () => `(${randInt(200, 999)}) ${randInt(200, 999)}-${String(randInt(0, 9999)).padStart(4, '0')}`;
        const makeExpr = () => {
            const ops = ['+', '-', '*', '/'];
            for (let attempt = 0; attempt < 12; attempt++) {
                const op = pick(ops);
                let a = randInt(1, 99);
                let b = randInt(1, 99);
                let res;
                if (op === '+') res = a + b;
                if (op === '-') {
                    if (b > a) [a, b] = [b, a];
                    res = a - b;
                }
                if (op === '*') {
                    a = randInt(2, 25);
                    b = randInt(2, 25);
                    res = a * b;
                }
                if (op === '/') {
                    b = randInt(2, 25);
                    res = randInt(2, 25);
                    a = b * res;
                }
                const expr = `${a}${op}${b}=${res}`;
                if (usedExpr.has(expr)) continue;
                usedExpr.add(expr);
                return expr;
            }
            return `${randInt(1, 99)}+${randInt(1, 99)}=${randInt(2, 198)}`;
        };
        const makers = [
            makePlain,
            makePlain,
            makePlain,
            makeDecimal,
            makePercent,
            makeMoney,
            makeDate,
            makeTime,
            makeHex,
            makePhone,
            makeExpr,
            makeExpr
        ];
        return () => pick(makers)();
    })();

    const makeHomeRowWord = (() => {
        const letters = ['a', 's', 'd', 'f', 'j', 'k', 'l'];
        const base = ['all', 'ask', 'dad', 'sad', 'lass', 'fall', 'salad', 'salsa', 'flask', 'add', 'lads', 'asks', 'falls', 'skill', 'alks'];
        const used = new Set();
        const makeRandom = () => {
            const len = randInt(2, 8);
            let w = '';
            for (let i = 0; i < len; i++) w += letters[randInt(0, letters.length - 1)];
            if (rng() < 0.25) w += ';';
            return w;
        };
        return () => {
            for (let attempt = 0; attempt < 20; attempt++) {
                const candidate = rng() < 0.55 ? pick(base) : makeRandom();
                if (used.has(candidate)) continue;
                used.add(candidate);
                return candidate;
            }
            return makeRandom();
        };
    })();

    const assembleParagraphs = (count, tokenMaker) => {
        const paras = [];
        const used = new Set();
        let safety = 0;
        while (paras.length < count && safety < count * 40) {
            safety++;
            const tokenCount = randInt(70, 120);
            const tokens = [];
            let last = '';
            for (let i = 0; i < tokenCount; i++) {
                let tok = tokenMaker();
                if (tok === last) tok = tokenMaker();
                last = tok;
                tokens.push(tok);
                if (rng() < 0.08) tokens.push(pick([',', ';']));
            }
            let text = tokens.join(' ').replace(/\s+([,;])/g, '$1');
            if (!/[.!?]$/.test(text)) text += '.';
            const key = hashText(text);
            if (used.has(key)) continue;
            used.add(key);
            paras.push(text);
        }
        return paras.join(' ');
    };

    const extendText = (baseText, targetParagraphs) => {
        const normalized = normalizeText(baseText);
        const spaceTokens = normalized.length ? normalized.split(' ').filter(Boolean) : [];
        if (spaceTokens.length < 10) return baseText;

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
        if (!startTokens.length) startTokens.push(spaceTokens[0]);

        const paras = [baseText];
        let safety = 0;
        
        while (paras.length < targetParagraphs && safety < targetParagraphs * 50) {
            safety++;
            const length = 90 + Math.floor(rng() * 90);
            const out = [];
            let tok = pick(startTokens.length > 0 ? startTokens : spaceTokens);
            
            for (let i = 0; i < length; i++) {
                out.push(tok);
                const nexts = transitions.get(tok);
                tok = nexts?.length ? pick(nexts) : pick(spaceTokens);
            }
            
            let text = out.join(' ').replace(/\s+/g, ' ').trim();
            text = text.replace(/\s+([,.;:!?])/g, '$1');
            if (!/[.!?]$/.test(text)) text += '.';
            if (text.length > 0) {
                text = text[0].toUpperCase() + text.slice(1);
                paras.push(text);
            }
        }
        return paras.join('\n\n');
    };

    if (practiceContent[type]) {
        return extendText(practiceContent[type].text, 100);
    }

    if (type === 'Numeric Keys') {
        return assembleParagraphs(100, makeNumericToken);
    }

    if (type === 'Basic Home Row') {
        const drills = ['asdf', 'jkl;', 'asdf jkl;', 'a s d f', 'j k l ;', 'sad dad', 'all fall', 'lass asks'];
        const tokenMaker = () => (rng() < 0.18 ? pick(drills) : makeHomeRowWord());
        return assembleParagraphs(100, tokenMaker);
    }

    const seedSentences = [
        'The quick brown fox jumps over the lazy dog.',
        'Pack my box with five dozen liquor jugs.',
        'How vexingly quick daft zebras jump!',
        'Sphinx of black quartz, judge my vow.',
        'A wizard’s job is to vex chumps quickly in fog.',
        'Typing builds momentum when you keep a steady rhythm.',
        'Small mistakes slow you down more than you think.',
        'Keep your wrists neutral and your shoulders relaxed.',
        'Accuracy first, then speed follows naturally.',
        'Practice punctuation, numbers (12345), and symbols (!@#$%).',
        'Short breaks help you stay consistent and focused.'
    ];
    const shuffled = [...seedSentences];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = randInt(0, i);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const more = assembleParagraphs(100, () => pick(shuffled).replace(/[.]/g, rng() < 0.2 ? '!' : '.'));
    return `${shuffled.join(' ')} ${more}`;
};

module.exports = {
    normalizeText,
    hashText,
    generateContestText
};
