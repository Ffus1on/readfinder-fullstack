import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as exphbs from 'express-handlebars';
import * as express from 'express';
import methodOverride from 'method-override';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { helpers } from './common/hbs-helpers';
import { PrismaModel } from './generated/prisma-class';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.set('trust proxy', 1);

  const port = configService.get<number>('PORT') || 3000;

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    methodOverride((req) => {
      const body = req.body as Record<string, unknown> | undefined;
      if (typeof body?._method === 'string' && body._method)
        return body._method;
      const queryMethod = req.query?._method;
      return typeof queryMethod === 'string' ? queryMethod : '';
    }),
  );

  const expressApp = app.getHttpAdapter().getInstance();

  const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: join(__dirname, '..', 'src', 'views', 'layouts'),
    partialsDir: join(__dirname, '..', 'src', 'views', 'partials'),
    helpers,
  });

  expressApp.engine('.hbs', (filePath, options, callback) => {
    void hbs.engine(filePath, options, callback);
  });
  expressApp.set('view engine', '.hbs');
  expressApp.set('views', join(__dirname, '..', 'src', 'views'));

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
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [...PrismaModel.extraModels],
  });
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
