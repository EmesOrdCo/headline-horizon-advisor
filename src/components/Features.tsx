
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
      title: "Biggest Movers Dashboard",
      description: "Track the day's top gainers and losers with AI-powered analysis explaining why stocks are moving and what it means for your portfolio."
    },
    {
      number: "05",
      title: "Personal Stock Watchlist",
      description: "Monitor your selected stocks with personalized insights, real-time price updates, and AI-generated analysis tailored to your holdings."
    }
  ];

  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-emerald-500/30 transition-colors">
              <div className="text-emerald-400 text-2xl font-bold mb-4">{feature.number}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
