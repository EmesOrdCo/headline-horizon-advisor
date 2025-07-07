
import DisclaimerModal from "./DisclaimerModal";

const Footer = () => {
  return (
    <footer className="bg-slate-900 py-12 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-emerald-400 mb-4">StockPredict AI</div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Empowering investors with AI-driven market intelligence and real-time predictions.
          </p>
        </div>
        
        <div className="flex justify-center gap-8 mb-8">
          <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a>
          <DisclaimerModal />
        </div>
        
        <div className="text-center text-slate-500">
          © 2024 StockPredict AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
