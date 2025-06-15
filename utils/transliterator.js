// utils/transliteration.js

// Cache for transliteration results to reduce API calls
const transliterationCache = new Map();

/**
 * Transliterate text from English to Marathi using Google Input Tools API
 * @param {string} text - English text to transliterate
 * @returns {Promise<string>} - Promise resolving to transliterated Marathi text
 */
export const transliterateToMarathi = async (text) => {
  if (!text) return '';
  
  // Return from cache if available
  if (transliterationCache.has(text)) {
    return transliterationCache.get(text);
  }
  
  try {
    // Google Input Tools API endpoint
    const apiUrl = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=mr-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (data && data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1]) {
      const transliterated = data[1][0][1][0];
      
      // Cache the result
      transliterationCache.set(text, transliterated);
      
      return transliterated;
    }
    
    return text; // Return original text if transliteration fails
  } catch (error) {
    console.error('Error during transliteration:', error);
    return text; // Return original text on error
  }
};

/**
 * Transliterate a complete sentence by splitting into words and transliterating each
 * @param {string} sentence - Full English sentence to transliterate
 * @returns {Promise<string>} - Promise resolving to transliterated Marathi sentence
 */
export const transliterateSentence = async (sentence) => {
  if (!sentence) return '';
  
  // Check if we already have this exact sentence in cache
  if (transliterationCache.has(sentence)) {
    return transliterationCache.get(sentence);
  }
  
  // Split sentence by spaces
  const words = sentence.split(' ');
  const transliteratedWords = [];
  
  // Transliterate each word
  for (const word of words) {
    if (word) {
      const transliteratedWord = await transliterateToMarathi(word);
      transliteratedWords.push(transliteratedWord);
    } else {
      transliteratedWords.push('');
    }
  }
  
  // Join words back into a sentence
  const transliteratedSentence = transliteratedWords.join(' ');
  
  // Cache the whole sentence result
  transliterationCache.set(sentence, transliteratedSentence);
  
  return transliteratedSentence;
};

/**
 * Full sentence transliteration (e.g. "mi tumhala sangto" -> "मी तुम्हाला सांगतो")
 * @param {string} sentence
 * @returns {Promise<string>}
 */
export const transliterateFullSentence = async (sentence) => {
  if (!sentence) return '';

  const words = sentence.split(' ');
  const transliteratedWords = [];

  for (const word of words) {
    if (/[a-zA-Z]/.test(word)) {
      const transliterated = await transliterateToMarathi(word);
      transliteratedWords.push(transliterated);
    } else {
      transliteratedWords.push(word);
    }
  }

  return transliteratedWords.join(' ');
};

/**
 * Process word-by-word transliteration, triggered by Shift key or space
 * @param {string} text - Full text input
 * @param {string} previousText - Previous text state for comparison
 * @param {boolean} forceTransliterate - Force transliteration (used with Shift key)
 * @returns {Promise<string>} - Promise resolving to text with latest word transliterated
 */
export const processWordByWordTransliteration = async (text, previousText = '', forceTransliterate = false) => {
  // If text is empty, return empty string
  if (!text) return '';
  
  // Check if space was just pressed (text ends with space and previous text didn't)
  const spaceJustPressed = text.endsWith(' ') && previousText && !previousText.endsWith(' ');
  
  // Check for transliteration triggers (Shift key, space bar, or forced)
  const shouldTransliterate = forceTransliterate || shiftTransliterationPending || 
                               (spaceJustPressed && spaceTransliterationPending);
  
  // Reset flags after checking
  if (shiftTransliterationPending) shiftTransliterationPending = false;
  if (spaceTransliterationPending) spaceTransliterationPending = false;
  
  if (shouldTransliterate) {    
    // Check if this is a paste event (significant text change compared to previous)
    const isPasteEvent = previousText && text.length > previousText.length + 5;
    
    // For paste events or force transliteration, transliterate the entire text
    if (isPasteEvent || forceTransliterate) {
      return await transliterateSentence(text);
    }
    
    // For space-triggered transliteration, handle it differently - 
    // we only want to transliterate the word that was just completed
    if (spaceJustPressed) {
      // Get the text without the trailing space
      const textWithoutSpace = text.trimEnd();
      // Get the last word from the previous content
      const words = textWithoutSpace.split(' ');
      const lastWord = words[words.length - 1];
      
      // Only transliterate if last word has Latin characters
      if (lastWord && /[a-zA-Z]/.test(lastWord)) {
        try {
          // Handle mixed script word (e.g., "सangto")
          const nonLatinPrefixMatch = lastWord.match(/^[^a-zA-Z0-9]+/);
          const latinPartMatch = lastWord.match(/[a-zA-Z0-9]+.*$/);
          
          let transliteratedWord;
          
          if (nonLatinPrefixMatch && latinPartMatch) {
            // Has both non-Latin prefix and Latin characters
            const nonLatinPrefix = nonLatinPrefixMatch[0];
            const latinPart = latinPartMatch[0];
            
            // Transliterate just the Latin part
            const transliteratedLatinPart = await transliterateToMarathi(latinPart);
            transliteratedWord = nonLatinPrefix + transliteratedLatinPart;
          } else {
            // Simple word with all Latin characters
            transliteratedWord = await transliterateToMarathi(lastWord);
          }
          
          // Replace the last word and keep the space
          words[words.length - 1] = transliteratedWord;
          return words.join(' ') + ' ';
        } catch (error) {
          console.error('Error in space-triggered transliteration:', error);
          return text;
        }
      }
    }
  } else {
    // If not transliterating, return the original text
    return text;
  }
  
  // When Shift is pressed, process current text for transliteration
  if (forceTransliterate || shiftTransliterationPending) {
    // Split the text by spaces to get words
    const words = text.split(' ');
    
    // Last word being typed - the one we're most likely trying to transliterate
    const lastWord = words[words.length - 1];
    
    // For single word case, just transliterate that word
    if (words.length === 1) {
      if (/[a-zA-Z]/.test(lastWord)) {
        try {
          // Extract any non-Latin prefix from the word
          const nonLatinPrefixMatch = lastWord.match(/^[^a-zA-Z0-9]+/);
          const latinPartMatch = lastWord.match(/[a-zA-Z0-9]+.*$/);
          
          if (latinPartMatch) {
            const latinPart = latinPartMatch[0];
            let nonLatinPrefix = nonLatinPrefixMatch ? nonLatinPrefixMatch[0] : '';
            
            // Get transliterated version of only the Latin part
            const transliteratedLatinPart = await transliterateToMarathi(latinPart);
            
            // Create the new word by combining the non-Latin prefix and transliterated Latin part
            return nonLatinPrefix + transliteratedLatinPart;
          }
          
          // If it's a simple word, just transliterate the whole thing
          return await transliterateToMarathi(lastWord);
        } catch (error) {
          console.error('Error in word-by-word transliteration:', error);
          return text;
        }
      } else {
        // No Latin characters, return as is
        return text;
      }
    }
    
    // For multiple words case, handle all words or just the last one based on context
    const completedWords = words.slice(0, -1);
    
    // If we're specifically triggering transliteration, assume we want to convert the last word
    // Keep the previously processed words as they are
    if (lastWord && /[a-zA-Z]/.test(lastWord)) {
      try {
        // Extract any non-Latin prefix from the word
        const nonLatinPrefixMatch = lastWord.match(/^[^a-zA-Z0-9]+/);
        const latinPartMatch = lastWord.match(/[a-zA-Z0-9]+.*$/);
        
        let transliteratedLastWord;
        
        if (latinPartMatch) {
          const latinPart = latinPartMatch[0];
          let nonLatinPrefix = nonLatinPrefixMatch ? nonLatinPrefixMatch[0] : '';
          
          // Get transliterated version of only the Latin part
          const transliteratedLatinPart = await transliterateToMarathi(latinPart);
          
          // Create the new word by combining the non-Latin prefix and transliterated Latin part
          transliteratedLastWord = nonLatinPrefix + transliteratedLatinPart;
        } else {
          transliteratedLastWord = await transliterateToMarathi(lastWord);
        }
        
        // Update the last word
        words[words.length - 1] = transliteratedLastWord;
        
        // Return the full text with transliterated last word
        return words.join(' ');
      } catch (error) {
        console.error('Error in word-by-word transliteration:', error);
        return text;
      }
    } else if (forceTransliterate) {
      // If force transliterating and no current word, transliterate everything
      return await transliterateSentence(text);
    }
  }
  
  // Return original text when not transliterating
  return text;
};

/**
 * Flags to track transliteration triggers
 */
export let shiftTransliterationPending = false;
export let spaceTransliterationPending = false;

/**
 * Handle special key presses during transliteration
 * @param {KeyboardEvent} e - Keyboard event
 * @param {Function} callback - Callback function to execute when triggering keys are pressed
 * @returns {boolean} - Whether the event has been handled or not
 */
export const handleSpecialKeys = (e, callback) => {
  // Handle Shift key press to trigger transliteration on demand
  if (e.key === 'Shift' || e.keyCode === 16) {
    shiftTransliterationPending = true;
    
    // If a callback is provided, execute it
    if (typeof callback === 'function') {
      callback();
    }
    
    // We'll let the default behavior proceed
    return false;
  }
  
  // Handle backspace carefully when dealing with Unicode characters
  if (e.key === 'Backspace' || e.keyCode === 8) {
    // Let the default behavior handle backspace
    return false;
  }
  
  // Space triggers word completion
  if (e.key === ' ' || e.keyCode === 32) {
    // Set the space transliteration flag
    spaceTransliterationPending = true;
    
    // Let default behavior handle space
    return false;
  }
  
  // Enter key pressed
  if (e.key === 'Enter' || e.keyCode === 13) {
    // Allow Enter to work as normal
    return false;
  }
  
  // Tab key pressed
  if (e.key === 'Tab' || e.keyCode === 9) {
    // Allow Tab to work as normal
    return false;
  }
  
  return false; // Return false for unhandled events
};

/**
 * Handle key up events to reset the key tracking
 * @param {KeyboardEvent} e - Keyboard event
 */
export const handleKeyUp = (e) => {
  // Reset the shift flag when shift key is released
  if (e.key === 'Shift' || e.keyCode === 16) {
    shiftTransliterationPending = false;
  }
  
  // Reset space flag when space key is released
  if (e.key === ' ' || e.keyCode === 32) {
    spaceTransliterationPending = false;
  }
};
