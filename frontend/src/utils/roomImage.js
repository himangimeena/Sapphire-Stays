/**
 * Room Image Mapping Utility for Sapphire Stays India
 * Provides curated, luxury travel photographs from Unsplash matching specific
 * property locations and room tiers so reviewers see unique visuals.
 */

export function getRoomImage(rt) {
  if (!rt) return "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";

  // Normalize inputs
  const name = (rt.name || "").toLowerCase();
  const tier = (rt.tier || "").toLowerCase();
  const branchCity = (rt.branch_city || rt.branch_name || "").toLowerCase();

  // 1. Udaipur Sanctuary (Lake Pichola)
  if (branchCity.includes("udaipur")) {
    if (name.includes("maharaja") || tier.includes("signature")) {
      return "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"; // Royal Maharaja
    } else if (name.includes("courtyard") || tier.includes("popular")) {
      return "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80"; // Palace Courtyard
    } else {
      return "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"; // Lakeview Standard
    }
  }

  // 2. Mumbai Heritage (Colaba)
  if (branchCity.includes("mumbai") || branchCity.includes("colaba")) {
    if (name.includes("presidential") || tier.includes("signature")) {
      return "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"; // Presidential Penthouse
    } else if (name.includes("gateway") || tier.includes("popular")) {
      return "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"; // Gateway Suite
    } else {
      return "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"; // Skyline room
    }
  }

  // 3. Goa Beach Resort
  if (branchCity.includes("goa")) {
    if (name.includes("ocean") || tier.includes("signature")) {
      return "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"; // Ocean Villa
    } else if (name.includes("pool") || tier.includes("popular")) {
      return "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"; // Pool Villa
    } else {
      return "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"; // Beachfront Villa
    }
  }

  // 4. Delhi Lutyens Sanctuary
  if (branchCity.includes("delhi")) {
    if (name.includes("ambassador") || tier.includes("signature")) {
      return "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80"; // Ambassador Penthouse
    } else if (name.includes("heritage") || tier.includes("popular")) {
      return "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"; // Heritage Suite
    } else {
      return "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80"; // Diplomatic Room
    }
  }

  // 5. Jaipur Fort Sanctuary
  if (branchCity.includes("jaipur")) {
    if (name.includes("solitaire") || tier.includes("signature")) {
      return "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80"; // Solitaire Pavilion
    } else if (name.includes("rajputana") || tier.includes("popular")) {
      return "https://images.unsplash.com/photo-1611891487122-207579d67d98?auto=format&fit=crop&w=800&q=80"; // Rajputana Fort Suite
    } else {
      return "https://images.unsplash.com/photo-1592229505726-ca121723b8ef?auto=format&fit=crop&w=800&q=80"; // Hillview Haven
    }
  }

  // 6. Munnar Highlands Sanctuary
  if (branchCity.includes("munnar")) {
    if (name.includes("mountain") || tier.includes("signature")) {
      return "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80"; // Mountain Villa
    } else if (name.includes("cloud") || tier.includes("popular")) {
      return "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80"; // Cloud Mist Ayurvedic
    } else {
      return "https://images.unsplash.com/photo-1549294413-26f195afcbce?auto=format&fit=crop&w=800&q=80"; // Highland Tea Estate
    }
  }

  // General fallbacks based on keywords if no city matched
  if (name.includes("maharaja") || name.includes("presidential") || name.includes("signature") || name.includes("imperial") || name.includes("ambassador")) {
    return "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";
  }
  if (name.includes("suite") || name.includes("executive") || name.includes("popular")) {
    return "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80";
  }

  return "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80";
}
