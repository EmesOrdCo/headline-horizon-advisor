
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsOfServiceModal = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-slate-400 hover:text-white transition-colors cursor-pointer">
          Terms of Service
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Terms of Service</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6 text-slate-300">
            <p className="text-sm text-slate-400">Last updated July 07, 2025</p>
            
            {/* Agreement Section */}
            <div>
              <h2 className="text-white font-semibold text-lg mb-3">AGREEMENT TO OUR LEGAL TERMS</h2>
              <p className="text-sm leading-relaxed mb-2">
                We are StockPredict AI (<strong>"Company," "we," "us," "our"</strong>).
              </p>
              <p className="text-sm leading-relaxed mb-2">
                We operate StockPredict AI, as well as any other related products and services that refer or link to these legal terms (the <strong>"Legal Terms"</strong>) (collectively, the <strong>"Services"</strong>).
              </p>
              <p className="text-sm leading-relaxed mb-2">
                You can contact us by email at hello@stockpredict.ai or by mail to San Francisco, CA.
              </p>
              <p className="text-sm leading-relaxed mb-2">
                These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (<strong>"you"</strong>), and StockPredict AI, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. <strong>IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong>
              </p>
              <p className="text-sm leading-relaxed mb-2">
                Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.
              </p>
              <p className="text-sm leading-relaxed">
                We recommend that you print a copy of these Legal Terms for your records.
              </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-3">TABLE OF CONTENTS</h3>
              <div className="grid grid-cols-1 gap-1 text-sm">
                <button onClick={() => scrollToSection('our-services')} className="text-emerald-400 hover:text-emerald-300 text-left">1. OUR SERVICES</button>
                <button onClick={() => scrollToSection('intellectual-property')} className="text-emerald-400 hover:text-emerald-300 text-left">2. INTELLECTUAL PROPERTY RIGHTS</button>
                <button onClick={() => scrollToSection('user-representations')} className="text-emerald-400 hover:text-emerald-300 text-left">3. USER REPRESENTATIONS</button>
                <button onClick={() => scrollToSection('prohibited-activities')} className="text-emerald-400 hover:text-emerald-300 text-left">4. PROHIBITED ACTIVITIES</button>
                <button onClick={() => scrollToSection('user-contributions')} className="text-emerald-400 hover:text-emerald-300 text-left">5. USER GENERATED CONTRIBUTIONS</button>
                <button onClick={() => scrollToSection('contribution-license')} className="text-emerald-400 hover:text-emerald-300 text-left">6. CONTRIBUTION LICENSE</button>
                <button onClick={() => scrollToSection('services-management')} className="text-emerald-400 hover:text-emerald-300 text-left">7. SERVICES MANAGEMENT</button>
                <button onClick={() => scrollToSection('term-termination')} className="text-emerald-400 hover:text-emerald-300 text-left">8. TERM AND TERMINATION</button>
                <button onClick={() => scrollToSection('modifications-interruptions')} className="text-emerald-400 hover:text-emerald-300 text-left">9. MODIFICATIONS AND INTERRUPTIONS</button>
                <button onClick={() => scrollToSection('governing-law')} className="text-emerald-400 hover:text-emerald-300 text-left">10. GOVERNING LAW</button>
                <button onClick={() => scrollToSection('dispute-resolution')} className="text-emerald-400 hover:text-emerald-300 text-left">11. DISPUTE RESOLUTION</button>
                <button onClick={() => scrollToSection('corrections')} className="text-emerald-400 hover:text-emerald-300 text-left">12. CORRECTIONS</button>
                <button onClick={() => scrollToSection('disclaimer')} className="text-emerald-400 hover:text-emerald-300 text-left">13. DISCLAIMER</button>
                <button onClick={() => scrollToSection('limitations-liability')} className="text-emerald-400 hover:text-emerald-300 text-left">14. LIMITATIONS OF LIABILITY</button>
                <button onClick={() => scrollToSection('indemnification')} className="text-emerald-400 hover:text-emerald-300 text-left">15. INDEMNIFICATION</button>
                <button onClick={() => scrollToSection('user-data')} className="text-emerald-400 hover:text-emerald-300 text-left">16. USER DATA</button>
                <button onClick={() => scrollToSection('electronic-communications')} className="text-emerald-400 hover:text-emerald-300 text-left">17. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</button>
                <button onClick={() => scrollToSection('miscellaneous')} className="text-emerald-400 hover:text-emerald-300 text-left">18. MISCELLANEOUS</button>
                <button onClick={() => scrollToSection('contact-us')} className="text-emerald-400 hover:text-emerald-300 text-left">19. CONTACT US</button>
              </div>
            </div>

            {/* Section 1: Our Services */}
            <div id="our-services">
              <h3 className="text-white font-semibold mb-2">1. OUR SERVICES</h3>
              <p className="text-sm leading-relaxed">
                The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country. Accordingly, those persons who choose to access the Services from other locations do so on their own initiative and are solely responsible for compliance with local laws, if and to the extent local laws are applicable.
              </p>
            </div>

            {/* Section 2: Intellectual Property Rights */}
            <div id="intellectual-property">
              <h3 className="text-white font-semibold mb-2">2. INTELLECTUAL PROPERTY RIGHTS</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-medium mb-2">Our intellectual property</h4>
                  <p className="text-sm leading-relaxed mb-2">
                    We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
                  </p>
                  <p className="text-sm leading-relaxed mb-2">
                    Our Content and Marks are protected by copyright and trademark laws (and various other intellectual property rights and unfair competition laws) and treaties around the world.
                  </p>
                  <p className="text-sm leading-relaxed">
                    The Content and Marks are provided in or through the Services "AS IS" for your personal, non-commercial use or internal business purpose only.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Your use of our Services</h4>
                  <p className="text-sm leading-relaxed mb-2">
                    Subject to your compliance with these Legal Terms, including the "PROHIBITED ACTIVITIES" section below, we grant you a non-exclusive, non-transferable, revocable license to:
                  </p>
                  <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                    <li>access the Services; and</li>
                    <li>download or print a copy of any portion of the Content to which you have properly gained access,</li>
                  </ul>
                  <p className="text-sm leading-relaxed mt-2">
                    solely for your personal, non-commercial use or internal business purpose.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: User Representations */}
            <div id="user-representations">
              <h3 className="text-white font-semibold mb-2">3. USER REPRESENTATIONS</h3>
              <p className="text-sm leading-relaxed">
                By using the Services, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Legal Terms; (2) you are not a minor in the jurisdiction in which you reside; (3) you will not access the Services through automated or non-human means, whether through a bot, script or otherwise; (4) you will not use the Services for any illegal or unauthorized purpose; and (5) your use of the Services will not violate any applicable law or regulation.
              </p>
              <p className="text-sm leading-relaxed mt-3">
                If you provide any information that is untrue, inaccurate, not current, or incomplete, we have the right to suspend or terminate your account and refuse any and all current or future use of the Services (or any portion thereof).
              </p>
            </div>

            {/* Section 4: Prohibited Activities */}
            <div id="prohibited-activities">
              <h3 className="text-white font-semibold mb-2">4. PROHIBITED ACTIVITIES</h3>
              <p className="text-sm leading-relaxed mb-3">
                You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
              </p>
              <p className="text-sm leading-relaxed mb-2">As a user of the Services, you agree not to:</p>
              <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us.</li>
                <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
                <li>Circumvent, disable, or otherwise interfere with security-related features of the Services, including features that prevent or restrict the use or copying of any Content or enforce limitations on the use of the Services and/or the Content contained therein.</li>
                <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
                <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
                <li>Make improper use of our support services or submit false reports of abuse or misconduct.</li>
                <li>Use the Services in a manner inconsistent with any applicable laws or regulations.</li>
                <li>Engage in unauthorized framing of or linking to the Services.</li>
                <li>Upload or transmit (or attempt to upload or to transmit) viruses, Trojan horses, or other material, including excessive use of capital letters and spamming (continuous posting of repetitive text), that interferes with any party's uninterrupted use and enjoyment of the Services or modifies, impairs, disrupts, alters, or interferes with the use, features, functions, operation, or maintenance of the Services.</li>
                <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
                <li>Delete the copyright or other proprietary rights notice from any Content.</li>
                <li>Attempt to impersonate another user or person or use the username of another user.</li>
                <li>Upload or transmit (or attempt to upload or to transmit) any material that acts as a passive or active information collection or transmission mechanism.</li>
                <li>Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</li>
                <li>Harass, annoy, intimidate, or threaten any of our employees or agents engaged in providing any portion of the Services to you.</li>
                <li>Attempt to bypass any measures of the Services designed to prevent or restrict access to the Services, or any portion of the Services.</li>
                <li>Copy or adapt the Services' software, including but not limited to Flash, PHP, HTML, JavaScript, or other code.</li>
                <li>Except as permitted by applicable law, decipher, decompile, disassemble, or reverse engineer any of the software comprising or in any way making up a part of the Services.</li>
                <li>Except as may be the result of standard search engine or Internet browser usage, use, launch, develop, or distribute any automated system, including without limitation, any spider, robot, cheat utility, scraper, or offline reader that accesses the Services, or use or launch any unauthorized script or other software.</li>
                <li>Use a buying agent or purchasing agent to make purchases on the Services.</li>
                <li>Make any unauthorized use of the Services, including collecting usernames and/or email addresses of users by electronic or other means for the purpose of sending unsolicited email, or creating user accounts by automated means or under false pretenses.</li>
                <li>Use the Services as part of any effort to compete with us or otherwise use the Services and/or the Content for any revenue-generating endeavor or commercial enterprise.</li>
              </ul>
            </div>

            {/* Continue adding all other sections... */}
            
            {/* Contact Us Section */}
            <div id="contact-us">
              <h3 className="text-white font-semibold mb-2">19. CONTACT US</h3>
              <p className="text-sm leading-relaxed">
                In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
              </p>
              <div className="mt-3 p-3 bg-slate-700 rounded text-sm">
                <p><strong>StockPredict AI</strong></p>
                <p>Email: hello@stockpredict.ai</p>
                <p>San Francisco, CA</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsOfServiceModal;
