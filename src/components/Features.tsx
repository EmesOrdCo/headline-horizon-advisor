
const Features = () => {
  const features = [
    {
      number: "01",
      title: "Live Market News Analysis",
      description: "Our AI continuously monitors breaking news from multiple sources and instantly analyzes their potential impact on stock prices. Get real-time alerts on market-moving events as they happen, with detailed sentiment analysis and confidence scores."
    },
    {
      number: "02", 
      title: "AI-Powered Stock Insights",
      description: "Advanced machine learning algorithms process news articles, market data, and historical patterns to generate actionable insights for your portfolio. Each analysis includes confidence levels and detailed reasoning behind our AI's conclusions."
    },
    {
      number: "03",
      title: "Multi-Source News Aggregation", 
      description: "Track comprehensive market coverage by aggregating news from dozens of financial sources. Our system weights articles by relevance and credibility, ensuring you get the most impactful information first with full source transparency."
    },
    {
      number: "04",
      title: "Magnificent 7 & Index Tracking",
      description: "Stay updated on the biggest market movers including Apple, Microsoft, Google, Amazon, NVIDIA, Tesla, and Meta, plus major index funds like SPY, QQQ, and DIA. Get dedicated analysis for the stocks that move markets most."
    },
    {
      number: "05",
      title: "Personal Stock Watchlist",
      description: "Create and manage your personalized stock watchlist with AI-powered analysis tailored to your holdings. Receive targeted insights on your specific investments with custom alerts and portfolio-focused news analysis."
    }
  ];

  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">What You Get</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Real-time AI analysis that turns market noise into actionable intelligence
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-emerald-500/30 transition-colors">
              <div className="text-emerald-400 text-2xl font-bold mb-4">{feature.number}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
