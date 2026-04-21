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
  forretningsadresse?: BrregAdresse;
  postadresse?: BrregAdresse;
  epostadresse?: string;
  telefon?: string;
  mobil?: string;
  hjemmeside?: string;
  antallAnsatte?: number;
  harRegistrertAntallAnsatte?: boolean;
};

type BrregEnheterResponse = {
  _embedded?: { enheter?: BrregEnhet[] };
};

function pickAddress(e: BrregEnhet): BrregAdresse | undefined {
  return e.forretningsadresse ?? e.postadresse;
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
