import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AlertCircle, BarChart3 } from 'lucide-react';
import { DomainConsumption } from '~/models/tunnel';
import { useAppSelector } from '~/store/hooks';

export default function DomainTrafficDashboard() {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [data, setData] = useState<DomainConsumption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/consumption', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch consumption data');
        }
        const result: DomainConsumption[] = await response.json();
        setData(result);
      } catch (err) {
        setError('Failed to load domain traffic data. Please try again later.');
        console.error('Error fetching consumption data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const domains = data.map(item => item.domain);
  const selectedData = data.find(item => item.domain === selectedDomain);

  const chartData = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const year = new Date().getFullYear();
    const consumption = selectedData?.consumptions.find(
      c => c.year === year && c.month === month
    );
    return {
      month: `${year}-${month.toString().padStart(2, '0')}`,
      dataUsage: consumption
        ? parseInt(consumption.dataUsage, 10) / 1024 / 1024 / 1024
        : 0, // Convert to GB or use 0 if no data
    };
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Domain Traffic Dashboard</CardTitle>
        <CardDescription>View traffic data for your domains</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Select onValueChange={(value) => setSelectedDomain(value)}>
            <SelectTrigger className="bg-white cursor-pointer">
              <SelectValue placeholder="Select a domain" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {domains.map(domain => (
                <SelectItem key={domain} value={domain} className="cursor-pointer">{domain}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ChartContainer
          config={{
            dataUsage: {
              label: "Data Usage (GB)",
              icon: BarChart3,
            },
          }}
          className="h-[450px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => value.split('-')[1]}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent className='bg-white' />} />
              <Bar 
                dataKey="dataUsage" 
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
