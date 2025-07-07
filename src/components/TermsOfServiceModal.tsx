
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

            {/* Section 5: User Generated Contributions */}
            <div id="user-contributions">
              <h3 className="text-white font-semibold mb-2">5. USER GENERATED CONTRIBUTIONS</h3>
              <p className="text-sm leading-relaxed mb-3">
                The Services does not offer users to submit or post content. We may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Services, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, "Contributions"). Contributions may be viewable by other users of the Services and through third-party websites. When you create or make available any Contributions, you thereby represent and warrant that:
              </p>
              <ul className="list-disc list-inside text-sm leading-relaxed space-y-1 ml-4">
                <li>The creation, distribution, transmission, public display, or performance, and the accessing, downloading, or copying of your Contributions do not and will not infringe the proprietary rights, including but not limited to the copyright, patent, trademark, trade secret, or moral rights of any third party.</li>
                <li>You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us, the Services, and other users of the Services to use your Contributions in any manner contemplated by the Services and these Legal Terms.</li>
                <li>You have the written consent, release, and/or permission of each and every identifiable individual person in your Contributions to use the name or likeness of each and every such identifiable individual person to enable inclusion and use of your Contributions in any manner contemplated by the Services and these Legal Terms.</li>
                <li>Your Contributions are not false, inaccurate, or misleading.</li>
                <li>Your Contributions are not unsolicited or unauthorized advertising, promotional materials, pyramid schemes, chain letters, spam, mass mailings, or other forms of solicitation.</li>
                <li>Your Contributions are not obscene, lewd, lascivious, filthy, violent, harassing, libelous, slanderous, or otherwise objectionable (as determined by us).</li>
                <li>Your Contributions do not ridicule, mock, disparage, intimidate, or abuse anyone.</li>
                <li>Your Contributions are not used to harass or threaten (in the legal sense of those terms) any other person and to promote violence against a specific person or class of people.</li>
                <li>Your Contributions do not violate any applicable law, regulation, or rule.</li>
                <li>Your Contributions do not violate the privacy or publicity rights of any third party.</li>
                <li>Your Contributions do not violate any applicable law concerning child pornography, or otherwise intended to protect the health or well-being of minors.</li>
                <li>Your Contributions do not include any offensive comments that are connected to race, national origin, gender, sexual preference, or physical handicap.</li>
                <li>Your Contributions do not otherwise violate, or link to material that violates, any provision of these Legal Terms, or any applicable law or regulation.</li>
              </ul>
              <p className="text-sm leading-relaxed mt-3">
                Any use of the Services in violation of the foregoing violates these Legal Terms and may result in, among other things, termination or suspension of your rights to use the Services.
              </p>
            </div>

            {/* Section 6: Contribution License */}
            <div id="contribution-license">
              <h3 className="text-white font-semibold mb-2">6. CONTRIBUTION LICENSE</h3>
              <p className="text-sm leading-relaxed mb-3">
                You and Services agree that we may access, store, process, and use any information and personal data that you provide and your choices (including settings).
              </p>
              <p className="text-sm leading-relaxed mb-3">
                By submitting suggestions or other feedback regarding the Services, you agree that we can use and share such feedback for any purpose without compensation to you.
              </p>
              <p className="text-sm leading-relaxed">
                We do not assert any ownership over your Contributions. You retain full ownership of all of your Contributions and any intellectual property rights or other proprietary rights associated with your Contributions. We are not liable for any statements or representations in your Contributions provided by you in any area on the Services. You are solely responsible for your Contributions to the Services and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.
              </p>
            </div>

            {/* Section 7: Services Management */}
            <div id="services-management">
              <h3 className="text-white font-semibold mb-2">7. SERVICES MANAGEMENT</h3>
              <p className="text-sm leading-relaxed mb-3">
                We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who, in our sole discretion, violates the law or these Legal Terms, including without limitation, reporting such user to law enforcement authorities; (3) in our sole discretion and without limitation, refuse, restrict access to, limit the availability of, or disable (to the extent technologically feasible) any of your Contributions or any portion thereof; (4) in our sole discretion and without limitation, notice, or liability, to remove from the Services or otherwise disable all files and content that are excessive in size or are in any way burdensome to our systems; and (5) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.
              </p>
            </div>

            {/* Section 8: Term and Termination */}
            <div id="term-termination">
              <h3 className="text-white font-semibold mb-2">8. TERM AND TERMINATION</h3>
              <p className="text-sm leading-relaxed mb-3">
                These Legal Terms shall remain in full force and effect while you use the Services. WITHOUT LIMITING ANY OTHER PROVISION OF THESE LEGAL TERMS, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SERVICES (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE LEGAL TERMS OR OF ANY APPLICABLE LAW OR REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SERVICES OR DELETE ANY CONTENT OR INFORMATION THAT YOU POSTED AT ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.
              </p>
              <p className="text-sm leading-relaxed mb-3">
                If we terminate or suspend your account for any reason, you are prohibited from registering and creating a new account under your name, a fake or borrowed name, or the name of any third party, even if you may be acting on behalf of the third party. In addition to terminating or suspending your account, we reserve the right to take appropriate legal action, including without limitation pursuing civil, criminal, and injunctive redress.
              </p>
            </div>

            {/* Section 9: Modifications and Interruptions */}
            <div id="modifications-interruptions">
              <h3 className="text-white font-semibold mb-2">9. MODIFICATIONS AND INTERRUPTIONS</h3>
              <p className="text-sm leading-relaxed mb-3">
                We reserve the right to change, modify, or remove the contents of the Services at any time or for any reason at our sole discretion without notice. However, we have no obligation to update any information on our Services. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Services.
              </p>
              <p className="text-sm leading-relaxed mb-3">
                We cannot guarantee the Services will be available at all times. We may experience hardware, software, or other problems or need to perform maintenance related to the Services, resulting in interruptions, delays, or errors. We reserve the right to change, revise, update, suspend, discontinue, or otherwise modify the Services at any time or for any reason without notice to you. You agree that we have no liability whatsoever for any loss, damage, or inconvenience caused by your inability to access or use the Services during any downtime or discontinuance of the Services. Nothing in these Legal Terms will be construed to obligate us to maintain and support the Services or to supply any corrections, updates, or releases in connection therewith.
              </p>
            </div>

            {/* Section 10: Governing Law */}
            <div id="governing-law">
              <h3 className="text-white font-semibold mb-2">10. GOVERNING LAW</h3>
              <p className="text-sm leading-relaxed">
                These Legal Terms shall be governed by and defined following the laws of the United States. StockPredict AI and yourself irrevocably consent that the courts of the United States shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.
              </p>
            </div>

            {/* Section 11: Dispute Resolution */}
            <div id="dispute-resolution">
              <h3 className="text-white font-semibold mb-2">11. DISPUTE RESOLUTION</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-medium mb-2">Informal Negotiations</h4>
                  <p className="text-sm leading-relaxed">
                    To expedite resolution and control the cost of any dispute, controversy, or claim related to these Legal Terms (each a "Dispute" and collectively, the "Disputes") brought by either you or us (individually, a "Party" and collectively, the "Parties"), the Parties agree to first attempt to negotiate any Dispute (except those Disputes expressly provided below) informally for at least thirty (30) days before initiating arbitration. Such informal negotiations commence upon written notice from one Party to the other Party.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Binding Arbitration</h4>
                  <p className="text-sm leading-relaxed">
                    Any dispute arising from the relationships between the Parties to these Legal Terms shall be determined by one arbitrator who will be chosen in accordance with the Arbitration and Internal Rules of the American Arbitration Association (AAA), and the arbitrator's decision will be final and binding upon both parties and will be enforced in any court of competent jurisdiction. The Parties agree that the dispute resolution procedures specified in this section will be the sole recourse for resolving any disputes.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Restrictions</h4>
                  <p className="text-sm leading-relaxed">
                    The Parties agree that any arbitration shall be limited to the Dispute between the Parties individually. To the full extent permitted by law, (a) no arbitration shall be joined with any other proceeding; (b) there is no right or authority for any Dispute to be arbitrated on a class-action basis or to utilize class action procedures; and (c) there is no right or authority for any Dispute to be brought in a purported representative capacity on behalf of the general public or any other persons.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Exceptions to Informal Negotiations and Arbitration</h4>
                  <p className="text-sm leading-relaxed">
                    The Parties agree that the following Disputes are not subject to the above provisions concerning informal negotiations binding arbitration: (a) any Disputes seeking to enforce or protect, or concerning the validity of, any of the intellectual property rights of a Party; (b) any Dispute related to, or arising from, allegations of theft, piracy, invasion of privacy, or unauthorized use; and (c) any claim for injunctive relief. If this provision is found to be illegal or unenforceable, then neither Party will elect to arbitrate any Dispute falling within that portion of this provision found to be illegal or unenforceable and such Dispute shall be decided by a court of competent jurisdiction within the courts listed for jurisdiction above, and the Parties agree to submit to the personal jurisdiction of that court.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 12: Corrections */}
            <div id="corrections">
              <h3 className="text-white font-semibold mb-2">12. CORRECTIONS</h3>
              <p className="text-sm leading-relaxed">
                There may be information on the Services that contains typographical errors, inaccuracies, or omissions, including descriptions, pricing, availability, and various other information. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update the information on the Services at any time, without prior notice.
              </p>
            </div>

            {/* Section 13: Disclaimer */}
            <div id="disclaimer">
              <h3 className="text-white font-semibold mb-2">13. DISCLAIMER</h3>
              <p className="text-sm leading-relaxed mb-3">
                THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF, INCLUDING, WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SERVICES' CONTENT OR THE CONTENT OF ANY WEBSITES OR MOBILE APPLICATIONS LINKED TO THE SERVICES AND WE WILL ASSUME NO LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE OF THE SERVICES, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICES, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH MAY BE TRANSMITTED TO OR THROUGH THE SERVICES BY ANY THIRD PARTY, AND/OR (6) ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES. WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SERVICES, ANY HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.
              </p>
            </div>

            {/* Section 14: Limitations of Liability */}
            <div id="limitations-liability">
              <h3 className="text-white font-semibold mb-2">14. LIMITATIONS OF LIABILITY</h3>
              <p className="text-sm leading-relaxed">
                IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE LESSER OF THE AMOUNT PAID, IF ANY, BY YOU TO US OR $100.00 USD. CERTAIN US STATE LAWS AND INTERNATIONAL LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.
              </p>
            </div>

            {/* Section 15: Indemnification */}
            <div id="indemnification">
              <h3 className="text-white font-semibold mb-2">15. INDEMNIFICATION</h3>
              <p className="text-sm leading-relaxed">
                You agree to defend, indemnify, and hold us harmless, including our subsidiaries, affiliates, and all of our respective officers, agents, partners, and employees, from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of: (1) use of the Services; (2) breach of these Legal Terms; (3) any breach of your representations and warranties set forth in these Legal Terms; (4) your violation of the rights of a third party, including but not limited to intellectual property rights; or (5) any overt harmful act toward any other user of the Services with whom you connected via the Services. Notwithstanding the foregoing, we reserve the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify us, and you agree to cooperate, at your expense, with our defense of such claims. We will use reasonable efforts to notify you of any such claim, action, or proceeding which is subject to this indemnification upon becoming aware of it.
              </p>
            </div>

            {/* Section 16: User Data */}
            <div id="user-data">
              <h3 className="text-white font-semibold mb-2">16. USER DATA</h3>
              <p className="text-sm leading-relaxed">
                We will maintain certain data that you transmit to the Services for the purpose of managing the performance of the Services, as well as data relating to your use of the Services. Although we perform regular routine backups of data, you are solely responsible for all data that you transmit or that relates to any activity you have undertaken using the Services. You agree that we shall have no liability to you for any loss or corruption of any such data, and you hereby waive any right of action against us arising from any such loss or corruption of such data.
              </p>
            </div>

            {/* Section 17: Electronic Communications */}
            <div id="electronic-communications">
              <h3 className="text-white font-semibold mb-2">17. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h3>
              <p className="text-sm leading-relaxed">
                Visiting the Services, sending us emails, and completing online forms constitute electronic communications. You consent to receive electronic communications, and you agree that all agreements, notices, disclosures, and other communications we provide to you electronically, via email and on the Services, satisfy any legal requirement that such communication be in writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY US OR VIA THE SERVICES. You hereby waive any rights or requirements under any statutes, regulations, rules, ordinances, or other laws in any jurisdiction which require an original signature or delivery or retention of non-electronic records, or to payments or the granting of credits by any means other than electronic means.
              </p>
            </div>

            {/* Section 18: Miscellaneous */}
            <div id="miscellaneous">
              <h3 className="text-white font-semibold mb-2">18. MISCELLANEOUS</h3>
              <p className="text-sm leading-relaxed mb-3">
                These Legal Terms and any policies or operating rules posted by us on the Services or in respect to the Services constitute the entire agreement and understanding between you and us. Our failure to exercise or enforce any right or provision of these Legal Terms shall not operate as a waiver of such right or provision. These Legal Terms operate to the fullest extent permissible by law. We may assign any or all of our rights and obligations to others at any time. We shall not be responsible or liable for any loss, damage, delay, or failure to act caused by any cause beyond our reasonable control. If any provision or part of a provision of these Legal Terms is determined to be unlawful, void, or unenforceable, that provision or part of the provision is deemed severable from these Legal Terms and does not affect the validity and enforceability of any remaining provisions. There is no joint venture, partnership, employment or agency relationship created between you and us as a result of these Legal Terms or use of the Services. You agree that these Legal Terms will not be construed against us by virtue of having drafted them. You hereby waive any and all defenses you may have based on the electronic form of these Legal Terms and the lack of signing by the parties hereto to execute these Legal Terms.
              </p>
            </div>

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
