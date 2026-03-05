const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const sampleVideos = [
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    title: "Big Buck Bunny",
    likes: 12400,
  },
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    title: "Elephant's Dream",
    likes: 8300,
  },
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    title: "For Bigger Blazes",
    likes: 5200,
  },
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    title: "For Bigger Escapes",
    likes: 9100,
  },
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    title: "For Bigger Fun",
    likes: 4400,
  },
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    title: "Sintel",
    likes: 15800,
  },
  {
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    title: "Tears of Steel",
    likes: 9900,
  },
];

async function main() {
  const existing = await prisma.video.count();
  if (existing > 0) {
    console.log(`${existing} vidéo(s) déjà en base. Pour réinitialiser : supprime les entrées puis relance le seed.`);
    return;
  }
  for (const v of sampleVideos) {
    await prisma.video.create({ data: v });
  }
  console.log(`${sampleVideos.length} vidéos de démo ajoutées.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
