
import { Badge } from "@/components/ui/badge";

const AnalysisPipeline = () => {
  const stages = [
    {
      title: "Headline Detection",
      description: "Scanning incoming news headlines...",
      status: "completed",
      confidence: 78
    },
    {
      title: "Significance Analysis", 
      description: "Evaluating market relevance and potential impact...",
      status: "completed"
    },
    {
      title: "Historical Analysis",
      description: "Comparing with similar historical events...", 
      status: "completed"
    },
    {
      title: "Impact Assessment",
      description: "Calculating expected price movements...",
      status: "completed"
    },
    {
      title: "Prediction Output",
      description: "Generating multi-timeframe predictions...",
      status: "in-progress",
      progress: 50
    }
  ];

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">AI Analysis Pipeline</h2>
        <p className="text-slate-400">See how our AI processes market-moving news in real-time</p>
      </div>
      
      <div className="bg-slate-800/30 backdrop-blur border border-slate-700 rounded-xl p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-blue-500 text-white">AAPL</Badge>
            <Badge className="bg-emerald-500 text-white">Bullish</Badge>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Apple announces record quarterly earnings, beats estimates by 15%
          </h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Confidence</span>
              <span className="text-emerald-400 font-semibold">78%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{width: '78%'}}></div>
            </div>
          </div>
        </div>
        
        <div className="grid gap-4">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                stage.status === 'completed' ? 'bg-emerald-500 text-white' :
                stage.status === 'in-progress' ? 'bg-yellow-500 text-black' :
                'bg-slate-600 text-slate-400'
              }`}>
                {stage.status === 'completed' ? '✓' : 
                 stage.status === 'in-progress' ? '⟳' : '○'}
              </div>
              <div className="flex-1">
                <h4 className="text-emerald-400 font-semibold text-sm">{stage.title}</h4>
                <p className="text-slate-300 text-sm">{stage.description}</p>
                {stage.progress && (
                  <div className="mt-2">
                    <div className="w-full bg-slate-700 rounded-full h-1">
                      <div 
                        className="bg-yellow-500 h-1 rounded-full transition-all duration-1000" 
                        style={{width: `${stage.progress}%`}}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              {stage.confidence && (
                <div className="text-right">
                  <div className="text-emerald-400 font-semibold text-sm">{stage.confidence}%</div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <span className="text-slate-400 text-sm">Processing Status</span>
          <Badge className="bg-yellow-500 text-black animate-pulse">
            ANALYZING
          </Badge>
        </div>
      </div>
    </section>
  );
};

export default AnalysisPipeline;
