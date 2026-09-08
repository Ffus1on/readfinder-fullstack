import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as exphbs from 'express-handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;

  app.useStaticAssets(join(__dirname, '..', 'public'));

  const expressApp = app.getHttpAdapter().getInstance();

  const hbs = exphbs.create({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: join(__dirname, '..', 'src', 'views', 'layouts'),
    partialsDir: join(__dirname, '..', 'src', 'views', 'partials'),
  });

  expressApp.engine('.hbs', (path, options, callback) => {
    void hbs.engine(path, options, callback);
  });
  expressApp.set('view engine', '.hbs');
  expressApp.set('views', join(__dirname, '..', 'src', 'views'));

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
