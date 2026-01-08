import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHistory } from '@/hooks/useApi';
import { Code2, CheckCircle, XCircle, Clock, ArrowRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const StudentDashboard = () => {
  const { data: history, execute: loadHistory, isLoading } = useHistory();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const successCount = history?.filter((h) => h.status === 'success').length || 0;
  const errorCount = history?.filter((h) => h.status === 'error').length || 0;
  const totalSubmissions = history?.length || 0;
  const successRate = totalSubmissions > 0 ? Math.round((successCount / totalSubmissions) * 100) : 0;

  return (
    <PageLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-muted-foreground">Track your progress and continue coding</p>
          </div>
          <Button asChild className="gradient-primary text-primary-foreground">
            <Link to="/student/editor">
              <Play className="mr-2 h-4 w-4" />
              Open Code Editor
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Submissions"
            value={totalSubmissions}
            icon={Code2}
          />
          <StatCard
            title="Successful Runs"
            value={successCount}
            icon={CheckCircle}
          />
          <StatCard
            title="Errors Encountered"
            value={errorCount}
            icon={XCircle}
          />
          <StatCard
            title="Success Rate"
            value={`${successRate}%`}
            icon={Clock}
            trend={successRate > 50 ? { value: 5, isPositive: true } : undefined}
          />
        </div>

        {/* Recent Submissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Submissions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/student/history">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : history && history.length > 0 ? (
              <div className="space-y-3">
                {history.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          item.status === 'success' ? "bg-success" : "bg-destructive"
                        )}
                      />
                      <div>
                        <p className="font-medium text-sm">{item.language}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'success' ? (
                        <span className="text-xs text-success font-medium">Success</span>
                      ) : (
                        <span className="text-xs text-destructive font-medium capitalize">
                          {item.errorType} Error
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Code2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No submissions yet. Start coding!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default StudentDashboard;
