module.exports = {

	mimeTypes 			: {
		png		: 'image/png',
		gif		: 'image/gif',
		jpeg	: 'image/jpeg',
		jpg		: 'image/jpeg',
		bmp		: 'image/bmp',
		webp	: 'image/webp',
		svg		: 'image/svg+xml',

		xls		: 'application/vnd.ms-excel',
		xlsx	: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		csv		: 'text/csv; charset=utf-8',
		txt		: 'text/plain; charset=utf-8',
		json	: 'application/json; charset=utf-8',

		mp4		: 'video/mp4',
		avi		: 'video/avi',
		mov		: 'video/quicktime',
		ogg		: 'video/ogg',
		wav		: 'audio/wav',
		mp3		: 'audio/mp3',

		zip		: 'application/zip',
	},

	recaptchaPublicKey	: '',

	
	timezones						: {
		'-12.0'	: '(GMT -12:00) Eniwetok, Kwajalein',
		'-11.0'	: '(GMT -11:00) Midway Island, Samoa',
		'-10.0'	: '(GMT -10:00) Hawaii',
		'-9.0'	: '(GMT -9:00) Alaska',
		'-8.0'	: '(GMT -8:00) Pacific Time (US & Canada)',
		'-7.0'	: '(GMT -7:00) Mountain Time (US & Canada)',
		'-6.0'	: '(GMT -6:00) Central Time (US & Canada), Mexico City',
		'-5.0'	: '(GMT -5:00) Eastern Time (US & Canada), Bogota, Lima',
		'-4.0'	: '(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz',
		'-3.5'	: '(GMT -3:30) Newfoundland',
		'-3.0'	: '(GMT -3:00) Brazil, Buenos Aires, Georgetown',
		'-2.0'	: '(GMT -2:00) Mid-Atlantic',
		'-1.0'	: '(GMT -1:00 hour) Azores, Cape Verde Islands',
		'0.0'	: '(GMT) Western Europe Time, London, Lisbon, Casablanca',
		'1.0'	: '(GMT +1:00 hour) Brussels, Copenhagen, Madrid, Paris',
		'2.0'	: '(GMT +2:00) Kaliningrad, South Africa',
		'3.0'	: '(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg',
		'3.5'	: '(GMT +3:30) Tehran',
		'4.0'	: '(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi',
		'4.5'	: '(GMT +4:30) Kabul',
		'5.0'	: '(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent',
		'5.5'	: '(GMT +5:30) Bombay, Calcutta, Madras, New Delhi',
		'5.75'	: '(GMT +5:45) Kathmandu',
		'6.0'	: '(GMT +6:00) Almaty, Dhaka, Colombo',
		'7.0'	: '(GMT +7:00) Bangkok, Hanoi, Jakarta',
		'8.0'	: '(GMT +8:00) Beijing, Perth, Singapore, Hong Kong',
		'9.0'	: '(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk',
		'9.5'	: '(GMT +9:30) Adelaide, Darwin',
		'10.0'	: '(GMT +10:00) Eastern Australia, Guam, Vladivostok',
		'11.0'	: '(GMT +11:00) Magadan, Solomon Islands, New Caledonia',
		'12.0'	: '(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka'
	},

	// ISO Alpha-2 Code
	countries						: {
		'AF' : 'Afghanistan', 'AL' : 'Albania', 'DZ' : 'Algeria', 'AS' : 'American Samoa', 'AD' : 'Andorra', 'AO' : 'Angola', 'AG' : 'Antigua and Barbuda', 'AR' : 'Argentina', 'AM' : 'Armenia', 'AW' : 'Aruba', 'AU' : 'Australia', 'AT' : 'Austria', 'AZ' : 'Azerbaijan', 'BH' : 'Bahrain', 'BS' : 'Bahamas', 'BD' : 'Bangladesh', 'BB' : 'Barbados', 'BY' : 'Belarus', 'BE' : 'Belgium', 'BZ' : 'Belize', 'BJ' : 'Benin', 'BM' : 'Bermuda', 'BT' : 'Bhutan', 'BO' : 'Bolivia, Plurinational State of', 'BA' : 'Bosnia and Herzegovina', 'BW' : 'Botswana', 'BR' : 'Brazil', 'BN' : 'Brunei Darussalam', 'BG' : 'Bulgaria', 'BF' : 'Burkina Faso', 'BI' : 'Burundi', 'KH' : 'Cambodia', 'CM' : 'Cameroon', 'CA' : 'Canada', 'CV' : 'Cape Verde', 'CF' : 'Central African Republic', 'TD' : 'Chad', 'CL' : 'Chile', 'CN' : 'China', 'CO' : 'Colombia', 'KM' : 'Comoros', 'CG' : 'Congo', 'CD' : 'Congo, the Democratic Republic of the', 'CK' : 'Cook Islands', 'CR' : 'Costa Rica', 'CI' : 'Côte d\'Ivoire', 'HR' : 'Croatia', 'CU' : 'Cuba', 'CY' : 'Cyprus', 'CZ' : 'Czech Republic', 'DK' : 'Denmark', 'DJ' : 'Djibouti', 'DM' : 'Dominica', 'DO' : 'Dominican Republic', 'EC' : 'Ecuador', 'EG' : 'Egypt', 'SV' : 'El Salvador', 'GQ' : 'Equatorial Guinea', 'ER' : 'Eritrea', 'EE' : 'Estonia', 'ET' : 'Ethiopia', 'FJ' : 'Fiji', 'FI' : 'Finland', 'FR' : 'France', 'GA' : 'Gabon', 'GM' : 'Gambia', 'GE' : 'Georgia', 'DE' : 'Germany', 'GH' : 'Ghana', 'GR' : 'Greece', 'GL' : 'Greenland', 'GD' : 'Grenada', 'GT' : 'Guatemala', 'GN' : 'Guinea', 'GW' : 'Guinea-Bissau', 'GY' : 'Guyana', 'HT' : 'Haiti', 'VA' : 'Vatican City', 'HN' : 'Honduras', 'HK' : 'Hong Kong', 'HU' : 'Hungary', 'IS' : 'Iceland', 'IN' : 'India', 'ID' : 'Indonesia', 'IR' : 'Iran, Islamic Republic of', 'IQ' : 'Iraq', 'IE' : 'Ireland', 'IL' : 'Israel', 'IT' : 'Italy', 'JM' : 'Jamaica', 'JP' : 'Japan', 'JO' : 'Jordan', 'KZ' : 'Kazakhstan', 'KE' : 'Kenya', 'KI' : 'Kiribati', 'KP' : 'Korea, Democratic People\'s Republic of', 'KR' : 'Korea, Republic of', 'KW' : 'Kuwait', 'KG' : 'Kyrgyzstan', 'LA' : 'Lao People\'s Democratic Republic', 'LV' : 'Latvia', 'LB' : 'Lebanon', 'LS' : 'Lesotho', 'LR' : 'Liberia', 'LY' : 'Libya', 'LI' : 'Liechtenstein', 'LT' : 'Lithuania', 'LU' : 'Luxembourg', 'MO' : 'Macao', 'MK' : 'Macedonia, the Former Yugoslav Republic of', 'MG' : 'Madagascar', 'MW' : 'Malawi', 'MY' : 'Malaysia', 'MV' : 'Maldives', 'ML' : 'Mali', 'MT' : 'Malta', 'MH' : 'Marshall Islands', 'MR' : 'Mauritania', 'MU' : 'Mauritius', 'MX' : 'Mexico', 'FM' : 'Micronesia, Federated States of', 'MD' : 'Moldova, Republic of', 'MC' : 'Monaco', 'MN' : 'Mongolia', 'ME' : 'Montenegro', 'MA' : 'Morocco', 'MZ' : 'Mozambique', 'MM' : 'Myanmar', 'NA' : 'Namibia', 'NR' : 'Nauru', 'NP' : 'Nepal', 'NL' : 'Netherlands', 'NZ' : 'New Zealand', 'NI' : 'Nicaragua', 'NE' : 'Niger', 'NG' : 'Nigeria', 'NU' : 'Niue', 'NO' : 'Norway', 'OM' : 'Oman', 'PK' : 'Pakistan', 'PW' : 'Palau', 'PS' : 'Palestine, State of', 'PA' : 'Panama', 'PG' : 'Papua New Guinea', 'PY' : 'Paraguay', 'PE' : 'Peru', 'PH' : 'Philippines', 'PL' : 'Poland', 'PT' : 'Portugal', 'QA' : 'Qatar', 'RO' : 'Romania', 'RU' : 'Russian Federation', 'RW' : 'Rwanda', 'KN' : 'Saint Kitts and Nevis', 'LC' : 'Saint Lucia', 'VC' : 'Saint Vincent and the Grenadines', 'WS' : 'Samoa', 'SM' : 'San Marino', 'ST' : 'Sao Tome and Principe', 'SA' : 'Saudi Arabia', 'SN' : 'Senegal', 'RS' : 'Serbia', 'SC' : 'Seychelles', 'SL' : 'Sierra Leone', 'SG' : 'Singapore', 'SK' : 'Slovakia', 'SI' : 'Slovenia', 'SB' : 'Solomon Islands', 'SO' : 'Somalia', 'ZA' : 'South Africa', 'GS' : 'South Georgia and the South Sandwich Islands', 'SS' : 'South Sudan', 'ES' : 'Spain', 'LK' : 'Sri Lanka', 'SD' : 'Sudan', 'SR' : 'Suriname', 'SZ' : 'Swaziland', 'SE' : 'Sweden', 'CH' : 'Switzerland', 'SY' : 'Syrian Arab Republic', 'TW' : 'Taiwan, Province of China', 'TJ' : 'Tajikistan', 'TZ' : 'Tanzania, United Republic of', 'TH' : 'Thailand', 'TL' : 'Timor-Leste', 'TG' : 'Togo', 'TO' : 'Tonga', 'TT' : 'Trinidad and Tobago', 'TN' : 'Tunisia', 'TR' : 'Turkey', 'TM' : 'Turkmenistan', 'TV' : 'Tuvalu', 'UG' : 'Uganda', 'UA' : 'Ukraine', 'AE' : 'United Arab Emirates', 'GB' : 'United Kingdom', 'US' : 'United States', 'UY' : 'Uruguay', 'UZ' : 'Uzbekistan', 'VU' : 'Vanuatu', 'VE' : 'Venezuela, Bolivarian Republic of', 'VN' : 'Viet Nam', 'YE' : 'Yemen', 'ZM' : 'Zambia', 'ZW' : 'Zimbabwe'
	},

	statesProvinces					: {
		'US'		: {"AL" : "Alabama", "AK" : "Alaska", "AZ" : "Arizona", "AR" : "Arkansas", "CA" : "California", "CO" : "Colorado", "CT" : "Connecticut", "DE" : "Delaware", "FL" : "Florida", "GA" : "Georgia", "HI" : "Hawaii", "ID" : "Idaho", "IL" : "Illinois", "IN" : "Indiana", "IA" : "Iowa", "KS" : "Kansas", "KY" : "Kentucky", "LA" : "Louisiana", "ME" : "Maine", "MD" : "Maryland", "MA" : "Massachusetts", "MI" : "Michigan", "MN" : "Minnesota", "MS" : "Mississippi", "MO" : "Missouri", "MT" : "Montana", "NE" : "Nebraska", "NV" : "Nevada", "NH" : "New Hampshire", "NJ" : "New Jersey", "NM" : "New Mexico", "NY" : "New York", "NC" : "North Carolina", "ND" : "North Dakota", "OH" : "Ohio", "OK" : "Oklahoma", "OR" : "Oregon", "PA" : "Pennsylvania", "RI" : "Rhode Island", "SC" : "South Carolina", "SD" : "South Dakota", "TN" : "Tennessee", "TX" : "Texas", "UT" : "Utah", "VT" : "Vermont", "VA" : "Virginia", "WA" : "Washington", "WV" : "West Virginia", "WI" : "Wisconsin", "WY" : "Wyoming", "DC" : "District of Columbia", "AS" : "American Samoa", "GU" : "Guam", "MP" : "Northern Mariana Islands", "PR" : "Puerto Rico", "UM" : "United States Minor Outlying Islands", "VI" : "Virgin Islands, U.S."},
		'CA'		: { "AB": "Alberta", "BC": "British Columbia (Colombie-Britannique)", "MB": "Manitoba", "NB": "New Brunswick (Nouveau-Brunswick)", "NL": "Newfoundland and Labrador (Terre-Neuve)", "NS": "Nova Scotia (Nouvelle-Écosse)", "ON": "Ontario", "PE": "Prince Edward Island (Île-du-Prince-Édouard)", "QC": "Quebec (Québec)", "SK": "Saskatchewan", "NT": "Northwest Territories (Territoires du Nord-Ouest)", "NU": "Nunavut", "YT": "Yukon Territory (Teritoire du Yukon)"}
	},

	currencies						: {
		'aud'	: 'Australian Dollar',
		'brl'	: 'Brazilian Real',
		'cad'	: 'Canadian Dollar',
		'chf'	: 'Swiss Franc',
		'dkk'	: 'Danish Krone',
		'eur'	: 'Euro',
		'gbp'	: 'British Pound',
		'hkd'	: 'Hong Kong Dollar',
		'jpy'	: 'Japanese Yen',
		'mxn'	: 'Mexican Peso',
		'nok'	: 'Norwegian Krone',
		'nzd'	: 'New Zealand Dollar',
		'sek'	: 'Swedish Krona',
		'sgd'	: 'Singapore Dollar',
		'usd'	: 'US Dollar',
	},
};
