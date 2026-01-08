import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import {
  Code2,
  Bot,
  BarChart3,
  CheckCircle,
  Zap,
  Users,
  ArrowRight,
  Play,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'Multi-Language Support',
    description: 'Write and debug code in Python, C, C++, and Java with our powerful Monaco editor.',
  },
  {
    icon: Bot,
    title: 'AI-Powered Hints',
    description: 'Get intelligent debugging assistance without revealing the full solution.',
  },
  {
    icon: Lightbulb,
    title: 'Learn By Doing',
    description: 'Understand your mistakes with step-by-step explanations and concept references.',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Monitor your improvement over time with detailed submission history.',
  },
];

const instructorFeatures = [
  {
    icon: Users,
    title: 'Class Analytics',
    description: 'Monitor student performance and identify common struggles across your class.',
  },
  {
    icon: TrendingUp,
    title: 'Error Trends',
    description: 'Discover which programming concepts cause the most difficulty.',
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              TraceCode Assistant
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Debug Smarter, <span className="text-gradient">Learn Faster</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your intelligent programming lab companion. Get real-time debugging hints,
              understand your mistakes, and improve your coding skills without being given the answers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gradient-primary text-primary-foreground">
                <Link to="/selection">
                  <Play className="mr-2 h-5 w-5" />
                  Start Coding
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">For Students</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to debug your code and master programming concepts
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="gradient-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">For Instructors</h2>
              <p className="text-muted-foreground mb-8">
                Gain insights into your class performance with powerful analytics.
                Identify struggling students, common error patterns, and difficult concepts.
              </p>
              <div className="space-y-4">
                {instructorFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-8" variant="outline" asChild>
                <Link to="/instructor/login">
                  Access Instructor Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="bg-card rounded-2xl shadow-2xl border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-32 bg-muted/50 rounded flex items-center justify-center">
                    <BarChart3 className="h-16 w-16 text-primary/20" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-20 bg-primary/10 rounded" />
                    <div className="h-20 bg-accent/10 rounded" />
                    <div className="h-20 bg-success/10 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to level up your coding?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of students improving their programming skills with AI-powered assistance.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/selection">
              Get Started Free
              <CheckCircle className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="gradient-primary p-2 rounded-lg">
                <Code2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">TraceCode</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 TraceCode. Built for better learning.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
