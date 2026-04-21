/** Brønnøysund Enhetsregisteret + hjelper for kommunenummer (Geonorge). */

export type BrregSearchParams = {
  /** Fire siffer — brukes til å slå opp kommunenummer hvis `kommuneNr` mangler. */
  postalCode?: string;
  /** Kommunenummer (4 siffer), f.eks. "4601". */
  kommuneNr?: string | null;
  /** Næringskode (f.eks. "47.112") — valgfritt filter. */
  industry?: string;
  size?: number;
  page?: number;
};

export type BrregCompany = {
  orgNr: string;
  name: string;
  industry: string | null;
  address: string | null;
  postalCode: string | null;
  municipality: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  employees: number;
};

type BrregAdresse = {
  adresse?: string[];
  postnummer?: string;
  kommune?: string;
  kommunenummer?: string;
};

type BrregEnhet = {
  organisasjonsnummer?: string;
  navn?: string;
  naeringskode1?: { beskrivelse?: string };
  organisasjonsform?: { kode?: string; beskrivelse?: string };
  forretningsadresse?: BrregAdresse;
  postadresse?: BrregAdresse;
  epostadresse?: string;
  telefon?: string;
  mobil?: string;
  hjemmeside?: string;
  antallAnsatte?: number;
  harRegistrertAntallAnsatte?: boolean;
  konkurs?: boolean;
  slettedato?: string;
  underTvangsavviklingEllerTvangsopplosning?: boolean;
};

type BrregEnheterResponse = {
  _embedded?: { enheter?: BrregEnhet[] };
};

function pickAddress(e: BrregEnhet): BrregAdresse | undefined {
  return e.forretningsadresse ?? e.postadresse;
}

/** Org.forms we skip (foreninger, samvirke, kommuner, etc.). */
const EXCLUDED_ORGANISASJONSFORM_KODER = new Set([
  "FLI",
  "SA",
  "BA",
  "STI",
  "KF",
  "KBO", // konkursbo
]);

function enhetHasStreetAddress(e: BrregEnhet): boolean {
  const addr = pickAddress(e);
  const lines = addr?.adresse;
  return (
    Array.isArray(lines) &&
    lines.some((l) => typeof l === "string" && l.trim().length > 0)
  );
}

function enhetHasPositiveEmployees(e: BrregEnhet): boolean {
  return (
    e.harRegistrertAntallAnsatte === true &&
    typeof e.antallAnsatte === "number" &&
    e.antallAnsatte > 0
  );
}

function passesBrregSponsorFilters(e: BrregEnhet): boolean {
  const kode = e.organisasjonsform?.kode?.trim().toUpperCase();
  if (kode && EXCLUDED_ORGANISASJONSFORM_KODER.has(kode)) {
    return false;
  }
  if (e.konkurs === true) return false;
  if (e.slettedato != null && String(e.slettedato).trim().length > 0) {
    return false;
  }
  if (e.underTvangsavviklingEllerTvangsopplosning === true) {
    return false;
  }
  if (!enhetHasStreetAddress(e)) return false;
  if (!enhetHasPositiveEmployees(e)) return false;
  return true;
}

function mapEnhet(e: BrregEnhet): BrregCompany | null {
  const orgNr = e.organisasjonsnummer?.replace(/\D/g, "") ?? "";
  if (orgNr.length !== 9) return null;
  const addr = pickAddress(e);
  const lines = addr?.adresse;
  const address =
    Array.isArray(lines) && lines.length > 0 ? lines.join(", ") : null;
  const employees =
    e.harRegistrertAntallAnsatte === true &&
    typeof e.antallAnsatte === "number"
      ? e.antallAnsatte
      : 0;
  return {
    orgNr,
    name: (e.navn ?? "").trim() || orgNr,
    industry: e.naeringskode1?.beskrivelse?.trim() ?? null,
    address,
    postalCode: addr?.postnummer?.trim() ?? null,
    municipality: addr?.kommune?.trim() ?? null,
    email: e.epostadresse?.trim() || null,
    phone: (e.telefon ?? e.mobil)?.trim() || null,
    website: e.hjemmeside?.trim() || null,
    employees,
  };
}

/**
 * Slår opp kommunenummer fra postnummer via Geonorge (adressesøk).
 */
export async function getKommuneNrFromPostalCode(
  postalCode: string
): Promise<string | null> {
  const pc = postalCode.replace(/\D/g, "").slice(0, 4);
  if (pc.length !== 4) return null;
  const url = `https://ws.geonorge.no/adresser/v1/sok?postnummer=${encodeURIComponent(pc)}&treffPerSide=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    adresser?: { kommunenummer?: string }[];
  };
  const knr = data.adresser?.[0]?.kommunenummer?.trim();
  return knr && /^\d{4}$/.test(knr) ? knr : null;
}

/**
 * Søk etter enheter i valgt kommune (og valgfritt næringskode).
 */
export async function searchBrreg(
  params: BrregSearchParams
): Promise<{ companies: BrregCompany[]; rawEnheter: BrregEnhet[] }> {
  const size = params.size ?? 20;
  const page = params.page ?? 0;
  const kommuneNr =
    params.kommuneNr?.trim() ||
    (params.postalCode
      ? await getKommuneNrFromPostalCode(params.postalCode)
      : null);

  if (!kommuneNr) {
    return { companies: [], rawEnheter: [] };
  }

  const url = new URL("https://data.brreg.no/enhetsregisteret/api/enheter");
  url.searchParams.set("kommunenummer", kommuneNr);
  url.searchParams.set("size", String(size));
  url.searchParams.set("page", String(page));
  const ind = params.industry?.trim();
  if (ind) {
    url.searchParams.set("naeringskode", ind);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Brønnøysund API feilet (${res.status})`);
  }

  const data = (await res.json()) as BrregEnheterResponse;
  const raw = data._embedded?.enheter ?? [];
  const companies = raw
    .map(mapEnhet)
    .filter((c): c is BrregCompany => c != null);

  return { companies, rawEnheter: raw };
}

const SPONSOR_LIST_LIMIT = 20;

export type BrregSponsorFilterResult = {
  companies: BrregCompany[];
  /** Rows returned from Brønnøysund for this page (typically up to 50). */
  totalFetched: number;
  /** Rows left after business rules (address, employees, org.form, etc.). */
  totalAfterFilter: number;
  /** Rows returned to the client (capped). */
  displayed: number;
};

/**
 * Filters Brønnøysund rows for sponsor matching, sorts by quality, returns top N.
 * Sort: 1) has e-mail, 2) employee count desc, 3) name A–Å.
 */
export function filterSortAndLimitSponsorCompanies(
  rawEnheter: BrregEnhet[],
  limit: number = SPONSOR_LIST_LIMIT
): BrregSponsorFilterResult {
  const totalFetched = rawEnheter.length;
  const filteredRaw = rawEnheter.filter(passesBrregSponsorFilters);
  const mapped = filteredRaw
    .map(mapEnhet)
    .filter((c): c is BrregCompany => c != null);

  mapped.sort((a, b) => {
    const ae = a.email != null && a.email.trim().length > 0 ? 1 : 0;
    const be = b.email != null && b.email.trim().length > 0 ? 1 : 0;
    if (be !== ae) return be - ae;
    if (b.employees !== a.employees) return b.employees - a.employees;
    return a.name.localeCompare(b.name, "nb", { sensitivity: "base" });
  });

  const companies = mapped.slice(0, limit);
  return {
    companies,
    totalFetched,
    totalAfterFilter: mapped.length,
    displayed: companies.length,
  };
}
