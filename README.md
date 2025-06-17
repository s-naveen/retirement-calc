# 🏦 Retirement Calculator

A comprehensive, modern retirement planning calculator built with React and TypeScript. This application helps users plan their retirement by calculating required savings, investment strategies, and providing detailed financial projections.

## ✨ Features

### 📊 Core Functionality
- **Retirement Planning**: Calculate required monthly savings to reach retirement goals
- **Advanced Investment Modeling**: Support for multiple investment scenarios with different rates and time periods
- **Inflation Adjustment**: Accounts for inflation in all calculations
- **Pension Integration**: Includes expected pension benefits in retirement planning
- **Dynamic Interest Rates**: Different rates for pre-retirement and post-retirement periods

### 🎨 User Experience
- **Multi-Section Form**: Organized into Basic Information, Financial Rates, and Advanced Settings
- **Real-time Validation**: Instant feedback on form inputs with helpful error messages
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Animated Transitions**: Smooth animations powered by Framer Motion
- **Data Persistence**: Form data is automatically saved to local storage

### 📈 Results & Visualization
- **Comprehensive Dashboard**: Detailed breakdown of retirement calculations
- **Interactive Charts**: Visual representation of savings growth over time
- **Export Options**: Download results as PDF reports
- **Multiple Scenarios**: Compare different investment strategies

### 🛠️ Technical Features
- **TypeScript**: Full type safety and better development experience
- **Modern React**: Built with React 19 and functional components
- **Performance Optimized**: Efficient rendering and state management
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Progressive Web App**: Can be installed and used offline

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/s-naveen/retirement-calc.git
   cd retirement-calc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:4000](http://localhost:4000) to view the application

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 🎯 How to Use

### 1. Basic Information
- **Current Age**: Your current age in years
- **Retirement Age**: When you plan to retire
- **Funds Required Until Age**: How long you need your retirement funds to last
- **Current Savings**: Amount you have already saved
- **Expected Monthly Pension**: Pension benefits you expect to receive

### 2. Financial Rates
- **Inflation Rate**: Expected annual inflation (default: 6.5%)
- **Pre-Retirement Return Rate**: Expected annual return before retirement (default: 8%)
- **Post-Retirement Return Rate**: Expected annual return after retirement (default: 7%)
- **Investment Increment Rate**: Annual increase in your investment amount (default: 6.5%)

### 3. Advanced Settings
- **Multiple Investment Scenarios**: Add different investment plans with varying amounts, rates, and time periods
- **Flexible Time Horizons**: Model investments with different maturity periods
- **Custom Interest Rates**: Set specific returns for each investment

## 📊 Calculation Methodology

The calculator uses sophisticated financial modeling to provide accurate projections:

- **Future Value Calculations**: Accounts for compound interest over time
- **Inflation Adjustment**: All amounts are adjusted for purchasing power
- **Present Value Analysis**: Determines required savings in today's dollars
- **Multiple Investment Streams**: Handles complex investment portfolios
- **Pension Integration**: Factors in expected pension benefits

## 🛠️ Technical Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Styling**: CSS3 with custom properties
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **Testing**: Jest + React Testing Library
- **Build Tool**: Create React App

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Create React App](https://github.com/facebook/create-react-app)
- Icons provided by [Lucide React](https://lucide.dev/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
- Charts created with [Recharts](https://recharts.org/)

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

**Happy Retirement Planning! 🎉**
