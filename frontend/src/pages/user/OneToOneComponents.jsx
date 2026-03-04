import React, { memo } from 'react';

// Helper to check if a word matches
const isWordCorrect = (target, typed) => target === typed;

export const TargetTextDisplay = memo(({
  visibleLines,       // Array of strings (lines to show)
  startLineIndex,     // The global index of the first visible line
  globalLineStartIndices, // Array where [i] = index of first word in line i
  activeWordIndex,    // Global index of the word currently being typed
  lockedWords,        // Array of all committed typed words
  currentWord,        // The current word being typed (not yet locked)
  wordNodesRef,       // Map ref for word elements
  activeWordRef       // Ref for the active word element
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: 'monospace', fontSize: 'inherit', lineHeight: '1.6', fontWeight: 'bold' }}>
      {visibleLines.map((line, localLineIndex) => {
        const globalLineIndex = startLineIndex + localLineIndex;
        // Safety check for indices
        const startWordIndex = (globalLineStartIndices && globalLineStartIndices[globalLineIndex]) !== undefined 
          ? globalLineStartIndices[globalLineIndex] 
          : 0;
          
        const words = line ? line.split(' ') : [];

        return (
          <div key={globalLineIndex} style={{ display: 'flex', flexWrap: 'nowrap', whiteSpace: 'pre', minHeight: '1.6em' }}>
            {words.map((word, wIndex) => {
              const globalWordIndex = startWordIndex + wIndex;
              const isTyped = globalWordIndex < activeWordIndex;
              const isCurrent = globalWordIndex === activeWordIndex;
              const typedWord = isTyped ? lockedWords[globalWordIndex] : (isCurrent ? currentWord : undefined);

              let style = { padding: '0 2px' };

              if (isTyped && typedWord !== undefined) {
                if (typedWord === word) {
                  style.color = '#4ade80'; // Bright Green (Dark Mode)
                } else {
                  style.color = '#f87171'; // Bright Red (Dark Mode)
                  style.textDecoration = 'underline';
                  style.textDecorationColor = '#f87171';
                }
              } else {
                style.color = '#4ade80'; // Bright Green (Reference text style)
              }

              if (isCurrent) {
                style.background = 'rgba(253, 224, 71, 0.2)'; // Yellow-300 with opacity
                style.borderRadius = '4px';
                if (currentWord && (!word.startsWith(currentWord) || currentWord.length > word.length)) {
                  style.color = '#f87171';
                  style.textDecoration = 'underline';
                  style.textDecorationColor = '#f87171';
                } else {
                    style.color = '#e5e7eb'; // Gray-200 for current word text
                }
              }

              return (
                <span
                  key={globalWordIndex}
                  ref={(el) => {
                    if (!wordNodesRef) return;
                    if (el) wordNodesRef.current.set(globalWordIndex, el);
                    else wordNodesRef.current.delete(globalWordIndex);
                    if (isCurrent && el && activeWordRef) activeWordRef.current = el;
                  }}
                  style={style}
                >
                  {word}{wIndex < words.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});

export const TypedTextDisplay = memo(({
  visibleLines,
  startLineIndex,
  globalLineStartIndices,
  activeWordIndex,
  lockedWords,
  currentWord,
  placeholder
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: 'monospace', fontSize: 'inherit', lineHeight: '1.6', fontWeight: 'bold' }}>
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .custom-cursor {
            border-left: 2px solid #a855f7; /* Purple-500 cursor */
            margin-left: 1px;
            animation: blink 1s step-end infinite;
            display: inline-block;
            height: 1.2em;
            vertical-align: text-bottom;
          }
        `}
      </style>
      {visibleLines.map((line, localLineIndex) => {
        const globalLineIndex = startLineIndex + localLineIndex;
        // Safety check for indices
        const startWordIndex = (globalLineStartIndices && globalLineStartIndices[globalLineIndex]) !== undefined 
          ? globalLineStartIndices[globalLineIndex] 
          : 0;
          
        const words = line ? line.split(' ') : [];

        return (
          <div key={globalLineIndex} style={{ display: 'flex', flexWrap: 'nowrap', whiteSpace: 'pre', minHeight: '1.6em' }}>
            {words.map((targetWord, wIndex) => {
              const globalWordIndex = startWordIndex + wIndex;
              const isTyped = globalWordIndex < activeWordIndex;
              const isCurrent = globalWordIndex === activeWordIndex;
              
              let content = null;
              let style = { padding: '0 2px' };
              let showCursor = false;

              if (isTyped) {
                const w = lockedWords[globalWordIndex] || '';
                content = w;
                if (w !== targetWord) {
                   style.color = '#f87171'; // Bright Red
                   style.borderBottom = '2px solid #f87171';
                } else {
                   style.color = '#e5e7eb'; // Gray-200 (Bright Text)
                }
              } else if (isCurrent) {
                const w = currentWord || '';
                content = w;
                showCursor = true;
                 // Highlight errors in current word
                if (w && (!targetWord.startsWith(w) || w.length > targetWord.length)) {
                    style.color = '#f87171';
                    style.borderBottom = '2px solid #f87171';
                } else {
                    style.color = '#e5e7eb'; // Gray-200
                }
              } else if (activeWordIndex === -1 && globalWordIndex === 0) {
                  // Special case: very start, no active word set yet? 
                  // Usually activeWordIndex starts at 0.
              }

              // If it's the very first word and we haven't started typing, show cursor?
              // activeWordIndex starts at 0. So isCurrent will be true for 0.

              if (content === null) {
                  // For untyped words, we render nothing (empty space)
                  // BUT we need to preserve the spacing if we want it to look like "filling in the blanks"?
                  // The user said "type here section ... same space".
                  // If I don't render the words, the line might be shorter?
                  // No, because it's left-aligned.
                  // But if I want to show the "blank" lines, I should probably render spaces?
                  // Or just let it be empty. The user didn't ask for "blanks" to be visible, just the "section" to have same space.
                  // The container has fixed height.
                  return null;
              }

              return (
                <span key={globalWordIndex} style={style}>
                  {content}
                  {showCursor && <span className="custom-cursor" />}
                  {wIndex < words.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});
