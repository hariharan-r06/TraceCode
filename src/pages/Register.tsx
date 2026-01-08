import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Code2, Loader2, GraduationCap, BookOpen, Chrome } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, loginGoogle, isLoading } = useAuth();

  // Check for 'personal' mode from query params
  const searchParams = new URLSearchParams(window.location.search);
  const isPersonalMode = searchParams.get('type') === 'personal';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Force 'student' role if in personal mode
      const finalRole = isPersonalMode ? 'student' : role;
      await register(name, email, password, finalRole);

      // Personal mode always goes to student dashboard
      if (isPersonalMode) {
        navigate('/student/dashboard');
      } else {
        navigate(role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard');
      }
    } catch (error) {
      // Error is handled by AuthContext with toast
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await loginGoogle();
      navigate('/student/dashboard');
    } catch (error) {
      // Error is handled by AuthContext with toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-semibold text-xl">
            <div className="gradient-primary p-2 rounded-lg">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            TraceCode
          </Link>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">
              {isPersonalMode ? 'Create Personal Account' : 'Create an account'}
            </CardTitle>
            <CardDescription>Get started with TraceCode today</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Hide tabs in Personal mode */}
            {!isPersonalMode && (
              <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="student" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Student
                  </TabsTrigger>
                  <TabsTrigger value="instructor" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Instructor
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Sign up with Google
            </Button>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
