/**
 * Curated Unsplash photography (Unsplash License: free to use, no permission
 * required; we credit every photographer anyway for the TSA copyright checklist).
 * Images are hotlinked from images.unsplash.com as Unsplash's guidelines request.
 * https://unsplash.com/license
 */
export interface Photo {
  id: string;
  /** Unsplash photo page slug, for the credit link. */
  slug: string;
  /** Photographer's Unsplash username. */
  by: string;
  alt: string;
}

const p = (id: string, slug: string, by: string, alt: string): Photo => ({ id, slug, by, alt });

export const photos = {
  // People: deliberately varied in age, ethnicity, faith, ability and setting.
  classroom: p("1509062522246-3755977927d7", "students-in-classroom-with-teacher-presenting-zFSo6bnZJTw", "heyquilia", "Students in a classroom while a teacher presents"),
  hijab: p("1550546094-9835463f9f71", "woman-wearing-gray-long-sleeved-top-and-gray-hijab-right-hand-on-cheek-hxLv1jqP0_o", "mruqi", "Student in a gray hijab resting her chin on her hand, thinking"),
  wheelchair: p("1574471436709-3419c6de861d", "woman-in-wheelchair-GIJWGUXKEzY", "nayelidalton", "Young woman using a wheelchair"),
  backpack: p("1759852692971-a2abc6799cbd", "a-smiling-student-with-backpack-and-books-walks-outside-dPQBwZ6d-NU", "seyilostboy", "Smiling student with a backpack and books walking outside"),
  glasses: p("1617009762269-c062aaf6b3a0", "woman-in-red-and-white-plaid-shirt-wearing-black-framed-eyeglasses-upn798iEEYM", "vikasmakwana", "Student in a plaid shirt and glasses"),
  laptopTee: p("1620829813573-7c9e1877706f", "man-in-gray-crew-neck-t-shirt-using-laptop-computer-KUzlAah2dog", "cwojo", "Young man in a gray t-shirt working on a laptop"),
  coffeeShop: p("1543269865-cbf427effbad", "a-group-of-friends-at-a-coffee-shop--uHVRvDr7pg", "brookecagle", "Group of friends studying together at a coffee shop"),
  sofa: p("1573162915851-0af01102b7be", "woman-sits-on-sofa-while-using-laptop-computer-FBdmhGMdCso", "wocintechchat", "Woman on a sofa using a laptop"),
  gradBook: p("1705856416539-49b7693832d3", "a-woman-in-a-graduation-gown-holding-a-book-cwVb-V0e9aE", "kosafoto", "Graduate in a gown holding a book"),
  elder: p("1758612898258-398a43e7fd65", "elderly-man-with-glasses-using-a-laptop-sDXK7FwhV8E", "silverkblack", "Older man with glasses learning on a laptop"),
  denimDesk: p("1544168190-79c17527004f", "man-in-denim-shirt-at-desk-WC7KIHo13Fc", "juanencalada", "Student in a denim shirt at a white desk"),
  writing: p("1514369118554-e20d93546b30", "woman-writing-on-book-6RTM8EsD1T8", "kyledevaras", "Student writing in a notebook"),
  lab: p("1707944745899-104a4b12d945", "a-group-of-people-working-in-a-lab-tEFl8Wqd5f0", "niaid", "Group working together in a science lab"),
  graduation: p("1633734973050-d6499a977c17", "a-large-group-of-people-in-graduation-gowns-bOrjvtn7aY0", "immanuel_offei", "Large group of graduates in gowns"),
  teamLaptop: p("1576267423445-b2e0074d68a4", "men-and-women-sitting-and-standing-while-staring-at-laptop-p74ndnYWRY4", "windows", "Team gathered around a laptop"),
  diverseLaptop: p("1758270705518-b61b40527e76", "diverse-group-of-students-collaborating-around-a-laptop--X4Qx4_4iMU", "silverkblack", "Diverse group of students collaborating around a laptop"),
  coder: p("1580894908361-967195033215", "woman-in-green-shirt-sitting-in-front-of-computer-64YrPKiguAE", "thisisengineering", "Young engineer in a green shirt working at a computer"),
  headphones: p("1758612214848-04e700d192ce", "young-woman-wearing-headphones-using-laptop-at-desk-4JFBqeP3VRQ", "silverkblack", "Young woman with headphones studying on a laptop"),
  typing: p("1637084576418-3f25344ccb7c", "a-man-is-typing-on-a-laptop-computer-jbzNp079OS4", "eldarnazarov", "Student typing on a laptop"),
  curlyNotebook: p("1593698054469-2bb6fdf4b512", "person-writing-in-notebook-at-home-office-ddwbTn5HDdQ", "soundtrap", "Student with curly hair and headphones writing notes next to a laptop"),
  library: p("1683319598210-d70486f2f996", "a-library-filled-with-lots-of-books-and-people-sitting-at-tables-gdZ9GPNi_VM", "idbronskiy", "Library with people studying at long tables"),
  tutor: p("1589206946274-929e4da3996b", "teacher-and-student-in-classroom-6c86TCPmNRQ", "ronfel", "Teacher pointing to a student's workbook"),
  deskWriting: p("1598981457915-aea220950616", "student-writing-at-classroom-desk--hgJu2ykh4E", "jeswinthomas", "Student writing on paper at a classroom desk"),
  handwritten: p("1769794371007-9bf419217727", "an-open-notebook-filled-with-handwritten-text-3NXtW3eXI2k", "yenvu2410", "Open notebook filled with handwritten notes"),
  roundtable: p("1573497701240-345a300b8d36", "five-people-sitting-at-table-and-talking-jzonFmreWok", "wocintechchat", "Five people discussing around a table"),
  phones: p("1758270704663-9d002a4b42a2", "two-students-looking-at-a-smartphone-in-class-jIZnT7iqars", "silverkblack", "Two students looking at a smartphone in class"),
  deskFlatlay: p("1636390877494-3ba0c41c7e5e", "a-desk-with-a-laptop-notepad-pen-and-cell-phone-_cgcOEWKSKM", "hcphotos", "Desk with a laptop, notepad, pen and phone"),
  // Technology
  robot: p("1485827404703-89b55fcc595e", "white-robot-near-brown-wall-2EJCSULRwC8", "agk42", "White humanoid robot against a brown wall"),
  network: p("1674027444485-cec3da58eef4", "an-abstract-image-of-a-sphere-with-dots-and-lines-nGoCBxiaRO0", "growtika", "Abstract sphere of connected dots and lines"),
  cables: p("1558494949-ef010cbdcc31", "cable-network-M5tzZtFCOfs", "tvick", "Network cables plugged into a switch"),
  circuit: p("1562408590-e32931084e23", "blue-circuit-board-jXd2FSvcRr8", "umby", "Close-up of a blue circuit board"),
  servers: p("1584169417032-d34e8d805e8b", "server-room-aisle-with-metal-equipment-racks-lVZjvw-u9V8", "ismailenesayhan", "Aisle between server racks in a data center"),
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

export const lessonPhoto: Record<string, PhotoKey> = {
  "f1-what-is-ai": "robot",
  "f2-learning-from-data": "circuit",
  "f3-how-llms-work": "headphones",
  "f4-limits": "servers",
  "t1-prompt-basics": "typing",
  "t2-iterate": "curlyNotebook",
  "t3-verify": "library",
  "t4-ai-as-tutor": "tutor",
  "e1-integrity": "deskWriting",
  "e2-citing-ai": "handwritten",
  "e3-bias": "roundtable",
  "e4-privacy-impact": "phones",
};

export const modulePhoto: Record<string, PhotoKey> = {
  foundations: "network",
  toolkit: "coder",
  ethics: "diverseLaptop",
};

/** Faces for the home page: who Neuronaut is for. */
export const learnerMosaic: PhotoKey[] = [
  "hijab", "backpack", "wheelchair", "laptopTee", "glasses", "elder",
  "coffeeShop", "gradBook", "denimDesk", "writing", "lab", "sofa",
];

export function photoUrl(photo: Photo, width: number, height?: number): string {
  const q = new URLSearchParams({ auto: "format", fit: "crop", w: String(width), q: "75" });
  if (height) q.set("h", String(height));
  return `https://images.unsplash.com/photo-${photo.id}?${q}`;
}

export function photoCredit(photo: Photo) {
  return {
    photographerUrl: `https://unsplash.com/@${photo.by}?utm_source=neuronaut&utm_medium=referral`,
    photoUrl: `https://unsplash.com/photos/${photo.slug}?utm_source=neuronaut&utm_medium=referral`,
  };
}
