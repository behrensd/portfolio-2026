/**
 * Legal Content Data
 *
 * Contains all legal text for Impressum, Datenschutz, etc.
 * Separated from components for maintainability.
 */

export interface LegalSection {
    title: string;
    content: string | string[];
    link?: {
        text: string;
        url: string;
    };
}

export const legalSections: LegalSection[] = [
    {
        title: 'Impressum',
        content: [
            'Dominik Behrens',
            'BAI Solutions',
            'Manshardtstraße 13a',
            '22119 Hamburg',
            'E-Mail: info@behrens-ai.de'
        ]
    },
    {
        title: 'Datenschutzerklärung',
        content: [
            '1. VERANTWORTLICHER',
            'Dominik Behrens, BAI Solutions',
            'Manshardtstraße 13a, 22119 Hamburg',
            'E-Mail: info@behrens-ai.de',
            '',
            '2. DATENERFASSUNG',
            'Diese Website erhebt keine Daten direkt. Es werden keine Cookies, Tracking-Skripte oder Analytics-Tools verwendet.',
            '',
            '3. EXTERNE DIENSTE',
            'Die Website nutzt folgende externe Dienste:',
            '',
            '3.1 Vercel Blob Storage',
            'Zum Hosten von Bildern und Videos. Dabei können IP-Adressen erfasst werden.',
            'Datenschutz: https://vercel.com/legal/privacy-policy',
            'Rechtsgrundlage: Art. 6(1)(b) DSGVO (Vertragserfüllung)',
            '',
            '3.2 Spline 3D',
            'Für 3D-Szenen auf der Startseite (nur Desktop).',
            'Datenschutz: https://spline.design/privacy',
            'Rechtsgrundlage: Art. 6(1)(b) DSGVO (Vertragserfüllung)',
            '',
            '3.3 Externe Links',
            'Links zu Instagram übermitteln den Referrer an die jeweilige Plattform.',
            '',
            '4. IHRE RECHTE',
            'Sie haben gemäß DSGVO folgende Rechte:',
            '- Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17)',
            '- Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20), Widerspruch (Art. 21)',
            '',
            'Kontakt: info@behrens-ai.de',
            '',
            '5. DATENSICHERHEIT',
            'Wir treffen angemessene Sicherheitsmaßnahmen zum Schutz Ihrer Daten.',
            '',
            '6. INTERNATIONALE ÜBERTRAGUNGEN',
            'Vercel und Spline sind in den USA ansässig. Datenübertragung erfolgt auf Basis von Standard Contractual Clauses (SCC).',
            '',
            '7. BESCHWERDERECHT',
            'Sie können Beschwerden einreichen bei:',
            'Der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit',
            'https://datenschutz-hamburg.de'
        ]
    },
    {
        title: 'Urheberrecht',
        content: `© ${new Date().getFullYear()} Dominik Behrens. Alle Rechte vorbehalten. Design, Code und Inhalte erstellt von Dominik Behrens.`
    },
    {
        title: 'Haftung für Inhalte',
        content: 'Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.'
    },
    {
        title: 'Haftung für Links',
        content: 'Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.'
    },
    {
        title: 'EU-Streitschlichtung',
        content: 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:',
        link: {
            text: 'https://ec.europa.eu/consumers/odr/',
            url: 'https://ec.europa.eu/consumers/odr/'
        }
    },
    {
        title: 'Verantwortlich für den Inhalt',
        content: [
            'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:',
            'Dominik Behrens',
            'Anschrift wie oben'
        ]
    }
];
