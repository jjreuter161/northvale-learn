// THE BACK BUTTON. On a phone, Back (and the browser's Back) should close what
// is open on top of the page, not leave the app. Everything that opens above a
// screen (a lesson, a sheet, a screen below a tab) takes one history step while
// it is open, and Back closes the newest one. A step goes away again when its
// layer closes by hand, but only once nothing newer sits above it.
const layers = []; // oldest first: { close }, and close is null once it was closed by hand
let steps = 0; // history steps taken (0 = the page as it opened)
let moving = false; // a history.go() of ours is on its way

function sync() {
  if (moving) return;
  while (layers.length && !layers[layers.length - 1].close) layers.pop();
  if (steps > layers.length) {
    moving = true;
    history.go(layers.length - steps);
  } else while (steps < layers.length) history.pushState({ nv: ++steps }, "");
}

// Takes a step for a layer; `close` is what Back should do. Returns what to
// call when the layer closes by hand.
export function holdBack(close) {
  const layer = { close };
  layers.push(layer);
  sync();
  return () => {
    if (!layers.includes(layer)) return; // Back already closed it
    layer.close = null;
    sync();
  };
}

addEventListener("popstate", (e) => {
  steps = (e.state && e.state.nv) || 0;
  if (!moving) while (layers.length > steps) { const l = layers.pop(); if (l.close) l.close(); }
  moving = false;
  sync();
});
