import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Database, Shield, Bell, Palette } from 'lucide-react';

const adminSections = [
  {
    title: 'User Management',
    description: 'Manage students, instructors, and admin accounts',
    icon: Users,
    status: 'Active',
  },
  {
    title: 'Database',
    description: 'View and manage database tables and records',
    icon: Database,
    status: 'Active',
  },
  {
    title: 'Security',
    description: 'Configure authentication and access controls',
    icon: Shield,
    status: 'Active',
  },
  {
    title: 'Notifications',
    description: 'Configure email and push notification settings',
    icon: Bell,
    status: 'Inactive',
  },
  {
    title: 'Appearance',
    description: 'Customize the platform theme and branding',
    icon: Palette,
    status: 'Active',
  },
  {
    title: 'System Settings',
    description: 'Configure API keys, rate limits, and system parameters',
    icon: Settings,
    status: 'Active',
  },
];

const AdminPanel = () => {
  return (
    <PageLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">System administration and configuration</p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Shield className="h-3 w-3 mr-1" />
            Admin Access
          </Badge>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Card key={section.title} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="gradient-primary p-3 rounded-lg">
                    <section.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <Badge 
                    variant={section.status === 'Active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {section.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-4">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  Manage
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Placeholder Notice */}
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Admin Panel Placeholder</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This is a placeholder for the admin panel. Full functionality will be implemented 
              when backend integration is complete.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AdminPanel;
