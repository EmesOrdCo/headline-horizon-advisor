
const Footer = () => {
  return (
    <footer className="bg-theme-nav py-12 px-6 border-t border-theme-nav">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-theme-accent mb-4">StockPredict AI</div>
          <p className="text-theme-muted max-w-2xl mx-auto">
            Empowering investors with AI-driven market intelligence and real-time predictions.
          </p>
        </div>
        
        <div className="flex justify-center gap-8 mb-8">
          <a href="#" className="text-theme-muted hover:text-theme-primary transition-colors">Privacy Policy</a>
          <a href="#" className="text-theme-muted hover:text-theme-primary transition-colors">Terms of Service</a>
          <a href="#" className="text-theme-muted hover:text-theme-primary transition-colors">Contact</a>
        </div>
        
        <div className="text-center text-theme-muted">
          © 2024 StockPredict AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
