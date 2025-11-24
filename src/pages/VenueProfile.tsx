import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, MapPin, Phone, Mail, Globe, Star, Clock, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { useTheme } from '../components/layout/ThemeContext';

interface VenueData {
  id: string;
  name: string;
  slug: string;
  owner_name: string;
  owner_email: string;
  phone: string;
  website: string;
  address: string;
  description: string;
  cover_image: string;
  logo_image: string;
  tagline: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  business_hours: any;
}

export default function VenueProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [venue, setVenue] = useState<VenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    fetchVenueBySlug();
  }, [slug]);

  const fetchVenueBySlug = async () => {
    if (!slug) return;

    try {
      const { data, error } = await (supabase
        .from('organizations') as any)
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      setVenue(data);
    } catch (err) {
      console.error('Error fetching venue:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Generate JSON-LD structured data for SEO (Schema.org LocalBusiness)
  const generateStructuredData = () => {
    if (!venue) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `https://bookingtms.com/${venue.slug}`,
      name: venue.name,
      description: venue.description || venue.tagline || `Book your experience at ${venue.name}`,
      image: venue.cover_image,
      logo: venue.logo_image,
      url: `https://bookingtms.com/${venue.slug}`,
      telephone: venue.phone,
      email: venue.owner_email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: venue.address,
      },
      sameAs: [
        venue.social_facebook,
        venue.social_instagram,
        venue.social_twitter,
        venue.website,
      ].filter(Boolean),
      priceRange: '$$',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '127',
      },
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading venue...</p>
        </div>
      </div>
    );
  }

  if (notFound || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Venue Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The venue you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const structuredData = generateStructuredData();

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{venue.name} - Book Your Experience | BookingTMS</title>
        <meta
          name="description"
          content={venue.description || venue.tagline || `Experience ${venue.name}. Book your slot today!`}
        />
        <meta name="keywords" content={`${venue.name}, booking, escape room, entertainment, ${venue.address}`} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="business.business" />
        <meta property="og:url" content={`https://bookingtms.com/${venue.slug}`} />
        <meta property="og:title" content={`${venue.name} - Book Your Experience`} />
        <meta property="og:description" content={venue.description || venue.tagline} />
        <meta property="og:image" content={venue.cover_image} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://bookingtms.com/${venue.slug}`} />
        <meta property="twitter:title" content={`${venue.name} - Book Your Experience`} />
        <meta property="twitter:description" content={venue.description || venue.tagline} />
        <meta property="twitter:image" content={venue.cover_image} />

        {/* Canonical URL */}
        <link rel="canonical" href={`https://bookingtms.com/${venue.slug}`} />

        {/* JSON-LD Structured Data */}
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
      </Helmet>

      {/* Page Content */}
      <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Hero Section with Cover Image */}
        <div
          className="relative h-[400px] bg-cover bg-center"
          style={{
            backgroundImage: venue.cover_image
              ? `url(${venue.cover_image})`
              : 'linear-gradient(to right, #4f46e5, #7c3aed)'
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
            <div className="flex items-end gap-6">
              {/* Logo */}
              {venue.logo_image && (
                <img
                  src={venue.logo_image}
                  alt={venue.name}
                  className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
                />
              )}

              {/* Title */}
              <div className="mb-4">
                <h1 className="text-5xl font-bold text-white mb-2">{venue.name}</h1>
                {venue.tagline && (
                  <p className="text-xl text-gray-200">{venue.tagline}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold">4.8</span>
                    <span className="text-gray-300">(127 reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {venue.description && (
                <section className={`p-6 rounded-xl ${isDark ? 'bg-[#161616]' : 'bg-white'} shadow-lg`}>
                  <h2 className="text-2xl font-bold mb-4">About Us</h2>
                  <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {venue.description}
                  </p>
                </section>
              )}

              {/* Book Now CTA */}
              <section className={`p-8 rounded-xl ${isDark ? 'bg-gradient-to-r from-indigo-900 to-purple-900' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} text-white shadow-lg`}>
                <h2 className="text-3xl font-bold mb-4">Ready to Book?</h2>
                <p className="text-lg mb-6">
                  Choose your preferred date and time to start your adventure!
                </p>
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-6"
                  onClick={() => {/* TODO: Open booking modal */ }}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Now
                </Button>
              </section>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-6">
              {/* Contact Card */}
              <section className={`p-6 rounded-xl ${isDark ? 'bg-[#161616]' : 'bg-white'} shadow-lg`}>
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  {venue.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{venue.address}</p>
                      </div>
                    </div>
                  )}

                  {venue.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <a href={`tel:${venue.phone}`} className="text-indigo-600 hover:underline">
                          {venue.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {venue.owner_email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a href={`mailto:${venue.owner_email}`} className="text-indigo-600 hover:underline">
                          {venue.owner_email}
                        </a>
                      </div>
                    </div>
                  )}

                  {venue.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a
                          href={venue.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Business Hours */}
              <section className={`p-6 rounded-xl ${isDark ? 'bg-[#161616]' : 'bg-white'} shadow-lg`}>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Business Hours
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">10:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday - Sunday</span>
                    <span className="font-medium">9:00 AM - 11:00 PM</span>
                  </div>
                </div>
              </section>

              {/* Owner Login Link */}
              <section className={`p-6 rounded-xl ${isDark ? 'bg-indigo-950/50 border border-indigo-900' : 'bg-indigo-50 border border-indigo-200'}`}>
                <h3 className="text-lg font-semibold mb-2 text-indigo-600 dark:text-indigo-400">
                  Are you the owner?
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Manage your venue, bookings, and settings
                </p>
                <Button
                  variant="outline"
                  className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                  onClick={() => navigate(`/${venue.slug}/admin`)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
