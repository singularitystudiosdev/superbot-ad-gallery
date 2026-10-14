// Assets a frame cannot be drawn exactly without (the 3D variant's model): a frozen ?t= capture waits on __AD.ready
// (timeline.9b47fc30.js), which reads settled() here. A failed load settles too; its owner logs the error.
let pending = 0;
const done = () => { pending--; };

export function track(promise) {
  pending++;
  promise.then(done, done);
  return promise;
}

export const settled = () => pending === 0;
