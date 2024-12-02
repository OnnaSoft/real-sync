import { useState, useEffect } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { ClientOnly } from 'remix-utils/client-only';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ChartData, ChartOptions } from 'chart.js';

export const meta: MetaFunction = () => {
  return [
    { title: "Domain Traffic Dashboard" },
    { name: "description", content: "View traffic data for your domains" },
  ];
};

// This component will only be rendered on the client
const Charts = () => {
  const [selectedDomain, setSelectedDomain] = useState('example.com');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [Chart, setChart] = useState<any>(null);

  useEffect(() => {
    const loadChart = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      setChart(() => Chart);
    };
    loadChart();
  }, []);

  // Mock data - replace with actual API call in production
  const domains = ['example.com', 'test.com', 'demo.com'];
  const periods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  const getChartData = (period: string): ChartData<'line'> => {
    // This is mock data. In a real application, you would fetch this data based on the selected period
    switch (period) {
      case '7d':
        return {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Traffic',
            data: [1000, 1500, 1200, 1800, 2000, 1700, 1600],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        };
      case '30d':
        return {
          labels: Array.from({length: 30}, (_, i) => `Day ${i + 1}`),
          datasets: [{
            label: 'Traffic',
            data: Array.from({length: 30}, () => Math.floor(Math.random() * 10000)),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        };
      case '90d':
        return {
          labels: Array.from({length: 90}, (_, i) => `Day ${i + 1}`),
          datasets: [{
            label: 'Traffic',
            data: Array.from({length: 90}, () => Math.floor(Math.random() * 20000)),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  const TrafficChart = ({ domain, period }: { domain: string; period: string }) => {
    const [chartInstance, setChartInstance] = useState<any>(null);

    useEffect(() => {
      if (!Chart) return;

      const ctx = document.getElementById('trafficChart') as HTMLCanvasElement;
      if (!ctx) return;

      const chartData = getChartData(period);

      const options: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: `Traffic for ${domain} - ${periods.find(p => p.value === period)?.label}`,
          },
        },
      };

      if (chartInstance) {
        chartInstance.destroy();
      }

      const newChartInstance = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: options,
      });

      setChartInstance(newChartInstance);

      return () => {
        if (newChartInstance) {
          newChartInstance.destroy();
        }
      };
    }, [Chart, domain, period]);

    return <canvas id="trafficChart"></canvas>;
  };

  return (
    <>
      <Card className='bg-white'>
        <CardHeader>
          <CardTitle>Select Domain and Period</CardTitle>
          <CardDescription>Choose a domain and time period to view its traffic data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={setSelectedDomain} defaultValue={selectedDomain}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a domain" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {domains.map((domain) => (
                <SelectItem key={domain} value={domain} className='cursor-pointer'>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedPeriod} defaultValue={selectedPeriod}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a period" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {periods.map((period) => (
                <SelectItem key={period.value} value={period.value} className='cursor-pointer'>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className='bg-white'>
        <CardHeader>
          <CardTitle>Traffic Data</CardTitle>
          <CardDescription>Traffic data for the selected domain and period</CardDescription>
        </CardHeader>
        <CardContent>
          {Chart && <TrafficChart domain={selectedDomain} period={selectedPeriod} />}
        </CardContent>
      </Card>
    </>
  );
};

export default function DomainTrafficDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Domain Traffic Dashboard</h2>
      <ClientOnly fallback={<p>Loading charts...</p>}>
        {() => <Charts />}
      </ClientOnly>
    </div>
  );
}

