/** Visningsnavn for lag-segment (lagres som kode i DB). */
export function segmentLabel(segment: string | null | undefined): string {
  if (segment == null || segment === "") return "—";
  const map: Record<string, string> = {
    idrettslag: "Idrettslag",
    golfklubb: "Golfklubb",
    "17mai": "17. mai-komité",
    barnehage: "Barnehage",
    annet: "Annet",
  };
  return map[segment] ?? segment;
}

export function campaignStatusNb(s: string): string {
  switch (s) {
    case "draft":
      return "Utkast";
    case "active":
      return "Aktiv";
    case "completed":
      return "Avsluttet";
    case "cancelled":
      return "Avbrutt";
    default:
      return s;
  }
}

export function orderStatusNb(s: string): string {
  switch (s) {
    case "draft":
      return "Ny";
    case "pending":
      return "Behandle";
    case "paid":
      return "Betalt";
    case "fulfilled":
      return "Levert";
    case "cancelled":
      return "Avbrutt";
    default:
      return s;
  }
}

export function orderStatusBadgeClass(s: string): string {
  switch (s) {
    case "draft":
      return "border-amber-300/80 bg-amber-50 text-amber-950";
    case "pending":
      return "border-[var(--brand-gold)]/50 bg-[var(--brand-gold)]/15 text-[var(--brand-pine)]";
    case "paid":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "fulfilled":
      return "border-neutral-200 bg-neutral-100 text-neutral-800";
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-900";
    default:
      return "border-neutral-200 bg-neutral-50";
  }
}

export function spleisStatusNb(s: string): string {
  switch (s) {
    case "draft":
      return "Utkast";
    case "active":
      return "Aktiv";
    case "funded":
      return "Finansiert";
    case "delivered":
      return "Levert";
    default:
      return s;
  }
}

export function emailStatusNb(s: string): string {
  switch (s) {
    case "draft":
      return "Utkast";
    case "sent":
      return "Sendt";
    case "opened":
      return "Åpnet";
    case "failed":
      return "Feilet";
    default:
      return s;
  }
}

/** Kampanjetype fra DB (tekstkode eller fritekst). */
export function campaignTypeLabel(type: string | null | undefined): string {
  if (type == null || type === "") return "—";
  const map: Record<string, string> = {
    arrangement: "Arrangement",
    utstyr: "Utstyr",
    reise: "Reise",
    annet: "Annet",
  };
  return map[type] ?? type;
}

export function spleisTypeNb(t: string): string {
  const map: Record<string, string> = {
    badstue: "Badstue",
    gapahuk: "Gapahuk",
    toalettbygg: "Toalettbygg",
    starterbod: "Starterbod",
    shelter: "Shelter",
    utepeis: "Utepeis",
    led_lys: "LED-lys",
    storskjerm: "Storskjerm",
    minibuss: "Minibuss",
    solcelle: "Solcelle",
    kunstgress: "Kunstgress",
    annet: "Annet",
  };
  return map[t] ?? t;
}
