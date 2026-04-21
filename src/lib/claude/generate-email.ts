import Anthropic from "@anthropic-ai/sdk";

export type SponsorEmailParams = {
  companyName: string;
  contactName?: string | null;
  industry: string | null | undefined;
  lagNavn: string;
  kampanjeTittel: string;
  /** Beløp som vises i e-posten, f.eks. "25 000" */
  beloep: string;
  eksponering: string;
  /** Kampanjetype (lesbar tekst). */
  type: string;
};

const MODEL = "claude-sonnet-4-20250514";

export async function generateSponsorEmail(
  params: SponsorEmailParams
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY er ikke konfigurert.");
  }

  const mottaker = params.contactName?.trim() || "daglig leder";
  const bransje = params.industry?.trim() || "næringsvirksomhet";

  const prompt = `
Skriv en kort, personlig sponsore-post PÅ NORSK
til ${mottaker} hos ${params.companyName}.

De driver med: ${bransje}
Vi er: ${params.lagNavn}
Vi søker sponsor til: ${params.kampanjeTittel}
Kampanjetype: ${params.type}
Beløp vi søker: kr ${params.beloep}
Hva sponsor får: ${params.eksponering}

Krav:
- Maks 100 ord
- Varm og lokal tone
- Ikke corporate språk
- Avslutt med tydelig oppfordring om å svare på denne e-posten eller ta kontakt (ingen URL eller lenketekst i e-posten)
- IKKE inkluder lenker, nettsideadresser eller klikkbare URL-er i teksten
`.trim();

  const anthropic = new Anthropic({ apiKey });
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block?.type === "text") {
    return block.text.trim();
  }
  return "";
}
