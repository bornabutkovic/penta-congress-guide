export type QuoteStatus = "pending" | "approved" | "sent" | "rejected";

export const statusLabels: Record<QuoteStatus, string> = {
  pending: "Na čekanju",
  approved: "Odobreno",
  sent: "Poslano",
  rejected: "Odbijeno",
};

export interface QuoteSection {
  flight: { from: string; to: string; airline: string; dates: string; price: number };
  hotel: { name: string; nights: number; room: string; price: number };
  transfer: { type: string; price: number };
  fee: { name: string; price: number };
}

export interface Quote {
  id: string;
  congress: string;
  shortName: string;
  city: string;
  country: string;
  dates: string;
  status: QuoteStatus;
  total: number;
  sections: QuoteSection;
}

export const quotes: Quote[] = [
  {
    id: "esc-2026",
    congress: "ESC Congress 2026",
    shortName: "ESC 2026",
    city: "Amsterdam",
    country: "Nizozemska",
    dates: "28.08. – 01.09.2026.",
    status: "pending",
    total: 2480,
    sections: {
      flight: { from: "Zagreb", to: "Amsterdam", airline: "KLM", dates: "27.08. – 02.09.", price: 420 },
      hotel: { name: "NH Collection Barbizon", nights: 6, room: "Standard Queen", price: 1380 },
      transfer: { type: "Privatni transfer (povratni)", price: 120 },
      fee: { name: "Kotizacija ESC 2026", price: 560 },
    },
  },
  {
    id: "easd-2026",
    congress: "EASD Annual Meeting 2026",
    shortName: "EASD 2026",
    city: "Beč",
    country: "Austrija",
    dates: "14.09. – 18.09.2026.",
    status: "approved",
    total: 1890,
    sections: {
      flight: { from: "Zagreb", to: "Beč", airline: "Austrian", dates: "13.09. – 19.09.", price: 280 },
      hotel: { name: "Hilton Vienna Park", nights: 6, room: "Deluxe King", price: 1180 },
      transfer: { type: "Shuttle (povratni)", price: 60 },
      fee: { name: "Kotizacija EASD", price: 370 },
    },
  },
  {
    id: "ers-2026",
    congress: "ERS International Congress",
    shortName: "ERS 2026",
    city: "Milano",
    country: "Italija",
    dates: "05.10. – 09.10.2026.",
    status: "sent",
    total: 2120,
    sections: {
      flight: { from: "Zagreb", to: "Milano Linate", airline: "Croatia Airlines", dates: "04.10. – 10.10.", price: 340 },
      hotel: { name: "Hotel Michelangelo", nights: 6, room: "Executive", price: 1260 },
      transfer: { type: "Privatni transfer", price: 95 },
      fee: { name: "Kotizacija ERS", price: 425 },
    },
  },
  {
    id: "eular-2026",
    congress: "EULAR 2026",
    shortName: "EULAR 2026",
    city: "Barcelona",
    country: "Španjolska",
    dates: "10.06. – 13.06.2026.",
    status: "pending",
    total: 2310,
    sections: {
      flight: { from: "Zagreb", to: "Barcelona", airline: "Lufthansa", dates: "09.06. – 14.06.", price: 460 },
      hotel: { name: "H10 Marina Barcelona", nights: 5, room: "Standard", price: 1290 },
      transfer: { type: "Aerodromski transfer", price: 80 },
      fee: { name: "Kotizacija EULAR", price: 480 },
    },
  },
  {
    id: "eha-2026",
    congress: "EHA Hybrid Congress",
    shortName: "EHA 2026",
    city: "Madrid",
    country: "Španjolska",
    dates: "12.06. – 15.06.2026.",
    status: "rejected",
    total: 1740,
    sections: {
      flight: { from: "Zagreb", to: "Madrid", airline: "Iberia", dates: "11.06. – 16.06.", price: 390 },
      hotel: { name: "Meliá Castilla", nights: 5, room: "Standard", price: 880 },
      transfer: { type: "Taxi (povratni)", price: 70 },
      fee: { name: "Kotizacija EHA", price: 400 },
    },
  },
  {
    id: "ueg-2026",
    congress: "UEG Week 2026",
    shortName: "UEG 2026",
    city: "Berlin",
    country: "Njemačka",
    dates: "11.10. – 14.10.2026.",
    status: "approved",
    total: 1980,
    sections: {
      flight: { from: "Zagreb", to: "Berlin BER", airline: "Lufthansa", dates: "10.10. – 15.10.", price: 320 },
      hotel: { name: "Steigenberger Berlin", nights: 5, room: "Superior", price: 1180 },
      transfer: { type: "Privatni transfer", price: 90 },
      fee: { name: "Kotizacija UEG", price: 390 },
    },
  },
];

export const formatEur = (n: number) =>
  new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
