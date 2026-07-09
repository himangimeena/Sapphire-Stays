// Static Fallback Seed Data for Sapphire Stays India
// Used gracefully when live backend server (http://localhost:5000) is offline during local review or demo mode.

export const FALLBACK_BRANCHES = [
  {
    id: 1,
    name: 'Sapphire Palace Udaipur Sanctuary',
    city: 'Udaipur',
    state: 'Rajasthan',
    address: 'Lake Pichola Heritage Marg, Udaipur, Rajasthan 313001',
    description: 'A 17th-century royal palace resting peacefully on Lake Pichola, offering private boat check-in, Mewari butler service, and private plunge pools overlooking Jag Mandir.',
    phone: '+91 294 242 0000',
    email: 'udaipur@sapphirestays.in',
    rating: 4.95,
    reviewsCount: 312,
    startingPrice: 38500,
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    features: ['Private Boat Arrival', 'Royal Butler Service', 'Lake Plunge Pool', 'Ayurvedic Spa']
  },
  {
    id: 2,
    name: 'Sapphire Grand Colaba Heritage',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Apollo Bunder, Colaba, Mumbai, Maharashtra 400001',
    description: 'An iconic Indo-Saracenic masterpiece facing the Arabian Sea and Gateway of India, celebrated for bespoke high tea at the Sea Lounge and private art galleries.',
    phone: '+91 22 6665 3366',
    email: 'colaba@sapphirestays.in',
    rating: 4.92,
    reviewsCount: 520,
    startingPrice: 32000,
    image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    features: ['Arabian Sea View', 'Gateway Heritage Walks', 'Chauffeur Maybach Service', 'Art Concierge']
  },
  {
    id: 3,
    name: 'Sapphire Imperial Lutyens Sanctuary',
    city: 'New Delhi',
    state: 'Delhi',
    address: '1 Janpath Lane, Connaught Place, New Delhi, Delhi 110001',
    description: 'Surrounded by 8 acres of manicured royal gardens in the heart of Lutyens Delhi, showcasing colonial elegance and award-winning Indian heritage dining.',
    phone: '+91 11 2334 1234',
    email: 'delhi@sapphirestays.in',
    rating: 4.89,
    reviewsCount: 410,
    startingPrice: 28000,
    image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    features: ['8 Acres Gardens', 'Private Tea Courtyard', 'Armored Chauffeur Fleet', 'Helipad Access']
  },
  {
    id: 4,
    name: 'Sapphire Serenity South Goa Resort',
    city: 'Goa',
    state: 'Goa',
    address: 'Cavelossim Beach, Salcete, South Goa, Goa 403731',
    description: 'A secluded beachfront luxury resort nestled between the Arabian Sea and Sal River, featuring Portuguese-style private villas and authentic coastal cuisine.',
    phone: '+91 832 668 8888',
    email: 'goa.serenity@sapphirestays.in',
    rating: 4.88,
    reviewsCount: 285,
    startingPrice: 24500,
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    features: ['Private Beachfront', 'Portuguese Villas', 'Sunset Yacht Charter', 'Holistic Wellness']
  },
  {
    id: 5,
    name: 'Sapphire Fort Jaipur Sanctuary',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Amer Heritage Road, Jaipur, Rajasthan 302001',
    description: 'Perched high in the Aravalli hills, this restored fortress offers 360-degree views of the Pink City, private elephant polo grounds, and royal dining.',
    phone: '+91 141 226 9999',
    email: 'jaipur.fort@sapphirestays.in',
    rating: 4.94,
    reviewsCount: 198,
    startingPrice: 35000,
    image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    features: ['Fortress Architecture', 'Pink City Panoramic Views', 'Royal Dining Hall', 'Private Courtyard']
  },
  {
    id: 6,
    name: 'Sapphire Backwaters Alleppey Sanctuary',
    city: 'Alleppey',
    state: 'Kerala',
    address: 'Punnamada Lake, Alleppey, Kerala 688006',
    description: 'Handcrafted teak houseboats and private lake villas surrounded by serene emerald backwaters, offering personalized Ayurvedic therapies and culinary cruises.',
    phone: '+91 477 223 4567',
    email: 'alleppey@sapphirestays.in',
    rating: 4.91,
    reviewsCount: 164,
    startingPrice: 22000,
    image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    features: ['Private Teak Houseboats', 'Lake Villa Suites', 'Ayurvedic Wellness', 'Sunset Culinary Cruise']
  }
];

export const FALLBACK_ROOMS = [
  {
    id: 1,
    branch_id: 1,
    name: 'Royal Maharaja Suite',
    type: 'Luxury Suite',
    price: 38500,
    capacity: 4,
    size_sqm: 120,
    description: 'Our most expansive palace suite with hand-painted gold leaf ceilings, private terrace over Lake Pichola, and dedicated 24/7 Mewari royal butler.',
    image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    features: ['Lake Pichola View', 'Private Plunge Pool', 'Gold Leaf Interiors', '24/7 Royal Butler']
  },
  {
    id: 2,
    branch_id: 1,
    name: 'Palace Garden Courtyard Suite',
    type: 'Executive Suite',
    price: 28000,
    capacity: 3,
    size_sqm: 85,
    description: 'Serene suite opening directly into the historic palace fountain courtyards, equipped with handcrafted rosewood furniture and marble plunge bath.',
    image_url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
    features: ['Fountain Courtyard Access', 'Handcrafted Rosewood Bed', 'Italian Marble Bath', 'Turn-down Aromatherapy']
  },
  {
    id: 3,
    branch_id: 2,
    name: 'Arabian Sea Grand Suite',
    type: 'Luxury Suite',
    price: 32000,
    capacity: 3,
    size_sqm: 95,
    description: 'Uninterrupted panoramic views of the Arabian Sea and Gateway of India from double-glazed colonial French windows.',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    features: ['Sea View Windows', 'Gateway of India Panorama', 'Colaba High Tea Access', 'Chauffeur Maybach Pick-up']
  },
  {
    id: 4,
    branch_id: 3,
    name: 'Lutyens Imperial Villa Chamber',
    type: 'Villa Chamber',
    price: 28000,
    capacity: 2,
    size_sqm: 75,
    description: 'Located inside the private garden estate of New Delhi, offering ultra-quiet soundproofing and private garden dining veranda.',
    image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    features: ['Private Garden Veranda', 'Colonial Art Collection', 'Armored Chauffeur Access', 'High-Speed Secure Wi-Fi']
  }
];
