'use strict';
function isEscaped (str, qoutePos) {
   let i = qoutePos - 1;
   let numOfEscape = 0;

   while (str[i] === '\\') {
      numOfEscape += 1;
      i -= 1;
   }

   // If numOfEscape is even, then the quote is not escaped; Otherwise escaped.
   return !!(numOfEscape % 2);
}

function processComments (str, start, end, strategy) {
   switch (strategy) {
   case 'remove':
      /*
       * Remove the comment totally, and in this way, the position of non-comment
       * text changed.
       */
      return '';
   case 'replace-with-whitespace':
      /*
       * Replace non-whitespace character in comment with whitespace, in this
       * way, non-comment text keeps their position unchanged.
       */
      return str.slice(start, end).replace(/\S/g, ' ');
   default:
      // Do nothing.
      return str.slice(start, end);
   }
}

function decomment (str, opt) {
   const strategy = (opt === undefined) ? '' : opt.strategy;
   let quoteStatus = 'CLOSE';
   let ret = '';
   let startPos = 0;

   for (let i = 0; i < str.length; i++) {
      const current = str[i];
      const next = str[i + 1];

      if (current === '"') {
         const escaped = isEscaped(str, i);
         if (!escaped) {
            quoteStatus = (quoteStatus === 'CLOSE') ? 'OPEN' : 'CLOSE';
         }
      }
      // Everyting should be kept when quoteStatus is 'OPEN'.
      if (quoteStatus === 'OPEN') continue;

      if (current === '/') {
         const startOfLine = (str[i - 1] === '\n' || i === 0);

         if (next === '/' || next === '*') {
            ret += str.slice(startPos, i);
            startPos = i;
            i += 2;

            if (next === '/') {
               // The double-slash style comment(//) expects '\n' or '\r\n' or EOF.
               while (str[i] !== '\n' && i <= str.length) {
                  i += 1;
               }

               const hasCarrige = str[i - 1] === '\r';
               const endPos = hasCarrige ? (i - 1) : i;
               /*
                * We should keep the "newline" if exists. When there is no "newline"('\r\n' or '\n'), we append '';
                * str[i] equals to '\n' when there exist "newline", otherwise be 'undefined'.
                */
               const endOfLine = (hasCarrige ? '\r\n' : (str[i] || ''));
               const appending = (strategy === 'remove' && startOfLine) ? '' : endOfLine;
               ret += processComments(str, startPos, endPos, strategy) + appending;
               startPos = i + 1;
            } else {
               // The slash-asterisk style comment(/*) expects '*/'.
               while (str[i] + str[i + 1] !== '*/' && i <= str.length) {
                  i += 1;
               }

               if (str.length < i) {
                  // If there is no '*/', we keep everything after '/*'.
                  ret += str.slice(startPos);
               } else {
                  ret += processComments(str, startPos, i + 2, strategy);
               }
               startPos = i + 2;
            }
         }
      }
   }

   return ret + str.slice(startPos);
}

module.exports = decomment;
