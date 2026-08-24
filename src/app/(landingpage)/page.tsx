import React from 'react';
import AOSInit from './components/AOSInit';
import HeroSection from './components/HeroSection';
import StatsBar from './components/StatsBar';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import UseCasesSection from './components/UseCasesSection';
import BenefitsSection from './components/BenefitsSection';
import EarlyAccessSection from './components/EarlyAccessSection';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-background text-on-background flex flex-col">
            <AOSInit />
            <HeroSection />
            <StatsBar />
            <FeaturesSection />
            <HowItWorksSection />
            <UseCasesSection />
            <BenefitsSection />
            <EarlyAccessSection />
            <FAQSection />
            <CTASection />
            <Footer />
        </main>
    );
}