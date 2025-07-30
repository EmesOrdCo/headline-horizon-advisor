import { Twitter, Linkedin } from "lucide-react";
import DisclaimerModal from "./DisclaimerModal";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import ContactModal from "./ContactModal";
import TermsOfServiceModal from "./TermsOfServiceModal";

const Footer = () => {
  return (
    <footer className="bg-background py-16 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Column 1: Logo + Tagline */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-bold text-emerald-400 mb-4">MarketSensorAI</div>
            <p className="text-muted-foreground text-sm">
              AI-powered trading intelligence that never sleeps.
            </p>
          </div>
          
          {/* Column 2: Product Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <div className="space-y-2">
              <a href="#features" className="block text-muted-foreground hover:underline text-sm">
                Features
              </a>
              <a href="#how-it-works" className="block text-muted-foreground hover:underline text-sm">
                How It Works
              </a>
              <a href="#" className="block text-muted-foreground hover:underline text-sm">
                Blog
              </a>
            </div>
          </div>
          
          {/* Column 3: Support Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <div className="space-y-2">
              <ContactModal />
              <TermsOfServiceModal />
              <PrivacyPolicyModal />
            </div>
          </div>
          
          {/* Column 4: Social Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Connect</h4>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground hover:scale-110 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="text-center text-muted-foreground border-t border-border pt-8">
          © 2025 MarketSensorAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;