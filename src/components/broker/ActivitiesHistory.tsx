import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlpacaBroker } from '@/hooks/useAlpacaBroker';
import { CalendarDays, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface ActivitiesHistoryProps {
  accountId: string;
}

const ActivitiesHistory = ({ accountId }: ActivitiesHistoryProps) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [activityType, setActivityType] = useState('all');
  const { getActivities, loading } = useAlpacaBroker();

  useEffect(() => {
    if (accountId) {
      loadActivities();
    }
  }, [accountId, activityType]);

  const loadActivities = async () => {
    try {
      const filters = activityType !== 'all' ? { activity_types: activityType } : {};
      const data = await getActivities(accountId, filters);
      setActivities(data || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fill':
        return <TrendingUp className="h-4 w-4" />;
      case 'deposit':
      case 'journal':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CalendarDays className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fill':
        return 'default';
      case 'deposit':
      case 'journal':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!accountId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Activities</CardTitle>
          <CardDescription>Please select an account to view activities</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Activities</CardTitle>
          <CardDescription>Transaction history and account events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="FILL">Trade Executions</SelectItem>
                <SelectItem value="TRANS">Transfers</SelectItem>
                <SelectItem value="MISC">Miscellaneous</SelectItem>
                <SelectItem value="ACATC">ACAT</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={loadActivities} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {loading ? 'Loading activities...' : 'No activities found'}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-muted">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getActivityColor(activity.activity_type)}>
                            {activity.activity_type}
                          </Badge>
                          {activity.symbol && (
                            <Badge variant="outline">{activity.symbol}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description || 'No description available'}
                        </p>
                        {activity.qty && (
                          <p className="text-sm">
                            Quantity: {activity.qty} 
                            {activity.price && ` @ $${parseFloat(activity.price).toFixed(2)}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.net_amount && (
                        <p className={`font-semibold ${
                          parseFloat(activity.net_amount) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {parseFloat(activity.net_amount) >= 0 ? '+' : ''}
                          ${parseFloat(activity.net_amount).toFixed(2)}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date || activity.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date || activity.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivitiesHistory;