import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Config } from './config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: Config,
  ) {}

  @Get('check')
  async check(@Req() req, @Res() res) {
    const token = req.cookies['access_token'];
    if (!token) {
      return res.status(401).json({ loggedIn: false });
    }

    try {
      const decoded = this.jwtService.verify(token);
      return res.json({ loggedIn: true, user: decoded });
    } catch (error) {
      return res.status(401).json({ loggedIn: false });
    }
  }

  @Get('/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftLoginCallback(@Req() req, @Res() res) {
    // Extract the state parameter
    const state = req.query.state;
    const { originalUrl } = JSON.parse(decodeURIComponent(state));

    // Handle the callback and return user data
    const user = req.user;
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    // Set the token in a cookie
    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect the user to the original URL
    res.redirect(`${originalUrl}?email=${user.email}`);
  }

  @Get('/client-id')
  async clientId() {
    return this.config.CLIENT_ID;
  }
}
