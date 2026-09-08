import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as exphbs from 'express-handlebars';
import express from 'express';
import methodOverride from 'method-override';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { helpers } from './common/hbs-helpers';
import { PrismaModel } from './generated/prisma-class';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
  );
  const configService = app.get(ConfigService);

  server.set('trust proxy', 1);

  const port = configService.get<number>('PORT') || 3000;
  const websiteDomain =
    configService.get<string>('SUPERTOKENS_WEBSITE_DOMAIN') ||
    `http://localhost:${port}`;

  app.enableCors({
    origin: [websiteDomain],
    credentials: true,
    allowedHeaders: [
      'content-type',
      'anti-csrf',
      'st-auth-mode',
      'rid',
      'if-none-match',
    ],
    exposedHeaders: ['st-auth-mode', 'anti-csrf'],
  });

  const viewsDir = join(__dirname, '..', 'src', 'views');
  server.use(express.static(join(__dirname, '..', 'public')));
  server.use(express.urlencoded({ extended: true }));
  server.use(
    methodOverride((req) => {
      const body = req.body as Record<string, unknown> | undefined;
      if (typeof body?._method === 'string' && body._method)
        return body._method;
      const queryMethod = req.query?._method;
      return typeof queryMethod === 'string' ? queryMethod : '';
    }),
  );

  const authService = app.get(AuthService);
  server.use(authService.getMiddleware());

  const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: join(viewsDir, 'layouts'),
    partialsDir: join(viewsDir, 'partials'),
    helpers,
  });

  server.engine('.hbs', (filePath, options, callback) => {
    void hbs.engine(filePath, options, callback);
  });
  server.set('view engine', '.hbs');
  server.set('views', viewsDir);

  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ReadFinder API')
    .setDescription(
      'RESTful API приложения ReadFinder — поиск книг, библиотек, мероприятий и рабочих мест.',
    )
    .setVersion('1.0')
    .addTag('Books', 'Книги и их наличие в библиотеках')
    .addTag('Libraries', 'Библиотеки и их дочерние ресурсы')
    .addTag('Events', 'Мероприятия библиотек')
    .addTag('Workspaces', 'Рабочие места в библиотеках')
    .addTag('Favorites', 'Избранные книги пользователя')
    .addTag('Users', 'Пользователи')
    .addSecurity('sessionAuth', {
      type: 'apiKey',
      in: 'cookie',
      name: 'sAccessToken',
      description:
        'Cookie-сессия SuperTokens. Получить: POST /auth/login (email + password).',
    })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [...PrismaModel.extraModels],
  });
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);

  server.use(authService.getErrorHandler());

  console.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
