import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BooksModule } from './books/books.module';
import { LibrariesModule } from './libraries/libraries.module';
import { FavoritesModule } from './favorites/favorites.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { GraphQLResolversModule } from './graphql/graphql.module';
import { complexityPlugin } from './graphql/complexity';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src', 'schema.gql'),
      introspection: true,
      playground: false,
      includeStacktraceInErrorResponses: false,
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        complexityPlugin,
      ],
    }),
    PrismaModule,
    BooksModule,
    LibrariesModule,
    FavoritesModule,
    WorkspacesModule,
    EventsModule,
    UsersModule,
    GraphQLResolversModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
