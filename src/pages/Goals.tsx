import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Target, Trophy, Award, Star, Calendar } from 'lucide-react';
import { dummyGoals, type Goal } from '@/utils/dummyData';
import confetti from 'canvas-confetti';
import { useGuestMode } from '@/hooks/use-guest-mode';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { appendUserGoal, loadUserGoals } from '@/utils/goalsStorage';

const badges = [
  { icon: Trophy, title: 'Budget Hero', description: 'Stayed within budget for 3 months', earned: true },
  { icon: Award, title: 'Saver Pro', description: 'Saved ₹50,000 or more', earned: true },
  { icon: Star, title: 'Goal Crusher', description: 'Completed 5 financial goals', earned: false },
  { icon: Target, title: 'Investment Starter', description: 'Started investing journey', earned: false },
];

export default function Goals() {
  const isGuestMode = useGuestMode();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newCategory, setNewCategory] = useState('Savings');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isGuestMode) {
      const localGoals = loadUserGoals();
      setGoals([...dummyGoals, ...localGoals]);
      return;
    }

    if (!user) {
      setGoals(loadUserGoals());
      return;
    }

    const q = query(
      collection(db, 'users', user.uid, 'goals'),
      orderBy('deadline', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Goal[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          title: data.title ?? '',
          target:
            typeof data.target === 'number' ? data.target : Number(data.target) || 0,
          current:
            typeof data.current === 'number' ? data.current : Number(data.current) || 0,
          deadline: data.deadline ?? '',
          category: data.category ?? '',
        };
      });

      setGoals(docs);
    });

    return () => unsubscribe();
  }, [isGuestMode, user]);

  const displayBadges = isGuestMode
    ? badges
    : badges.map((badge) => ({ ...badge, earned: false }));

  const handleCelebrate = (goalId: string) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleAddGoal = async () => {
    if (!newTitle || !newTarget || !newDeadline) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in goal name, target and deadline.',
        variant: 'destructive',
      });
      return;
    }

    const targetNumber = Number(newTarget);
    if (!Number.isFinite(targetNumber) || targetNumber <= 0) {
      toast({
        title: 'Invalid target',
        description: 'Target amount should be a positive number.',
        variant: 'destructive',
      });
      return;
    }

    const baseGoal: Goal = {
      id:
        (typeof crypto !== 'undefined' && 'randomUUID' in crypto &&
          // @ts-expect-error - randomUUID may not exist in older environments
          crypto.randomUUID()) ||
        Date.now().toString(),
      title: newTitle,
      target: targetNumber,
      current: 0,
      deadline: newDeadline,
      category: newCategory,
    };

    const currentUser = user;

    try {
      if (!currentUser) {
        appendUserGoal(baseGoal);
        setGoals((prev) => [...prev, baseGoal]);
      } else {
        await addDoc(collection(db, 'users', currentUser.uid, 'goals'), {
          title: baseGoal.title,
          target: baseGoal.target,
          current: baseGoal.current,
          deadline: baseGoal.deadline,
          category: baseGoal.category,
        });
      }

      toast({
        title: 'Goal added',
        description: 'Your new financial goal has been created.',
      });

    setNewTitle('');
    setNewTarget('');
    setNewDeadline('');
    setNewCategory('Savings');
    } catch (error) {
      console.error('Error adding goal', error);
      toast({
        title: 'Failed to add goal',
        description: 'Something went wrong while saving your goal. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar showProfile />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold mb-2">Financial Goals</h1>
            <p className="text-muted-foreground">Track your progress and achieve your dreams</p>
          </motion.div>

          {/* Add Goal Form + Goals Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card order-last lg:order-first">
              <CardHeader>
                <CardTitle>Create New Goal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="goal-title">Goal name</label>
                  <input
                    id="goal-title"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="e.g., Emergency Fund"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="goal-target">Target (₹)</label>
                    <input
                      id="goal-target"
                      type="number"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      placeholder="50000"
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="goal-deadline">Deadline</label>
                    <input
                      id="goal-deadline"
                      type="date"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="goal-category">Category</label>
                  <input
                    id="goal-category"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    placeholder="Savings, Travel, Investment..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <Button className="w-full gradient-primary" onClick={handleAddGoal}>
                  Add Goal
                </Button>
              </CardContent>
            </Card>

            {/* Goals Grid */}
            <div className="space-y-0">
              {goals.length === 0 ? (
                <Card className="glass-card p-8 text-center text-muted-foreground">
                  No goals yet. Add your first savings target to see progress here.
                </Card>
              ) : (
                goals.map((goal, index) => {
                  const progress = (goal.current / goal.target) * 100;
                  const remaining = goal.target - goal.current;
                  const daysLeft = Math.ceil(
                    (new Date(goal.deadline).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="glass-card shadow-glass hover:shadow-glow transition-all">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl">{goal.title}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                {goal.category}
                              </p>
                            </div>
                            <div className="p-2 bg-gradient-primary rounded-lg">
                              <Target className="h-5 w-5 text-primary-foreground" />
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={progress} className="h-3" />
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Current</p>
                              <p className="text-lg font-bold">
                                ₹{goal.current.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Target</p>
                              <p className="text-lg font-bold">
                                ₹{goal.target.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>{daysLeft} days left</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ₹{remaining.toLocaleString()} remaining to reach your goal
                            </p>
                          </div>

                          {progress >= 100 && (
                            <Button
                              onClick={() => handleCelebrate(goal.id)}
                              className="w-full gradient-primary"
                            >
                              🎉 Celebrate Achievement!
                            </Button>
                          )}

                          {progress < 100 && (
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <p className="text-sm text-primary">
                                💡 AI Tip: Save ₹
                                {Math.ceil(remaining / (daysLeft || 1)).toLocaleString()}{' '}
                                per day to reach this goal!
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>

          </div>

          {/* Badges Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Achievement Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {displayBadges.map((badge, index) => (
                    <motion.div
                      key={badge.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                      className={`p-4 rounded-lg border-2 text-center ${
                        badge.earned
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-muted/30 opacity-50'
                      }`}
                    >
                      <div className={`inline-flex p-3 rounded-full mb-3 ${
                        badge.earned ? 'bg-gradient-primary' : 'bg-muted'
                      }`}>
                        <badge.icon className={`h-6 w-6 ${
                          badge.earned ? 'text-primary-foreground' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <h3 className="font-semibold mb-1">{badge.title}</h3>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                      {badge.earned && (
                        <Badge className="mt-2" variant="default">Earned</Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
