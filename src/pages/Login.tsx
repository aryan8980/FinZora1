import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { disableGuestSession, enableGuestSession } from '@/hooks/use-guest-mode';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address to reset your password.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Reset email sent',
        description: 'Check your inbox for password reset instructions.',
      });
    } catch (error) {
      console.error('Reset password error', error);
      toast({
        title: 'Error',
        description: (error as { message?: string }).message ?? 'Failed to send reset email.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Missing credentials',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      disableGuestSession();
      toast({
        title: 'Login Successful!',
        description: 'Welcome back to FinZora',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Firebase login error', error);
      toast({
        title: 'Unable to sign in',
        description:
          (error as { message?: string }).message ?? 'Please verify your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    enableGuestSession();
    navigate('/dashboard');
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
      disableGuestSession();
      toast({
        title: 'Logged in with Google',
        description: 'Welcome back to FinZora',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error', error);
      toast({
        title: 'Google sign-in failed',
        description: (error as { message?: string }).message ?? 'Please try again.',
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
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
              <CardDescription>Sign in to continue your financial journey</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      variant="link"
                      className="px-0 font-normal text-xs h-auto"
                      onClick={handleForgotPassword}
                      type="button"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background"
                  />
                </div>

                <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                  {isLoading ? 'Signing In…' : 'Sign In'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  Sign in with Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  Continue as Guest
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
