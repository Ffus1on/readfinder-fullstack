import { Module } from '@nestjs/common';
import './enums/category.enum';
import './enums/workspace-type.enum';
import './enums/user-role.enum';
import { BooksModule } from '../books/books.module';
import { LibrariesModule } from '../libraries/libraries.module';
import { EventsModule } from '../events/events.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { UsersModule } from '../users/users.module';
import { BooksResolver } from './books/books.resolver';
import { LibrariesResolver } from './libraries/libraries.resolver';
import { LibraryBookResolver } from './libraries/library-book.resolver';
import { EventsResolver } from './events/events.resolver';
import { WorkspacesResolver } from './workspaces/workspaces.resolver';
import { FavoritesResolver } from './favorites/favorites.resolver';
import { UsersResolver } from './users/users.resolver';

@Module({
  imports: [
    BooksModule,
    LibrariesModule,
    EventsModule,
    WorkspacesModule,
    FavoritesModule,
    UsersModule,
  ],
  providers: [
    BooksResolver,
    LibrariesResolver,
    LibraryBookResolver,
    EventsResolver,
    WorkspacesResolver,
    FavoritesResolver,
    UsersResolver,
  ],
})
export class GraphQLResolversModule {}
