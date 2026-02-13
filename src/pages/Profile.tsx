import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { disableGuestSession } from '@/hooks/use-guest-mode';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [user, setUser] = useState<FirebaseUser | null>(() => auth.currentUser);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [daysActive, setDaysActive] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        setName(firebaseUser.displayName || 'User');
        setEmail(firebaseUser.email || '');

        // Calculate days active safely
        try {
          const createdAt = firebaseUser.metadata?.creationTime;
          if (createdAt) {
            const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
            setDaysActive(Math.max(0, days));
          } else {
            setDaysActive(0);
          }
        } catch (error) {
          console.log('Error calculating days active:', error);
          setDaysActive(0);
        }

        // Fetch phone number and location from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setPhone(data?.phone || '');
            setLocation(data?.location || '');
          }
        } catch (error) {
          console.log('Error fetching user data:', error);
        }

        // Fetch total transactions count
        try {
          const transactionsSnapshot = await getDocs(
            collection(db, 'users', firebaseUser.uid, 'transactions')
          );
          setTotalTransactions(transactionsSnapshot.size);
        } catch (error) {
          console.log('Error fetching transactions count:', error);
        }
      }
    });

    // Initialize from current user immediately if present
    const current = auth.currentUser;
    if (current) {
      setUser(current);
      setName(current.displayName || 'User');
      setEmail(current.email || '');

      // Calculate days active safely
      try {
        const createdAt = current.metadata?.creationTime;
        if (createdAt) {
          const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
          setDaysActive(Math.max(0, days));
        } else {
          setDaysActive(0);
        }
      } catch (error) {
        console.log('Error calculating days active:', error);
        setDaysActive(0);
      }

      // Fetch phone number and location from Firestore
      (async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', current.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setPhone(data?.phone || '');
            setLocation(data?.location || '');
          }
        } catch (error) {
          console.log('Error fetching user data:', error);
        }

        try {
          const transactionsSnapshot = await getDocs(
            collection(db, 'users', current.uid, 'transactions')
          );
          setTotalTransactions(transactionsSnapshot.size);
        } catch (error) {
          console.log('Error fetching transactions count:', error);
        }
      })();
    }

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Update name in Firebase Auth
      await updateProfile(user, { displayName: name });

      // Save all fields to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name,
        email: email,
        phone: phone,
        location: location,
        updatedAt: new Date(),
      }, { merge: true });

      setIsEditing(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully saved to the database',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Failed to update profile',
        description: 'Something went wrong while saving your changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      disableGuestSession();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out',
      });
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      console.error('Error during logout', error);
      toast({
        title: 'Logout failed',
        description: 'Something went wrong while logging you out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AppLayout showProfile>
      <main className="flex-1 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          {/* Profile Header */}
          <Card className="glass-card shadow-glass">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                    JD
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{name}</h1>
                  <p className="text-muted-foreground">{email}</p>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  <User className="inline h-4 w-4 mr-2" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-2" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="inline h-4 w-4 mr-2" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1 gradient-primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                  </p>
                </div>
                <ThemeToggle />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <h3 className="font-medium">Currency</h3>
                  <p className="text-sm text-muted-foreground">
                    Default currency for transactions
                  </p>
                </div>
                <span className="font-medium">INR (₹)</span>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-accent rounded-lg text-center">
                  <p className="text-2xl font-bold">{totalTransactions}</p>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                </div>
                <div className="p-4 bg-accent rounded-lg text-center">
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                </div>
                <div className="p-4 bg-accent rounded-lg text-center">
                  <p className="text-2xl font-bold">{daysActive}</p>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </AppLayout>
  );
}
