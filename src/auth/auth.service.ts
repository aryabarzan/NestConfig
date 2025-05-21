import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(profile: any): Promise<any> {
    return { id: profile.id, email: profile.emails[0].value };
  }
}
