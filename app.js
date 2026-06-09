/* ============================================
   KonserIndo — Concert Data & App Logic
   Data: Tempo.co, Billboard, NME, Bandwagon Asia,
   JamBase, tiket.com, loket.com, Weverse, Soompi,
   RRI.co.id, CNBCIndonesia, KapanLagi
   Last updated: June 9, 2026
   ============================================ */

const TODAY = new Date('2026-06-09');

/* ============================================
   ARTIST IMAGES — Wikimedia Commons CC-licensed
   Untuk artis tanpa foto Wikimedia, gunakan
   gradient CSS (imageUrl: null)
   ============================================ */
const ARTIST_IMAGES = {
  'blackpink-deadline-2025':      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/170514_BLACKPINK_at_YG_x_UNICEF_Walking_Festival_07.jpg/600px-170514_BLACKPINK_at_YG_x_UNICEF_Walking_Festival_07.jpg',
  'bts-jakarta-2026':             'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/WikiPortraits_Studio_BTS_at_Sundance_2024.jpg/600px-WikiPortraits_Studio_BTS_at_Sundance_2024.jpg',
  'avenged-sevenfold-jakarta-2026': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Avenged_Sevenfold_%2832468305786%29_%28cropped%29.jpg/600px-Avenged_Sevenfold_%2832468305786%29_%28cropped%29.jpg',
  'the-weeknd-jakarta-2026':      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/The_Weeknd_Portrait_by_Brian_Ziff.jpg/600px-The_Weeknd_Portrait_by_Brian_Ziff.jpg',
  'mcr-hammersonic-2026':         'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/My_Chemical_Romance_lights.jpg/600px-My_Chemical_Romance_lights.jpg',
  'mcr-jis-2026':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/My_Chemical_Romance_lights.jpg/600px-My_Chemical_Romance_lights.jpg',
  'dream-theater-2026':           'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Dream_Theater_-_Wacken_Open_Air_2015_-_Wacken-7698.jpg/600px-Dream_Theater_-_Wacken_Open_Air_2015_-_Wacken-7698.jpg',
  'laufey-jakarta-2026':          'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Laufey_in_2023.jpg/600px-Laufey_in_2023.jpg',
  'green-day-jakarta-2025':       'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Green_Day_Live_in_Singapore_2010.jpg/600px-Green_Day_Live_in_Singapore_2010.jpg',
  'ateez-2026':                   'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/ATEEZ_at_KCON_LA_2023_%28cropped%29.jpg/600px-ATEEZ_at_KCON_LA_2023_%28cropped%29.jpg',
  'the-neighbourhood-jakarta-2026': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/The_Neighbourhood_-_03-28-2014_%2813623028734%29.jpg/600px-The_Neighbourhood_-_03-28-2014_%2813623028734%29.jpg',
  'bryan-adams-jakarta-2026':     'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Bryan_Adams_in_2019.jpg/600px-Bryan_Adams_in_2019.jpg',
  'five-sos-jakarta-2026':        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/5_Seconds_of_Summer_at_the_iHeartRadio_Music_Festival_%28cropped%29.jpg/600px-5_Seconds_of_Summer_at_the_iHeartRadio_Music_Festival_%28cropped%29.jpg',
  'java-jazz-2026':               'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Jon_Batiste_%2852944193773%29_%28cropped%29.jpg/600px-Jon_Batiste_%2852944193773%29_%28cropped%29.jpg',
  'lalala-fest-2026':             'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Steve_Lacy_Primavera_Sound_2023_%28cropped%29.jpg/600px-Steve_Lacy_Primavera_Sound_2023_%28cropped%29.jpg',
};

const CONCERTS = [

  /* ════════ PAST CONCERTS ════════ */
  {
    id: 'blackpink-deadline-2025',
    artist: 'BLACKPINK',
    tour: 'WORLD TOUR <DEADLINE>',
    genre: 'kpop', emoji: '🌸',
    dates: ['1 November 2025', '2 November 2025'],
    rawDate: new Date('2025-11-01'),
    time: '18:00 WIB',
    venue: 'Gelora Bung Karno (GBK) Utama',
    city: 'Senayan, Jakarta Pusat',
    promotor: 'Live Nation Asia',
    ticketPlatform: 'tiket.com',
    ticketUrl: 'https://tiket.com',
    priceRange: 'Rp 1.000.000 – Rp 5.000.000',
    priceMin: 1000000, priceMax: 5000000,
    ticketCategories: [
      { name: 'CAT 4', price: 'Rp 1.000.000' },
      { name: 'CAT 3', price: 'Rp 1.800.000' },
      { name: 'CAT 2', price: 'Rp 2.800.000' },
      { name: 'CAT 1', price: 'Rp 3.800.000' },
      { name: 'VIP', price: 'Rp 5.000.000' },
    ],
    confirmStatus: 'confirmed', hot: false,
    description: 'BLACKPINK sukses menggelar konser "DEADLINE" di GBK selama 2 malam. Rosé, Jisoo, Jennie, dan Lisa tampil di hadapan lebih dari 100.000 penonton dan mengubah stadion menjadi "pink dome". Salah satu konser K-Pop terbaik dalam sejarah Indonesia.',
    sources: ['weverse.io', 'tempo.co', 'thejakartapost.com'],
  },
  {
    id: 'fforever-jakarta-2026',
    artist: 'F✦FOREVER (F4 + Ashin)',
    tour: 'F✦FOREVER 1st World Tour',
    genre: 'pop', emoji: '⭐',
    dates: ['29 Mei 2026', '30 Mei 2026'],
    rawDate: new Date('2026-05-29'),
    time: '19:30 WIB',
    venue: 'Indonesia Arena, GBK',
    city: 'Senayan, Jakarta Pusat',
    promotor: 'Color Asia Live',
    ticketPlatform: 'Loket.com',
    ticketUrl: 'https://fforeverindonesia.com',
    priceRange: 'Cek Loket.com',
    priceMin: 0, priceMax: 0,
    ticketCategories: [{ name: 'Various Categories', price: 'Cek loket.com' }],
    confirmStatus: 'confirmed', hot: false,
    description: 'F4 (Jerry Yan, Van Ness Wu, Vic Chou) bersama Ashin (vokalis Mayday) tampil 2 malam di Indonesia Arena dengan stage eksklusif "Four-Point Star". Nostalgia era Meteor Garden hadir kembali untuk jutaan fans Indonesia.',
    sources: ['fforeverindonesia.com', 'cnbcindonesia.com'],
  },
  {
    id: 'ateez-2026',
    artist: 'ATEEZ',
    tour: 'ATEEZ 2026 World Tour "In Your Fantasy"',
    genre: 'kpop', emoji: '🌀',
    dates: ['31 Januari 2026'],
    rawDate: new Date('2026-01-31'),
    time: '19:00 WIB',
    venue: 'ICE BSD City Hall 5 & 6',
    city: 'Tangerang Selatan, Banten',
    promotor: 'AEG Presents Asia',
    ticketPlatform: 'Loket.com',
    ticketUrl: 'https://loket.com',
    priceRange: 'Rp 750.000 – Rp 3.500.000',
    priceMin: 750000, priceMax: 3500000,
    ticketCategories: [
      { name: 'Festival', price: 'Rp 750.000' },
      { name: 'Standing', price: 'Rp 1.200.000' },
      { name: 'CAT 3', price: 'Rp 1.800.000' },
      { name: 'CAT 2', price: 'Rp 2.500.000' },
      { name: 'VIP', price: 'Rp 3.500.000' },
    ],
    confirmStatus: 'confirmed', hot: false,
    description: 'ATEEZ menggebrak ICE BSD dalam tur dunia "In Your Fantasy". Penampilan perdana mereka di Jakarta disambut antusias oleh ribuan ATINY Indonesia.',
    sources: ['bandwagon.asia', 'chosun.com'],
  },
  {
    id: 'dream-theater-2026',
    artist: 'Dream Theater',
    tour: '40th Anniversary World Tour',
    genre: 'rock', emoji: '🎸',
    dates: ['7 Februari 2026'],
    rawDate: new Date('2026-02-07'),
    time: '20:00 WIB',
    venue: 'Beach City International Stadium',
    city: 'Ancol, Jakarta Utara',
    promotor: 'Mainstager Indonesia',
    ticketPlatform: 'Loket.com',
    ticketUrl: 'https://dreamtheaterjakarta2026.com',
    priceRange: 'Rp 900.000 – Rp 4.500.000',
    priceMin: 900000, priceMax: 4500000,
    ticketCategories: [
      { name: 'Festival B', price: 'Rp 900.000' },
      { name: 'Festival A', price: 'Rp 1.500.000' },
      { name: 'Tribun C', price: 'Rp 2.000.000' },
      { name: 'Tribun B', price: 'Rp 3.000.000' },
      { name: 'VIP', price: 'Rp 4.500.000' },
    ],
    confirmStatus: 'confirmed', hot: false,
    description: 'Dream Theater merayakan 40 tahun berkarya bersama formasi lengkap termasuk Mike Portnoy yang comeback setelah 14 tahun absen.',
    sources: ['dreamtheaterjakarta2026.com', 'metaltalk.net'],
  },
  {
    id: 'mcr-hammersonic-2026',
    artist: 'My Chemical Romance',
    tour: 'Hammersonic Festival 2026',
    genre: 'rock', emoji: '🖤',
    dates: ['3 Mei 2026'],
    rawDate: new Date('2026-05-03'),
    time: '20:30 WIB',
    venue: 'Pantai Carnaval Ancol',
    city: 'Jakarta Utara',
    promotor: 'Hammersonic',
    ticketPlatform: 'Loket.com',
    ticketUrl: 'https://loket.com',
    priceRange: 'Rp 950.000 – Rp 2.800.000',
    priceMin: 950000, priceMax: 2800000,
    ticketCategories: [
      { name: '1-Day Pass', price: 'Rp 950.000' },
      { name: '2-Day Pass', price: 'Rp 1.700.000' },
      { name: 'VIP 1-Day', price: 'Rp 1.800.000' },
      { name: 'VIP 2-Day', price: 'Rp 2.800.000' },
    ],
    confirmStatus: 'confirmed', hot: false,
    description: 'MCR headliner Hammersonic 2026 di Pantai Carnaval Ancol. Membawakan hits legendaris termasuk "Welcome to the Black Parade" dan "Helena".',
    sources: ['tempo.co', 'nme.com', 'kerrang.com'],
  },
  {
    id: 'laufey-jakarta-2026',
    artist: 'Laufey',
    tour: '"A Matter of Time" Tour',
    genre: 'jazz', emoji: '🌸',
    dates: ['23 Mei 2026'],
    rawDate: new Date('2026-05-23'),
    time: '20:00 WIB',
    venue: 'NICE PIK2',
    city: 'Pantai Indah Kapuk 2, Tangerang',
    promotor: 'Ismaya Live',
    ticketPlatform: 'Loket.com',
    ticketUrl: 'https://laufeyjakarta.com',
    priceRange: 'Rp 850.000 – Rp 3.200.000',
    priceMin: 850000, priceMax: 3200000,
    ticketCategories: [
      { name: 'GA', price: 'Rp 850.000' },
      { name: 'Tribune', price: 'Rp 1.400.000' },
      { name: 'CAT 2', price: 'Rp 2.000.000' },
      { name: 'CAT 1', price: 'Rp 2.600.000' },
      { name: 'VIP', price: 'Rp 3.200.000' },
    ],
    confirmStatus: 'confirmed', hot: false,
    description: 'Grammy Award-winning Laufey membawa "A Matter of Time" Tour ke Jakarta setelah sold out di Singapore. Memukau fans dengan nuansa jazz dan orkestra live.',
    sources: ['tempo.co', 'laufeyjakarta.com'],
  },
  {
    id: 'java-jazz-2026',
    artist: 'Java Jazz Festival 2026',
    tour: 'myBCA International Java Jazz Festival',
    genre: 'jazz', emoji: '🎷',
    dates: ['29 Mei 2026', '30 Mei 2026', '31 Mei 2026'],
    rawDate: new Date('2026-05-29'),
    time: '15:00 – 01:00 WIB',
    venue: 'NICE PIK2',
    city: 'Pantai Indah Kapuk 2, Tangerang',
    promotor: 'Java Festival Production',
    ticketPlatform: 'jfp.events',
    ticketUrl: 'https://jfp.events',
    priceRange: 'Cek jfp.events',
    priceMin: 0, priceMax: 0,
    ticketCategories: [
      { name: 'Daily Pass', price: 'Cek jfp.events' },
      { name: '3 Days Pass', price: 'Cek jfp.events' },
      { name: 'VIP Package', price: 'Cek jfp.events' },
    ],
    confirmStatus: 'confirmed', hot: false,
    description: 'Festival jazz terbesar Asia. Lineup 2026: Jon Batiste (Grammy ×8), Wave to Earth, Ella Mai, Daniel Caesar, Dave Koz & Summer Horns, Lisa Simone, Earth Wind & Fire by Al McKay.',
    lineup: ['Jon Batiste', 'Wave to Earth', 'Ella Mai', 'Daniel Caesar', 'Dave Koz & Summer Horns', 'Lisa Simone', 'Thee Sacred Souls', 'Earth Wind & Fire by Al McKay'],
    sources: ['thejakartapost.com', 'indiplomacy.com', 'javajazzfestival.com'],
  },

  {
    id: 'exo-exhorizon-jakarta-2026',
    artist: 'EXO',
    tour: 'EXO PLANET #6 – EXhOrizon',
    genre: 'kpop', emoji: '🌌',
    dates: ['6 Juni 2026', '7 Juni 2026'],
    rawDate: new Date('2026-06-06'),
    time: '19:00 WIB',
    venue: 'Indonesia Arena, GBK',
    city: 'Senayan, Jakarta Pusat',
    promotor: 'Dyandra Global Edutainment',
    ticketPlatform: 'Loket.com',
    ticketUrl: 'https://loket.com',
    priceRange: 'Rp 1.550.000 – Rp 5.000.000',
    priceMin: 1550000, priceMax: 5000000,
    ticketCategories: [
      { name: 'CAT 4', price: 'Rp 1.550.000' },
      { name: 'CAT 3', price: 'Rp 2.200.000' },
      { name: 'CAT 2', price: 'Rp 3.000.000' },
      { name: 'CAT 1', price: 'Rp 3.800.000' },
      { name: 'VIP',   price: 'Rp 5.000.000' },
    ],
    confirmStatus: 'confirmed', hot: false,
    description: 'EXO kembali ke Jakarta setelah bertahun-tahun! Tur EXO PLANET #6 EXhOrizon berlangsung 2 malam di Indonesia Arena. Lima member (Suho, Chanyeol, D.O., Kai, Sehun, Lay) tampil memukau di hadapan ribuan EXO-L Indonesia.',
    sources: ['cnbcindonesia.com', 'kapanlagi.com', 'indonesia.travel'],
  },

  // ── PAST: Green Day (Feb 2025) ──
  {
    id: 'green-day-jakarta-2025',
    artist: 'Green Day',
    tour: 'The Saviors Tour (Hammersonic 10th Anniversary)',
    genre: 'rock', emoji: '🟢',
    dates: ['15 Februari 2025'],
    rawDate: new Date('2025-02-15'),
    time: '21:00 WIB',
    venue: 'Pantai Carnaval Ancol',
    city: 'Jakarta Utara',
    promotor: 'Hammersonic / Rajawali Indonesia',
    ticketPlatform: 'Loket.com',
    ticketUrl: 'https://loket.com',
    priceRange: 'Rp 850.000 – Rp 2.500.000',
    priceMin: 850000, priceMax: 2500000,
    ticketCategories: [
      { name: '1-Day Pass', price: 'Rp 850.000' },
      { name: 'VIP 1-Day', price: 'Rp 1.800.000' },
      { name: 'VIP 2-Day', price: 'Rp 2.500.000' },
    ],
    confirmStatus: 'confirmed', hot: false,
    description: 'Green Day kembali ke Jakarta setelah 29 tahun absen! Headliner Hammersonic ke-10 di Carnaval Ancol. Billie Joe Armstrong cs membawakan hit klasik seperti Basket Case, American Idiot, dan Boulevard of Broken Dreams — pertama kalinya sejak 1996.',
    sources: ['greendayauthority.com', 'tempo.co', 'mothership.sg'],
  },

  /* ════════ UPCOMING CONFIRMED ════════ */
  {
    id: 'avenged-sevenfold-jakarta-2026',
    artist: 'Avenged Sevenfold (A7X)',
    tour: 'Asia Tour 2026',
    genre: 'rock', emoji: '💀',
    dates: ['10 Oktober 2026'],
    rawDate: new Date('2026-10-10'),
    time: '19:00 WIB',
    venue: 'Jakarta International Stadium (JIS)',
    city: 'Tanjung Priok, Jakarta Utara',
    promotor: 'Mainstager Indonesia',
    ticketPlatform: 'Loket.com',
    ticketUrl: 'https://loket.com',
    priceRange: 'Rp 665.000 – Rp 2.550.000',
    priceMin: 665000, priceMax: 2550000,
    ticketCategories: [
      { name: 'Festival',   price: 'Rp 665.000' },
      { name: 'Tribune D',  price: 'Rp 800.000' },
      { name: 'Tribune C',  price: 'Rp 1.000.000' },
      { name: 'Tribune B',  price: 'Rp 1.350.000' },
      { name: 'Tribune A',  price: 'Rp 1.750.000' },
      { name: 'Pit',        price: 'Rp 2.000.000' },
      { name: 'VIP',        price: 'Rp 2.550.000' },
    ],
    confirmStatus: 'confirmed', hot: true,
    description: 'Avenged Sevenfold kembali ke Indonesia setelah lebih dari satu dekade! M. Shadows, Synyster Gates, Zacky Vengeance, Johnny Christ & Brooks Wackerman tampil di JIS dalam Asia Tour 2026. Pre-sale via Deathbats Club 6 April, general sale 8 April.',
    sources: ['rri.co.id', 'bandwagon.asia', 'avengedsevenfold.com', 'indonesia.travel'],
  },
  {
    id: 'bryan-adams-jakarta-2026',
    artist: 'Bryan Adams & Ari Lasso',
    tour: 'Live in Jakarta',
    genre: 'rock', emoji: '🎸',
    dates: ['3 Oktober 2026'],
    rawDate: new Date('2026-10-03'),
    time: '19:30 WIB',
    venue: 'Beach City International Stadium',
    city: 'Ancol, Jakarta Utara',
    promotor: 'Produksi Lokal',
    ticketPlatform: 'Loket.com',
    ticketUrl: 'https://bryanadamsjakarta.com',
    priceRange: 'Cek bryanadamsjakarta.com',
    priceMin: 0, priceMax: 0,
    ticketCategories: [
      { name: 'Festival', price: 'Cek website resmi' },
      { name: 'Tribune',  price: 'Cek website resmi' },
      { name: 'VIP',      price: 'Cek website resmi' },
    ],
    confirmStatus: 'confirmed', hot: false,
    description: 'Kolaborasi spektakuler antara legenda rock Kanada Bryan Adams dengan raja pop Indonesia Ari Lasso! Dua dunia musik berbeda bersatu dalam satu malam di Ancol Beach City Stadium. Bryan Adams terkenal dengan hits Summer of 69, Run to You, dan Everything I Do.',
    sources: ['bryanadamsjakarta.com', 'shopee.co.id'],
  },
  {
    id: 'the-neighbourhood-jakarta-2026',
    artist: 'The Neighbourhood',
    tour: 'THE WOURLD TOUR',
    genre: 'pop', emoji: '🖤',
    dates: ['18 Juli 2026'],
    rawDate: new Date('2026-07-18'),
    time: '20:00 WIB',
    venue: 'Istora Senayan',
    city: 'Senayan, Jakarta Selatan',
    promotor: 'iMe Indonesia',
    ticketPlatform: 'Loket.com',
    ticketUrl: 'https://loket.com',
    priceRange: 'Rp 750.000 – Rp 2.800.000',
    priceMin: 750000, priceMax: 2800000,
    ticketCategories: [
      { name: 'Tribune',   price: 'Rp 750.000' },
      { name: 'CAT 2',    price: 'Rp 1.200.000' },
      { name: 'CAT 1',    price: 'Rp 1.800.000' },
      { name: 'Pit / GA', price: 'Rp 2.200.000' },
      { name: 'VIP',      price: 'Rp 2.800.000' },
    ],
    confirmStatus: 'confirmed', hot: true,
    description: 'The Neighbourhood (The NBHD) membawa THE WOURLD TOUR ke Jakarta — stop final Asia Tenggara mereka. Band indie-rock asal California ini terkenal dengan hits Sweater Weather, Stargazing, dan Afraid. Konser di Istora Senayan untuk kapasitas lebih intim.',
    sources: ['songkick.com', 'apple.com concerts', 'everythingindo.com'],
  },
  {
    id: 'lalala-fest-2026',
    artist: 'LaLaLa Festival 2026',
    tour: 'LaLaLa Fest 10th Anniversary',
    genre: 'indie', emoji: '🌈',
    dates: ['22 Agustus 2026', '23 Agustus 2026'],
    rawDate: new Date('2026-08-22'),
    time: '12:00 – 23:00 WIB',
    venue: 'JIEXPO Kemayoran',
    city: 'Kemayoran, Jakarta Pusat',
    promotor: 'LaLaLa Entertainment',
    ticketPlatform: 'Loket.com',
    ticketUrl: 'https://lalalafest.com',
    priceRange: 'Rp 600.000 – Rp 2.500.000',
    priceMin: 600000, priceMax: 2500000,
    ticketCategories: [
      { name: '1-Day Pass',         price: 'Rp 600.000' },
      { name: '2-Day Pass',         price: 'Rp 1.100.000' },
      { name: 'VIP 1-Day',          price: 'Rp 1.400.000' },
      { name: 'VIP 2-Day',          price: 'Rp 2.500.000' },
    ],
    confirmStatus: 'confirmed', hot: true,
    description: 'Festival indie-pop terbesar Indonesia kembali dengan lineup internasional kelas dunia! Headliners 2026: Steve Lacy, Rex Orange County, The Flaming Lips (Farewell Show), Two Door Cinema Club (15th Anniversary), Kodaline (Farewell Tour), HONNE, dan BE:FIRST. 60.000+ penonton hadir tiap tahun.',
    lineup: ['Steve Lacy', 'Rex Orange County', 'The Flaming Lips', 'Two Door Cinema Club', 'Kodaline', 'HONNE', 'BE:FIRST', 'Astrid S', 'Jordan Rakei', 'Matt Maltese', 'Flo'],
    sources: ['lalalafest.com', 'tokyohive.com', 'billboardphilippines.com'],
  },
  {
    id: 'the-weeknd-jakarta-2026',
    artist: 'The Weeknd',
    tour: '"After Hours Til Dawn" Stadium Tour Asia',
    genre: 'pop', emoji: '🌙',
    dates: ['26 September 2026', '27 September 2026'],
    rawDate: new Date('2026-09-26'),
    time: '19:00 WIB',
    venue: 'Jakarta International Stadium (JIS)',
    city: 'Tanjung Priok, Jakarta Utara',
    promotor: 'Live Nation Asia',
    ticketPlatform: 'Live Nation',
    ticketUrl: 'https://www.livenation.com',
    priceRange: 'Rp 1.000.000 – Rp 5.500.000',
    priceMin: 1000000, priceMax: 5500000,
    ticketCategories: [
      { name: 'Tribune D', price: 'Rp 1.000.000' },
      { name: 'Tribune C', price: 'Rp 1.600.000' },
      { name: 'Tribune B', price: 'Rp 2.200.000' },
      { name: 'Tribune A', price: 'Rp 3.000.000' },
      { name: 'Pit Standing', price: 'Rp 3.800.000' },
      { name: 'VIP Package', price: 'Rp 5.500.000' },
    ],
    confirmStatus: 'confirmed', hot: true,
    description: 'The Weeknd membawa tur stadion "After Hours Til Dawn" ke Jakarta 2 malam berturut-turut di JIS. Ini adalah leg final dari salah satu tur paling sukses dalam sejarah musik dunia, dengan produksi panggung yang spektakuler.',
    sources: ['karlobag.eu', 'billboard.com', 'afterhourstildawntour2026.com'],
  },
  {
    id: 'mcr-jis-2026',
    artist: 'My Chemical Romance',
    tour: '"Long Live the Black Parade" Asia Tour',
    genre: 'rock', emoji: '🖤',
    dates: ['22 November 2026'],
    rawDate: new Date('2026-11-22'),
    time: '19:00 WIB',
    venue: 'Jakarta International Stadium (JIS)',
    city: 'Tanjung Priok, Jakarta Utara',
    promotor: 'iMe Indonesia',
    ticketPlatform: 'tiket.com',
    ticketUrl: 'https://www.tiket.com/en-us/to-do/my-chemical-romance-live-in-jakarta-2026',
    priceRange: 'Rp 850.000 – Rp 4.000.000',
    priceMin: 850000, priceMax: 4000000,
    ticketCategories: [
      { name: 'Tribune D', price: 'Rp 850.000' },
      { name: 'Tribune C', price: 'Rp 1.200.000' },
      { name: 'Tribune B', price: 'Rp 1.800.000' },
      { name: 'Tribune A', price: 'Rp 2.500.000' },
      { name: 'Pit Standing', price: 'Rp 3.000.000' },
      { name: 'VIP', price: 'Rp 4.000.000' },
    ],
    confirmStatus: 'confirmed', hot: true,
    description: 'MCR kembali ke Jakarta untuk konser standalone penuh di JIS! Bagian dari tur "Long Live the Black Parade" — lebih megah dari penampilan Hammersonic. Konser penuh 2+ jam dengan seluruh katalog hits.',
    sources: ['tiket.com', 'mcrjakarta.com', 'thebeat.asia'],
  },
  {
    id: 'bts-jakarta-2026',
    artist: 'BTS',
    tour: 'BTS World Tour "ARIRANG"',
    genre: 'kpop', emoji: '💜',
    dates: ['26 Desember 2026', '27 Desember 2026'],
    rawDate: new Date('2026-12-26'),
    time: '18:00 WIB',
    venue: 'Gelora Bung Karno (GBK) Utama',
    city: 'Senayan, Jakarta Pusat',
    promotor: 'iMe Indonesia',
    ticketPlatform: 'btsworldtourofficial.com',
    ticketUrl: 'https://btsworldtourofficial.com',
    priceRange: 'Rp 1.800.000 – Rp 4.500.000',
    priceMin: 1800000, priceMax: 4500000,
    ticketCategories: [
      { name: 'CAT 4 (Tribune)', price: 'Rp 1.800.000' },
      { name: 'CAT 3 (Tribune)', price: 'Rp 2.500.000' },
      { name: 'CAT 2 (Pit)', price: 'Rp 3.200.000' },
      { name: 'CAT 1 (Floor)', price: 'Rp 3.800.000' },
      { name: 'Soundcheck VIP', price: 'Rp 4.500.000' },
    ],
    confirmStatus: 'confirmed', hot: true,
    description: 'BTS kembali ke Jakarta setelah 4 tahun! Tur "ARIRANG" hadir dengan stage 360° revolusioner di GBK Utama selama 2 malam. General on-sale via btsworldtourofficial.com. Presale ARMY dimulai 2 Juni 2026.',
    sources: ['tempo.co', 'billboard.com', 'ndtvprofit.com'],
  },

  {
    id: 'five-sos-jakarta-2026',
    artist: '5 Seconds of Summer (5SOS)',
    tour: 'EVERYONE\'S A STAR! World Tour',
    genre: 'pop', emoji: '⭐',
    dates: ['TBA – November 2026 (antara 12–15 Nov)'],
    rawDate: new Date('2026-11-13'),
    time: 'TBA',
    venue: 'TBA (kemungkinan NICE PIK2 atau ICE BSD)',
    city: 'Jakarta / Tangerang',
    promotor: 'Live Nation Asia',
    ticketPlatform: '5sosjakarta.com',
    ticketUrl: 'https://5sosjakarta.com',
    priceRange: 'Cek 5sosjakarta.com',
    priceMin: 0, priceMax: 0,
    ticketCategories: [
      { name: 'Tickets on sale: 12.00 PM WIB', price: 'Cek 5sosjakarta.com' },
    ],
    confirmStatus: 'confirmed', hot: true,
    description: '5 Seconds of Summer kembali ke Indonesia dalam tur dunia EVERYONE\'S A STAR! — mendukung album ke-6 mereka. Tur Asia mencakup Manila (11–12 Nov), Jakarta (TBA ~13–15 Nov), KL (17 Nov), Singapura (16 Nov), dan Tokyo (21 Nov). Website resmi 5sosjakarta.com sudah aktif.',
    sources: ['5sosjakarta.com', 'thesmartlocal.my', 'livenation.sg'],
  },
  {
    id: 'enhypen-jakarta-2027',
    artist: 'ENHYPEN',
    tour: 'BLOOD SAGA World Tour',
    genre: 'kpop', emoji: '🩸',
    dates: ['TBA – Early 2027 (kemungkinan Feb/Mar)'],
    rawDate: new Date('2027-02-01'),
    time: 'TBA',
    venue: 'TBA (kemungkinan ICE BSD atau Indonesia Arena)',
    city: 'Jakarta / Tangerang',
    promotor: 'TBA',
    ticketPlatform: 'TBA',
    ticketUrl: 'https://enhypenbloodsagatour.com',
    priceRange: 'Belum diumumkan',
    priceMin: 0, priceMax: 0,
    ticketCategories: [{ name: 'Semua kategori', price: 'Belum diumumkan' }],
    confirmStatus: 'rumor', hot: true,
    rumorDetail: 'Chosun.com (Mar 2026) menyebut ENHYPEN akan tour ke Jakarta sebagai bagian BLOOD SAGA World Tour "by March next year" (2027). Namun tanggal dan venue spesifik BELUM diumumkan secara resmi.',
    description: 'ENHYPEN mengumumkan tur dunia BLOOD SAGA (2026–2027) yang sangat luas. Indonesia disebut sebagai salah satu stop Asia di awal 2027. Detail tanggal & venue untuk Jakarta masih menunggu pengumuman resmi.',
    sources: ['chosun.com', 'kpopnewswire.com', 'enhypenbloodsagatour.com'],
  },
  // ── RUMOR: Byeon Woo-seok ──
  {
    id: 'byeon-woo-seok-jakarta-2026',
    artist: 'Byeon Woo-seok',
    tour: '2026 Fan Meeting Tour "The Secret Library"',
    genre: 'kpop', emoji: '📚',
    dates: ['TBA – Late 2026 / Early 2027'],
    rawDate: new Date('2026-11-01'),
    time: 'TBA',
    venue: 'TBA',
    city: 'Jakarta',
    promotor: 'TBA',
    ticketPlatform: 'TBA',
    ticketUrl: 'https://instagram.com/varoentertainment',
    priceRange: 'Belum diumumkan',
    priceMin: 0, priceMax: 0,
    ticketCategories: [{ name: 'Semua kategori', price: 'Belum diumumkan' }],
    confirmStatus: 'rumor', hot: true,
    rumorDetail: 'VARO Entertainment mengumumkan tur Asia "The Secret Library" per 9 Juni 2026, dengan Jakarta sebagai salah satu stop. Tanggal dan venue spesifik BELUM diumumkan. Hanya teaser kota saja yang dirilis.',
    description: 'Aktor Korea Byeon Woo-seok (Lovely Runner) mengumumkan fan meeting tur Asia 2026 bertema "The Secret Library". Jakarta masuk daftar kota bersama Seoul, Bangkok, Yokohama, Taipei, Singapore, Manila, dan Hong Kong.',
    sources: ['chosun.com', 'gmanetwork.com', 'asiaone.com'],
  },

  // ── RUMOR: aespa ──
  {
    id: 'aespa-jakarta-rumor',
    artist: 'aespa',
    tour: 'SYNK : COMPLæXITY World Tour',
    genre: 'kpop', emoji: '🤖',
    dates: ['TBA – Late 2026 / Early 2027'],
    rawDate: new Date('2026-12-01'),
    time: 'TBA',
    venue: 'TBA (kemungkinan ICE BSD atau NICE PIK2)',
    city: 'Jakarta / Tangerang',
    promotor: 'Belum diumumkan',
    ticketPlatform: 'TBA',
    ticketUrl: 'https://aespaworldtour.com',
    priceRange: 'Belum diumumkan',
    priceMin: 0, priceMax: 0,
    ticketCategories: [{ name: 'Semua kategori', price: 'Belum diumumkan' }],
    confirmStatus: 'rumor', hot: true,
    rumorDetail: 'Tour "SYNK : COMPLæXITY" resmi diumumkan Live Nation (Apr 2026) dengan stop Asia, namun tanggal & venue Indonesia BELUM dikonfirmasi. Ticketing Asia diumumkan "at a later date". Fans Indo sangat berharap dapat giliran.',
    description: 'aespa mengumumkan tur dunia "SYNK : COMPLæXITY" (Agu 2026 – Feb 2027) via Live Nation. Negara Asia yang dikunjungi belum dirinci secara lengkap. Indonesia adalah target kuat mengingat basis fan besar.',
    sources: ['livenation.com', 'justjared.com', 'aespaworldtour.com'],
  },
  {
    id: 'ed-sheeran-jakarta-rumor',
    artist: 'Ed Sheeran',
    tour: 'LOOP Tour',
    genre: 'pop', emoji: '🎶',
    dates: ['TBA – 2026 (pernah dibatalkan, janji kembali)'],
    rawDate: new Date('2026-10-01'),
    time: 'TBA',
    venue: 'TBA',
    city: 'Jakarta',
    promotor: 'TBA',
    ticketPlatform: 'TBA',
    ticketUrl: 'https://edsheeran.com',
    priceRange: 'Belum diumumkan',
    priceMin: 0, priceMax: 0,
    ticketCategories: [{ name: 'Semua kategori', price: 'TBA' }],
    confirmStatus: 'rumor', hot: false,
    rumorDetail: 'Ed Sheeran pernah cancel konser Jakarta dan berjanji kembali (laporan Coconuts.co). LOOP Tour 2026 saat ini fokus ke Australia, NZ, dan Amerika. Indonesia belum masuk jadwal resmi.',
    description: 'Ed Sheeran sedang dalam LOOP Tour 2026. Meski belum ada tanggal resmi untuk Indonesia, riwayat konsernya di Jakarta dan janjinya untuk kembali membuat rumor ini terus bergulir kencang.',
    sources: ['coconuts.co', 'wikipedia.org (Loop Tour)'],
  },
  {
    id: 'coldplay-jakarta-rumor',
    artist: 'Coldplay',
    tour: 'Music of the Spheres World Tour (Potential Return)',
    genre: 'pop', emoji: '🪐',
    dates: ['TBA – 2027 (kemungkinan)'],
    rawDate: new Date('2027-01-01'),
    time: 'TBA',
    venue: 'TBA (kemungkinan GBK)',
    city: 'Jakarta',
    promotor: 'TBA',
    ticketPlatform: 'TBA',
    ticketUrl: 'https://coldplay.com',
    priceRange: 'Belum diumumkan',
    priceMin: 0, priceMax: 0,
    ticketCategories: [{ name: 'Semua kategori', price: 'TBA' }],
    confirmStatus: 'rumor', hot: true,
    rumorDetail: 'Coldplay pause tur setelah Wembley Sep 2025 dan akan restart 2027. Konser Jakarta 2023 sangat sukses. Spekulasi return 2027 sangat kuat di komunitas fans. BELUM ada konfirmasi resmi dari band maupun promotor.',
    description: 'Setelah konser fenomenal di GBK (2023), Coldplay dirumorkan kembali untuk leg 2027 dari Music of the Spheres World Tour. Tur mereka restart 2027 setelah jeda panjang — Indonesia jadi salah satu kandidat terkuat.',
    sources: ['wikipedia.org (MOTSWT)', 'coldplaytour.org'],
  },
  // ── RUMOR: Dua Lipa (reschedule) ──
  {
    id: 'dua-lipa-jakarta-rumor',
    artist: 'Dua Lipa',
    tour: 'Reschedule Radical Optimism / New Tour',
    genre: 'pop', emoji: '💃',
    dates: ['TBA – 2026/2027 (reschedule belum diumumkan)'],
    rawDate: new Date('2027-01-01'),
    time: 'TBA',
    venue: 'TBA',
    city: 'Jakarta',
    promotor: 'TBA',
    ticketPlatform: 'TBA',
    ticketUrl: 'https://dualipa.com',
    priceRange: 'Belum diumumkan',
    priceMin: 0, priceMax: 0,
    ticketCategories: [{ name: 'Semua kategori', price: 'TBA' }],
    confirmStatus: 'rumor', hot: false,
    rumorDetail: 'Dua Lipa membatalkan konser Jakarta (9 Nov 2024) menit terakhir karena masalah keamanan panggung — meninggalkan ribuan fans kecewa. Belum ada pengumuman resmi reschedule atau konser baru ke Indonesia.',
    description: 'Dua Lipa pernah cancel detik terakhir saat hendak tampil di Indonesia Arena (Nov 2024) karena unsafe staging. Fans Indonesia masih berharap ia kembali untuk menebus kekecewaan tersebut. Hingga kini belum ada konfirmasi.',
    sources: ['bandwagon.asia', 'deadline.com', 'billboard.com'],
  },

  // ── RUMOR: Taylor Swift ──
  {
    id: 'taylor-swift-jakarta-rumor',
    artist: 'Taylor Swift',
    tour: 'New Tour (TBA)',
    genre: 'pop', emoji: '✨',
    dates: ['TBA – Belum ada indikasi jelas'],
    rawDate: new Date('2027-06-01'),
    time: 'TBA',
    venue: 'TBA',
    city: 'Jakarta',
    promotor: 'TBA',
    ticketPlatform: 'TBA',
    ticketUrl: 'https://taylorswift.com',
    priceRange: 'Belum diumumkan',
    priceMin: 0, priceMax: 0,
    ticketCategories: [{ name: 'Semua kategori', price: 'TBA' }],
    confirmStatus: 'rumor', hot: true,
    rumorDetail: 'Eras Tour tidak mampir ke Indonesia — kekecewaan terbesar jutaan Swifties. Taylor Swift belum mengumumkan tur baru untuk 2026/2027. Rumor ini murni harapan fans dan belum ada konfirmasi apapun dari pihak resmi.',
    description: 'Rumor Taylor Swift ke Jakarta selalu muncul setiap tahun. Pemerintah Indonesia bahkan pernah aktif mengupayakan konser Taylor Swift. Sampai saat ini tidak ada konfirmasi resmi dari manajemen maupun promotor manapun.',
    sources: ['stylecaster.com', 'jakartaglobe.id'],
  },
];

/* ============================================
   UTILITY
   ============================================ */
const isPast   = c => c.rawDate < TODAY;
const isRumor  = c => c.confirmStatus === 'rumor';
const genreLabel = g => ({ kpop:'K-Pop', pop:'Pop / R&B', rock:'Rock / Metal', jazz:'Jazz', indie:'Indie / Festival' }[g] || g);

/* ============================================
   RENDER CARDS
   ============================================ */
function getArtistImage(id) {
  return ARTIST_IMAGES[id] || null;
}

function renderCards(list) {
  const grid     = document.getElementById('concertsGrid');
  const noResult = document.getElementById('noResult');

  if (!list.length) {
    grid.innerHTML = '';
    noResult.classList.remove('hidden');
    return;
  }
  noResult.classList.add('hidden');

  grid.innerHTML = list.map(c => {
    const past  = isPast(c);
    const rumor = isRumor(c);
    const statusLabel = past ? 'Sudah Lewat' : rumor ? 'Rumor' : 'Confirmed';
    const statusClass = past ? 'badge-status-past' : rumor ? 'badge-status-rumor' : 'badge-status-upcoming';
    const priceDisplay = c.priceMin > 0
      ? `Rp ${(c.priceMin/1e6).toFixed(1).replace('.0','')}jt – Rp ${(c.priceMax/1e6).toFixed(1).replace('.0','')}jt`
      : rumor ? '⚠️ Belum diumumkan' : c.priceRange;
    const img = getArtistImage(c.id);
    const cardBgStyle = img
      ? `style="background-image:url('${img}');background-size:cover;background-position:center top;"`
      : '';

    return `
      <div class="concert-card${past?' past':''}${rumor?' rumor-card':''}" onclick="openModal('${c.id}')">
        <div class="card-header${img?' has-photo':''}" ${cardBgStyle}>
          ${!img ? `<div class="card-bg-emoji">${c.emoji}</div>` : ''}
          <div class="card-overlay"></div>
          <div class="card-badges">
            <span class="badge badge-genre-${c.genre}">${genreLabel(c.genre)}</span>
            <span class="badge ${statusClass}">${past?'':'rumor'===c.confirmStatus?'🔮 ':'✅ '}${statusLabel}</span>
            ${c.hot ? '<span class="badge badge-hot">🔥 Hot</span>' : ''}
          </div>
        </div>
        <div class="card-body">
          <div class="card-artist">${c.artist}</div>
          <div class="card-tour">${c.tour}</div>
          ${rumor ? '<div class="rumor-banner">⚠️ Belum ada pengumuman resmi</div>' : ''}
          <div class="card-meta">
            <div class="meta-row"><span class="meta-icon">📅</span><span class="meta-text"><strong>${c.dates.join(' &amp; ')}</strong></span></div>
            <div class="meta-row"><span class="meta-icon">🕐</span><span class="meta-text">${c.time}</span></div>
            <div class="meta-row"><span class="meta-icon">📍</span><span class="meta-text"><strong>${c.venue}</strong><br>${c.city}</span></div>
            <div class="meta-row"><span class="meta-icon">🎟️</span><span class="meta-text">${c.promotor}</span></div>
          </div>
          <div class="card-price${rumor?' card-price-rumor':''}">
            <div>
              <div class="price-label">${rumor ? '⚠️ Status Harga' : 'Harga Tiket'}</div>
              <div class="price-range">${priceDisplay}</div>
            </div>
            <span style="font-size:1.4rem">${rumor ? '❓' : '💳'}</span>
          </div>
          <div class="card-footer">
            ${!past && !rumor
              ? `<a class="btn btn-primary" href="${c.ticketUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">🎫 Beli Tiket</a>`
              : rumor
                ? `<button class="btn btn-rumor" onclick="openModal('${c.id}');event.stopPropagation()">🔮 Lihat Detail</button>`
                : `<button class="btn btn-disabled" disabled>Konser Selesai</button>`
            }
            <button class="btn btn-secondary" onclick="openModal('${c.id}');event.stopPropagation()">Detail ›</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ============================================
   RENDER HIGHLIGHTS
   ============================================ */
function renderHighlights() {
  const row   = document.getElementById('highlightsRow');
  const picks = CONCERTS.filter(c => !isPast(c)).slice(0, 5);

  row.innerHTML = picks.map(c => {
    const img = getArtistImage(c.id);
    const bgStyle = img
      ? `style="background-image:url('${img}');background-size:cover;background-position:center top;"`
      : '';
    return `
    <div class="highlight-card${isRumor(c)?' highlight-rumor':''}${img?' has-photo':''}" onclick="openModal('${c.id}')" ${bgStyle}>
      <div class="hl-overlay"></div>
      <div class="hl-content">
        ${!img ? `<span class="hl-emoji">${c.emoji}</span>` : ''}
        <div class="hl-artist">${c.artist}</div>
        ${isRumor(c) ? '<div class="hl-rumor-badge">🔮 Rumor</div>' : ''}
        <div class="hl-date">📅 ${c.dates[0]}</div>
        <div class="hl-desc">${c.venue} · ${c.city.split(',')[0]}</div>
      </div>
    </div>`;
  }).join('');
}

/* ============================================
   MODAL
   ============================================ */
function openModal(id) {
  const c = CONCERTS.find(x => x.id === id);
  if (!c) return;
  const past  = isPast(c);
  const rumor = isRumor(c);

  const ticketHtml = c.ticketCategories.map(t =>
    `<div class="ticket-cat"><span class="ticket-cat-name">${t.name}</span><span class="ticket-cat-price">${t.price}</span></div>`
  ).join('');

  const lineupHtml = c.lineup
    ? `<div class="lineup-tags">${c.lineup.map(a=>`<span class="lineup-tag">${a}</span>`).join('')}</div>`
    : '';

  const rumorBoxHtml = rumor && c.rumorDetail
    ? `<div class="rumor-detail-box"><div class="rumor-detail-title">🔮 Kenapa ini masih Rumor?</div><p>${c.rumorDetail}</p></div>`
    : '';

  const img = getArtistImage(c.id);
  const heroStyle = img ? `style="background-image:url('${img}');background-size:cover;background-position:center 20%;"` : '';

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-hero${img ? ' modal-hero-photo' : ''}" ${heroStyle}>
      ${img ? '<div class="modal-hero-overlay"></div>' : ''}
      <div class="modal-hero-inner">
        ${!img ? `<span class="modal-emoji">${c.emoji}</span>` : ''}
        <div class="modal-artist">${c.artist}</div>
        <div class="modal-tour">${c.tour}</div>
        <div class="modal-badges">
          <span class="badge badge-genre-${c.genre}">${genreLabel(c.genre)}</span>
          <span class="badge badge-status-${past?'past':rumor?'rumor':'upcoming'}">${past?'Sudah Lewat':rumor?'🔮 Rumor':'✅ Confirmed'}</span>
          ${c.hot ? '<span class="badge badge-hot">🔥 Hot</span>' : ''}
        </div>
      </div>
    </div>
    ${rumorBoxHtml}
    <div class="modal-details">
      <div class="detail-box"><div class="detail-label">📅 Tanggal</div><div class="detail-value">${c.dates.join('<br>')}</div></div>
      <div class="detail-box"><div class="detail-label">🕐 Jam Mulai</div><div class="detail-value">${c.time}</div></div>
      <div class="detail-box" style="grid-column:1/-1"><div class="detail-label">📍 Venue</div><div class="detail-value">${c.venue}<br><span style="font-weight:400;color:var(--text-sub);font-size:0.85rem">${c.city}</span></div></div>
      <div class="detail-box"><div class="detail-label">🎟️ Promotor</div><div class="detail-value">${c.promotor}</div></div>
      <div class="detail-box"><div class="detail-label">💳 Platform Tiket</div><div class="detail-value">${c.ticketPlatform}</div></div>
      <div class="detail-box" style="grid-column:1/-1"><div class="detail-label">💰 Range Harga</div><div class="detail-value price-color">${c.priceRange}</div></div>
    </div>
    <div class="modal-desc">${c.description}</div>
    ${lineupHtml ? `<div class="modal-ticket-area"><h4>🎤 Lineup</h4>${lineupHtml}</div>` : ''}
    <div class="modal-ticket-area"><h4>🎫 Kategori Tiket</h4><div class="ticket-categories">${ticketHtml}</div></div>
    <div class="modal-actions">
      ${!past && !rumor
        ? `<a class="btn btn-primary" href="${c.ticketUrl}" target="_blank" rel="noopener">🎫 Beli Tiket Sekarang</a>`
        : rumor
          ? `<a class="btn btn-rumor-outline" href="${c.ticketUrl}" target="_blank" rel="noopener">🔔 Pantau Info Resmi</a>`
          : `<button class="btn btn-disabled" disabled>Konser Telah Selesai</button>`
      }
    </div>
    <div class="modal-disclaimer">
      ${rumor
        ? '⚠️ <b>DISCLAIMER:</b> Konser ini BELUM dikonfirmasi secara resmi. Jangan beli tiket dari pihak tidak resmi!'
        : '⚠️ <b>Disclaimer:</b> Harga tiket dapat berubah. Selalu cek platform resmi sebelum membeli.'
      }
    </div>
    ${c.sources ? `<div class="modal-sources">Sumber: ${c.sources.join(' · ')}</div>` : ''}
  `;

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ============================================
   FILTER & SEARCH
   ============================================ */
let activeFilter = 'all';
let searchQuery  = '';

function applyFilters() {
  let result = [...CONCERTS];

  if      (activeFilter === 'kpop')      result = result.filter(c => c.genre === 'kpop');
  else if (activeFilter === 'pop')       result = result.filter(c => c.genre === 'pop');
  else if (activeFilter === 'rock')      result = result.filter(c => c.genre === 'rock');
  else if (activeFilter === 'jazz')      result = result.filter(c => c.genre === 'jazz');
  else if (activeFilter === 'indie')     result = result.filter(c => c.genre === 'indie');
  else if (activeFilter === 'confirmed') result = result.filter(c => c.confirmStatus === 'confirmed' && !isPast(c));
  else if (activeFilter === 'rumor')     result = result.filter(c => isRumor(c));
  else if (activeFilter === 'upcoming')  result = result.filter(c => !isPast(c));
  else if (activeFilter === 'past')      result = result.filter(c => isPast(c));

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(c =>
      c.artist.toLowerCase().includes(q) ||
      c.tour.toLowerCase().includes(q) ||
      c.venue.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (c.lineup && c.lineup.some(a => a.toLowerCase().includes(q)))
    );
  }

  renderCards(result);
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    activeFilter = this.dataset.filter;
    applyFilters();
    document.getElementById('concertsGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.getElementById('searchInput').addEventListener('input', function () {
  searchQuery = this.value;
  applyFilters();
});

/* ============================================
   NAVBAR SCROLL
   ============================================ */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

/* ============================================
   STATS
   ============================================ */
function updateStats() {
  document.getElementById('totalConcerts').textContent  = CONCERTS.length;
  document.getElementById('confirmedCount').textContent = CONCERTS.filter(c => c.confirmStatus === 'confirmed' && !isPast(c)).length;
  document.getElementById('rumorCount').textContent     = CONCERTS.filter(c => isRumor(c)).length;
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  renderCards(CONCERTS);
  renderHighlights();
});
