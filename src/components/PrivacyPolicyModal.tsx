
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicyModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-slate-400 hover:text-white transition-colors cursor-pointer">
          Privacy Policy
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Privacy Policy</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 text-slate-300">
            <p className="text-sm text-slate-400">Last updated July 07, 2025</p>
            
            <div>
              <h3 className="text-white font-semibold mb-3 text-lg">1. WHAT INFORMATION DO WE COLLECT?</h3>
              
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">Personal information you disclose to us</h4>
                <p className="text-sm leading-relaxed mb-3 font-medium">
                  In Short: We collect personal information that you provide to us.
                </p>
                <p className="text-sm leading-relaxed mb-3">
                  We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
                </p>
                <p className="text-sm leading-relaxed mb-3">
                  <strong>Sensitive Information.</strong> We do not process sensitive information.
                </p>
                <p className="text-sm leading-relaxed">
                  All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
                </p>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2">Information automatically collected</h4>
                <p className="text-sm leading-relaxed mb-3 font-medium">
                  In Short: Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.
                </p>
                <p className="text-sm leading-relaxed mb-3">
                  We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.
                </p>
                <p className="text-sm leading-relaxed">
                  Like many businesses, we also collect information through cookies and similar technologies.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 text-lg">2. HOW DO WE PROCESS YOUR INFORMATION?</h3>
              <p className="text-sm leading-relaxed mb-3 font-medium">
                In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.
              </p>
              <p className="text-sm leading-relaxed">
                We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 text-lg">3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h3>
              <p className="text-sm leading-relaxed mb-3 font-medium">
                In Short: We may share information in specific situations described in this section and/or with the following third parties.
              </p>
              <p className="text-sm leading-relaxed mb-3">
                We may need to share your personal information in the following situations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed ml-4">
                <li>
                  <strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
                </li>
                <li>
                  <strong>Affiliates.</strong> We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Notice. Affiliates include our parent company and any subsidiaries, joint venture partners, or other companies that we control or that are under common control with us.
                </li>
                <li>
                  <strong>Business Partners.</strong> We may share your information with our business partners to offer you certain products, services, or promotions.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 text-lg">4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h3>
              <p className="text-sm leading-relaxed mb-3 font-medium">
                In Short: We may use cookies and other tracking technologies to collect and store your information.
              </p>
              <p className="text-sm leading-relaxed mb-3">
                We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.
              </p>
              <p className="text-sm leading-relaxed mb-3">
                We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help manage and display advertisements, to tailor advertisements to your interests, or to send abandoned shopping cart reminders (depending on your communication preferences). The third parties and service providers use their technology to provide advertising about products and services tailored to your interests which may appear either on our Services or on other websites.
              </p>
              <p className="text-sm leading-relaxed">
                Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;
