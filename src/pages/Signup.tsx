import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, ArrowRight, KeyRound } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { disableGuestSession } from '@/hooks/use-guest-mode';
import { setDoc, doc } from 'firebase/firestore';
import { sendOtp, verifyOtp } from '@/services/api';

export default function Signup() {
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      toast({
        title: 'Missing information',
        description: 'Please complete all fields.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Please choose a password with at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both password fields are identical.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const data = await sendOtp(email);

      if (data.success) {
        toast({
          title: 'OTP Sent',
          description: `We sent a verification code to ${email}`,
        });
        setStep('otp');
      } else {
        toast({
          title: 'Failed to send OTP',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Error',
        description: 'Could not connect to verification service.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter a valid 6-digit code.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verify OTP
      const verifyData = await verifyOtp(email, otp);

      if (!verifyData.success) {
        throw new Error(verifyData.message || 'Invalid OTP');
      }

      // 2. Create Firebase Account
      const credentials = await createUserWithEmailAndPassword(auth, email, password);

      if (credentials.user && fullName) {
        await updateProfile(credentials.user, { displayName: fullName });

        // Store phone number in Firestore
        await setDoc(doc(db, 'users', credentials.user.uid), {
          phone: phone,
          createdAt: new Date(),
          emailVerified: true // Mark as verified since we checked OTP
        });
      }

      disableGuestSession();
      toast({
        title: 'Account created!',
        description: 'Welcome to FinZora. Redirecting you to the dashboard.',
      });

      navigate('/dashboard');

    } catch (error) {
      console.error('Signup error', error);
      toast({
        title: 'Unable to create account',
        description: (error as any).message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="absolute inset-0 gradient-hero opacity-50" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="glass-card shadow-glow">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-primary rounded-2xl">
                  {step === 'details' ? (
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                  ) : (
                    <Mail className="h-8 w-8 text-primary-foreground" />
                  )}
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">
                {step === 'details' ? 'Create your account' : 'Verify Email'}
              </CardTitle>
              <CardDescription>
                {step === 'details'
                  ? 'Start your intelligent finance journey in minutes'
                  : `Enter the code sent to ${email}`
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 'details' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Alex Johnson"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-background"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                    {isLoading ? 'Sending Code...' : 'Continue'} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndSignup} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="bg-background pl-10 text-center tracking-widest text-lg"
                        autoFocus
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Check your spam folder if you don't see the email.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/3"
                      onClick={() => setStep('details')}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="w-2/3 gradient-primary" disabled={isLoading}>
                      {isLoading ? 'Verifying...' : 'Verify & Create'}
                    </Button>
                  </div>
                </form>
              )}

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
