import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ArrowLeft, DollarSign, Target, Calendar, Download, Eye, EyeOff } from 'lucide-react';
import { RetirementData, CalculationResults } from '../types';
import { formatCurrency } from '../utils/calculations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './ResultsDashboard.css';

interface ResultsDashboardProps {
  data: RetirementData;
  results: CalculationResults;
  onRecalculate: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ data, results, onRecalculate }) => {
  const [showFullInvestmentSchedule, setShowFullInvestmentSchedule] = useState(false);
  const [showFullWithdrawalSchedule, setShowFullWithdrawalSchedule] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Export to PDF functionality
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector('.results-dashboard') as HTMLElement;
      if (!element) return;

      // Temporarily show all data for export
      const originalInvestmentShow = showFullInvestmentSchedule;
      const originalWithdrawalShow = showFullWithdrawalSchedule;
      setShowFullInvestmentSchedule(true);
      setShowFullWithdrawalSchedule(true);

      // Wait for state to update and render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create a clone of the element for PDF generation
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = '1200px';
      clone.style.padding = '40px';
      clone.style.backgroundColor = '#ffffff';
      clone.style.color = '#000000';
      clone.style.fontFamily = 'Arial, sans-serif';
      
      // Apply PDF-specific styles
      const style = document.createElement('style');
      style.textContent = `
        .pdf-export * {
          color: #000000 !important;
          background-color: transparent !important;
          border-color: #e2e8f0 !important;
        }
        .pdf-export .table-wrapper th {
          background-color: #f8fafc !important;
          color: #1f2937 !important;
        }
        .pdf-export .metric-card {
          border: 1px solid #e2e8f0 !important;
          box-shadow: none !important;
        }
        .pdf-export .chart-container {
          border: 1px solid #e2e8f0 !important;
          box-shadow: none !important;
        }
      `;
      
      clone.classList.add('pdf-export');
      document.head.appendChild(style);
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1200,
        windowWidth: 1200,
        windowHeight: Math.max(clone.scrollHeight, 800)
      });

      // Clean up
      document.body.removeChild(clone);
      document.head.removeChild(style);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate dimensions to fit the page with margins
      const margin = 20;
      const availableWidth = pdfWidth - (2 * margin);
      const availableHeight = pdfHeight - (2 * margin);
      
      const ratio = Math.min(availableWidth / (imgWidth * 0.264583), availableHeight / (imgHeight * 0.264583));
      const scaledWidth = (imgWidth * 0.264583) * ratio;
      const scaledHeight = (imgHeight * 0.264583) * ratio;
      
      const x = (pdfWidth - scaledWidth) / 2;
      const y = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(67, 97, 238);
      pdf.text('Retirement Planning Report', pdfWidth / 2, 15, { align: 'center' });
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pdfWidth / 2, 25, { align: 'center' });

      // Check if content fits on one page
      if (scaledHeight > availableHeight - 20) {
        // Multi-page handling
        const pagesNeeded = Math.ceil(scaledHeight / (availableHeight - 20));
        const pageHeight = scaledHeight / pagesNeeded;
        
        for (let i = 0; i < pagesNeeded; i++) {
          if (i > 0) pdf.addPage();
          
          const sourceY = i * (imgHeight / pagesNeeded);
          const sourceHeight = imgHeight / pagesNeeded;
          
          // Create a canvas for this page section
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = sourceHeight;
          const pageCtx = pageCanvas.getContext('2d');
          
          if (pageCtx) {
            pageCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
            const pageImgData = pageCanvas.toDataURL('image/png');
            pdf.addImage(pageImgData, 'PNG', x, y, scaledWidth, pageHeight);
          }
        }
      } else {
        pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      }

      pdf.save(`retirement-plan-${new Date().toISOString().split('T')[0]}.pdf`);

      // Restore original state
      setShowFullInvestmentSchedule(originalInvestmentShow);
      setShowFullWithdrawalSchedule(originalWithdrawalShow);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Prepare chart data
  const investmentChartData = results.monthlyInvestments.map(inv => ({
    age: inv.age,
    monthlyInvestment: inv.monthlyAmount,
    corpus: inv.yearEndCorpus,
    inflationAdjusted: inv.inflationAdjustedAmount
  }));

  const withdrawalChartData = results.monthlyWithdrawals.map(withdrawal => ({
    age: withdrawal.age,
    monthlyWithdrawal: withdrawal.monthlyWithdrawal,
    remainingCorpus: withdrawal.remainingCorpus
  }));

  const summaryData = [
    { name: 'Total Investment', value: results.totalInvestmentNeeded, color: '#4361ee' },
    { name: 'Returns', value: results.totalReturns, color: '#2ec4b6' },
    { name: 'Current Savings', value: data.savingsTillNow, color: '#ff9f1c' }
  ];

  const keyMetrics = [
    {
      title: 'Required Corpus',
      value: formatCurrency(results.requiredCorpus),
      icon: Target,
      color: 'primary'
    },
    {
      title: 'Monthly Investment Needed',
      value: formatCurrency(results.monthlyInvestments[0]?.monthlyAmount || 0),
      icon: DollarSign,
      color: 'secondary'
    },
    {
      title: 'Investment Period',
      value: `${data.retirementAge - data.currentAge} years`,
      icon: Calendar,
      color: 'accent'
    },
    {
      title: 'Expected Returns',
      value: formatCurrency(results.totalReturns),
      icon: TrendingUp,
      color: 'success'
    }
  ];

  return (
    <div className="results-dashboard">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="back-btn" onClick={onRecalculate}>
          <ArrowLeft size={20} />
          Recalculate
        </button>
        <h2>Your Retirement Plan</h2>
        <button className="export-btn" onClick={exportToPDF} disabled={isExporting}>
          <Download size={20} />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div 
        className="metrics-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {keyMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            className={`metric-card ${metric.color}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
          >
            <div className="metric-icon">
              <metric.icon size={24} />
            </div>
            <div className="metric-content">
              <h3>{metric.title}</h3>
              <p className="metric-value">{metric.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Investment Growth Chart */}
        <motion.div 
          className="chart-container"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3>Investment Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={investmentChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(label) => `Age: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="corpus" 
                stroke="#4361ee" 
                strokeWidth={3}
                name="Total Corpus"
              />
              <Line 
                type="monotone" 
                dataKey="monthlyInvestment" 
                stroke="#2ec4b6" 
                strokeWidth={2}
                name="Monthly Investment"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Investment Bar Chart */}
        <motion.div 
          className="chart-container"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h3>Monthly Investment Requirements</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={investmentChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="age" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(label) => `Age: ${label}`}
              />
              <Bar dataKey="monthlyInvestment" fill="#4361ee" name="Nominal Amount" />
              <Bar dataKey="inflationAdjusted" fill="#2ec4b6" name="Today's Value" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Portfolio Composition Pie Chart */}
        <motion.div 
          className="chart-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3>Portfolio Composition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={summaryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {summaryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Withdrawal Chart */}
        {withdrawalChartData.length > 0 && (
          <motion.div 
            className="chart-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h3>Retirement Withdrawals</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={withdrawalChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  labelFormatter={(label) => `Age: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="remainingCorpus" 
                  stroke="#ff9f1c" 
                  strokeWidth={3}
                  name="Remaining Corpus"
                />
                <Line 
                  type="monotone" 
                  dataKey="monthlyWithdrawal" 
                  stroke="#e71d36" 
                  strokeWidth={2}
                  name="Monthly Withdrawal"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Tables Section */}
      <div className="tables-section">
        <motion.div 
          className="table-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="table-header">
            <h3>Investment Schedule</h3>
            {results.monthlyInvestments.length > 10 && (
              <button 
                className="toggle-btn"
                onClick={() => setShowFullInvestmentSchedule(!showFullInvestmentSchedule)}
              >
                {showFullInvestmentSchedule ? <EyeOff size={16} /> : <Eye size={16} />}
                {showFullInvestmentSchedule ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Age</th>
                  <th>Monthly Investment</th>
                  <th>Today's Value</th>
                  <th>Year-End Corpus</th>
                </tr>
              </thead>
              <tbody>
                {(showFullInvestmentSchedule ? results.monthlyInvestments : results.monthlyInvestments.slice(0, 10)).map((investment, index) => (
                  <tr key={index}>
                    <td>{investment.age}</td>
                    <td>{formatCurrency(investment.monthlyAmount)}</td>
                    <td>{formatCurrency(investment.inflationAdjustedAmount)}</td>
                    <td>{formatCurrency(investment.yearEndCorpus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!showFullInvestmentSchedule && results.monthlyInvestments.length > 10 && (
              <p className="table-note">Showing first 10 years. Click "Show All" to see full schedule.</p>
            )}
          </div>
        </motion.div>

        {withdrawalChartData.length > 0 && (
          <motion.div 
            className="table-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div className="table-header">
              <h3>Withdrawal Schedule</h3>
              {results.monthlyWithdrawals.length > 10 && (
                <button 
                  className="toggle-btn"
                  onClick={() => setShowFullWithdrawalSchedule(!showFullWithdrawalSchedule)}
                >
                  {showFullWithdrawalSchedule ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showFullWithdrawalSchedule ? 'Show Less' : 'Show All'}
                </button>
              )}
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Age</th>
                    <th>Monthly Withdrawal</th>
                    <th>Remaining Corpus</th>
                  </tr>
                </thead>
                <tbody>
                  {(showFullWithdrawalSchedule ? results.monthlyWithdrawals : results.monthlyWithdrawals.slice(0, 10)).map((withdrawal, index) => (
                    <tr key={index}>
                      <td>{withdrawal.age}</td>
                      <td>{formatCurrency(withdrawal.monthlyWithdrawal)}</td>
                      <td>{formatCurrency(withdrawal.remainingCorpus)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!showFullWithdrawalSchedule && results.monthlyWithdrawals.length > 10 && (
                <p className="table-note">Showing first 10 years. Click "Show All" to see full schedule.</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResultsDashboard; 