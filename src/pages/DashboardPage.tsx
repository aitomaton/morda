import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, LayoutDashboard, Notebook as Robot, CreditCard, BarChart3, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Sample data for charts - replace with real data
const callData = [
  { date: '2024-01', processed: 65 },
  { date: '2024-02', processed: 78 },
  { date: '2024-03', processed: 90 },
  { date: '2024-04', processed: 81 },
  { date: '2024-05', processed: 86 },
  { date: '2024-06', processed: 95 },
];

const satisfactionData = [
  { month: 'Jan', satisfaction: 85 },
  { month: 'Feb', satisfaction: 88 },
  { month: 'Mar', satisfaction: 92 },
  { month: 'Apr', satisfaction: 87 },
  { month: 'May', satisfaction: 90 },
  { month: 'Jun', satisfaction: 93 },
];

const DashboardPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <MessageSquare className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">Chats</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Users className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">CRM</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <LayoutDashboard className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">Dashboards</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Robot className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">Unit Agents</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <CreditCard className="h-8 w-8 mb-2" />
              <h3 className="font-semibold">Billing</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processed Calls Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Processed Calls
                </CardTitle>
                <CardDescription>Daily call processing statistics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="processed" fill="#3b82f6" name="Processed Calls" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Satisfaction Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Customer Satisfaction
                </CardTitle>
                <CardDescription>Monthly satisfaction trends</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={satisfactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="satisfaction" 
                    stroke="#22c55e"
                    name="Satisfaction (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;