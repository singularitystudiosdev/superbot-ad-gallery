// The 'halloween-shopping' variant's two orders (halloween.37ff9e93.js): real listings, read on amazon.com and temu.com on
// 2026-10-17 in a guest session (nothing added to a cart, nothing bought), their photos the stores' own; how each was
// picked, and what is illustrative, is in img/halloween.37ff9e93/CREDITS.txt. Files are relative to img/halloween.37ff9e93/.

export const AMAZON = {
  store: 'amazon', name: 'Amazon',
  logoDark: 'amazon-logo-white.svg', mark: 'amazon-logo.svg',
  say: 'Your king size Halloween candy has been ordered from Amazon.',
  arrives: 'Arriving Monday, October 19',
  item: { id: 'B0722659X7', title: 'REESE’S King Size White Peanut Butter Pumpkins, 2.4 Ounce (Pack of 24)', price: 28.99, file: 'amazon/B0722659X7.jpg', url: 'https://www.amazon.com/dp/B0722659X7' },
};

export const TEMU = {
  store: 'temu', name: 'Temu', qty: 3,
  logo: 'temu-logo.svg', mark: 'temu-logo.svg',
  say: 'Your 3 pumpkin costumes in size S have been ordered from Temu.',
  arrives: 'Arriving Oct 24 – Oct 29',
  // the ask's size (CREDITS.txt: Temu's product pages would not show their size options to a guest session)
  sizeLabel: 'S',
  item: { id: '606214364721258', title: 'Autumn/Winter Style Cute Sleeveless Pumpkin Bodysuit with Hat for Girls, Halloween Children’s Costume, Book Week Costume', price: 7.82, file: 'temu/606214364721258.jpg', url: 'https://www.temu.com/autumn-winter-style-cute-sleeveless-pumpkin-bodysuit-with-hat-for-girls-halloween-childrens-costume-book-week-costume-g-606214364721258.html' },
};
