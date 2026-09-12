import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Render,
  Req,
  Res,
  Header,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import { deleteUser } from 'supertokens-node';
import { ApiExcludeController } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { PublicAccess } from './public.decorator';
import { getUser, viewUser } from './auth-user';
import { isStrongPassword } from './password-policy';
import { UsersService, MAX_NAME_LENGTH } from '../users/users.service';

@ApiExcludeController()
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Get('login')
  @PublicAccess()
  @Header('Cache-Control', 'no-store')
  @Render('auth/login')
  getLogin(
    @Query('redirect') redirect?: string,
    @Query('error') error?: string,
    @Query('email') email?: string,
  ) {
    return {
      title: 'Вход - ReadFinder',
      styles: ['/styles/template.css', '/styles/auth.css'],
      scripts: ['/javascript/auth-validation.js'],
      user: null,
      redirect: redirect || '',
      error: error || '',
      email: email || '',
    };
  }

  @Post('login')
  @PublicAccess()
  async postLogin(
    @Body() body: { email?: string; password?: string; redirect?: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const email = body.email ?? '';
    const password = body.password ?? '';
    const redirect = body.redirect || '/';

    try {
      const response = await EmailPassword.signIn('public', email, password);
      if (response.status === 'OK') {
        const user = await this.authService.syncPrismaUser(
          response.user.id,
          response.user.emails[0],
        );
        await this.authService.createSession(
          req,
          res,
          response.recipeUserId,
          user.id,
        );
        const safeRedirect =
          redirect.startsWith('/') &&
          !redirect.startsWith('//') &&
          !redirect.includes('\\')
            ? redirect
            : '/';
        return res.redirect(safeRedirect);
      }
      if (response.status === 'WRONG_CREDENTIALS_ERROR') {
        return res.redirect(
          `/auth/login?error=invalid&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirect)}`,
        );
      }
    } catch (e) {
      this.logger.warn(`Ошибка входа для ${email}: ${(e as Error).message}`);
    }
    return res.redirect(
      `/auth/login?error=server&email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirect)}`,
    );
  }

  @Get('signup')
  @PublicAccess()
  @Header('Cache-Control', 'no-store')
  @Render('auth/signup')
  getSignup(
    @Query('error') error?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
  ) {
    return {
      title: 'Регистрация - ReadFinder',
      styles: ['/styles/template.css', '/styles/auth.css'],
      scripts: ['/javascript/auth-validation.js'],
      user: null,
      error: error || '',
      name: name || '',
      email: email || '',
    };
  }

  @Post('signup')
  @PublicAccess()
  async postSignup(
    @Body() body: { email?: string; password?: string; name?: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const email = body.email ?? '';
    const password = body.password ?? '';
    const name = body.name?.trim() || '';

    if (name.length > MAX_NAME_LENGTH) {
      return res.redirect(this.signupErrorUrl('name', name, email));
    }

    if (!isStrongPassword(password)) {
      return res.redirect(this.signupErrorUrl('password', name, email));
    }

    try {
      const response = await EmailPassword.signUp('public', email, password);
      if (response.status === 'OK') {
        const existing = await this.usersService.findByEmail(
          response.user.emails[0],
        );
        if (existing) {
          await deleteUser(response.user.id).catch(() => undefined);
          return res.redirect(this.signupErrorUrl('exists', name, email));
        }
        const user = await this.authService.syncPrismaUser(
          response.user.id,
          response.user.emails[0],
          name,
        );
        await this.authService.createSession(
          req,
          res,
          response.recipeUserId,
          user.id,
        );
        return res.redirect('/');
      }
      if (response.status === 'EMAIL_ALREADY_EXISTS_ERROR') {
        return res.redirect(this.signupErrorUrl('exists', name, email));
      }
      if ((response as { status: string }).status === 'FIELD_ERROR') {
        return res.redirect(this.signupErrorUrl('email', name, email));
      }
    } catch (e) {
      this.logger.warn(`Ошибка регистрации ${email}: ${(e as Error).message}`);
    }
    return res.redirect(this.signupErrorUrl('server', name, email));
  }

  @Post('logout')
  @PublicAccess()
  async logout(@Req() req: Request, @Res() res: Response) {
    await this.authService.signOut(req, res);
    return res.redirect('/');
  }

  @Get('change-password')
  @Header('Cache-Control', 'no-store')
  @Render('auth/change-password')
  getChangePassword(
    @Req() req: Request,
    @Query('error') error?: string,
    @Query('success') success?: string,
  ) {
    const user = getUser(req);
    return {
      title: 'Смена пароля - ReadFinder',
      styles: ['/styles/template.css', '/styles/auth.css'],
      scripts: ['/javascript/auth-validation.js'],
      user: viewUser(user),
      error: error || '',
      success: success || '',
    };
  }

  @Post('change-password')
  async postChangePassword(
    @Body() body: { currentPassword?: string; newPassword?: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const currentPassword = body.currentPassword ?? '';
    const newPassword = body.newPassword ?? '';

    if (!isStrongPassword(newPassword)) {
      return res.redirect('/auth/change-password?error=password');
    }

    const result = await this.authService.changePassword(
      req,
      res,
      currentPassword,
      newPassword,
    );
    if (!result.ok) {
      return res.redirect(`/auth/change-password?error=${result.reason}`);
    }
    return res.redirect('/auth/change-password?success=1');
  }

  private signupErrorUrl(code: string, name: string, email: string): string {
    return `/auth/signup?error=${code}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;
  }
}
