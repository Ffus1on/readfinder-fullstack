import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import type { Request, Response } from 'express';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
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
import { ElapsedTimeInterceptor } from './common/elapsed-time.interceptor';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({ ttl: 5000, isGlobal: true }),
    StorageModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src', 'schema.gql'),
      introspection: true,
      playground: false,
      includeStacktraceInErrorResponses: false,
      context: ({ req, res }: { req: Request; res: Response }) => ({
        req,
        res,
      }),
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
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ElapsedTimeInterceptor },
  ],
})
export class AppModule {}
