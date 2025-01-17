import * as DOMPurify from 'dompurify';


export function purifyDomForString(domString:string = "") {
  if (!domString || !domString.length) {
    return domString;
  }
  // Step 1: Collect all proper tags
  const tagMatchers = [];
  domString = domString.replace(/<\/?(\w|\d)[^<>]+?>/gm, (match) => {
    tagMatchers.push(match);
    return `$it${tagMatchers.length}`;
  });

  // Step 2: Collect all improper tag type text causing issues
  const textMatchers = [];
  domString = domString.replace(/((<)\S+)|(<\s?)|(>)/gm, (match) => {
    textMatchers.push(match);
    return `$st${textMatchers.length}`;
  });

  // Step 3: Replace the right tags back to their place
  tagMatchers.forEach((match, index) => {
    domString = domString.replace(`$it${index + 1}`, match);
  });


  // Sanitize the HTML string without the improper tag type texts
  let sanitizedText = DOMPurify.sanitize(domString, {SAFE_FOR_JQUERY: true});

  // if we do DOMPurify.sanitize any data, if closing is not there it will add automatically.


  // Step 4: Replace the improper tag type text to their original position
  textMatchers.forEach((match, index) => {
    sanitizedText = sanitizedText.replace(`$st${index + 1}`, match);
  });

  // Remove the extra closing tag at the end of the string (if it exists and there is no closing tag immediately before it)
  // Eg: input1:<a>123</a></a> || <a>123</a> </a> , will remove extra closing tag.
  //     input2:<a>123</a> , return same input.   
     
	sanitizedText = sanitizedText.replace(/(<\/(\w|\d)+>)\s*(<\/(\w|\d)+>)$/, '$1');

  return sanitizedText;
}