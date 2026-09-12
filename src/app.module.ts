import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import type { Request, Response } from 'express';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
import { AdminModule } from './admin/admin.module';
import { GraphQLResolversModule } from './graphql/graphql.module';
import { complexityPlugin } from './graphql/complexity';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ElapsedTimeInterceptor } from './common/elapsed-time.interceptor';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { AuthMiddleware } from './auth/auth.middleware';
import { AuthService } from './auth/auth.service';
import { ConfigService } from '@nestjs/config';
import Session from 'supertokens-node/recipe/session';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register({ ttl: 5000, isGlobal: true }),
    StorageModule,
    AuthModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        appName:
          configService.get<string>('SUPERTOKENS_APP_NAME') || 'ReadFinder',
        apiDomain:
          configService.get<string>('SUPERTOKENS_API_DOMAIN') ||
          'http://localhost:3000',
        websiteDomain:
          configService.get<string>('SUPERTOKENS_WEBSITE_DOMAIN') ||
          'http://localhost:3000',
        apiBasePath:
          configService.get<string>('SUPERTOKENS_API_BASE_PATH') || '/api/auth',
        websiteBasePath:
          configService.get<string>('SUPERTOKENS_WEBSITE_BASE_PATH') || '/auth',
        connectionURI:
          configService.get<string>('SUPERTOKENS_CONNECTION_URI') || '',
        apiKey: configService.get<string>('SUPERTOKENS_API_KEY'),
      }),
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src', 'schema.gql'),
      introspection: true,
      playground: false,
      includeStacktraceInErrorResponses: false,
      context: async ({ req, res }: { req: Request; res: Response }) => {
        let sessionUserId: string | undefined;
        try {
          const session = await Session.getSession(req, res, {
            sessionRequired: false,
            overrideGlobalClaimValidators: () => [],
          });
          if (session) {
            sessionUserId = AuthService.resolveDbUserId(session);
          }
        } catch {
          sessionUserId = undefined;
        }
        return { req, res, sessionUserId };
      },
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
    AdminModule,
    GraphQLResolversModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ElapsedTimeInterceptor },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/logout', method: RequestMethod.ALL },
        { path: 'api/docs', method: RequestMethod.ALL },
        { path: 'api/docs-json', method: RequestMethod.ALL },
        { path: 'graphql', method: RequestMethod.ALL },
        { path: 'favicon.ico', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
