import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <span className="font-bold text-foreground">AI Job Platform</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ethiopia's premier AI-powered recruitment platform connecting top talent with leading employers across Africa.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[
                { icon: Twitter, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Github, href: '#' },
                { icon: Mail, href: 'mailto:hello@aijobplatform.com' },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">For Job Seekers</h3>
            <ul className="space-y-3">
              {[
                ['Browse Jobs', '/jobs'],
                ['Companies', '/companies'],
                ['Courses', '/courses'],
                ['Career Paths', '/courses'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">For Employers</h3>
            <ul className="space-y-3">
              {[
                ['Post a Job', '/register'],
                ['Find Candidates', '/register'],
                ['Pricing', '/register'],
                ['Employer Login', '/login'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm">Company</h3>
            <ul className="space-y-3">
              {[
                ['About Us', '/about'],
                ['Blog', '/blog'],
                ['Privacy Policy', '/privacy'],
                ['Terms of Service', '/terms'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AI Job Platform. All rights reserved. Made with ❤️ in Ethiopia.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by AI · Built for Africa
          </p>
        </div>
      </div>
    </footer>
  );
}
