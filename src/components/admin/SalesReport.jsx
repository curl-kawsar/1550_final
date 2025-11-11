'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Search, 
  Download,
  Calendar,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { toast } from "sonner";

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    salesByMonth: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const response = await fetch('/api/admin/sales', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sales data');
      }

      const data = await response.json();
      setSalesData(data.sales);
      setSummary(data.summary);
      
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredSales = () => {
    let filtered = salesData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sale => 
        sale.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.registrationCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter(sale => 
        sale.paymentDate && new Date(sale.paymentDate) >= filterDate
      );
    }

    return filtered;
  };

  const exportToCSV = () => {
    const filteredData = getFilteredSales();
    const headers = ['Student Name', 'Email', 'Registration Code', 'Payment Date', 'Amount', 'Status', 'Stripe Payment ID'];
    
    const csvContent = [
      headers.join(','),
      ...filteredData.map(sale => [
        `"${sale.studentName}"`,
        sale.email,
        sale.registrationCode || '',
        formatDate(sale.paymentDate),
        sale.paymentAmount,
        sale.paymentStatus,
        sale.stripePaymentIntentId || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSales = getFilteredSales();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Sales Report</h2>
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
        
        {/* Loading skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
        
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Sales Report</h2>
        <Button onClick={fetchSalesData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +{summary.totalStudents} purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Students with access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per student
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.salesByMonth[0] ? formatCurrency(summary.salesByMonth[0].revenue) : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.salesByMonth[0] ? summary.salesByMonth[0].count : 0} sales
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or registration code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>

            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Sales Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration Code</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500">No sales data found</p>
                        {searchTerm && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSearchTerm('')}
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.studentName}
                      </TableCell>
                      <TableCell>{sale.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {sale.registrationCode || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(sale.paymentDate)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(sale.paymentAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={sale.paymentStatus === 'succeeded' ? 'default' : 'destructive'}
                        >
                          {sale.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (sale.stripePaymentIntentId) {
                              navigator.clipboard.writeText(sale.stripePaymentIntentId);
                              toast.success('Payment ID copied to clipboard');
                            }
                          }}
                        >
                          Copy ID
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredSales.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Showing {filteredSales.length} of {salesData.length} transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReport;
