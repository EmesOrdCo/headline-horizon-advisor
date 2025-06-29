
const Features = () => {
  const features = [
    {
      number: "01",
      title: "Real-time News Analysis",
      description: "Our AI continuously monitors market-moving news and analyzes their potential impact on stock prices in real-time."
    },
    {
      number: "02", 
      title: "AI-Powered Predictions",
      description: "Advanced machine learning algorithms process historical data and current events to generate accurate price predictions."
    },
    {
      number: "03",
      title: "Sentiment Analysis", 
      description: "Track market sentiment from bearish to bullish across multiple timeframes with confidence metrics."
    },
    {
      number: "04",
      title: "Multi-timeframe Forecasts",
      description: "Get predictions for 1 day, 1 week, 1 month, and 1 quarter with detailed confidence levels."
    },
    {
      number: "05",
      title: "Portfolio Integration",
      description: "Seamlessly integrate predictions with your existing portfolio to make informed investment decisions."
    }
  ];

  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-theme-card/30 backdrop-blur border border-theme-card rounded-xl p-6 hover:border-theme-accent/30 transition-colors">
              <div className="text-theme-accent text-2xl font-bold mb-4">{feature.number}</div>
              <h3 className="text-xl font-semibold text-theme-primary mb-3">{feature.title}</h3>
              <p className="text-theme-secondary leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
