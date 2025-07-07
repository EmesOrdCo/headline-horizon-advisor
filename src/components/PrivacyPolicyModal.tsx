
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const PrivacyPolicyModal = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-slate-400 hover:text-white transition-colors cursor-pointer">
          Privacy Policy
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Privacy Notice</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 text-slate-300">
            <p className="text-sm text-slate-400">Last updated July 07, 2025</p>
            
            {/* Introduction */}
            <div className="space-y-4">
              <p className="text-sm leading-relaxed">
                This Privacy Notice for <strong>StockPredict AI</strong> ("we," "us," or "our"), describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you:
              </p>
              <p className="text-sm leading-relaxed">
                <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services.
              </p>
            </div>

            {/* Summary of Key Points */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-lg">SUMMARY OF KEY POINTS</h3>
              <p className="text-sm leading-relaxed mb-4 italic">
                This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our table of contents below to find the section you are looking for.
              </p>
              
              <div className="space-y-3 text-sm">
                <p>
                  <strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about{" "}
                  <button 
                    onClick={() => scrollToSection('section-1')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    personal information you disclose to us
                  </button>.
                </p>
                
                <p>
                  <strong>Do we process any sensitive personal information?</strong> Some of the information may be considered "special" or "sensitive" in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal information.
                </p>
                
                <p>
                  <strong>Do we collect any information from third parties?</strong> We may collect information from public databases, marketing partners, social media platforms, and other outside sources. Learn more about{" "}
                  <button 
                    onClick={() => scrollToSection('section-1')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    information collected from other sources
                  </button>.
                </p>
                
                <p>
                  <strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about{" "}
                  <button 
                    onClick={() => scrollToSection('section-2')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    how we process your information
                  </button>.
                </p>
                
                <p>
                  <strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties. Learn more about{" "}
                  <button 
                    onClick={() => scrollToSection('section-3')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    when and with whom we share your personal information
                  </button>.
                </p>
                
                <p>
                  <strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about{" "}
                  <button 
                    onClick={() => scrollToSection('section-9')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    your privacy rights
                  </button>.
                </p>
                
                <p>
                  <strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by submitting a{" "}
                  <button 
                    onClick={() => scrollToSection('section-13')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    data subject access request
                  </button>, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.
                </p>
                
                <p>
                  Want to learn more about what we do with any information we collect?{" "}
                  <button 
                    onClick={() => scrollToSection('section-1')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    Review the Privacy Notice in full
                  </button>.
                </p>
              </div>
            </div>

            {/* Table of Contents */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-lg">TABLE OF CONTENTS</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <button 
                    onClick={() => scrollToSection('section-1')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    1. WHAT INFORMATION DO WE COLLECT?
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => scrollToSection('section-2')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    2. HOW DO WE PROCESS YOUR INFORMATION?
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => scrollToSection('section-3')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => scrollToSection('section-4')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => scrollToSection('section-5')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    5. HOW DO WE HANDLE YOUR SOCIAL LOGINS?
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => scrollToSection('section-6')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    6. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => scrollToSection('section-7')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    7. HOW LONG DO WE KEEP YOUR INFORMATION?
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => scrollToSection('section-8')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    8. DO WE COLLECT INFORMATION FROM MINORS?
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => scrollToSection('section-9')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    9. WHAT ARE YOUR PRIVACY RIGHTS?
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => scrollToSection('section-10')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    10. CONTROLS FOR DO-NOT-TRACK FEATURES
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => scrollToSection('section-11')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    11. DO WE MAKE UPDATES TO THIS NOTICE?
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => scrollToSection('section-12')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
                  </button>
                </div>
                <div>
                  <button 
                    onClick={() => scrollToSection('section-13')}
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer block"
                  >
                    13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
                  </button>
                </div>
              </div>
            </div>

            <div id="section-1">
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

            <div id="section-2">
              <h3 className="text-white font-semibold mb-3 text-lg">2. HOW DO WE PROCESS YOUR INFORMATION?</h3>
              <p className="text-sm leading-relaxed mb-3 font-medium">
                In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.
              </p>
              <p className="text-sm leading-relaxed">
                We process your personal information for a variety of reasons, depending on how you interact with our Services, including:
              </p>
            </div>

            <div id="section-3">
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

            <div id="section-4">
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

            <div id="section-5">
              <h3 className="text-white font-semibold mb-3 text-lg">5. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h3>
              <p className="text-sm leading-relaxed mb-3 font-medium">
                In Short: If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.
              </p>
              <p className="text-sm leading-relaxed mb-3">
                Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or X logins). Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile information we receive may vary depending on the social media provider concerned, but will often include your name, email address, friends list, and profile picture, as well as other information you choose to make public on such a social media platform.
              </p>
              <p className="text-sm leading-relaxed">
                We will use the information we receive only for the purposes that are described in this Privacy Notice or that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible for, other uses of your personal information by your third-party social media provider. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information, and how you can set your privacy preferences on their sites and apps.
              </p>
            </div>

            <div id="section-6">
              <h3 className="text-white font-semibold mb-3 text-lg">6. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</h3>
              <p className="text-sm leading-relaxed mb-3 font-medium">
                In Short: We may transfer, store, and process your information in countries other than your own.
              </p>
              <p className="text-sm leading-relaxed mb-3">
                Our servers are located in []. If you are accessing our Services from outside, please be aware that your information may be transferred to, stored by, and processed by us in our facilities and in the facilities of the third parties with whom we may share your personal information (see "WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?" above), in and other countries.
              </p>
              <p className="text-sm leading-relaxed">
                If you are a resident in the European Economic Area (EEA), United Kingdom (UK), or Switzerland, then these countries may not necessarily have data protection laws or other similar laws as comprehensive as those in your country. However, we will take all necessary measures to protect your personal information in accordance with this Privacy Notice and applicable law.
              </p>
            </div>

            <div id="section-7">
              <h3 className="text-white font-semibold mb-3 text-lg">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h3>
              <p className="text-sm leading-relaxed mb-3 font-medium">
                In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.
              </p>
              <p className="text-sm leading-relaxed mb-3">
                We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
              </p>
              <p className="text-sm leading-relaxed">
                When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
              </p>
            </div>

            <div id="section-8">
              <h3 className="text-white font-semibold mb-3 text-lg">8. DO WE COLLECT INFORMATION FROM MINORS?</h3>
              <p className="text-sm leading-relaxed mb-3 font-medium">
                In Short: We do not knowingly collect data from or market to children under 18 years of age.
              </p>
              <p className="text-sm leading-relaxed">
                We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at __________.
              </p>
            </div>

            <div id="section-9">
              <h3 className="text-white font-semibold mb-3 text-lg">9. WHAT ARE YOUR PRIVACY RIGHTS?</h3>
              <p className="text-sm leading-relaxed mb-3 font-medium">
                In Short: You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.
              </p>
              <p className="text-sm leading-relaxed mb-3">
                <strong>Withdrawing your consent:</strong> If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?" below.
              </p>
              <p className="text-sm leading-relaxed mb-3">
                However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.
              </p>
              <div className="mb-3">
                <h4 className="text-white font-medium mb-2">Account Information</h4>
                <p className="text-sm leading-relaxed mb-2">
                  If you would at any time like to review or change the information in your account or terminate your account, you can:
                </p>
                <p className="text-sm leading-relaxed">
                  Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.
                </p>
              </div>
            </div>

            <div id="section-10">
              <h3 className="text-white font-semibold mb-3 text-lg">10. CONTROLS FOR DO-NOT-TRACK FEATURES</h3>
              <p className="text-sm leading-relaxed">
                Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.
              </p>
            </div>

            <div id="section-11">
              <h3 className="text-white font-semibold mb-3 text-lg">11. DO WE MAKE UPDATES TO THIS NOTICE?</h3>
              <p className="text-sm leading-relaxed mb-3 font-medium">
                In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.
              </p>
              <p className="text-sm leading-relaxed">
                We may update this Privacy Notice from time to time. The updated version will be indicated by an updated "Revised" date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.
              </p>
            </div>

            <div id="section-12">
              <h3 className="text-white font-semibold mb-3 text-lg">12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h3>
              <p className="text-sm leading-relaxed">
                If you have questions or comments about this notice, you may contact us by post at:
              </p>
            </div>

            <div id="section-13">
              <h3 className="text-white font-semibold mb-3 text-lg">13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h3>
              <p className="text-sm leading-relaxed">
                Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please fill out and submit a data subject access request.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;
