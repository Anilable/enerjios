'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  Sun, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EnerjiOSLogo } from '@/components/ui/energyos-logo'

export function Footer() {
  const { data: session } = useSession()
  const currentYear = new Date().getFullYear()

  const companyLinks = [
    { href: '/about', label: 'Hakkımızda' },
    { href: '/services', label: 'Hizmetlerimiz' },
    { href: '/projects', label: 'Referanslar' },
    { href: '/news', label: 'Haberler' },
    { href: '/careers', label: 'Kariyer' },
  ]

  const serviceLinks = [
    { href: '/calculator', label: 'GES Hesaplayıcı' },
    { href: '/companies', label: 'Kurulum Firmaları' },
    { href: '/products', label: 'Ürün Kataloğu' },
    { href: '/financing', label: 'Finansman' },
    { href: '/maintenance', label: 'Bakım Hizmetleri' },
  ]

  const supportLinks = [
    { href: '/help', label: 'Yardım Merkezi' },
    { href: '/contact', label: 'İletişim' },
    { href: '/support', label: 'Teknik Destek' },
    { href: '/faq', label: 'Sık Sorulan Sorular' },
    { href: '/documentation', label: 'Dokümantasyon' },
  ]

  const legalLinks = [
    { href: '/kvkk', label: 'KVKK Aydınlatma Metni' },
    { href: '/cerez-politikasi', label: 'Çerez Politikası' },
    { href: '/gizlilik-politikasi', label: 'Gizlilik Politikası' },
    { href: '/kvkk-basvuru', label: 'KVKK Başvuru' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href={session ? "/dashboard" : "/"} className="flex items-center space-x-2 mb-6">
              <EnerjiOSLogo className="h-14 w-auto" />
            </Link>
            
            <p className="text-gray-300 mb-6 max-w-md">
              Türkiye'nin en kapsamlı güneş enerjisi sistemi (GES) satış ve yönetim platformu. 
              Çiftçiler, ev sahipleri ve işletmeler için özel çözümler sunuyoruz.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Levazım, Vadi Cd Zorlu Center , 34340 Beşiktaş/İstanbul</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+90 (288) 415 20 05</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Mail className="h-4 w-4" />
                <span>info@enerjios.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 mt-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Şirket</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold mb-4">Hizmetler</h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Destek</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="max-w-md">
            <h3 className="font-semibold mb-2">Haberdar Olun</h3>
            <p className="text-gray-400 text-sm mb-4">
              Güneş enerjisi sektöründeki son gelişmeler ve özel teklifler için bültenimize abone olun.
            </p>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="E-posta adresiniz"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
              <Button>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} EnerjiOS. Tüm hakları saklıdır.
            </div>
            
            <div className="flex items-center space-x-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Sun className="h-4 w-4 text-primary" />
              <span>Güneş enerjisi ile güçlendi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}