import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-microsoft';
import { AuthService } from './auth.service';
import { Config } from './config';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(
    private readonly authService: AuthService,
    private readonly config: Config,
  ) {
    super({
      clientID: config.CLIENT_ID,
      clientSecret: config.CLIENT_SECRET,
      callbackURL: config.AUTH_CALL_BACK_URL,
      scope: ['user.read'], // Scopes for Microsoft Graph API
      tenant: 'organizations', // From Azure AD
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = await this.authService.validateUser(profile);
    done(null, user);
  }
}
