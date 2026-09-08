import {
  Module,
  DynamicModule,
  Global,
  Type,
  InjectionToken,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthModuleOptions, AUTH_MODULE_OPTIONS } from './auth.config';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Global()
@Module({})
export class AuthModule {
  static forRootAsync(options: {
    imports?: Array<Type | DynamicModule>;
    useFactory: (
      ...args: never[]
    ) => Promise<AuthModuleOptions> | AuthModuleOptions;
    inject?: InjectionToken[];
  }): DynamicModule {
    return {
      module: AuthModule,
      imports: [...(options.imports ?? []), UsersModule],
      providers: [
        {
          provide: AUTH_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        AuthService,
      ],
      controllers: [AuthController],
      exports: [AuthService],
    };
  }
}
