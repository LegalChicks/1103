
import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Modal } from '../components/ui';
import { db, appId } from '../services/firebase';
import { addDoc, collection } from 'firebase/firestore';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    return (
        <div className="bg-white text-stone-900">
            <Header isMobileMenuOpen={isMobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} isScrolled={isScrolled} />
            <main>
                <HeroSection />
                <PackagesSection />
                <MembershipSection />
                <PartnersSection />
                <BlogSection />
                <FinalCTA />
            </main>
            <Footer />
        </div>
    );
};


const Header: React.FC<{ isMobileMenuOpen: boolean, setMobileMenuOpen: (isOpen: boolean) => void, isScrolled: boolean }> = ({ isMobileMenuOpen, setMobileMenuOpen, isScrolled }) => {
    const navigate = useNavigate();
    const headerClasses = `fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'shadow-lg bg-white/95 backdrop-blur-sm' : ''}`;

    return (
        <header id="header" className={headerClasses}>
            <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <a href="#home" className="flex items-center space-x-3">
                        <img src="https://placehold.co/48x48/8B4513/FFFFFF?text=LCE&font=inter" alt="LCE Logo" className="h-10 w-10 rounded-full" />
                        <span className={`text-xl font-bold hidden sm:block ${isScrolled ? 'text-stone-800' : 'text-white'}`}>Legal Chicks</span>
                    </a>
                    <div className="hidden lg:flex items-center space-x-6">
                        <a href="#home" className={`font-medium transition-colors ${isScrolled ? 'text-stone-600 hover:text-amber-600' : 'text-white/80 hover:text-white'}`}>Home</a>
                        <a href="#packages" className={`font-medium transition-colors ${isScrolled ? 'text-stone-600 hover:text-amber-600' : 'text-white/80 hover:text-white'}`}>Packages</a>
                        <a href="#membership" className={`font-medium transition-colors ${isScrolled ? 'text-stone-600 hover:text-amber-600' : 'text-white/80 hover:text-white'}`}>Membership</a>
                        <a href="#partners" className={`font-medium transition-colors ${isScrolled ? 'text-stone-600 hover:text-amber-600' : 'text-white/80 hover:text-white'}`}>Partners</a>
                        <a href="#blog" className={`font-medium transition-colors ${isScrolled ? 'text-stone-600 hover:text-amber-600' : 'text-white/80 hover:text-white'}`}>Blog</a>
                    </div>
                    <div className="hidden lg:flex items-center space-x-4">
                        <button onClick={() => navigate('/login')} className={`btn btn-sm px-4 py-2 ${isScrolled ? 'btn-dark' : 'bg-white/20 text-white hover:bg-white/30'}`}>Member Login</button>
                        <a href="#membership" className="btn btn-primary">Join the Network</a>
                    </div>
                    <div className="lg:hidden">
                        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} type="button" className={`inline-flex items-center justify-center p-2 rounded-md ${isScrolled ? 'text-stone-600 hover:bg-stone-100' : 'text-white hover:bg-white/20'}`}>
                            <Icon name={isMobileMenuOpen ? "X" : "Menu"} className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </nav>
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white shadow-lg rounded-b-lg border-t border-stone-100">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="#home" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-amber-600 hover:bg-stone-50">Home</a>
                        <a href="#packages" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-amber-600 hover:bg-stone-50">Packages</a>
                        <a href="#membership" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-amber-600 hover:bg-stone-50">Membership</a>
                        <a href="#partners" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-amber-600 hover:bg-stone-50">Partners</a>
                        <a href="#blog" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-amber-600 hover:bg-stone-50">Blog</a>
                        <div className="border-t border-stone-200 my-2"></div>
                        <a href="#membership" className="block w-full text-center px-4 py-2 rounded-md text-base font-medium btn btn-primary">Join the Network</a>
                        <button onClick={() => navigate('/login')} className="block w-full text-center px-4 py-2 rounded-md text-base font-medium btn btn-dark mt-2">Member Login</button>
                    </div>
                </div>
            )}
        </header>
    );
};

const HeroSection = () => (
    <section id="home" className="relative h-screen min-h-[700px] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img src="https://images.pexels.com/photos/8430677/pexels-photo-8430677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Filipina farmers working" className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 p-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
                From Hard Work to High Value
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/90 mb-10">
                Legal Chicks arms Filipina poultry farmers with the <strong>data</strong> to farm smarter, the <strong>community</strong> to stand stronger, and the <strong>market access</strong> to sell for what you're truly worth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#membership" className="btn btn-primary text-lg px-8 py-4">Join the Network</a>
                <a href="#partners" className="btn btn-secondary text-lg px-8 py-4">Partner With Us</a>
            </div>
        </div>
    </section>
);

const PackagesSection = () => {
    const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
    const [modalTitle, setModalTitle] = useState('');

    const openModal = (type: 'starter' | 'business' | 'franchise') => {
        if (type === 'starter') {
            setModalTitle('Starter Package');
            setModalContent(<StarterModalContent />);
        } else if (type === 'business') {
            setModalTitle('Business Package');
            setModalContent(<BusinessModalContent />);
        } else if (type === 'franchise') {
            setModalTitle('Franchise Tier');
            setModalContent(<FranchiseModalContent />);
        }
    };

    const closeModal = () => setModalContent(null);

    return (
        <>
            <section id="packages" className="py-16 sm:py-24 bg-white">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* ... How to Join steps ... */}
                    <div className="text-center mb-16">
                        <h2 className="text-base font-semibold text-amber-600 tracking-wide uppercase">Your Path to Empowerment</h2>
                        <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">How to Join the Network</p>
                    </div>
                    {/* ... Package display ... */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                        <PackageCard 
                            title="Starter Package"
                            audience="Ideal for Urban Families"
                            price="₱20,000+"
                            description="A complete, guided, low-barrier entry for backyard income generation."
                            features={["Essential Chicks & Feeds", "Starter Coop Kit", `"Guided Business Warranty"`, "1-Year Network Membership"]}
                            onDetailsClick={() => openModal('starter')}
                            dark={false}
                        />
                        <PackageCard 
                            title="Franchise Tier"
                            audience="Ideal for OFW Returnees & Investors"
                            price="₱150,000+"
                            description="A turnkey solution to own your poultry business under the Legal Chicks brand."
                            features={["All Starter Package features, scaled", "Official LCE Branding Rights", "Guaranteed Supplier Access", "Inclusion in Joint Marketing", `Become a Regional "Ambassador"`]}
                            onDetailsClick={() => openModal('franchise')}
                            dark={true}
                            highlight="Most Popular"
                        />
                         <PackageCard 
                            title="Business Package"
                            audience="Ideal for Rural Farmers & SMEs"
                            price="₱100,000+"
                            description="Scale your existing farm or business with our supply chain and tech."
                            features={["Large-scale Chick/Feed Supply", "Full Platform Access (KPIs, AI)", "Access to Collective Marketing", "Financing Assistance"]}
                            onDetailsClick={() => openModal('business')}
                            dark={false}
                        />
                    </div>
                </div>
            </section>
            <Modal isOpen={!!modalContent} onClose={closeModal} title={modalTitle}>
                {modalContent}
            </Modal>
        </>
    );
};

const PackageCard = ({title, audience, price, description, features, onDetailsClick, dark, highlight} : {title: string, audience: string, price: string, description: string, features: string[], onDetailsClick: () => void, dark: boolean, highlight?: string}) => (
    <div className={`${dark ? 'bg-stone-800 text-white' : 'bg-slate-50'} rounded-2xl p-8 shadow-lg flex flex-col relative ${highlight ? 'scale-105 border-2 border-amber-500' : ''}`}>
        {highlight && <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-amber-500 text-stone-900 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">{highlight}</span>}
        <h3 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-stone-900'}`}>{title}</h3>
        <p className={`text-sm font-medium mb-4 ${dark ? 'text-amber-400' : 'text-stone-500'}`}>{audience}</p>
        <p className={`text-4xl font-extrabold mb-4 ${dark ? 'text-white' : 'text-stone-900'}`}>{price}</p>
        <p className={`${dark ? 'text-stone-300' : 'text-stone-600'} mb-6 min-h-[50px]`}>{description}</p>
        <ul className="space-y-3 mb-8 flex-grow">
            {features.map(feat => (
                <li key={feat} className="flex items-start"><Icon name="Check" className={`w-5 h-5 mr-2 mt-1 flex-shrink-0 ${dark ? 'text-green-500' : 'text-green-600'}`} /><span>{feat}</span></li>
            ))}
        </ul>
        <button onClick={onDetailsClick} className={`font-semibold mb-6 ${dark ? 'text-amber-400 hover:text-white' : 'text-amber-600 hover:text-amber-700'}`}>See Detailed Inclusions &rarr;</button>
        <a href="#membership" className={`btn w-full ${dark ? 'btn-primary' : 'btn-dark'}`}>Apply for {title.split(' ')[0]}</a>
    </div>
);


const MembershipSection = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', farmName: '', farmLocation: '', farmSize: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 1) {
      if (formData.name && formData.email && formData.phone) {
        setStep(2);
      }
    } else if (step === 2) {
      if (formData.farmLocation && formData.farmSize) {
        setStep(3);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
        const collectionPath = `/artifacts/${appId}/public/data/membership_applications`;
        await addDoc(collection(db, collectionPath), {
            ...formData,
            status: 'pending',
            submittedAt: new Date().toISOString()
        });
        setIsSuccess(true);
    } catch (err) {
        console.error("Error submitting application:", err);
        setError('Submission failed. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <section id="membership" className="py-16 sm:py-24 bg-slate-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-6">Ready to Join the Network?</h2>
              {/* ... value prop list ... */}
          </div>
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-stone-100">
            {isSuccess ? (
                <div className="text-center">
                    <Icon name="PartyPopper" className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-stone-900 mb-2">Application Received!</h3>
                    <p className="text-lg text-stone-600">Welcome to the network! Our team will be in touch within 24-48 hours.</p>
                </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className="text-2xl font-bold text-center text-stone-900 mb-2">Apply for Membership</h3>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6">
                    <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(step/3)*100}%` }}></div>
                </div>
                {step === 1 && (
                    <div className="space-y-4">
                        <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-stone-300 rounded-lg"/>
                        <input type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-stone-300 rounded-lg"/>
                        <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-stone-300 rounded-lg"/>
                        <button type="button" onClick={handleNext} className="btn btn-primary w-full mt-6">Next: Farm Details</button>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-4">
                        <input type="text" placeholder="Farm Name (if any)" value={formData.farmName} onChange={e => setFormData({...formData, farmName: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-stone-300 rounded-lg"/>
                        <input type="text" placeholder="Farm Location (Province)" required value={formData.farmLocation} onChange={e => setFormData({...formData, farmLocation: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-stone-300 rounded-lg"/>
                        <input type="text" placeholder="Current Flock Size (e.g. 500 birds)" required value={formData.farmSize} onChange={e => setFormData({...formData, farmSize: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-stone-300 rounded-lg"/>
                        <div className="flex gap-4 mt-6">
                            <button type="button" onClick={() => setStep(1)} className="btn bg-slate-200 text-slate-700 hover:bg-slate-300 w-1/3">Back</button>
                            <button type="button" onClick={handleNext} className="btn btn-primary w-2/3">Next: Verification</button>
                        </div>
                    </div>
                )}
                {step === 3 && (
                    <div>
                        <p className="text-stone-600 mb-4">An LCE representative will contact you shortly to verify your details and complete your application.</p>
                        <div className="flex gap-4 mt-6">
                            <button type="button" onClick={() => setStep(2)} className="btn bg-slate-200 text-slate-700 hover:bg-slate-300 w-1/3">Back</button>
                            <button type="submit" disabled={isLoading} className={`btn btn-dark w-2/3 ${isLoading ? 'btn-loading' : ''}`}>{isLoading ? 'Submitting...' : 'Submit Application'}</button>
                        </div>
                        {error && <p className="text-red-600 text-sm text-center mt-4">{error}</p>}
                    </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// ... Other sections (Partners, Blog, FinalCTA, Footer) would be similarly componentized ...
const PartnersSection = () => <section id="partners" className="py-16 sm:py-24 bg-white">
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
            <h2 className="text-base font-semibold text-amber-600 tracking-wide uppercase">Get Involved</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">Partners & Resources</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl shadow-lg">
                <Icon name="Building" className="w-12 h-12 text-amber-600 mb-4"/>
                <h3 className="text-2xl font-bold text-stone-900 mb-3">For Partners</h3>
                <p className="text-stone-600 text-lg mb-6">We collaborate with suppliers, government agencies, and NGOs to build a stronger agricultural ecosystem.</p>
                <a href="#membership" className="btn btn-dark">Partner With Us</a>
            </div>
            <div className="bg-slate-50 p-8 rounded-2xl shadow-lg">
                <Icon name="BookOpen" className="w-12 h-12 text-amber-600 mb-4"/>
                <h3 className="text-2xl font-bold text-stone-900 mb-3">Public Blog & Resources</h3>
                <p className="text-stone-600 text-lg mb-6">Read our latest insights on poultry management, market trends, and legal compliance.</p>
                <a href="#blog" className="btn btn-dark">Read Our Blog</a>
            </div>
        </div>
    </div>
</section>;
const BlogSection = () => <section id="blog" className="py-16 sm:py-24 bg-slate-50">
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
            <h2 className="text-base font-semibold text-amber-600 tracking-wide uppercase">Insights</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">From Our Blog</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BlogCard image="https://images.pexels.com/photos/763320/pexels-photo-763320.jpeg?auto=compress&cs=tinysrgb&w=600" date="Compliance | Nov 01, 2025" title="5 Key Changes in the Latest DA Circular" link="https://www.da.gov.ph/issuances/" />
            <BlogCard image="https://images.pexels.com/photos/1937743/pexels-photo-1937743.jpeg?auto=compress&cs=tinysrgb&w=600" date="Farm Ops | Oct 28, 2025" title="How to Calculate Your Feed Conversion Ratio (FCR)" link="https://e-extension.gov.ph/" />
            <BlogCard image="https://images.pexels.com/photos/6634185/pexels-photo-6634185.jpeg?auto=compress&cs=tinysrgb&w=600" date="Best Practices | Oct 22, 2025" title="Biosecurity 101: Protecting Your Flock" link="https://www.bai.gov.ph/" />
        </div>
    </div>
</section>;

const BlogCard = ({ image, date, title, link } : {image: string, date: string, title: string, link: string}) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1">
        <img src={image} alt={title} className="w-full h-48 object-cover" />
        <div className="p-6">
            <span className="text-sm text-stone-500">{date}</span>
            <h4 className="text-xl font-bold text-stone-900 my-2">{title}</h4>
            <a href={link} target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-600 hover:text-amber-700">Read More &rarr;</a>
        </div>
    </div>
);

const FinalCTA = () => <section id="final-cta" className="py-16 sm:py-24 bg-stone-800 text-white">
    <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">Stop Competing. Start Conquering.</h2>
        <p className="text-xl text-stone-300 mb-10">Your hard work deserves more than survival. It deserves to win. Join a network that gives you the legal, digital, and community tools to thrive.</p>
        <a href="#membership" className="btn btn-primary text-lg px-10 py-4">Apply for Membership Today</a>
    </div>
</section>;

const Footer = () => <footer className="bg-stone-900 text-stone-300">
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
                <h4 className="text-sm font-semibold text-stone-100 tracking-wider uppercase mb-4">Contact Us</h4>
                <ul className="space-y-3 text-stone-400">
                    <li className="flex items-start"><Icon name="Mail" className="w-5 h-5 mr-3 mt-1 flex-shrink-0"/> <a href="mailto:info@legalchicks.ph" className="hover:text-white">info@legalchicks.ph</a></li>
                    <li className="flex items-start"><Icon name="Phone" className="w-5 h-5 mr-3 mt-1 flex-shrink-0"/> <a href="tel:+639171234567" className="hover:text-white">+63 (917) 123 4567</a></li>
                </ul>
            </div>
        </div>
        <div className="mt-12 pt-8 border-t border-stone-700 text-center text-stone-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Legal Chicks Empowerment Network. All rights reserved.</p>
        </div>
    </div>
</footer>;


const StarterModalContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h4 className="font-semibold text-stone-700 uppercase tracking-wider text-sm mb-3">Hardware & Supplies</h4>
            <ul className="space-y-2 text-stone-600">
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>50 Day-Old-Chicks (Vaccinated RIR)</span></li>
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>2 Sacks LCE-Certified Starter Feed</span></li>
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>Standard Waterers & Feeders</span></li>
            </ul>
        </div>
        <div>
            <h4 className="font-semibold text-stone-700 uppercase tracking-wider text-sm mb-3">Support & Platform</h4>
            <ul className="space-y-2 text-stone-600">
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>"Guided Business Warranty"</span></li>
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>1-Year LCE Network Membership</span></li>
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>Access to LCE App (Basic KPIs)</span></li>
            </ul>
        </div>
    </div>
);

const BusinessModalContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h4 className="font-semibold text-stone-700 uppercase tracking-wider text-sm mb-3">Platform & Tech</h4>
            <ul className="space-y-2 text-stone-600">
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>Full LCE Platform Access (KPIs, Benchmarking)</span></li>
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>LCE "Co-Pilot" AI Assistant (Pro Tier)</span></li>
            </ul>
        </div>
        <div>
            <h4 className="font-semibold text-stone-700 uppercase tracking-wider text-sm mb-3">Market & Supply Chain</h4>
            <ul className="space-y-2 text-stone-600">
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>Exclusive Access to Bulk-Rate Pricing</span></li>
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>Eligibility for "Legal Chicks Certified" Program</span></li>
            </ul>
        </div>
    </div>
);

const FranchiseModalContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h4 className="font-semibold text-stone-700 uppercase tracking-wider text-sm mb-3">Business-in-a-Box</h4>
            <ul className="space-y-2 text-stone-600">
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>Official LCE Branding & Logo License</span></li>
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>Scaled Starter Kit (250+ RIR Chicks)</span></li>
            </ul>
        </div>
        <div>
            <h4 className="font-semibold text-stone-700 uppercase tracking-wider text-sm mb-3">Platform & Exclusivity</h4>
            <ul className="space-y-2 text-stone-600">
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>Full LCE Platform Access (KPIs, AI Co-Pilot)</span></li>
                <li className="flex items-start"><Icon name="Check" className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0"/><span>Exclusive rights to host LCE Orientations</span></li>
            </ul>
        </div>
    </div>
);


export default LandingPage;
