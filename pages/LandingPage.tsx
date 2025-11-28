
import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon, Logo } from '../components/ui';
import { db, appId } from '../services/firebase';
import { addDoc, collection } from 'firebase/firestore';

// Define custom colors based on the specification
const theme = {
    primary: '#8B542F', // Dark Brown/Coffee
    secondary: '#E3793D', // Orange/Rust
    accent: '#F9A825', // Gold/Yellow-Orange
    textDark: '#374151',
    textLight: '#F9FAFB',
};

// Helper for smooth scrolling with header offset
const scrollToSection = (id: string) => {
    const sectionId = id.replace('#', '');
    const element = document.getElementById(sectionId);
    if (element) {
        const headerOffset = 80; // Height of fixed header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
};

const LandingPage: React.FC = () => {
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();

    // Handle incoming scroll requests from other pages
    useEffect(() => {
        if (location.state && (location.state as any).scrollTo) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                scrollToSection((location.state as any).scrollTo);
            }, 100);
        }
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
             const heroSection = document.getElementById('about');
            if (heroSection) {
                // Change header style after scrolling past the hero image
                setIsScrolled(window.scrollY > heroSection.offsetHeight - 80);
            } else {
                setIsScrolled(window.scrollY > 50);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    return (
        <div className="font-sans antialiased text-stone-800 bg-gray-50">
            <Header isMobileMenuOpen={isMobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} isScrolled={isScrolled} />
            <main>
                <HeroSection />
                <MissionVisionValuesSection />
                <WhatWeDoSection />
                <PartnersSection />
                <ModelAndImpactSection />
                <ConnectSection />
            </main>
            <Footer />
        </div>
    );
};

const Header: React.FC<{ isMobileMenuOpen: boolean, setMobileMenuOpen: (isOpen: boolean) => void, isScrolled: boolean }> = ({ isMobileMenuOpen, setMobileMenuOpen, isScrolled }) => {
    const navigate = useNavigate();
    
    // Header background logic: transparent at top, primary color when scrolled
    const headerClasses = `fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'shadow-lg' : 'bg-transparent'}`;
    const headerStyle = isScrolled ? { backgroundColor: theme.primary } : {};
    const linkColor = 'text-white hover:text-gray-200 cursor-pointer';

    const navLinks = [
        { href: "#about", label: "Who We Are" },
        { href: "#what-we-do", label: "What We Do" },
        { href: "#partners", label: "Partners" },
        { href: "#model", label: "Model & Impact" },
    ];

    const handleNavClick = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        scrollToSection(href);
        setMobileMenuOpen(false);
    };

    return (
        <header id="header" className={headerClasses} style={headerStyle}>
            <div className={`absolute inset-0 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundColor: theme.primary }}></div>
            {/* Gradient overlay for readability when at top */}
            {!isScrolled && <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>}
            
            <nav className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between h-12">
                    <button onClick={(e) => handleNavClick(e, '#about')} className="flex items-center space-x-3 group focus:outline-none">
                         {/* Logo Placeholder - using the Logo component but styling it to match */}
                        <div className="bg-white rounded-full p-1">
                             <Logo className="h-10 w-10" />
                        </div>
                        <span className="text-xl font-bold hidden sm:block text-white group-hover:text-gray-100">LCEN</span>
                    </button>
                    
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map(link => (
                            <button 
                                key={link.href} 
                                onClick={(e) => handleNavClick(e, link.href)} 
                                className={`text-base font-medium transition duration-150 bg-transparent border-none ${linkColor}`}
                            >
                                {link.label}
                            </button>
                        ))}
                        
                        {/* Member Login Button (Desktop) */}
                        <button 
                            onClick={() => navigate('/login')} 
                            className="text-white hover:bg-white/10 px-4 py-2 rounded-lg font-medium transition duration-150 border border-transparent hover:border-white/30"
                        >
                            Member Login
                        </button>

                        <button 
                            onClick={(e) => handleNavClick(e, '#connect')}
                            className="py-2 px-4 rounded-lg font-bold shadow-md transition transform hover:-translate-y-0.5"
                            style={{ backgroundColor: theme.secondary, color: theme.textLight }}
                        >
                            Connect
                        </button>
                    </div>
                    
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} type="button" className="text-white hover:bg-white/20 p-2 rounded-lg">
                            <Icon name={isMobileMenuOpen ? "X" : "Menu"} className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </nav>
            {isMobileMenuOpen && (
                <div className="md:hidden absolute w-full bg-gray-800 shadow-lg border-t border-gray-700">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map(link => (
                             <button 
                                key={link.href} 
                                onClick={(e) => handleNavClick(e, link.href)} 
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                            >
                                {link.label}
                            </button>
                        ))}
                        <div className="border-t border-gray-700 my-2"></div>
                        <button 
                            onClick={(e) => handleNavClick(e, '#connect')} 
                            className="block w-full text-center px-4 py-2 rounded-md text-base font-bold text-white mb-2" 
                            style={{ backgroundColor: theme.secondary }}
                        >
                            Connect
                        </button>
                        <button 
                            onClick={() => navigate('/login')} 
                            className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-gray-300 border border-gray-600 hover:bg-gray-700"
                        >
                            Member Login
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

const HeroSection = () => (
    <section id="about" className="relative min-h-screen flex items-center justify-center text-center py-20 sm:py-32">
        {/* Hero Background with Overlay */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.pexels.com/photos/1595303/pexels-photo-1595303.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Poultry Farm" 
                className="w-full h-full object-cover" 
            />
            {/* Linear gradient adds a 50% opaque layer of the primary color over the image */}
            <div className="absolute inset-0" style={{ background: `linear-gradient(rgba(139, 84, 47, 0.7), rgba(139, 84, 47, 0.6))` }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight">
                <span className="block">Legal Chicks Empowerment Network</span>
                {/* Text color adjusted for better contrast on dark background */}
                <span className="block text-3xl sm:text-4xl mt-4 font-semibold" style={{ color: theme.accent }}>"From One Coop to a Community"</span>
            </h1>
            <p className="mt-8 max-w-4xl mx-auto text-xl text-gray-100 leading-relaxed">
                <strong>Legal Chicks Empowerment Network (LCEN)</strong> is a livelihood and agribusiness movement born in Cagayan Valley, Philippines, dedicated to empowering farmers, homemakers, and youth through <strong>sustainable poultry farming.</strong>
            </p>
            <p className="mt-4 max-w-4xl mx-auto text-lg text-gray-200">
                Founded by Legal Chicks Poultry Farm, LCEN bridges the gap between agripreneurship and community empowerment — helping ordinary Cagayanos transform their backyards into productive, income-generating poultry enterprises.
            </p>
            <div className="mt-10 flex justify-center">
                <button 
                    onClick={() => scrollToSection('what-we-do')} 
                    className="py-3 px-8 rounded-xl text-lg font-bold shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                    style={{ backgroundColor: theme.secondary, color: theme.textLight }}
                >
                    See How We Empower Cagayan
                </button>
            </div>
        </div>
    </section>
);

const SectionHeader: React.FC<{title: string}> = ({ title }) => (
    <h2 className="text-3xl font-extrabold mb-4 pl-5 border-l-8" style={{ color: theme.primary, borderColor: theme.secondary }}>
        {title}
    </h2>
);

const MissionVisionValuesSection: React.FC = () => (
    <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-10">
                {/* Mission */}
                <div>
                    <SectionHeader title="🎯 Our Mission" />
                    <p className="text-lg text-gray-700 leading-relaxed">
                        To <strong>equip and empower Cagayan farmers and families</strong> with the knowledge, tools, and support they need to start and sustain profitable poultry businesses — creating livelihoods that last, communities that grow, and futures that thrive.
                    </p>
                </div>
                {/* Vision */}
                <div>
                    <SectionHeader title="🌅 Our Vision" />
                    <p className="text-lg text-gray-700 leading-relaxed">
                        A Cagayan where every farmer can <strong>earn and live well from the land they work on</strong> — connected through one network of shared knowledge, trust, and opportunity.
                    </p>
                </div>
                {/* Values */}
                <div>
                    <SectionHeader title="💡 Core Values" />
                    <ul className="space-y-3 text-gray-700">
                        <li><strong style={{ color: theme.secondary }}>Empowerment:</strong> We teach, train, and trust our partners to grow independently.</li>
                        <li><strong style={{ color: theme.secondary }}>Integrity:</strong> Every deal, every egg, every promise — handled with honesty.</li>
                        <li><strong style={{ color: theme.secondary }}>Community:</strong> We rise together. Farmers, families, and partners are one.</li>
                        <li><strong style={{ color: theme.secondary }}>Innovation:</strong> We embrace technology and sustainable methods that work.</li>
                        <li><strong style={{ color: theme.secondary }}>Stewardship:</strong> We protect our animals, our land, and our people.</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
);

const WhatWeDoSection: React.FC = () => {
    const solutions = [
        { icon: "GraduationCap" as const, title: "1. Training & Mentorship", description: "We conduct hands-on workshops and online programs on poultry raising, disease control, feed formulation, and egg management — designed for both beginners and seasoned farmers." },
        { icon: "Package" as const, title: "2. Starter Opportunity Packages", description: "Affordable start-up kits include: Vaccinated chicks (RIR/Australorp), feeds/vitamins for the first cycle, a step-by-step care guide, and a starter coop layout plan." },
        { icon: "Sprout" as const, title: "3. Access to Supplies & Feeds", description: "Through the Legal Chicks network, farmers enjoy discounted feeds, vaccines, and pelletized nutrition produced locally — cutting costs and ensuring quality control." },
        { icon: "Store" as const, title: "4. Brand Partnership & Market Access", description: "Members can market under the Legal Chicks label, gaining instant brand credibility. We also assist with bulk selling, farm-to-market connections, and digital visibility." },
        { icon: "HeartHandshake" as const, title: "5. Community Support & Incentives", description: "A portion of LCEN’s earnings funds a Community Development Fund, used to support new starters, provide small grants, or offer youth scholarships. We don’t just grow poultry — we grow people.", wide: true }
    ];

    return (
        <section id="what-we-do" className="py-16 sm:py-24 bg-gray-50">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-4xl font-extrabold text-center mb-12" style={{ color: theme.primary }}>
                    🐣 What We Do: End-to-End Livelihood Solutions
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {solutions.map(s => (
                        <div key={s.title} className={`bg-white p-8 rounded-xl shadow-lg hover:-translate-y-2 transition-transform duration-300 border-t-4 ${s.wide ? 'lg:col-span-2' : ''}`} style={{ borderColor: theme.secondary }}>
                            <div className="mb-4">
                                <Icon name={s.icon} className="w-10 h-10" style={{ color: theme.secondary }} />
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{ color: theme.primary }}>{s.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{s.description}</p>
                        </div>
                    ))}
                </div>

                {/* Image Placeholder: Farmers Training */}
                <div className="mt-16 bg-gray-200 p-8 rounded-xl shadow-inner text-center">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: theme.primary }}>LCEN Farmers Workshop</h3>
                    <p className="text-gray-600 italic mb-6">Empowering the community through hands-on learning.</p>
                    <div className="h-64 w-full rounded-lg overflow-hidden relative shadow-md group">
                         <img 
                            src="https://images.pexels.com/photos/934068/pexels-photo-934068.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                            alt="Farmers Workshop" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <span className="text-white font-bold text-xl bg-black/50 px-4 py-2 rounded">Cagayan Farmers in Action</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const PartnersSection: React.FC = () => (
    <section id="partners" className="py-16 sm:py-24 text-white" style={{ backgroundColor: theme.primary }}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-center mb-12">🤝 Our Network Partners & Reach</h2>
            
            <div className="grid lg:grid-cols-2 gap-10 items-start">
                {/* Partners Collaboration */}
                <div>
                    <h3 className="text-2xl font-bold mb-4" style={{ color: theme.accent }}>Active Collaborations</h3>
                    <p className="text-lg font-light mb-6">
                        LCEN actively collaborates with key organizations to ensure farmers have access to funding, reliable markets, and essential government resources.
                    </p>
                    <ul className="space-y-3 bg-white text-gray-800 p-6 rounded-xl shadow-lg">
                        <li className="flex items-start"><span className="text-xl mr-3 font-bold" style={{ color: theme.secondary }}>✓</span>Local Government Units (LGUs) in Cagayan towns</li>
                        <li className="flex items-start"><span className="text-xl mr-3 font-bold" style={{ color: theme.secondary }}>✓</span>Department of Agriculture (DA) and DTI Livelihood Programs</li>
                        <li className="flex items-start"><span className="text-xl mr-3 font-bold" style={{ color: theme.secondary }}>✓</span>Private agri-supply chains and training institutions</li>
                        <li className="flex items-start"><span className="text-xl mr-3 font-bold" style={{ color: theme.secondary }}>✓</span>Community cooperatives and youth groups</li>
                    </ul>
                </div>

                {/* Reach and Clusters */}
                <div>
                    <h3 className="text-2xl font-bold mb-4" style={{ color: theme.accent }}>Our Growing Reach</h3>
                    <p className="text-lg font-light mb-6">
                        We are rapidly expanding across Cagayan Valley, organizing local farmers into "Farmer Clusters" for efficient mentoring and resource sharing.
                    </p>
                    <div className="bg-white text-gray-800 p-6 rounded-xl shadow-lg mb-6">
                        <h4 className="text-xl font-bold mb-3" style={{ color: theme.primary }}>Currently Active In:</h4>
                        <ul className="grid grid-cols-2 gap-y-2">
                            <li className="flex items-center"><span className="mr-2" style={{ color: theme.secondary }}>📍</span>Tuguegarao City</li>
                            <li className="flex items-center"><span className="mr-2" style={{ color: theme.secondary }}>📍</span>Solana</li>
                            <li className="flex items-center"><span className="mr-2" style={{ color: theme.secondary }}>📍</span>Enrile</li>
                            <li className="flex items-center"><span className="mr-2" style={{ color: theme.secondary }}>📍</span>Peñablanca</li>
                        </ul>
                    </div>
                     {/* Map Placeholder */}
                     <div className="p-4 bg-white/10 rounded-xl text-center border border-white/20">
                        <div className="h-40 w-full bg-white/20 mt-2 rounded-lg flex items-center justify-center overflow-hidden relative">
                             <img 
                                src="https://images.pexels.com/photos/2033343/pexels-photo-2033343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                                alt="Map Placeholder"
                                className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
                            />
                            <span className="absolute text-white font-bold drop-shadow-md">Expanding Across The Valley</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const ModelAndImpactSection: React.FC = () => (
    <section id="model" className="py-16 sm:py-24 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-center mb-12" style={{ color: theme.primary }}>
                🧭 Business Model & Impact
            </h2>

            <div className="grid lg:grid-cols-2 gap-10">
                
                {/* Business Model Table */}
                <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:-translate-y-1">
                    <h3 className="text-2xl font-bold mb-4" style={{ color: theme.secondary }}>LCEN Hybrid Structure</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Element</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap font-semibold text-gray-800">Enterprise Core</td>
                                    <td className="px-4 py-4 text-gray-600">Manages training, branding, chick supply, and feed production.</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap font-semibold text-gray-800">Empowerment Network</td>
                                    <td className="px-4 py-4 text-gray-600">Community arm that trains, supports, and monitors local poultry farmers.</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap font-semibold text-gray-800">Revenue Streams</td>
                                    <td className="px-4 py-4 text-gray-600">Starter packages, feed sales, training fees, marketing commissions.</td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap font-semibold text-gray-800">Impact Flow</td>
                                    <td className="px-4 py-4 text-gray-600">Part of profits reinvested into the Community Development Fund.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 text-sm text-gray-500 italic">This hybrid structure allows LCEN to stay financially self-sustaining while fulfilling its mission.</p>
                </div>

                {/* Impact Goals */}
                <div className="bg-white p-6 rounded-xl shadow-md transition-transform hover:-translate-y-1">
                    <h3 className="text-2xl font-bold mb-4" style={{ color: theme.secondary }}>📈 Our Impact Goals (2025–2026)</h3>
                    <ul className="space-y-4">
                        {[
                            "Train and mentor **300+ Cagayan farmers**",
                            "Establish **10+ local clusters** under the LCEN banner",
                            "Create **500+ new livelihood opportunities**",
                            "Supply and distribute **20,000+ healthy layers**",
                            "Launch the **Legal Chicks Farmer Certification Program**"
                        ].map((goal, idx) => (
                            <li key={idx} className="flex items-start">
                                <span className="text-green-600 text-xl mr-3 mt-0.5">✔</span>
                                <p className="text-lg text-gray-700" dangerouslySetInnerHTML={{ __html: goal.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Why LCEN Matters */}
                <div className="lg:col-span-2 mt-8 p-8 rounded-xl shadow-2xl text-white relative overflow-hidden" style={{ backgroundColor: theme.secondary }}>
                     <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                     <div className="relative z-10">
                        <h3 className="text-3xl font-bold mb-3">🌾 Why LCEN Matters</h3>
                        <p className="text-xl font-light leading-relaxed">
                            In a time when farming families are struggling against low prices, rising costs, and climate challenges — LCEN stands as a practical lifeline.
                            We don’t just give aid; we give <strong>ability</strong>. We don’t just provide jobs; we build <strong>ownership</strong>. And we don’t just raise chickens; we raise a generation of local <strong>agri-entrepreneurs</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const ConnectSection = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', farmLocation: '', farmSize: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
  
    const handleNext = () => {
        if (step === 1 && formData.name && formData.email && formData.phone) setStep(2);
        else if (step === 2 && formData.farmLocation && formData.farmSize) setStep(3);
    };
  
    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');
      try {
          await addDoc(collection(db, `/artifacts/${appId}/public/data/membership_applications`), {
              ...formData, status: 'pending', submittedAt: new Date().toISOString()
          });
          setIsSuccess(true);
      } catch (err) {
          setError('Submission failed. Please try again.');
      } finally {
          setIsLoading(false);
      }
    };
  
    return (
      <section id="connect" className="py-16 sm:py-24 text-white text-center relative" style={{ backgroundColor: theme.primary }}>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">🕊️ Our Promise & Commitment</h2>
            <p className="mt-4 text-xl font-light mb-12 italic max-w-4xl mx-auto">
                To every Cagayano who joins us: <strong>You will not start alone. You will not grow alone. You will never stand alone.</strong>
            </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            <div>
                 <div className="bg-white/10 p-8 rounded-2xl border border-white/20 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold mb-4" style={{ color: theme.accent }}>Connect With Us</h3>
                    <div className="space-y-6 text-lg">
                        <div className="flex items-center">
                            <span className="text-3xl mr-4">📍</span>
                            <div>
                                <p className="font-bold">Head Office</p>
                                <p>Solana, Cagayan Valley</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-3xl mr-4">📧</span>
                             <div>
                                <p className="font-bold">Email Us</p>
                                <a href="mailto:admin@legalchicks.vip" className="underline hover:text-gray-200">admin@legalchicks.vip</a>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-3xl mr-4">📘</span>
                             <div>
                                <p className="font-bold">Social Media</p>
                                <a href="https://www.facebook.com/LegalChicksPoultryFarm/" target="_blank" className="underline hover:text-gray-200">Facebook Page</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl text-stone-800">
              {isSuccess ? (
                  <div className="text-center py-10">
                      <Icon name="PartyPopper" className="w-16 h-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-stone-900 mb-2">Application Received!</h3>
                      <p className="text-lg text-stone-600">Welcome to the network! Our team will be in touch within 24-48 hours.</p>
                      <button onClick={() => { setIsSuccess(false); setStep(1); setFormData({ name: '', email: '', phone: '', farmLocation: '', farmSize: '' }) }} className="mt-6 text-sm text-gray-500 underline">Submit another application</button>
                  </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 className="text-2xl font-bold text-center mb-6" style={{ color: theme.primary }}>Inquire About The Opportunity Package</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                      <div className="h-2.5 rounded-full transition-all duration-300" style={{ width: `${(step/3)*100}%`, backgroundColor: theme.secondary }}></div>
                  </div>
                  {step === 1 && (
                      <div className="space-y-4 animate-fade-in">
                          <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                          <input type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                          <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                          <button type="button" onClick={handleNext} className="w-full py-3 rounded-lg font-bold text-white mt-6 shadow-md hover:opacity-90 transition" style={{ backgroundColor: theme.secondary }}>Next: Farm Details</button>
                      </div>
                  )}
                  {step === 2 && (
                      <div className="space-y-4 animate-fade-in">
                          <input type="text" placeholder="Farm Location (Province)" required value={formData.farmLocation} onChange={e => setFormData({...formData, farmLocation: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                          <input type="text" placeholder="Current Flock Size (e.g. '50 birds' or 'None')" required value={formData.farmSize} onChange={e => setFormData({...formData, farmSize: e.target.value})} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                          <div className="flex gap-4 mt-6">
                              <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition">Back</button>
                              <button type="button" onClick={handleNext} className="flex-1 py-3 rounded-lg font-bold text-white shadow-md hover:opacity-90 transition" style={{ backgroundColor: theme.secondary }}>Next: Verification</button>
                          </div>
                      </div>
                  )}
                  {step === 3 && (
                      <div className="animate-fade-in">
                          <p className="text-gray-600 mb-6 text-center">Ready to submit? An LCEN representative will contact you shortly to verify your details.</p>
                          <div className="flex gap-4 mt-6">
                              <button type="button" onClick={() => setStep(2)} className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition">Back</button>
                              <button type="submit" disabled={isLoading} className={`flex-1 py-3 rounded-lg font-bold text-white shadow-md hover:opacity-90 transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`} style={{ backgroundColor: theme.primary }}>
                                {isLoading ? 'Sending...' : 'Submit Inquiry'}
                              </button>
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
  
const Footer = () => (
    <footer className="bg-gray-800 text-white py-12 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start space-y-8 md:space-y-0">
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                        <Logo className="h-8 w-8" />
                        <span className="font-bold text-xl">LCEN</span>
                    </div>
                    <p className="text-gray-400 text-sm max-w-xs">
                        Livelihood and Agribusiness Movement in Cagayan Valley. Building communities, one coop at a time.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-12 text-center md:text-left">
                     <div>
                        <h4 className="font-bold mb-4 text-gray-300">Navigation</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition">Who We Are</button></li>
                            <li><button onClick={() => scrollToSection('what-we-do')} className="hover:text-white transition">What We Do</button></li>
                            <li><button onClick={() => scrollToSection('partners')} className="hover:text-white transition">Partners</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4 text-gray-300">Contact</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Solana, Cagayan Valley</li>
                            <li><a href="mailto:admin@legalchicks.vip" className="hover:text-white transition">admin@legalchicks.vip</a></li>
                            <li><a href="https://www.facebook.com/LegalChicksPoultryFarm/" target="_blank" className="hover:text-white transition">Facebook Page</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Legal Chicks Empowerment Network. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
);

export default LandingPage;
