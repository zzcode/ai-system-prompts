export const directory = 'https://www.careeronestop.org/LocalHelp/UnemploymentBenefits/Find-Unemployment-Benefits.aspx';
export const federalGuide = 'https://www.usa.gov/unemployment-benefits';
export const dolSnapshot = 'https://oui.doleta.gov/unemploy/statelaws.asp';
export const checkedOn = '2026-11-23';

// Publish amounts only where a state agency source supports the figure.
const checked = {
  CA: [450, 26, 'https://edd.ca.gov/en/unemployment/Calculator/', 'https://edd.ca.gov/en/about_edd/news_releases_and_announcements/federal-workers-government-shutdown/', 'EDD publishes a weekly benefit range of $40–$450.'],
  MA: [1154, 30, 'https://www.mass.gov/info-details/how-your-unemployment-benefits-are-determined', null, 'Base weekly maximum as of October 4, 2026; dependency allowances can apply.'],
  MO: [320, 20, 'https://labor.mo.gov/faqs/knowledge-base/how-are-my-benefits-figured'],
  NC: [350, 12, 'https://www.des.nc.gov/apply-unemployment', null, 'Current duration listed by the agency at review; the state unemployment rate can change the limit.'],
  NJ: [905, 26, 'https://www.nj.gov/labor/myunemployment/before/about/calculator/', null, 'State agency lists this weekly cap for 2026.'],
  NY: [869, null, 'https://dol.ny.gov/mbr', null, 'See the state agency for the limit that applies to your claim and for claim duration.'],
  SC: [350, 20, 'https://dew.sc.gov/individuals/how-unemployment-insurance-works/weekly-benefit-amount'],
  WA: [1208, null, 'https://esd.wa.gov/about-us/news-release/2026/new-average-annual-wage-estimates-adjust-unemployment-insurance-and-paid-leave-benefits', null, 'Weekly cap applies to new claims opened on or after July 5, 2026. Confirm duration with ESD.'],
};

export const states = `AL Alabama
AK Alaska
AZ Arizona
AR Arkansas
CA California
CO Colorado
CT Connecticut
DE Delaware
DC District of Columbia
FL Florida
GA Georgia
HI Hawaii
ID Idaho
IL Illinois
IN Indiana
IA Iowa
KS Kansas
KY Kentucky
LA Louisiana
ME Maine
MD Maryland
MA Massachusetts
MI Michigan
MN Minnesota
MS Mississippi
MO Missouri
MT Montana
NE Nebraska
NV Nevada
NH New Hampshire
NJ New Jersey
NM New Mexico
NY New York
NC North Carolina
ND North Dakota
OH Ohio
OK Oklahoma
OR Oregon
PA Pennsylvania
RI Rhode Island
SC South Carolina
SD South Dakota
TN Tennessee
TX Texas
UT Utah
VT Vermont
VA Virginia
WA Washington
WV West Virginia
WI Wisconsin
WY Wyoming`.split('\n').map((line) => {
  const code = line.slice(0, 2);
  const name = line.slice(3);
  const [weekly, weeks, source, durationSource, note] = checked[code] ?? [];
  return { code, name, id: code.toLowerCase(), weekly, weeks, source, durationSource, note };
});
