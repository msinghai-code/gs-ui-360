
export function  addEllipsis(text:string, charTruncateLength:number = 20){
  if(text && text.length && text !== '--'){
    let truncatedStr = text.substring(0, charTruncateLength);
    if (truncatedStr.length < text.length) {
      truncatedStr = text.substring(0, charTruncateLength - 3) + '...'
    }
    return truncatedStr;
  }else{
    return '';
  }
}

export function checkUrl(text: string) {
  const urlRegex = (/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);
  if(text.match(urlRegex) && text.match(urlRegex).length) {
    return true;
  }
  return false;
}

/**
 * The data fetched from api has the nodes which are already present in map
 * These data(person ids) are filtered so that only the new nodes can be sent
 * to the map for redraw
 */
export function filterExistingIds(oldData,newData){
  const existingIds = oldData.map((item=>item.id));
  return newData.filter((node)=>{
    return !existingIds.includes(node.id);
  });
}
