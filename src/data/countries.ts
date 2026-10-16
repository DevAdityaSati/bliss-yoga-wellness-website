export const WORLD_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "South Korea", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka",
  "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste",
  "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export interface TimeZoneOption {
  value: string;
  label: string;
  offset: string;
}

export const COMMON_TIMEZONES: TimeZoneOption[] = [
  { value: "Pacific/Honolulu", label: "Honolulu (HST)", offset: "UTC-10:00" },
  { value: "America/Anchorage", label: "Anchorage (AKDT)", offset: "UTC-08:00" },
  { value: "America/Los_Angeles", label: "Los Angeles / Vancouver (PDT)", offset: "UTC-07:00" },
  { value: "America/Denver", label: "Denver / Edmonton (MDT)", offset: "UTC-06:00" },
  { value: "America/Chicago", label: "Chicago / Mexico City (CDT)", offset: "UTC-05:00" },
  { value: "America/New_York", label: "New York / Toronto (EDT)", offset: "UTC-04:00" },
  { value: "America/Sao_Paulo", label: "São Paulo / Buenos Aires (BRT)", offset: "UTC-03:00" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)", offset: "UTC+00:00" },
  { value: "Europe/London", label: "London / Dublin (BST)", offset: "UTC+01:00" },
  { value: "Europe/Paris", label: "Paris / Berlin / Rome (CEST)", offset: "UTC+02:00" },
  { value: "Europe/Athens", label: "Athens / Helsinki / Cairo (EEST)", offset: "UTC+03:00" },
  { value: "Asia/Dubai", label: "Dubai / Muscat (GST)", offset: "UTC+04:00" },
  { value: "Asia/Kolkata", label: "Mumbai / New Delhi (IST)", offset: "UTC+05:30" },
  { value: "Asia/Bangkok", label: "Bangkok / Jakarta (ICT)", offset: "UTC+07:00" },
  { value: "Asia/Singapore", label: "Singapore / Hong Kong (SGT)", offset: "UTC+08:00" },
  { value: "Asia/Tokyo", label: "Tokyo / Seoul (JST)", offset: "UTC+09:00" },
  { value: "Australia/Sydney", label: "Sydney / Melbourne (AEST)", offset: "UTC+10:00" },
  { value: "Pacific/Auckland", label: "Auckland / Fiji (NZST)", offset: "UTC+12:00" },
];
