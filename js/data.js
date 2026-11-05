// Content taken from theritzclinic.com and the clinic's November 2569 doctor schedule.
export const BRANCHES = [
  { id: 'townintown', th: 'ทาวน์อินทาวน์', en: 'Town in Town', phone: '094-689-1666', open: '10:00', close: '20:00', lat: 13.776, lng: 100.611 },
  { id: 'ari', th: 'อารีย์', en: 'Ari', phone: '094-847-3666', open: '10:00', close: '20:00', lat: 13.780, lng: 100.544 },
  { id: 'bangna', th: 'เดอะกลาส มาร์เก็ต บางนา', en: 'The Glass Market Bangna', phone: '080-576-3666', open: '10:30', close: '20:30', lat: 13.660, lng: 100.655 },
  { id: 'rama2', th: 'เซ็นทรัลพระราม 2', en: 'Central Rama 2', phone: '061-947-6222', open: '10:30', close: '20:30', lat: 13.664, lng: 100.437 },
  { id: 'ics', th: 'ไอซีเอส', en: 'ICS', phone: '082-492-5444', open: '10:30', close: '20:30', lat: 13.727, lng: 100.508 },
  { id: 'westville', th: 'เซ็นทรัลเวสต์วิลล์', en: 'Central Westville', phone: '062-819-6663', open: '10:30', close: '20:30', lat: 13.818, lng: 100.444 },
  { id: 'siam', th: 'สยามสแควร์', en: 'Siam Square', phone: '082-365-2666', open: '10:00', close: '20:00', lat: 13.745, lng: 100.533 },
  { id: 'bangkapi', th: 'เดอะมอลล์บางกะปิ', en: 'The Mall Bangkapi', phone: '081-454-8299', open: '10:00', close: '20:00', lat: 13.766, lng: 100.643 },
  { id: 'rangsit', th: 'ฟิวเจอร์พาร์ครังสิต', en: 'Future Park Rangsit', phone: '061-752-2666', open: '10:30', close: '20:30', lat: 13.989, lng: 100.617 },
  { id: 'northville', th: 'เซ็นทรัลนอร์ทวิลล์', en: 'Central Northville', phone: '062-689-2523', open: '10:30', close: '20:30', lat: 13.905, lng: 100.525 },
  { id: 'pinklao', th: 'เซ็นทรัลปิ่นเกล้า', en: 'Central Pinklao', phone: '062-636-5747', open: '10:30', close: '20:30', lat: 13.778, lng: 100.476 },
  { id: 'seacon', th: 'ซีคอนสแควร์ ศรีนครินทร์', en: 'Seacon Square Srinakarin', phone: '094-888-7298', open: '10:30', close: '20:30', lat: 13.694, lng: 100.648 },
];

// Monday to Sunday, from the November 2569 schedule on the About Us page.
export const SCHEDULE = {
  townintown: [['ปาล์ม'], ['น็อต', 'แพรแพร'], ['เบียร์'], ['อาอี้'], [], ['หงส์หยก'], ['อาอี้']],
  ari: [['แพร'], ['ณิ', 'พลอย'], ['เพพ'], ['เบียร์', 'แฮม'], ['หงส์หยก'], ['แพร'], ['พี']],
  bangna: [['โย่'], ['ปาล์ม'], ['แพรแพร', 'ลิลลี่'], ['พลอย'], ['แพรแพร', 'ลิลลี่'], ['พลอย', 'โย่'], ['พลอย', 'น็อต', 'โย่']],
  rama2: [['หงส์หยก'], ['นุ๊ก'], ['แพรแพร', 'พี'], ['แพรแพร', 'ลิลลี่'], ['เบียร์'], ['ลิลลี่'], ['เบียร์']],
  ics: [['เพพ', 'ณิ'], ['พี'], ['พลอย'], ['แพรแพร', 'แฮม'], ['โย่'], ['น็อต'], ['นุ๊ก']],
  siam: [['นุ๊ก'], ['ลิลลี่'], ['ณิ'], ['หงส์หยก'], ['นุ๊ก', 'น็อต'], ['เพพ', 'เบียร์', 'พี'], ['พลอย', 'เพพ']],
  westville: [['น็อต'], ['พี'], ['นุ๊ก', 'น็อต'], ['เบียร์', 'โย่'], ['พี'], ['นุ๊ก'], ['ณิ', 'ลิลลี่']],
  bangkapi: [['แพรแพร'], ['พลอย'], [], [], ['เพพ', 'แฮม'], ['โย่', 'ณิ'], ['เตย']],
  rangsit: [['เบียร์'], ['น็อต', 'แพร'], ['แฮม'], ['เตย'], ['พลอย'], ['เตย'], ['โย่', 'แฮม']],
  northville: [['ณิ'], ['เตย'], ['เพพ', 'หงส์หยก'], [], ['แพรแพร', 'แฮม'], ['ณิ', 'แฮม'], ['น็อต']],
  pinklao: [[], ['โย่'], [], ['ณิ', 'เพพ'], ['อาอี้'], ['เบียร์', 'ณิ', 'แฮม'], ['นุ๊ก']],
  seacon: [['ณิ', 'แฮม'], [], ['แฮม'], [], [], ['อาอี้', 'เตย'], ['แพรแพร']],
};

const S = 'https://theritzclinic.com/service/';
export const T = {
  pico: { name: 'Pico Laser', id: 4341, url: 'treatment.html?id=4341' },
  picoSmooth: { name: 'Pico Smooth / Pico Bright', id: 4342, url: 'treatment.html?id=4342' },
  picoVario: { name: 'PICO VarioPulse', id: 562000, url: 'treatment.html?id=562000' },
  thermage: { name: 'New Thermage FLX', id: 4221, url: 'treatment.html?id=4221' },
  rejuran: { name: 'Rejuran', id: 395323, url: 'treatment.html?id=395323' },
  exion: { name: 'EXION Microneedle RF', id: 557139, url: 'treatment.html?id=557139' },
  glow: { name: 'Glow Factor', id: 395880, url: 'treatment.html?id=395880' },
  belotero: { name: 'Belotero Revive', id: 395018, url: 'treatment.html?id=395018' },
  oligio: { name: 'Oligio X', id: 682515, url: 'treatment.html?id=682515' },
  accure: { name: 'Accure Acne Laser', id: 557783, url: 'treatment.html?id=557783' },
  vbeam: { name: 'Vbeam Perfecta', id: 509437, url: 'treatment.html?id=509437' },
  elite: { name: 'Elite 4D Hair Removal', id: 515783, url: 'treatment.html?id=515783' },
  moveo: { name: 'Moveo Red Laser', id: 4211, url: 'treatment.html?id=4211' },
  cool: { name: 'CoolSculpting', id: 544988, url: 'treatment.html?id=544988' },
  sculptra: { name: 'Sculptra', id: 228429, url: 'treatment.html?id=228429' },
  radiesse: { name: 'Radiesse', id: 509793, url: 'treatment.html?id=509793' },
  filler: { name: 'Filler', id: 4200, url: 'treatment.html?id=4200' },
  ulthera: { name: 'Ulthera SPT', id: 4372, url: 'treatment.html?id=4372' },
  mpt: { name: 'Ultraformer MPT', id: 4378, url: 'treatment.html?id=4378' },
  botox: { name: 'Botulinum Toxin', id: 4123, url: 'treatment.html?id=4123' },
  emface: { name: 'EMFACE', id: 515967, url: 'treatment.html?id=515967' },
};

// The five layers behind "โปรแกรมยกหน้า 5 ชั้น". Floor 1 is the skin surface, floor 5 the deepest.
export const FLOORS = [
  { n: 1, th: 'ผิวชั้นนอก', en: 'Skin surface', note: 'จุดด่างดำ ฝ้า กระ และสีผิวไม่สม่ำเสมอ', noteEn: 'Dark spots, melasma, freckles and uneven skin tone', items: ['pico', 'picoSmooth', 'picoVario'] },
  { n: 2, th: 'ผิวชั้นหนังแท้', en: 'Dermis', note: 'คอลลาเจน ความชุ่มชื้น รูขุมขน รอยแดงและสิว', noteEn: 'Collagen, hydration, pores, redness and acne', items: ['thermage', 'oligio', 'rejuran', 'exion', 'glow', 'belotero', 'vbeam', 'accure', 'elite', 'moveo'] },
  { n: 3, th: 'ชั้นไขมัน', en: 'Fat layer', note: 'ไขมันส่วนเกินและการเติมเต็มมิติใบหน้า', noteEn: 'Excess fat, and volume to restore the shape of the face', items: ['filler', 'sculptra', 'radiesse', 'cool'] },
  { n: 4, th: 'ชั้นพังผืด SMAS', en: 'SMAS', note: 'ชั้นเดียวกับที่ศัลยแพทย์ยกในการผ่าตัดดึงหน้า', noteEn: 'The same layer a surgeon lifts in a facelift', items: ['ulthera', 'mpt'] },
  { n: 5, th: 'ชั้นกล้ามเนื้อ', en: 'Muscle', note: 'ริ้วรอยจากการขยับหน้าและกรอบหน้า', noteEn: 'Expression lines and the jawline', items: ['botox', 'emface'] },
];

export const CONCERNS = {
  face: [
    { en: 'Sagging skin', th: 'หน้าหย่อนคล้อย', items: ['ulthera', 'mpt', 'thermage', 'oligio'] },
    { en: 'Wrinkles', th: 'ริ้วรอย', items: ['botox', 'thermage', 'rejuran'] },
    { en: 'Acne and acne scars', th: 'สิวและหลุมสิว', items: ['accure', 'pico', 'vbeam', 'exion'] },
    { en: 'Melasma and dark spots', th: 'ฝ้า กระ จุดด่างดำ', items: ['pico', 'picoSmooth', 'picoVario'] },
    { en: 'Dull, dehydrated skin', th: 'ผิวหมอง ขาดน้ำ', items: ['glow', 'rejuran', 'belotero'] },
    { en: 'Face shape and volume', th: 'ปรับรูปหน้า เติมเต็ม', items: ['filler', 'sculptra', 'radiesse'] },
  ],
  body: [
    { en: 'Stubborn fat', th: 'ไขมันส่วนเกิน', items: ['cool', 'mpt'] },
    { en: 'Hair removal', th: 'กำจัดขน', items: ['elite', 'moveo'] },
    { en: 'Firmer body skin', th: 'ผิวกายกระชับ', items: ['sculptra', 'radiesse'] },
  ],
};

export const PROMOS = [
  { title: 'โปรแกรมยกหน้า 5 ชั้น', titleEn: '5-Layer Face Lift Program', price: '9,900', unit: 'เฉลี่ยเดือนละ', unitEn: 'Average per month', note: 'ยกกระชับโครงสร้างผิวตาม Facial Anatomy', noteEn: 'Lifts the skin structure following facial anatomy', url: 'https://theritzclinic.com/product/โปรแกรมยกหน้า-5-ชั้น/' },
  { title: 'Ultherapy Prime 300 Shots', titleEn: 'Ultherapy Prime 300 Shots', price: '39,000', unit: 'ราคา', unitEn: 'Price', note: 'จองวันนี้ แถมฟรี Program Ultraformer MPT 100 lines', noteEn: 'Book today and get Ultraformer MPT 100 lines free', url: 'https://theritzclinic.com/product/ulthera-prime/' },
];

export const ARTICLES = [
  { title: 'Personalized Vitamin จัดวิตามินและสารอาหารเฉพาะบุคคล', titleEn: 'Personalized Vitamin: vitamins and nutrients matched to you', date: '21 ต.ค. 2569', dateEn: '21 Oct 2026', url: 'https://theritzclinic.com/personalized-vitamin/' },
  { title: 'Personalized IV Therapy สูตร IV Therapy ที่ออกแบบเฉพาะคุณ', titleEn: 'Personalized IV Therapy: a drip formula designed for you', date: '21 ต.ค. 2569', dateEn: '21 Oct 2026', url: 'https://theritzclinic.com/personalized-iv-therapy/' },
  { title: 'Vitality DNA Code เข้าใจรหัสพันธุกรรม เพื่อวางแผนดูแลสุขภาพเฉพาะคุณ', titleEn: 'Vitality DNA Code: reading your genes to plan your health care', date: '21 ต.ค. 2569', dateEn: '21 Oct 2026', url: 'https://theritzclinic.com/vitality-dna-code/' },
];

export const LINE_URL = 'https://line.me/ti/p/@theritzclinic';

// Doctor nicknames as romanised for the English version.
export const DOCTOR_EN = { 'ปาล์ม': 'Palm', 'น็อต': 'Not', 'แพรแพร': 'Praeprae', 'เบียร์': 'Beer', 'อาอี้': 'Aee', 'หงส์หยก': 'Hongyok', 'แพร': 'Prae', 'ณิ': 'Ni', 'พลอย': 'Ploy', 'เพพ': 'Pep', 'แฮม': 'Ham', 'โย่': 'Yo', 'ลิลลี่': 'Lily', 'นุ๊ก': 'Nook', 'พี': 'Pee', 'เตย': 'Toey', 'ริท': 'Ritz', 'อั๋น': 'Aun', 'แม็ก': 'Mac' };

const UP = 'https://theritzclinic.com/wp-content/uploads/';

// Branch addresses and directions, from theritzclinic.com/contact-us/.
export const ADDR = {
  townintown: { th: 'เลขที่ 345/6 โครงการเฮดควอเทอร์ส เอกมัย-ลาดพร้าว ซอยลาดพร้าว 94 (ปัญจมิตร) แขวงพลับพลา เขตวังทองหลาง กรุงเทพมหานคร 10310', en: '345/6 Headquarters Ekkamai-Ladprao, Soi Ladprao 94 (Panjamit), Phlapphla, Wang Thonglang, Bangkok 10310', go: 'จอดรถในโครงการ Headquarter เอกมัย-ลาดพร้าว บริเวณด้านหน้าคลินิก', goEn: 'Park inside the Headquarters Ekkamai-Ladprao project, in front of the clinic.' },
  ari: { th: 'เลขที่ 19 ซ.พหลโยธิน 7 พญาไท กทม. 10400', en: '19 Soi Phahonyothin 7, Phaya Thai, Bangkok 10400', go: 'BTS อารีย์ ทางออก 3 เดินเข้าซอยพหลโยธิน 7 ร้านอยู่มุมซอยอารีย์ 1 รถยนต์ส่วนบุคคลจอดได้ที่ตึกสหกรณ์', goEn: 'BTS Ari, exit 3. Walk into Soi Phahonyothin 7 and the clinic is on the corner of Soi Ari 1. Cars can park at the cooperative building.' },
  bangna: { th: 'เดอะกลาส มาร์เก็ต บางนา ชั้น 2 ยูนิต R208 เลขที่ 645 หมู่ 13 ต.บางแก้ว อ.บางพลี จ.สมุทรปราการ 10540', en: 'The Glass Market Bangna, 2nd floor, unit R208, 645 Moo 13, Bang Kaeo, Bang Phli, Samut Prakan 10540', go: '', goEn: '' },
  rama2: { th: 'เลขที่ 160 ศูนย์การค้าเซ็นทรัลพลาซา พระราม 2 ห้อง 220 ชั้น 2 ถนนพระรามที่ 2 แขวงแสมดำ เขตบางขุนเทียน กรุงเทพมหานคร 10150', en: 'Central Plaza Rama 2, 2nd floor, room 220, 160 Rama 2 Road, Samae Dam, Bang Khun Thian, Bangkok 10150', go: 'จอดรถเซ็นทรัลพระราม 2 ชั้น 2 โซน Sun', goEn: 'Park at Central Rama 2, 2nd floor, Sun zone.' },
  ics: { th: 'เลขที่ 168 ห้อง 101 ชั้น 1 ถนนเจริญนคร แขวงคลองต้นไทร เขตคลองสาน กรุงเทพมหานคร 10600', en: 'ICS, 1st floor, room 101, 168 Charoen Nakhon Road, Khlong Ton Sai, Khlong San, Bangkok 10600', go: 'BTS ลงสถานีกรุงธนบุรี เปลี่ยนเป็น BTS สายสีทอง ลงสถานีเจริญนคร รถยนต์ส่วนบุคคลจอดที่ ICS ชั้น 1', goEn: 'BTS to Krung Thon Buri, change to the Gold Line and get off at Charoen Nakhon. Cars can park at ICS, 1st floor.' },
  siam: { th: 'เลขที่ 430/37-38 ซอยสยามสแควร์ 7 ถนนพระราม 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330', en: '430/37-38 Siam Square Soi 7, Rama 1 Road, Pathum Wan, Bangkok 10330', go: 'BTS สยาม ทางออก 4 สยามสแควร์ซอย 7 จอดรถได้บริเวณสยามสแควร์', goEn: 'BTS Siam, exit 4, then Siam Square Soi 7. Parking is around Siam Square.' },
  westville: { th: 'ถ.ราชพฤกษ์ ตำบลมหาสวัสดิ์ อำเภอบางกรวย นนทบุรี 11130', en: 'Central Westville, Ratchaphruek Road, Maha Sawat, Bang Kruai, Nonthaburi 11130', go: 'จอดรถเซ็นทรัลเวสต์วิลล์ ชั้น 1 โซน Semi OutDoor', goEn: 'Park at Central Westville, 1st floor, Semi Outdoor zone.' },
  bangkapi: { th: 'เลขที่ 3522 ศูนย์การค้าเดอะมอลล์ บางกะปิ ห้อง 901, 902 ชั้น 9 ถนนลาดพร้าว แขวงคลองจั่น เขตบางกะปิ กรุงเทพมหานคร 10240', en: 'The Mall Bangkapi, 9th floor, rooms 901 and 902, 3522 Ladprao Road, Khlong Chan, Bang Kapi, Bangkok 10240', go: '', goEn: '' },
  rangsit: { th: 'เลขที่ 94 ศูนย์การค้าฟิวเจอร์พาร์ค รังสิต ชั้น 2 ห้อง PL.2.SHP044A,045C ถนนพหลโยธิน ตำบลประชาธิปัตย์ อำเภอธัญบุรี จังหวัดปทุมธานี 12130', en: 'Future Park Rangsit, 2nd floor, room PL.2.SHP044A/045C, 94 Phahonyothin Road, Prachathipat, Thanyaburi, Pathum Thani 12130', go: '', goEn: '' },
  northville: { th: 'เลขที่ 562, 566 อาคารเซ็นทรัล นอร์ทวิลล์ ห้อง 257 ชั้น 2 ถนนรัตนาธิเบศร์ ตำบลบางกระสอ อำเภอเมืองนนทบุรี จังหวัดนนทบุรี', en: 'Central Northville, 2nd floor, room 257, 562 and 566 Rattanathibet Road, Bang Kraso, Mueang Nonthaburi, Nonthaburi', go: '', goEn: '' },
  pinklao: { th: 'เลขที่ 7/129-7/221 อาคารเซ็นทรัลปิ่นเกล้า ชั้น 2 ห้อง OF2222/2 ถนนบรมราชชนนี แขวงอรุณอมรินทร์ เขตบางกอกน้อย กรุงเทพมหานคร', en: 'Central Pinklao, 2nd floor, room OF2222/2, 7/129-7/221 Borommaratchachonnani Road, Arun Ammarin, Bangkok Noi, Bangkok', go: '', goEn: '' },
  seacon: { th: 'เลขที่ 55 ศูนย์การค้าซีคอนสแควร์ ชั้น 3 ห้อง 3024 ถนนศรีนครินทร์ แขวงหนองบอน เขตประเวศ กรุงเทพมหานคร 10250', en: 'Seacon Square, 3rd floor, room 3024, 55 Srinagarindra Road, Nong Bon, Prawet, Bangkok 10250', go: '', goEn: '' },
};

// The 17 doctors listed under "physicians" on theritzclinic.com. id = WordPress post id.
export const DOCTORS = [
  { id: 13804, th: 'ริท', en: 'Ritz', founder: true, img: UP + '2023/02/Pop-Up-หมอริท-768x768.jpg' },
  { id: 4104, th: 'อั๋น', en: 'Aun', img: UP + '2023/03/Pop-Up-หมออั๋น-768x768.jpg' },
  { id: 4087, th: 'นุ๊ก', en: 'Nook', img: UP + '2023/03/Pop-Up-หมอนุ๊ก-768x768.jpg' },
  { id: 565315, th: 'เบียร์', en: 'Beer', img: UP + '2024/09/Pop-Up-หมอเบียร์-768x768.jpg' },
  { id: 1745, th: 'แพร', en: 'Prae', img: UP + '2022/08/Pop-Up-หมอแพร-768x768.jpg' },
  { id: 4097, th: 'ลิลลี่', en: 'Lily', img: UP + '2023/03/Pop-Up-หมอลิลลี่-768x768.jpg' },
  { id: 4102, th: 'หงส์หยก', en: 'Hongyok', img: UP + '2023/03/Pop-Up-หมอหงส์หยก-768x768.jpg' },
  { id: 4108, th: 'อาอี้', en: 'Aee', img: UP + '2023/03/Pop-Up-หมออาอี้-768x768.jpg' },
  { id: 4093, th: 'พลอย', en: 'Ploy', img: UP + '2023/03/Pop-Up-หมอพลอย-768x768.jpg' },
  { id: 88074, th: 'น็อต', en: 'Not', img: UP + '2023/06/Pop-Up-หมอน็อต-768x768.jpg' },
  { id: 151031, th: 'โย่', en: 'Yo', img: UP + '2023/08/Pop-Up-หมอโย่-768x768.jpg' },
  { id: 228125, th: 'ปาล์ม', en: 'Palm', img: UP + '2023/11/Pop-Up-หมอปาม-768x768.jpg' },
  { id: 228145, th: 'แม็ก', en: 'Mac', img: UP + '2023/11/Pop-Up-หมอแม๊ก-768x768.jpg' },
  { id: 506697, th: 'เตย', en: 'Toey', img: UP + '2024/03/Pop-Up-หมอเตย-768x768.jpg' },
  { id: 547062, th: 'พี', en: 'Pee', img: UP + '2024/07/Pop-Up-หมอพี-768x768.jpg' },
  { id: 571317, th: 'เพพ', en: 'Pep', img: UP + '2024/10/Pop-Up-หมอเพพ-768x768.jpg' },
  { id: 746277, th: 'แพรแพร', en: 'Praeprae', img: UP + '2026/05/Pop-Up-หมอแพรแพร-768x768.jpg' },
];

// Treatment directory. Groups follow the service categories in WordPress; the five
// services with no category there were placed by us (Oligio X, PICO VarioPulse, Accure, EXION).
export const CATS = [
  { id: 'lift', en: 'Lifting', th: 'ยกกระชับ' },
  { id: 'laser', en: 'Laser and skin tone', th: 'เลเซอร์และสีผิว' },
  { id: 'design', en: 'Facial design', th: 'ปรับรูปหน้า' },
  { id: 'boost', en: 'Skin boosters', th: 'บำรุงผิว' },
  { id: 'bio', en: 'Collagen biostimulators', th: 'กระตุ้นคอลลาเจน' },
  { id: 'body', en: 'Body design', th: 'ปรับรูปร่าง' },
  { id: 'hair', en: 'Hair removal', th: 'กำจัดขน' },
  { id: 'well', en: 'Wellness (Vitality Lab)', th: 'เวลเนส' },
];
const SV = 'https://theritzclinic.com/service/';
// floor = which layer of the 5-Layer Lift it works on (0 = not a layer treatment).
export const SERVICES = [
  { id: 4372, cat: 'lift', floor: 4, name: 'Ulthera SPT', en: 'Focused ultrasound that lifts at the SMAS layer, the layer a surgical facelift works on.', th: 'อัลตราซาวด์โฟกัสยกกระชับที่ชั้น SMAS', url: '' },
  { id: 4221, cat: 'lift', floor: 2, name: 'New Thermage FLX', en: 'Radiofrequency that heats the dermis to firm sagging skin.', th: 'คลื่นวิทยุกระชับผิวหย่อนคล้อย', url: '' },
  { id: 4378, cat: 'lift', floor: 4, name: 'Ultraformer MPT', en: 'A 3-in-1 lift: tightens, reduces facial fat and nourishes the skin, with less pain.', th: 'ยกกระชับ สลายไขมัน บำรุงผิว เจ็บน้อย', url: '' },
  { id: 682515, cat: 'lift', floor: 2, name: 'Oligio X', en: 'The 2025 lifting technology: cool, lifting and long-lasting.', th: 'เทคโนโลยียกกระชับรุ่นใหม่ 2025 เย็น ยก ยุบ นาน', url: '' },
  { id: 515967, cat: 'lift', floor: 5, name: 'EMFACE', en: 'Lifts the face with no needles and no numbing cream.', th: 'ยกกระชับหน้าโดยไม่ใช้เข็ม ไม่ใช้ยาชา', url: '' },
  { id: 509619, cat: 'lift', floor: 0, name: 'Advanced Personal Lifting', en: 'A lifting plan designed for one person, combining the machines that suit your face.', th: 'โปรแกรมยกกระชับที่ออกแบบเฉพาะบุคคล', url: '' },
  { id: 516098, cat: 'lift', floor: 2, name: 'EXION Body', en: 'EXION for the skin on your body: firmer, smoother skin.', th: 'EXION สำหรับผิวพรรณทั่วเรือนร่าง', url: '' },
  { id: 4341, cat: 'laser', floor: 1, name: 'Pico Laser', en: 'Picosecond laser for dark spots, melasma and uneven skin tone.', th: 'พิโคเลเซอร์ ดูแลจุดด่างดำ ฝ้า กระ', url: '' },
  { id: 4276, cat: 'laser', floor: 2, name: 'PICO-SCAR', en: 'Pico laser set up for acne scars.', th: 'พิโคเลเซอร์สำหรับหลุมสิว', url: '' },
  { id: 4342, cat: 'laser', floor: 1, name: 'PICO-SMOOTH & PICO-BRIGHT', en: 'Pico laser for smoother, brighter skin.', th: 'พิโคเลเซอร์เพื่อผิวเรียบเนียน กระจ่างใส', url: '' },
  { id: 562000, cat: 'laser', floor: 1, name: 'PICO VarioPulse', en: 'The newest pico technology at the clinic.', th: 'เทคโนโลยีพิโครุ่นใหม่ล่าสุด', url: '' },
  { id: 509437, cat: 'laser', floor: 2, name: 'Vbeam Perfecta', en: 'Laser for redness and inflamed acne.', th: 'ลดรอยแดง สิวอักเสบ', url: '' },
  { id: 557783, cat: 'laser', floor: 2, name: 'Accure Acne Laser', en: 'Laser that treats acne at the oil glands.', th: 'เลเซอร์รักษาสิว', url: '' },
  { id: 4200, cat: 'design', floor: 3, name: 'Filler', en: 'Hyaluronic acid filler to restore volume and shape. Read this before your first filler.', th: 'ฟิลเลอร์เติมเต็มและปรับรูปหน้า', url: '' },
  { id: 4123, cat: 'design', floor: 5, name: 'Botulinum Toxin', en: 'Relaxes the muscles behind expression lines and a square jaw.', th: 'โบท็อกลดริ้วรอยและกรามใหญ่', url: '' },
  { id: 395323, cat: 'boost', floor: 2, name: 'Rejuran', en: 'Restores the skin from the inner layers so it looks hydrated and healthy.', th: 'ฟื้นบำรุงจากผิวชั้นใน', url: '' },
  { id: 395880, cat: 'boost', floor: 2, name: 'Glow Factor by NCTF 135 HA', en: 'Hyaluronic acid with vitamins, against early wrinkles.', th: 'HA พร้อมวิตามิน ต่อต้านริ้วรอย', url: '' },
  { id: 395018, cat: 'boost', floor: 2, name: 'Belotero Revive', en: 'A skin booster filler for healthier-looking skin.', th: 'ฟิลเลอร์เพื่อผิวสุขภาพดี', url: '' },
  { id: 4186, cat: 'boost', floor: 2, name: 'DNA Glow Skin', en: 'A booster program for clear, glowing skin.', th: 'บำรุงผิวใส', url: '' },
  { id: 557139, cat: 'boost', floor: 2, name: 'EXION AI Microneedle RF', en: 'Microneedle radiofrequency guided by AI, for pores, scars and texture.', th: 'Microneedle RF ควบคุมด้วย AI', url: '' },
  { id: 228429, cat: 'bio', floor: 3, name: 'Sculptra', en: 'Stimulates your own collagen to restore the skin over time.', th: 'กระตุ้นการสร้างคอลลาเจน', url: '' },
  { id: 509793, cat: 'bio', floor: 3, name: 'Radiesse', en: 'Builds collagen for skin that looks firm and radiant.', th: 'สร้างผิวให้เปล่งปลั่งจากภายใน', url: '' },
  { id: 544988, cat: 'body', floor: 3, name: 'CoolSculpting', en: 'Freezes away stubborn fat. The guide covers results, pros and cons.', th: 'สลายไขมันด้วยความเย็น', url: '' },
  { id: 396434, cat: 'body', floor: 3, name: 'Variofill', en: '100% pure HA for the hips and buttocks.', th: 'HA บริสุทธิ์สำหรับบั้นท้ายและสะโพก', url: '' },
  { id: 515783, cat: 'hair', floor: 2, name: 'Elite 4D Hair Removal', en: 'Permanent laser hair removal for smooth skin.', th: 'เลเซอร์กำจัดขนถาวร', url: '' },
  { id: 4211, cat: 'hair', floor: 2, name: 'Moveo Red Laser', en: 'A gentle, cool laser for hair removal with almost no pain.', th: 'เลเซอร์เย็น อ่อนโยน ถนอมผิว', url: '' },
  { id: 746481, cat: 'well', floor: 0, name: 'Vitality Blood Check', en: 'A blood check that the rest of the Vitality Lab plan is built on.', th: 'ตรวจเลือดเพื่อวางแผนสุขภาพ', url: '' },
  { id: 746484, cat: 'well', floor: 0, name: 'Vitality DNA Code', en: 'Reads your genes to plan your health care.', th: 'เข้าใจรหัสพันธุกรรมเพื่อวางแผนสุขภาพ', url: '' },
  { id: 746486, cat: 'well', floor: 0, name: 'Personalized IV Therapy', en: 'An IV drip formula designed for you.', th: 'สูตร IV Therapy ที่ออกแบบเฉพาะคุณ', url: '' },
  { id: 746488, cat: 'well', floor: 0, name: 'Personalized Vitamin', en: 'Vitamins and nutrients a doctor matches to your blood results.', th: 'วิตามินและสารอาหารเฉพาะบุคคล', url: '' },
].map((s) => ({ ...s, url: `treatment.html?id=${s.id}` }));
// WordPress posts we left out on purpose because they repeat a service above.
export const SERVICE_SKIP = [516296, 557518];

// "Friend of The Ritz" reviews (review_slider in WordPress), translated from Thai.
export const REVIEWS = [
  { id: 234698, program: 'New Thermage FLX', cat: 'lift', who: 'ภัสรนันท์ อัษฎมงคล (เบียร์)', whoEn: 'Patsaranan Atsadamongkol (Beer)', img: UP + '2023/11/เบียร์-300x300.jpg', textEn: 'This is my second year of New Thermage FLX at THE RITZ CLINIC. The results are very clear. My face feels firm, the facial fat I worried about is gone and my jawline is sharper. I will be back for more.', text: 'เบียร์ทำ New Thermage FLX ที่ THE RITZ CLINIC เข้าปีที่ 2 แล้ว หลังทำเห็นผลลัพธ์ชัดเจนมาก ๆ รู้สึกเลยว่าหน้าเฟิร์มกระชับ ไขมันบนใบหน้าที่กังวลก็หาย กรอบหน้าชัด บอกเลยว่ากลับมาทำซ้ำอีกแน่นอนค่ะ' },
  { id: 234777, program: 'Ulthera SPT', cat: 'lift', who: 'ธนภัทร กาลวิละ (ฟิล์ม)', whoEn: 'Thanapat Kanwila (Film)', img: UP + '2023/11/ฟิล์ม-300x300.jpg', textEn: 'I trust Ulthera SPT at THE RITZ CLINIC. The results are very clear, and on camera for my dramas I feel confident from every angle. One session lasts a whole year, so it is worth it.', text: 'ผมมั่นใจ Ulthera SPT ที่เดอะริทซ์คลินิก เห็นผลลัพธ์ชัดเจนมาก ๆ ครับ เวลาออกกล้องถ่ายละครก็มั่นใจมากขึ้น ไม่ว่ามุมไหนผมก็รอด ที่สำคัญทำ 1 ครั้งอยู่นานถึง 1 ปี คุ้มค่ามากครับ' },
  { id: 234706, program: 'Ultraformer MPT', cat: 'lift', who: 'พรหมพิริยะ ทองพุทธรักษ์ (ปาแปง)', whoEn: 'Prompiriya Thongputtaruk (Papang)', img: UP + '2023/11/ปาแปง-300x300.jpg', textEn: 'I am hooked on Ultraformer MPT. It lifts, reduces fat and nourishes the skin in one machine, and the results are so clear that I come back every 6 months.', text: 'ผมติดใจเครื่อง Ultraformer MPT เลยครับ ช่วยทั้งยกกระชับ สลายไขมันและบำรุงผิว ครบจบในเครื่องเดียว ที่สำคัญเห็นผลลัพธ์ชัดเจนจนผมกลับมาทำซ้ำทุก ๆ 6 เดือนเลยครับ' },
  { id: 539119, program: 'PICO-SCAR', cat: 'laser', who: 'ชพงศ์ จิรสินคุรกานนต์ (แต๊งส์)', whoEn: 'Chapong Jirasinkurakanon (Tangs)', img: UP + '2024/06/ชพงศ์-จิรสินคุรกานนต์-แต๊งส์-300x300.jpg', textEn: 'I had acne and acne scars my whole life and never took selfies. My scars really became shallower in less than a year, and I am far more confident now. To everyone still treating theirs, do not give up.', text: 'ใครจะคิดว่าจากคนที่เป็นสิวมีหลุมสิวเยอะ ๆ มาตลอดชีวิต ไม่เซลฟ์กับตัวเองเลย หลุมสิวตื้นขึ้นจริง ๆ ภายในระยะเวลาไม่ถึงปี ตอนนี้มีความมั่นใจมากขึ้น เป็นกำลังใจให้กับทุกคน อย่าท้อแท้ที่จะรักษา' },
  { id: 234849, program: 'Filler', cat: 'design', who: 'รัชพงศ์ ทิวะธนเศรษฐ์ (เซิน)', whoEn: 'Ratchapong Tiwathanaset (Sern)', img: UP + '2023/11/เซิน-300x300.jpg', textEn: 'I chose THE RITZ CLINIC for under-eye filler because of their Tri-Ligament Under Eyes Lifting technique. It fixed my deep, dark under-eyes and the result looks very natural with no lumps.', text: 'เซินเลือกฉีดฟิลเลอร์แก้ปัญหาใต้ตาที่ THE RITZ CLINIC ครับ เพราะที่นี่มีเทคนิคเฉพาะ Tri-Ligament Under Eyes Lifting ผลลัพธ์หลังทำเป็นธรรมชาติมาก ๆ ไม่เป็นก้อน' },
  { id: 234825, program: 'Botulinum Toxin', cat: 'design', who: 'วราวุธ โพธิ์ยิ้ม (ตั้ม)', whoEn: 'Warawut Phoyim (Tum)', img: UP + '2023/11/ตั้ม-300x300.jpg', textEn: 'I chose Botox at THE RITZ CLINIC because I trust the standards here. The products are certified by the U.S. FDA and Thai FDA, and experienced doctors look after you closely. If you have wrinkles like me, I recommend it.', text: 'ตั้มเลือกฉีด Bo ที่ THE RITZ CLINIC ครับ เพราะผมมั่นใจในคุณภาพ มาตรฐานของที่นี่ ตัวยารับรองมาตรฐาน U.S. FDA, Thai FDA และดูแลโดยแพทย์ผู้ชำนาญการอย่างใกล้ชิด' },
  { id: 234802, program: 'Sculptra', cat: 'bio', who: 'วรวรรธน์ บุญชื่น', whoEn: 'Worawat Boonchuen', img: UP + '2023/11/อินทนน-300x300.jpg', textEn: 'Before, my cheeks sagged and my cheek pads were big. After Sculptra my face looks naturally lifted, my skin is firm and my jawline is sharper.', text: 'ก่อนหน้าแก้มย้วย กระเปาะแก้มใหญ่ หลังจากทำ ใบหน้าก็ยกกระชับขึ้นอย่างเป็นธรรมชาติ ผิวแน่น กรอบหน้าชัด โปรแกรม Sculptra ที่ THE RITZ คือดีคือปังจริง ๆ ครับ' },
  { id: 539198, program: 'Rejuran', cat: 'boost', who: 'แพรวโพยม ประสมทอง (พี่ตี๋) / ปรียารินท์ รวีพุฒิพงศ์ (น้องบี๋)', whoEn: 'Praewpayom Prasomthong (Tee) and Preeyarin Raweeputtipong (Bee)', img: UP + '2024/06/REJURAN-300x300.jpg', textEn: 'Bee: my pores used to be wide and deep, and now they look tight and blurred. Tee: my tired, dull face looks fuller and clearer, and my acne scars are shallower. Seven days after the first session the results were already this good, so I want to keep going.', text: 'น้องบี๋: ก่อนหน้ารูขุมขนกว้างลึก ตอนนี้รูขุมขนกระชับเบลอไปเลย พี่ตี๋: หน้าที่เคยโทรม หมองคล้ำ หน้าอิ่มฟูใสขึ้น หลุมสิวก็ตื้นขึ้น เพียงครั้งแรกหลังทำ 7 วันก็เห็นผลลัพธ์ได้ดีขนาดนี้แล้ว' },
  { id: 539217, program: 'Glow Factor', cat: 'boost', who: 'ณัฐชานันท์ พ่วงลา (เจมส์)', whoEn: 'Natchanan Puangla (James)', img: UP + '2024/06/ณัฐชานันท์-พ่วงลา-เจมส์-300x300.jpg', textEn: 'This program made my face clear and glowing, the kind of glow you notice from far away. I trust THE RITZ with my skin and I recommend it.', text: 'เป็นโปรแกรมที่ทำให้หน้าใส ฉ่ำโกลว์ ตะโกนนน มองเห็นมาแต่ไกล เจมส์ไว้ใจให้เดอะริทซ์ดูแลเรื่องงานผิว แนะนำเลย ไม่ผิดหวังแน่นอนค่ะ' },
  { id: 539166, program: 'Moveo Red Laser', cat: 'hair', who: 'พงศธร ผดุงเกียรติวงศ์ (กรีน)', whoEn: 'Pongsatorn Padungkiatwong (Green)', img: UP + '2024/06/พงศธร-ผดุงเกียรติวงศ์-กรีน-300x300.jpg', textEn: 'If you want hair removal that does not hurt, on your legs or anywhere else, try Moveo Red Laser. No pain, no snapping, no flinching, and it feels cool. The machine is certified by the U.S. FDA too.', text: 'สำหรับใครที่สนใจเลเซอร์ขนแบบไม่เจ็บ ไม่ว่าจะเป็นขนขาหรือขนตามร่างกายส่วนอื่น ๆ ก็ลองดู MOVEO RED LASER ไม่เจ็บ ไม่ดีด ไม่สะดุ้ง เย็นสบาย ได้รับการรับรองมาตรฐานจาก U.S. FDA อีกด้วย' },
];
