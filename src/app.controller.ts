import { Controller, Get, Query, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  getIndex(@Query('auth') auth?: string) {
    const isAuthenticated = auth === 'true';
    return {
      title: 'ReadFinder',
      styles: ['/styles/template.css', '/styles/index.css'],
      currentPath: '/',
      user: isAuthenticated ? { name: 'Даниил' } : null,
      books: [
        {
          image: '/files/pages/index/bookImage1.jpg',
          title: 'Опасная игра бабули',
        },
        { image: '/files/pages/index/bookImage2.jpg', title: 'Скитальцы' },
        {
          image: '/files/pages/index/bookImage3.jpg',
          title: 'Волоколамское шоссе',
        },
        {
          image: '/files/pages/index/bookImage4.jpg',
          title: 'Волоколамское шоссе',
        },
        { image: '/files/pages/index/bookImage5.jpg', title: 'Кольцо царя' },
        {
          image: '/files/pages/index/bookImage6.jpg',
          title: 'Посмотри, отвернись, посмотри',
        },
        { image: '/files/pages/index/bookImage7.jpg', title: 'Тревожные люди' },
        {
          image: '/files/pages/index/bookImage8.jpg',
          title: 'Маленький принц',
        },
      ],
      bookStats: [
        {
          title: 'Опасная игра бабули',
          author: 'Иван Иванов',
          pages: '250',
          rating: '4.5',
        },
        {
          title: 'Скитальцы',
          author: 'Петр Петров',
          pages: '310',
          rating: '4.8',
        },
        {
          title: 'Волоколамское шоссе',
          author: 'Николай Николаев',
          pages: '280',
          rating: '4.7',
        },
      ],
    };
  }

  @Get('catalog')
  @Render('catalog')
  getCatalog(@Query('auth') auth?: string) {
    const isAuthenticated = auth === 'true';
    return {
      title: 'Каталог книг - ReadFinder',
      styles: ['/styles/template.css', '/styles/catalog.css'],
      currentPath: '/catalog',
      user: isAuthenticated ? { name: 'Даниил' } : null,
      books: [
        { image: '/files/pages/index/bookImage1.jpg', title: 'Книга 1' },
        { image: '/files/pages/index/bookImage2.jpg', title: 'Книга 2' },
        { image: '/files/pages/index/bookImage3.jpg', title: 'Книга 3' },
        { image: '/files/pages/index/bookImage4.jpg', title: 'Книга 4' },
        { image: '/files/pages/index/bookImage5.jpg', title: 'Книга 5' },
        { image: '/files/pages/index/bookImage6.jpg', title: 'Книга 6' },
        { image: '/files/pages/index/bookImage7.jpg', title: 'Книга 7' },
        { image: '/files/pages/index/bookImage8.jpg', title: 'Книга 8' },
      ],
    };
  }

  @Get('favorites')
  @Render('favorites')
  getFavorites(@Query('auth') auth?: string) {
    const isAuthenticated = auth === 'true';
    return {
      title: 'Избранные книги - ReadFinder',
      styles: ['/styles/template.css', '/styles/favorites.css'],
      currentPath: '/favorites',
      user: isAuthenticated ? { name: 'Даниил' } : null,
    };
  }

  @Get('addresses')
  @Render('addresses')
  getAddresses(@Query('auth') auth?: string) {
    const isAuthenticated = auth === 'true';
    return {
      title: 'Адреса библиотек - ReadFinder',
      styles: ['/styles/template.css', '/styles/addresses.css'],
      currentPath: '/addresses',
      user: isAuthenticated ? { name: 'Даниил' } : null,
      libraries: [
        { name: 'Юношеская библиотека им. А. П. Гайдара' },
        { name: 'Центральная районная детская библиотека' },
        {
          name: 'Санкт-Петербургская Государственная специальная центральная библиотека для слепых и слабовидящих',
        },
        { name: 'Библиотека им. Б. Лавренёва' },
        { name: 'Детская библиотека № 2' },
        { name: 'Библиотека книжных героев' },
        { name: 'Центральная районная библиотека имени А. С. Пушкина' },
        { name: 'Библиотека имени В. И. Ленина' },
        { name: '3-я Районная библиотека' },
      ],
    };
  }

  @Get('library-card')
  @Render('library-card')
  getLibraryCard(@Query('auth') auth?: string) {
    const isAuthenticated = auth === 'true';
    return {
      title: 'Читательский билет - ReadFinder',
      styles: ['/styles/template.css', '/styles/library-card.css'],
      currentPath: '/library-card',
      user: isAuthenticated ? { name: 'Даниил' } : null,
    };
  }

  @Get('workspaces')
  @Render('workspaces')
  getWorkspaces(@Query('auth') auth?: string) {
    const isAuthenticated = auth === 'true';
    return {
      title: 'WorkSpaces - ReadFinder',
      styles: ['/styles/template.css', '/styles/workspaces.css'],
      currentPath: '/workspaces',
      user: isAuthenticated ? { name: 'Даниил' } : null,
      scripts: ['/javascript/load-users.js'],
    };
  }

  @Get('constructor')
  @Render('constructor')
  getConstructor(@Query('auth') auth?: string) {
    const isAuthenticated = auth === 'true';
    return {
      title: 'Конструктор расписаний - ReadFinder',
      styles: ['/styles/template.css', '/styles/constructor.css'],
      currentPath: '/constructor',
      user: isAuthenticated ? { name: 'Даниил' } : null,
      scripts: ['/javascript/constructor.js'],
    };
  }
}
