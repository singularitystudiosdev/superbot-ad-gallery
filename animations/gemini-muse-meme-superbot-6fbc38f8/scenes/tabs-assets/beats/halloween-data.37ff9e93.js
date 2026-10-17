// The 'halloween-shopping' variant's two stores (halloween.37ff9e93.js): real listings, read on amazon.com and temu.com on
// 2026-10-17 in a guest session (nothing added to a cart, nothing bought), their photos the stores' own; every fact and
// what is illustrative is in img/halloween.37ff9e93/CREDITS.txt. `items` are in the order the results first show; the
// pointer's sort puts them in price order. `pick` is the item superbot buys, ringed with its `tags`. Files are relative to
// img/halloween.37ff9e93/.

export const AMAZON = {
  store: 'amazon', name: 'Amazon', query: 'halloween king size candy bag',
  logoDark: 'amazon-logo-white.svg', mark: 'amazon-logo.svg',
  say: 'Searching Amazon for the cheapest king size Halloween candy.',
  after: 'Bought Reese’s King Size Pumpkins, 24 count, for $28.99. Arriving Monday.',
  arrives: 'Arriving Monday, October 19', tags: ['Cheapest', 'Halloween'],
  pick: 'B0722659X7',
  items: [
    { id: 'B000IXWDFO', short: 'HERSHEY’S Milk Chocolate King Size Candy Bars, 2.6 oz, 18 Ct', title: 'HERSHEY’S Milk Chocolate King Size Candy Bars, 2.6 oz, 18 Ct', price: 35.99, size: '2.6 oz × 18', rating: 4.5, reviews: '(987)', file: 'amazon/B000IXWDFO.jpg', url: 'https://www.amazon.com/dp/B000IXWDFO' },
    { id: 'B000IXSN6W', short: 'REESE’S FAST BREAK King Size Candy Bars, 3.5 oz, 18 ct', title: 'REESE’S FAST BREAK King Size Candy Bars, 3.5 oz, 18 ct', price: 38.90, size: '3.5 oz × 18', rating: 4.7, reviews: '(1,271)', file: 'amazon/B000IXSN6W.jpg', url: 'https://www.amazon.com/dp/B000IXSN6W' },
    { id: 'B0722659X7', short: 'REESE’S King Size White Peanut Butter Pumpkins, 2.4 Ounce (Pack of 24)', title: 'REESE’S King Size White Peanut Butter Pumpkins, 2.4 Ounce (Pack of 24)', price: 28.99, size: '2.4 oz × 24', rating: 4.6, reviews: '(31)', file: 'amazon/B0722659X7.jpg', url: 'https://www.amazon.com/dp/B0722659X7' },
    { id: 'B000IXSMW2', short: 'MOUNDS Coconut and Dark Chocolate King Size, Candy Bars, 3.5 oz (18 Count)', title: 'MOUNDS Coconut and Dark Chocolate King Size, Candy Bars, 3.5 oz (18 Count)', price: 36.36, size: '3.5 oz × 18', rating: 4.4, reviews: '(176)', file: 'amazon/B000IXSMW2.jpg', url: 'https://www.amazon.com/dp/B000IXSMW2' },
  ],
};

export const TEMU = {
  store: 'temu', name: 'Temu', query: 'pumpkin costume', qty: 3,
  logo: 'temu-logo.svg', mark: 'temu-logo.svg',
  say: 'Finding the cheapest, cutest pumpkin costume on Temu in size S.',
  after: 'Ordered 3 in size S for $23.46. Arriving before Halloween.',
  arrives: 'Arriving Oct 24 – Oct 29', tags: ['Cheapest', 'Cutest'],
  // the size row is the ask's (CREDITS.txt: Temu's product pages would not show their size options to a guest session)
  sizeLabel: 'S', sizes: ['XS', 'S', 'M', 'L'],
  pick: '606214364721258',
  items: [
    { id: '607292250522877', short: 'Baby Pumpkin Romper, Hat & Socks', title: 'Autumn Winter Halloween Baby Toddler Loose Bodysuit Pumpkin Long Sleeve Romper with Hat Socks 3pcs Set', price: 10.98, was: 19.62, sold: '179 sold', rating: 5, reviews: '(1)', file: 'temu/607292250522877.jpg', url: 'https://www.temu.com/autumn-winter-halloween-baby-toddler-loose-bodysuit-pumpkin-long-sleeve-romper-with-hat-socks-3pcs-set-for-outdoor-g-607292250522877.html' },
    { id: '606803295310963', short: 'Girls’ Pumpkin Vest Outfit', title: 'Halloween Costume Girls’ Crew Neck Bodysuit, Pumpkin Vest, Halloween Outfit', price: 12.80, was: 18.99, sold: '457 sold', rating: 5, reviews: '(1)', file: 'temu/606803295310963.jpg', url: 'https://www.temu.com/girls-autumn--crew-neck--bodysuit--pumpkin-vest-halloween--outfit-perfect-for-outdoor-g-606803295310963.html' },
    { id: '606214364721258', short: 'Cute Pumpkin Bodysuit with Hat', title: 'Autumn/Winter Style Cute Sleeveless Pumpkin Bodysuit with Hat for Girls, Halloween Children’s Costume, Book Week Costume', price: 7.82, was: 45.88, sold: '1.6K+ sold', rating: 4.8, reviews: '(5)', file: 'temu/606214364721258.jpg', url: 'https://www.temu.com/autumn-winter-style-cute-sleeveless-pumpkin-bodysuit-with-hat-for-girls-halloween-childrens-costume-book-week-costume-g-606214364721258.html' },
    { id: '606725247746553', short: 'Newborn Pumpkin Suit + Leaf Collar', title: 'Boys’ Regular Bodysuit Newborn Baby Halloween Pumpkin 2pcs Set with Matching Pumpkin Hat', price: 13.60, sold: '192 sold', rating: 5, reviews: '(4)', file: 'temu/606725247746553.jpg', url: 'https://www.temu.com/boys-regular-bodysuit-newborn-baby-halloween-pumpkin-2pcs-set-with-matching-pumpkin-hat-three-dimensional-green-leaf-collar-long-sleeves-full--coverage-childrens-holiday-funny-pumpkin-print-photo-crawling-suit-perfect-for-outdoor-g-606725247746553.html' },
  ],
};
