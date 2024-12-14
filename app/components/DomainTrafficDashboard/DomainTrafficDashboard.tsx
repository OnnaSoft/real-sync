import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AlertCircle, BarChart3 } from 'lucide-react';
import { DomainConsumption } from '~/models/tunnel';
import { useAppSelector } from '~/store/hooks';
import useFetch from '~/hooks/useFetch';

export default function DomainTrafficDashboard() {
  const fetch = useFetch();
  const [selectedDomain, setSelectedDomain] = useState<string>("All Domains");
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

  const domains = ["All Domains", ...data.map(item => item.domain)];

  const chartData = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const year = new Date().getFullYear();
    let totalUsage = 0;

    if (selectedDomain === "All Domains") {
      data.forEach(domain => {
        const consumption = domain.consumptions.find(
          c => c.year === year && c.month === month
        );
        if (consumption) {
          totalUsage += parseInt(consumption.dataUsage, 10);
        }
      });
    } else {
      const selectedDataItem = data.find(item => item.domain === selectedDomain);
      const consumption = selectedDataItem?.consumptions.find(
        c => c.year === year && c.month === month
      );
      if (consumption) {
        totalUsage = parseInt(consumption.dataUsage, 10);
      }
    }

    return {
      month: `${year}-${month.toString().padStart(2, '0')}`,
      dataUsage: totalUsage / 1024 / 1024 / 1024, // Convert to GB
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedDomain === "All Domains"
            ? "All Domains Traffic Dashboard"
            : `Domain Traffic Dashboard: ${selectedDomain}`}
        </CardTitle>
        <CardDescription>View traffic data for your domains</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col'>
        <div className="mb-6">
          <Select onValueChange={(value) => setSelectedDomain(value)} defaultValue="All Domains">
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
              color: "#2563eb",
              icon: BarChart3,
            },
          }}
          className="max-h-[450px] flex-1"
        >
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year.slice(2)}`;
                }}
              />
              <YAxis
                tickFormatter={(value) => `${value} GB`}
              />
              <ChartTooltip content={<ChartTooltipContent className='bg-white' />} />
              <Bar
                dataKey="dataUsage"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

