// AT MOST ONE ASK PER VISIT. The survey, the age question, the account offer, the
// "New: Practice" sheet and the reminder offer all ask the learner for something.
// The first one that is due in a visit (until the page is reloaded or the app is
// reopened) takes the turn; the others wait for the next visit, and they are
// still due then, because what they check is saved, not remembered here.
import { useRef } from "react";

let asked = false;

// For a card in a screen: `wanted` is whether it would show now. Once it has the
// turn it keeps it (so it doesn't flicker), and nothing else asks after it.
export function useAsk(wanted) {
  const mine = useRef(false);
  if (wanted && !mine.current && !asked) mine.current = asked = true;
  return mine.current;
}

// For something that opens by itself (a sheet): true once, if nobody has asked yet.
export const claimAsk = () => (asked ? false : (asked = true));
