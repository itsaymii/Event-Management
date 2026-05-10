import React, { useState } from 'react'; // Idinagdag ang useState
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import CapabilitiesSection from '../components/CapabilitiesSection';
import WorkflowSection from '../components/WorkflowSection';
import RolesSection from '../components/RolesSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import LoginPage from './LoginPage';
import SignUpPage from "./SignUpPage"; 

export default function LandingPage() {
  // Ito ang controller kung naka-login view ba o hindi
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  // Kapag true ang showSignUp, ito lang ang i-render natin
  if (showSignUp) {
    return <SignUpPage onBack={() => setShowSignUp(false)} />;
  }

  // Kapag true ang showLogin, ito lang ang i-render natin
  if (showLogin) {
    return <LoginPage onBack={() => setShowLogin(false)} onSignUp={() => setShowSignUp(true)} />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.08),_transparent_30%)]">
        {/* I-pass ang function sa Header para ma-trigger ang pag-open */}
        <Header onLoginClick={() => setShowLogin(true)} />
        <HeroSection />
      </div>
      <CapabilitiesSection />
      <WorkflowSection />
      <RolesSection />
      <CTASection />
      <Footer />
    </div>
  );
}