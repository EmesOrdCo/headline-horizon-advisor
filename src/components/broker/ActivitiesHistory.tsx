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
  const { getActivities, getOrders, loading } = useAlpacaBroker();

  useEffect(() => {
    if (accountId) {
      loadActivities();
    }
  }, [accountId, activityType]);

  const loadActivities = async () => {
    try {
      const filters = activityType !== 'all' ? { activity_types: activityType } : {};
      
      console.log('Loading activities for account:', accountId);
      console.log('Activity filters:', filters);
      
      // Fetch orders first (this works)
      const ordersData = await getOrders(accountId, { status: 'all', limit: 50 });
      console.log('Orders data received:', ordersData);

      // Try to fetch activities, but don't fail if it doesn't work
      let activitiesData = [];
      try {
        activitiesData = await getActivities(accountId, filters);
        console.log('Activities data received:', activitiesData);
      } catch (activitiesError) {
        console.warn('Activities API failed, showing only orders:', activitiesError);
        activitiesData = [];
      }

      // Convert pending orders to activity format
      const pendingOrders = (ordersData || [])
        .filter((order: any) => ['accepted', 'pending_new', 'pending_cancel', 'pending_replace'].includes(order.status))
        .map((order: any) => ({
          activity_type: 'PENDING_ORDER',
          symbol: order.symbol,
          description: `${order.side.toUpperCase()} ${order.qty} shares - ${order.order_type} order`,
          qty: order.qty,
          price: order.limit_price,
          created_at: order.created_at,
          status: order.status,
          side: order.side
        }));

      console.log('Pending orders converted:', pendingOrders);

      // Combine and sort by date
      const combined = [...(activitiesData || []), ...pendingOrders]
        .sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());

      console.log('Combined activities:', combined);
      setActivities(combined);
    } catch (error) {
      console.error('Failed to load activities:', error);
      // Even if everything fails, try to at least show pending orders
      try {
        const ordersData = await getOrders(accountId, { status: 'all', limit: 50 });
        const pendingOrders = (ordersData || [])
          .filter((order: any) => ['accepted', 'pending_new', 'pending_cancel', 'pending_replace'].includes(order.status))
          .map((order: any) => ({
            activity_type: 'PENDING_ORDER',
            symbol: order.symbol,
            description: `${order.side.toUpperCase()} ${order.qty} shares - ${order.order_type} order`,
            qty: order.qty,
            price: order.limit_price,
            created_at: order.created_at,
            status: order.status,
            side: order.side
          }));
        setActivities(pendingOrders);
      } catch (fallbackError) {
        console.error('Complete failure to load any data:', fallbackError);
      }
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fill':
        return <TrendingUp className="h-4 w-4" />;
      case 'pending_order':
        return <CalendarDays className="h-4 w-4" />;
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
      case 'pending_order':
        return 'destructive';
      case 'deposit':
      case 'journal':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!accountId) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Account Activities</CardTitle>
          <CardDescription className="text-slate-400">Please select an account to view activities</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Account Activities</CardTitle>
          <CardDescription className="text-slate-400">Transaction history and account events</CardDescription>
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
            <div className="text-center py-8 text-slate-400">
              {loading ? 'Loading activities...' : 'No activities found'}
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <Card key={index} className="p-4 bg-slate-700/30 border-slate-600 hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                     <div className="flex items-start space-x-3">
                       <div className="p-2 rounded-full bg-slate-600">
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
                         <p className="text-sm text-slate-400">
                           {activity.description || 'No description available'}
                         </p>
                         {activity.qty && (
                           <p className="text-sm text-white">
                             Quantity: {activity.qty} 
                             {activity.price && ` @ $${parseFloat(activity.price).toFixed(2)}`}
                           </p>
                         )}
                       </div>
                     </div>
                     <div className="text-right">
                       {activity.net_amount && (
                         <p className={`font-semibold ${
                           parseFloat(activity.net_amount) >= 0 ? 'text-emerald-400' : 'text-red-400'
                         }`}>
                           {parseFloat(activity.net_amount) >= 0 ? '+' : ''}
                           ${parseFloat(activity.net_amount).toFixed(2)}
                         </p>
                       )}
                       <p className="text-sm text-slate-400">
                         {new Date(activity.date || activity.created_at).toLocaleDateString()}
                       </p>
                       <p className="text-xs text-slate-400">
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