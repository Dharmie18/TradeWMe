import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, TrendingUp, Lock } from 'lucide-react';
import Link from 'next/link';
import { MarketOverview } from '@/components/MarketOverview';
import { TopMovers } from '@/components/TopMovers';
import { TrendingTokens } from '@/components/TrendingTokens';
import { LivePriceTicker } from '@/components/LivePriceTicker';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { StatsCounter } from '@/components/StatsCounter';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Live Price Ticker */}
      <LivePriceTicker />
      
      <main className="flex-1">
        {/* Hero Section with Enhanced Animated Background */}
        <section className="w-full py-12 md:py-20 lg:py-32 relative overflow-hidden">
          {/* Enhanced Animated Background */}
          <div className="absolute inset-0 -z-10">
            {/* Primary gradient blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/25 to-blue-400/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-cyan-400/25 rounded-full blur-3xl animate-blob animation-delay-4000" />
            
            {/* Additional floating elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl animate-float" />
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-cyan-300/25 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-cyan-50/30" />
          </div>
          
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in">
                Trade Crypto Like a Pro with{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 bg-clip-text text-transparent">
                  PocketBroker
                </span>
              </h1>
              <p className="mt-6 md:mt-8 text-base md:text-lg lg:text-xl leading-7 md:leading-8 text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Access the best rates across all DEXs. Non-custodial, secure, and lightning fast.
                Your keys, your crypto, your control.
              </p>
              <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Link href="/trade" className="w-full sm:w-auto">
                  <Button size="lg" className="gap-2 w-full sm:w-auto hover:scale-105 transition-transform">
                    Start Trading
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/markets" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto hover:scale-105 transition-transform">
                    Explore Markets
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Counter Section */}
        <section className="w-full border-y bg-muted/40 py-12 md:py-16 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 animate-scale-in">
            <StatsCounter />
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-20 lg:py-24 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid gap-6 md:gap-8 md:grid-cols-3">
                <div className="group flex flex-col items-center text-center p-6 md:p-8 rounded-xl hover:bg-muted/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:animate-hover-lift animate-slide-in-left">
                  <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-primary-foreground group-hover:scale-110 transition-transform animate-float">
                    <Lock className="h-7 w-7 md:h-8 md:w-8" />
                  </div>
                  <h3 className="mt-4 md:mt-6 text-xl md:text-2xl font-semibold">Non-Custodial</h3>
                  <p className="mt-2 md:mt-3 text-sm md:text-base text-muted-foreground">
                    You control your funds. We never have access to your assets.
                  </p>
                </div>
                <div className="group flex flex-col items-center text-center p-6 md:p-8 rounded-xl hover:bg-muted/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:animate-hover-lift animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                  <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-400 text-primary-foreground group-hover:scale-110 transition-transform animate-float" style={{ animationDelay: '0.2s' }}>
                    <Zap className="h-7 w-7 md:h-8 md:w-8" />
                  </div>
                  <h3 className="mt-4 md:mt-6 text-xl md:text-2xl font-semibold">Best Rates</h3>
                  <p className="mt-2 md:mt-3 text-sm md:text-base text-muted-foreground">
                    Aggregate liquidity from multiple DEXs for optimal pricing.
                  </p>
                </div>
                <div className="group flex flex-col items-center text-center p-6 md:p-8 rounded-xl hover:bg-muted/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:animate-hover-lift animate-slide-in-left" style={{ animationDelay: '0.4s' }}>
                  <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-primary-foreground group-hover:scale-110 transition-transform animate-float" style={{ animationDelay: '0.4s' }}>
                    <Shield className="h-7 w-7 md:h-8 md:w-8" />
                  </div>
                  <h3 className="mt-4 md:mt-6 text-xl md:text-2xl font-semibold">Secure & Audited</h3>
                  <p className="mt-2 md:mt-3 text-sm md:text-base text-muted-foreground">
                    Battle-tested smart contracts and rigorous security audits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Market Overview Section */}
        <section className="w-full py-12 md:py-20 lg:py-24 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 md:mb-8 text-center animate-slide-up">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Market Overview</h2>
                <p className="mt-2 md:mt-3 text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-in-left">
                  Real-time insights into the crypto market
                </p>
              </div>
              <div className="animate-scale-in">
                <MarketOverview />
              </div>
            </div>
          </div>
        </section>

        {/* Top Movers Section */}
        <section className="w-full py-12 md:py-20 lg:py-24 bg-muted/30 animate-stagger-fade">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 md:mb-8 text-center animate-slide-up">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Top Movers</h2>
                <p className="mt-2 md:mt-3 text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-in-right">
                  Track the biggest gainers and losers in the market
                </p>
              </div>
              <div className="animate-bounce-in">
                <TopMovers />
              </div>
            </div>
          </div>
        </section>

        {/* Trending Tokens Section */}
        <section className="w-full py-12 md:py-20 lg:py-24 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 md:mb-8 text-center animate-slide-up">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Trending Now</h2>
                <p className="mt-2 md:mt-3 text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-in-left">
                  Most popular tokens across the ecosystem
                </p>
              </div>
              <div className="animate-scale-in">
                <TrendingTokens />
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="w-full border-y bg-muted/40 py-12 md:py-20 lg:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <NewsletterSignup />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-20 lg:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Ready to start trading?</h2>
              <p className="mt-4 md:mt-6 text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect your wallet and start trading in seconds
              </p>
              <div className="mt-8 md:mt-10">
                <Link href="/trade">
                  <Button size="lg" className="gap-2 w-full sm:w-auto hover:scale-105 transition-transform">
                    Launch App
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}