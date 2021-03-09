export default function getInfoFromCookie() {
  if (document.cookie) {
    const splitCookieVal = document.cookie.split(' ');
    const usernameStartPos = splitCookieVal[0].indexOf('=') + 1;
    const usernameEndPos = splitCookieVal[0].indexOf(';');
    const loggedInUsername = splitCookieVal[0].substring(usernameStartPos, usernameEndPos);
    const idStartPos = splitCookieVal[3].indexOf('=') + 1;
    const trackedPortfolioId = Number(splitCookieVal[3].substring(idStartPos));
    return ({ loggedInUsername, trackedPortfolioId });
  }
  return null;
}
