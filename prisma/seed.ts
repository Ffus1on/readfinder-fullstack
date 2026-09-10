import { PrismaClient, Category, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existingUsers = await prisma.user.findMany();
  if (existingUsers.length > 0) {
    console.log('Seed already applied, skipping...');
    return;
  }

  const user1 = await prisma.user.create({
    data: {
      id: 'demo-user-id',
      name: 'Даниил',
      email: 'danya.razgadov@yandex.ru',
      role: UserRole.ADMIN,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Анна',
      email: 'anna@example.com',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Михаил',
      email: 'mikhail@example.com',
    },
  });

  const book1 = await prisma.book.create({
    data: {
      title: 'Опасная игра бабули',
      author: 'Иван Иванов',
      description: 'Захватывающий детектив с неожиданной развязкой.',
      image: '/files/pages/index/bookImage1.jpg',
      pages: 250,
      category: Category.DETECTIVE,
    },
  });

  const book2 = await prisma.book.create({
    data: {
      title: 'Скитальцы',
      author: 'Петр Петров',
      description: 'Роман о путешественниках и их приключениях.',
      image: '/files/pages/index/bookImage2.jpg',
      pages: 310,
      category: Category.FICTION,
    },
  });

  const book3 = await prisma.book.create({
    data: {
      title: 'Волоколамское шоссе',
      author: 'Николай Николаев',
      description: 'Историческая повесть о Великой Отечественной войне.',
      image: '/files/pages/index/bookImage3.jpg',
      pages: 280,
      category: Category.HISTORY,
    },
  });

  const book4 = await prisma.book.create({
    data: {
      title: 'Кольцо царя',
      author: 'Елена Соколова',
      description: 'Мистический триллер о древнем артефакте.',
      image: '/files/pages/index/bookImage4.jpg',
      pages: 320,
      category: Category.FANTASY,
    },
  });

  const book5 = await prisma.book.create({
    data: {
      title: 'Посмотри, отвернись, посмотри',
      author: 'Дмитрий Орлов',
      description: 'Современная проза о жизни большого города.',
      image: '/files/pages/index/bookImage5.jpg',
      pages: 290,
      category: Category.FICTION,
    },
  });

  const book6 = await prisma.book.create({
    data: {
      title: 'Тревожные люди',
      author: 'Фредрик Бакман',
      description: 'Трогательная история о людях, оказавшихся в одном месте в одно время.',
      image: '/files/pages/index/bookImage6.jpg',
      pages: 350,
      category: Category.FICTION,
    },
  });

  const book7 = await prisma.book.create({
    data: {
      title: 'Маленький принц',
      author: 'Антуан де Сент-Экзюпери',
      description: 'Философская сказка о дружбе и любви.',
      image: '/files/pages/index/bookImage7.jpg',
      pages: 96,
      category: Category.FICTION,
    },
  });

  const book8 = await prisma.book.create({
    data: {
      title: '1984',
      author: 'Джордж Оруэлл',
      description: 'Роман-антиутопия о тоталитарном обществе.',
      image: '/files/pages/index/bookImage8.jpg',
      pages: 328,
      category: Category.SCIENCE,
    },
  });

  const book9 = await prisma.book.create({
    data: {
      title: 'Преступление и наказание',
      author: 'Фёдор Достоевский',
      description: 'Классический роман о моральных дилеммах.',
      image: '/files/pages/index/bookImage1.jpg',
      pages: 672,
      category: Category.FICTION,
    },
  });

  const book10 = await prisma.book.create({
    data: {
      title: 'Гарри Поттер и философский камень',
      author: 'Дж. К. Роулинг',
      description: 'Первая книга о мальчике, который выжил.',
      image: '/files/pages/index/bookImage2.jpg',
      pages: 432,
      category: Category.FANTASY,
    },
  });

  await prisma.bookRating.createMany({
    data: [
      { userId: user1.id, bookId: book1.id, value: 9 },
      { userId: user1.id, bookId: book2.id, value: 10 },
      { userId: user1.id, bookId: book3.id, value: 9 },
      { userId: user1.id, bookId: book4.id, value: 9 },
      { userId: user1.id, bookId: book5.id, value: 9 },
      { userId: user1.id, bookId: book6.id, value: 10 },
      { userId: user1.id, bookId: book7.id, value: 10 },
      { userId: user1.id, bookId: book8.id, value: 9 },
      { userId: user1.id, bookId: book9.id, value: 10 },
      { userId: user1.id, bookId: book10.id, value: 10 },
      { userId: user2.id, bookId: book2.id, value: 9 },
      { userId: user2.id, bookId: book4.id, value: 8 },
      { userId: user2.id, bookId: book6.id, value: 9 },
      { userId: user2.id, bookId: book8.id, value: 8 },
      { userId: user2.id, bookId: book10.id, value: 9 },
      { userId: user3.id, bookId: book1.id, value: 8 },
      { userId: user3.id, bookId: book3.id, value: 8 },
      { userId: user3.id, bookId: book5.id, value: 8 },
      { userId: user3.id, bookId: book7.id, value: 9 },
      { userId: user3.id, bookId: book9.id, value: 9 },
    ],
  });

  const lib1 = await prisma.library.create({
    data: {
      name: 'Российская национальная библиотека',
      address: 'ул. Садовая, 18, Санкт-Петербург',
      lat: 59.9267,
      lng: 30.3195,
    },
  });

  const lib2 = await prisma.library.create({
    data: {
      name: 'Библиотека им. В. В. Маяковского',
      address: 'наб. реки Фонтанки, 44, Санкт-Петербург',
      lat: 59.9292,
      lng: 30.3431,
    },
  });

  const lib3 = await prisma.library.create({
    data: {
      name: 'Библиотека «Лиговская»',
      address: 'Лиговский пр., 99, Санкт-Петербург',
      lat: 59.9199,
      lng: 30.3546,
    },
  });

  const lib4 = await prisma.library.create({
    data: {
      name: 'Библиотека им. К. А. Тимирязева',
      address: 'ул. Шкапина, 6, Санкт-Петербург',
      lat: 59.9017,
      lng: 30.2750,
    },
  });

  const lib5 = await prisma.library.create({
    data: {
      name: 'Библиотека им. А. С. Пушкина',
      address: 'ул. Марата, 72, Санкт-Петербург',
      lat: 59.9220,
      lng: 30.3430,
    },
  });

  const lib6 = await prisma.library.create({
    data: {
      name: 'Библиотека им. А. П. Гайдара',
      address: 'ул. Большая Морская, 18, Санкт-Петербург',
      lat: 59.9311,
      lng: 30.3106,
    },
  });

  const lib7 = await prisma.library.create({
    data: {
      name: 'Библиотека им. Б. Лавренёва',
      address: 'наб. реки Карповки, 28, Санкт-Петербург',
      lat: 59.9714,
      lng: 30.2935,
    },
  });

  const lib8 = await prisma.library.create({
    data: {
      name: 'Библиотека «Старт»',
      address: 'пр. Большевиков, 2, Санкт-Петербург',
      lat: 59.9199,
      lng: 30.4802,
    },
  });

  const lib9 = await prisma.library.create({
    data: {
      name: 'Библиотека им. К. И. Чуковского',
      address: 'пр. Стачек, 30, Санкт-Петербург',
      lat: 59.8889,
      lng: 30.2683,
    },
  });

  const lib10 = await prisma.library.create({
    data: {
      name: 'Библиотека «На Стремянной»',
      address: 'ул. Стремянная, 20, Санкт-Петербург',
      lat: 59.9353,
      lng: 30.3477,
    },
  });

  await prisma.favorite.create({
    data: { userId: user1.id, bookId: book1.id },
  });
  await prisma.favorite.create({
    data: { userId: user1.id, bookId: book6.id },
  });
  await prisma.favorite.create({
    data: { userId: user1.id, bookId: book10.id },
  });
  await prisma.favorite.create({
    data: { userId: user2.id, bookId: book3.id },
  });
  await prisma.favorite.create({
    data: { userId: user2.id, bookId: book8.id },
  });
  await prisma.favorite.create({
    data: { userId: user3.id, bookId: book7.id },
  });
  await prisma.favorite.create({
    data: { userId: user3.id, bookId: book9.id },
  });

  await prisma.libraryBook.create({
    data: { bookId: book1.id, libraryId: lib1.id, quantity: 3 },
  });
  await prisma.libraryBook.create({
    data: { bookId: book2.id, libraryId: lib1.id, quantity: 2 },
  });
  await prisma.libraryBook.create({
    data: { bookId: book3.id, libraryId: lib2.id, quantity: 5 },
  });
  await prisma.libraryBook.create({
    data: { bookId: book6.id, libraryId: lib3.id, quantity: 1 },
  });
  await prisma.libraryBook.create({
    data: { bookId: book8.id, libraryId: lib4.id, quantity: 4 },
  });
  await prisma.libraryBook.create({
    data: { bookId: book10.id, libraryId: lib5.id, quantity: 2 },
  });
  await prisma.libraryBook.create({
    data: { bookId: book7.id, libraryId: lib1.id, quantity: 3 },
  });

  await prisma.workspace.create({
    data: { libraryId: lib1.id, type: 'individual', capacity: 1, isAvailable: true },
  });
  await prisma.workspace.create({
    data: { libraryId: lib1.id, type: 'group', capacity: 6, isAvailable: true },
  });
  await prisma.workspace.create({
    data: { libraryId: lib2.id, type: 'individual', capacity: 1, isAvailable: false },
  });
  await prisma.workspace.create({
    data: { libraryId: lib3.id, type: 'individual', capacity: 1, isAvailable: true },
  });
  await prisma.workspace.create({
    data: { libraryId: lib3.id, type: 'group', capacity: 4, isAvailable: true },
  });
  await prisma.workspace.create({
    data: { libraryId: lib4.id, type: 'individual', capacity: 1, isAvailable: true },
  });
  await prisma.workspace.create({
    data: { libraryId: lib6.id, type: 'individual', capacity: 1, isAvailable: true },
  });
  await prisma.workspace.create({
    data: { libraryId: lib7.id, type: 'group', capacity: 6, isAvailable: true },
  });
  await prisma.workspace.create({
    data: { libraryId: lib8.id, type: 'individual', capacity: 1, isAvailable: false },
  });
  await prisma.workspace.create({
    data: { libraryId: lib10.id, type: 'individual', capacity: 1, isAvailable: true },
  });

  await prisma.libraryBook.create({
    data: { bookId: book4.id, libraryId: lib6.id, quantity: 2 },
  });
  await prisma.libraryBook.create({
    data: { bookId: book5.id, libraryId: lib7.id, quantity: 3 },
  });
  await prisma.libraryBook.create({
    data: { bookId: book1.id, libraryId: lib8.id, quantity: 1 },
  });
  await prisma.libraryBook.create({
    data: { bookId: book9.id, libraryId: lib9.id, quantity: 2 },
  });
  await prisma.libraryBook.create({
    data: { bookId: book2.id, libraryId: lib10.id, quantity: 4 },
  });

  await prisma.libraryEvent.create({
    data: {
      libraryId: lib1.id,
      title: 'Мастер-класс по скорочтению',
      description: 'Научитесь читать в 2 раза быстрее за один день!',
      startTime: new Date('2026-08-15T14:00:00Z'),
      endTime: new Date('2026-08-15T16:00:00Z'),
      creatorId: user1.id,
    },
  });
  await prisma.libraryEvent.create({
    data: {
      libraryId: lib3.id,
      title: 'Лекция "История книги"',
      description: 'От глиняных табличек до электронных книг.',
      startTime: new Date('2026-08-20T18:00:00Z'),
      endTime: new Date('2026-08-20T19:30:00Z'),
      creatorId: user2.id,
    },
  });

  console.log('Seed completed successfully!');
  console.log(`  Users: 3`);
  console.log(`  Books: 10`);
  console.log(`  Libraries: 10`);
  console.log(`  Ratings: 20`);
  console.log(`  Favorites: 7`);
  console.log(`  LibraryBooks: 12`);
  console.log(`  Workspaces: 10`);
  console.log(`  Events: 2`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
