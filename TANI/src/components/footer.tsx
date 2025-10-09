import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import ContactForm from './contact-form';

const footerNav = [
  { name: 'Privacy Policy', href: '#' },
  { name: 'Terms & Conditions', href: '#' },
  { name: 'Accessibility Statement', href: '#' },
  { name: 'Refund Policy', href: '#' },
];

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'Twitter (TikTok placeholder)', href: '#', icon: Twitter },
];

export default function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 border-t-2 border-border">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
              <h3 className="text-4xl font-headline font-bold text-primary mb-4">Warrior Jews</h3>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter for the latest updates.
              </p>
              <ContactForm />
            </div>
            <div className="md:col-span-7 md:justify-self-end">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-headline text-lg font-semibold text-primary mb-4">Contact Us</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>+1 313-723-7255</li>
                    <li>tani.kagan@gmail.com</li>
                    <li>10427 N Scottsdale Rd, Suite #202, Scottsdale, AZ 85253</li>
                  </ul>
                  <div className="flex space-x-4 mt-6">
                    {socialLinks.map((item) => (
                      <a key={item.name} href={item.href} className="text-muted-foreground hover:text-primary">
                        <span className="sr-only">{item.name}</span>
                        <item.icon className="h-6 w-6" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-headline text-lg font-semibold text-primary mb-4">Quick Links</h4>
                  <ul className="space-y-2">
                    {footerNav.map((item) => (
                      <li key={item.name}>
                        <Link href={item.href} className="text-muted-foreground hover:text-primary hover:underline">
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-6 text-center text-sm text-muted-foreground/80 border-t border-border">
          <p>&copy; 2035 by Warrior Jews. Powered and secured by a Senior Engineer.</p>
        </div>
      </div>
    </footer>
  );
}
