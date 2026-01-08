import { useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHistory } from '@/hooks/useApi';
import { CheckCircle, XCircle, Clock, Code2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

const HistoryPage = () => {
  const { data: history, execute: loadHistory, isLoading } = useHistory();
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredHistory = history?.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const successCount = history?.filter((h) => h.status === 'success').length || 0;
  const errorCount = history?.filter((h) => h.status === 'error').length || 0;

  // Calculate improvement metrics
  const recentSubmissions = history?.slice(0, 5) || [];
  const olderSubmissions = history?.slice(5) || [];
  const recentSuccessRate = recentSubmissions.length > 0
    ? (recentSubmissions.filter(s => s.status === 'success').length / recentSubmissions.length) * 100
    : 0;
  const olderSuccessRate = olderSubmissions.length > 0
    ? (olderSubmissions.filter(s => s.status === 'success').length / olderSubmissions.length) * 100
    : 0;
  const improvement = recentSuccessRate - olderSuccessRate;

  return (
    <PageLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Submission History</h1>
          <p className="text-muted-foreground">Review your past submissions and track your progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{successCount}</p>
                <p className="text-sm text-muted-foreground">Successful Runs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{errorCount}</p>
                <p className="text-sm text-muted-foreground">Errors Encountered</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className={cn(
                  "text-2xl font-bold",
                  improvement > 0 ? "text-success" : improvement < 0 ? "text-destructive" : ""
                )}>
                  {improvement > 0 ? '+' : ''}{improvement.toFixed(0)}%
                </p>
                <p className="text-sm text-muted-foreground">Recent Improvement</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Submissions</CardTitle>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Errors</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredHistory && filteredHistory.length > 0 ? (
              <div className="space-y-3">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                          item.status === 'success' ? "bg-success/10" : "bg-destructive/10"
                        )}
                      >
                        {item.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{item.language}</Badge>
                          {item.errorType && (
                            <Badge variant="destructive" className="text-xs capitalize">
                              {item.errorType}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono truncate max-w-xs">
                          {item.code.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {item.executionTime > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.executionTime.toFixed(3)}s
                        </span>
                      )}
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Code2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No submissions found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default HistoryPage;
