// import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '@/lib/db';
// import User from '@/models/User';
// import jwt from 'jsonwebtoken';
// import speakeasy from 'speakeasy';
// import qrcode from 'qrcode';

// // Helper to get user ID from token (assuming token is sent for setup/verify)
// const getUserIdFromToken = (req: NextRequest) => {
//     const token = req.cookies.get('token')?.value;
//     if (!token) return null;
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
//         return decoded.userId;
//     } catch (e) {
//         return null;
//     }
// };

// // POST /api/auth/2fa?action=setup
// // Generates a new 2FA secret and QR code for the logged-in user
// async function setup2FA(req: NextRequest) {
//     const userId = getUserIdFromToken(req);
//     if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
//     await dbConnect();
//     const secret = speakeasy.generateSecret({ name: 'Secure Vault' });
//     await User.findByIdAndUpdate(userId, { twoFactorSecret: secret.base32 });

//     const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);
//     return NextResponse.json({ qrCodeUrl, secret: secret.base32 });
// }

// // POST /api/auth/2fa?action=verify
// // Verifies the TOTP code and enables 2FA for the user
// async function verify2FA(req: NextRequest) {
//     const userId = getUserIdFromToken(req);
//     if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
//     const { token } = await req.json();
//     await dbConnect();
//     const user = await User.findById(userId);

//     if (!user || !user.twoFactorSecret) {
//         return NextResponse.json({ message: '2FA not set up' }, { status: 400 });
//     }

//     const verified = speakeasy.totp.verify({
//         secret: user.twoFactorSecret,
//         encoding: 'base32',
//         token: token,
//     });

//     if (verified) {
//         await User.findByIdAndUpdate(userId, { twoFactorEnabled: true });
//         return NextResponse.json({ message: '2FA enabled successfully' });
//     } else {
//         return NextResponse.json({ message: 'Invalid 2FA token' }, { status: 400 });
//     }
// }


// // POST /api/auth/2fa?action=login-verify
// // Verifies the TOTP code during login for a user who requires it
// async function loginVerify2FA(req: NextRequest) {
//     const { email, token: twoFactorToken } = await req.json();
//     if (!email || !twoFactorToken) {
//         return NextResponse.json({ message: 'Email and token are required' }, { status: 400 });
//     }

//     await dbConnect();
//     const user = await User.findOne({ email });

//     if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
//         return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
//     }

//     const verified = speakeasy.totp.verify({
//         secret: user.twoFactorSecret,
//         encoding: 'base32',
//         token: twoFactorToken,
//     });

//     if (verified) {
//         const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
//         const response = NextResponse.json({ message: 'Login successful' });
//         response.cookies.set('token', authToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600, path: '/' });
//         return response;
//     } else {
//         return NextResponse.json({ message: 'Invalid 2FA token' }, { status: 401 });
//     }
// }


// export async function POST(req: NextRequest) {
//     const { searchParams } = new URL(req.url);
//     const action = searchParams.get('action');

//     switch (action) {
//         case 'setup':
//             return setup2FA(req);
//         case 'verify':
//             return verify2FA(req);
//         case 'login-verify':
//             return loginVerify2FA(req);
//         default:
//             return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
//     }
// }

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email, otp } = await req.json(); // Expecting email and the otp code

    if (!email || !otp) {
        return NextResponse.json({ message: 'Email and OTP are required.' }, { status: 400 });
    }

    // 1. Find the user in the database
    const user = await User.findOne({ email });

    // 2. Check if an OTP was ever generated
    if (!user || !user.otp || !user.otpExpires) {
        return NextResponse.json({ message: 'Invalid request. Please try logging in again.' }, { status: 400 });
    }

    // 3. Check if the OTP has expired
    if (user.otpExpires < new Date()) {
        return NextResponse.json({ message: 'OTP has expired. Please try logging in again.' }, { status: 400 });
    }

    // 4. Check if the OTP is correct
    if (user.otp !== otp) {
        return NextResponse.json({ message: 'Invalid OTP.' }, { status: 400 });
    }

    // 5. OTP is valid, so clear it from the database to prevent reuse
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // 6. Issue the session token and log the user in
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
    response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600, path: '/' });
    
    return response;

  } catch (error) {
      console.error("Verification Error:", error);
      return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}