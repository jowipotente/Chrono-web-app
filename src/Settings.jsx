import React, { useState } from 'react';
import ChronoSidebar from './ChronoSidebar';

function Settings() {
  // Get user from sessionStorage
  const storedUser = sessionStorage.getItem('user');
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  // Helper to split country code and number from stored mobile
  const splitCountryCode = (mobile) => {
    const match = mobile.match(/^(\+\d{1,3})(.*)$/);
    if (match) {
      return { countryCode: match[1], number: match[2] };
    }
    return { countryCode: '+1', number: mobile }; // default country code
  };

  const initialMobile = parsedUser && parsedUser.mobile ? parsedUser.mobile : '';
  const { countryCode: initialCountryCode, number: initialMobileNumber } = splitCountryCode(initialMobile);

  const [userInfo, setUserInfo] = useState({
    name: parsedUser ? parsedUser.username : '',
    email: parsedUser ? parsedUser.email : '',
    mobile: initialMobileNumber,
    location: parsedUser && parsedUser.location ? parsedUser.location : ''
  });

  // Temporary state for edits
  const [tempUserInfo, setTempUserInfo] = useState({
    name: parsedUser ? parsedUser.username : '',
    email: parsedUser ? parsedUser.email : '',
    mobile: initialMobileNumber,
    location: parsedUser && parsedUser.location ? parsedUser.location : ''
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState(initialCountryCode);
  const [tempSelectedCountryCode, setTempSelectedCountryCode] = useState(initialCountryCode);
  
  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    mobile: false,
    location: false
  });
  
  const [savedMessage, setSavedMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Mapping of local mobile prefixes to country codes (example subset)
  const localPrefixToCountryCode = {
    '1': '+1',    // US, Canada
    '7': '+7',    // Russia, Kazakhstan
    '20': '+20',  // Egypt
    '27': '+27',  // South Africa
    '30': '+30',  // Greece
    '31': '+31',  // Netherlands
    '32': '+32',  // Belgium
    '33': '+33',  // France
    '34': '+34',  // Spain
    '36': '+36',  // Hungary
    '39': '+39',  // Italy
    '40': '+40',  // Romania
    '41': '+41',  // Switzerland
    '43': '+43',  // Austria
    '44': '+44',  // United Kingdom
    '45': '+45',  // Denmark
    '46': '+46',  // Sweden
    '47': '+47',  // Norway
    '48': '+48',  // Poland
    '49': '+49',  // Germany
    // Add more as needed
  };

  // Function to detect country code from local mobile prefix
  const detectCountryCodeFromMobile = (mobile) => {
    // Remove non-digit characters
    let digits = mobile.replace(/\D/g, '');
    // Remove leading '0' if present (common local prefix)
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    // Check prefixes from longest to shortest
    const prefixes = Object.keys(localPrefixToCountryCode).sort((a, b) => b.length - a.length);
    for (const prefix of prefixes) {
      // Match prefix exactly at start of digits
      if (digits.length >= prefix.length && digits.substring(0, prefix.length) === prefix) {
        return localPrefixToCountryCode[prefix];
      }
    }
    return null;
  };

  const handleInputChange = (field, value) => {
    if (field === 'mobile') {
      // Detect country code from mobile prefix
      const detectedCode = detectCountryCodeFromMobile(value);
      if (detectedCode && detectedCode !== tempSelectedCountryCode) {
        setTempSelectedCountryCode(detectedCode);
      }
    }
    setTempUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCountryCodeChange = (value) => {
    setTempSelectedCountryCode(value);
  };

  const validateMobileNumber = (mobile, countryCode) => {
    // Mapping of country codes to expected local number lengths (example subset)
    const countryCodeToLocalLength = {
      '+1': 10,    // US, Canada
      '+7': [10, 11],    // Russia, Kazakhstan
      '+20': 9,    // Egypt
      '+27': 9,    // South Africa
      '+30': 10,   // Greece
      '+31': 9,    // Netherlands
      '+32': [9, 10],    // Belgium
      '+33': 9,    // France
      '+34': 9,    // Spain
      '+36': 9,    // Hungary
      '+39': [9, 10],   // Italy
      '+40': 9,    // Romania
      '+41': 9,    // Switzerland
      '+43': 10,   // Austria
      '+44': [10, 11],   // United Kingdom
      '+45': 8,    // Denmark
      '+46': 9,    // Sweden
      '+47': 8,    // Norway
      '+48': 9,    // Poland
      '+49': [10, 11],   // Germany
      '+51': 9,    // Peru
      '+52': 10,   // Mexico
      '+53': 8,    // Cuba
      '+54': 10,   // Argentina
      '+55': 11,   // Brazil
      '+56': 9,    // Chile
      '+57': 10,   // Colombia
      '+58': 10,   // Venezuela
      '+60': 9,    // Malaysia
      '+61': 9,    // Australia
      '+62': 10,   // Indonesia
      '+63': 10,   // Philippines
      '+64': 9,    // New Zealand
      '+65': 8,    // Singapore
      '+66': 9,    // Thailand
      '+81': 10,   // Japan
      '+82': 9,    // South Korea
      '+84': 9,    // Vietnam
      '+86': 11,   // China
      '+90': 10,   // Turkey
      '+91': 10,   // India
      '+92': 10,   // Pakistan
      '+93': 9,    // Afghanistan
      '+94': 9,    // Sri Lanka
      '+95': 9,    // Myanmar
      '+98': 10    // Iran
      // Add more as needed
    };

    // Check that mobile contains only digits
    const digitOnlyRegex = /^\d+$/;
    if (!digitOnlyRegex.test(mobile)) {
      return false;
    }
    // Remove non-digit characters from mobile
    const digits = mobile.replace(/\D/g, '');

    // Check if countryCode is valid format
    const countryCodeRegex = /^\+?[0-9]{1,3}$/;
    if (!countryCodeRegex.test(countryCode)) {
      return false;
    }

    // Check if local number length matches expected length for country code
    const expectedLength = countryCodeToLocalLength[countryCode];
    if (!expectedLength) {
      // If country code not in map, fallback to length between 6 and 14
      if (digits.length < 6 || digits.length > 14) {
        return false;
      }
    } else {
      if (Array.isArray(expectedLength)) {
        if (!expectedLength.includes(digits.length)) {
          return false;
        }
      } else {
        if (digits.length !== expectedLength) {
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = () => {
    // Detect country code from mobile prefix on save
    const detectedCode = detectCountryCodeFromMobile(tempUserInfo.mobile);
    const countryCodeToUse = detectedCode || tempSelectedCountryCode;

    // Validate mobile number with detected or selected country code
    if (tempUserInfo.mobile && !validateMobileNumber(tempUserInfo.mobile, countryCodeToUse)) {
      setErrorMessage('Please enter a valid mobile number.');
      setShowErrorDialog(true);
      return;
    } else {
      setErrorMessage('');
      setShowErrorDialog(false);
    }

    // Remove leading '0' from local number if present (common local prefix)
    let localNumber = tempUserInfo.mobile;
    if (localNumber.startsWith('0')) {
      localNumber = localNumber.substring(1);
    }

    // Combine country code and local number for saving
    const fullMobile = countryCodeToUse + localNumber;

    // Update userInfo with tempUserInfo values and detected/selected country code
    setUserInfo({
      ...tempUserInfo,
      mobile: localNumber
    });
    setTempUserInfo(prev => ({
      ...prev,
      mobile: localNumber
    }));
    setSelectedCountryCode(countryCodeToUse);
    setTempSelectedCountryCode(countryCodeToUse);

    // Optionally update sessionStorage with new username, email, mobile (with country code), and location
    const updatedUser = {
      username: tempUserInfo.name,
      email: tempUserInfo.email,
      mobile: fullMobile,
      location: tempUserInfo.location
    };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));

    setSavedMessage(true);
    setIsEditing({
      name: false,
      email: false,
      mobile: false,
      location: false
    });
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSavedMessage(false);
    }, 3000);
  };

  const toggleEdit = (field) => {
    if (!isEditing[field]) {
      // When entering edit mode, copy current userInfo to tempUserInfo for that field
      setTempUserInfo(prev => ({
        ...prev,
        [field]: userInfo[field]
      }));
    }
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="flex h-screen">
      <ChronoSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {userInfo.name}!</h2>
          <p className="text-gray-600 mb-8">You've got this - keep going, you can do it!</p>

          {/* Success Message */}
          {savedMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
              <div className="w-5 h-5 mr-2 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">✓</div>
              <span>Settings saved successfully!</span>
            </div>
          )}

          {/* Error Dialog */}
          {/* Removed popup dialog for invalid mobile number as per user request */}

          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-8 relative">
              <div>
                <button className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors">
                  <div className="w-4 h-4 relative">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-current rounded-full"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-2 bg-current rounded-t-full"></div>
                  </div>
                </button>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800">{userInfo.name}</h3>
                <p className="text-gray-600">{userInfo.email}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name Field */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  {isEditing.name ? (
                    <input
                      type="text"
                      value={tempUserInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <p className="text-gray-800 py-2">{userInfo.name}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleEdit('name')}
                  className="ml-4 text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  {isEditing.name ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {/* Email Field */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email account</label>
                  {isEditing.email ? (
                    <input
                      type="email"
                      value={tempUserInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <p className="text-gray-800 py-2">{userInfo.email}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleEdit('email')}
                  className="ml-4 text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  {isEditing.email ? 'Cancel' : 'Edit'}
                </button>
              </div>

          {/* Mobile Field */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile number
                {errorMessage && (
                  <span className="text-red-600 ml-2 text-xs italic">*invalid mobile no.*</span>
                )}
              </label>
              {isEditing.mobile ? (
                <div className="flex space-x-2">
                  <select
                    value={tempSelectedCountryCode}
                    onChange={(e) => handleCountryCodeChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="+1">+1 (US, Canada, etc.)</option>
                    <option value="+7">+7 (Russia, Kazakhstan)</option>
                    <option value="+20">+20 (Egypt)</option>
                    <option value="+27">+27 (South Africa)</option>
                    <option value="+30">+30 (Greece)</option>
                    <option value="+31">+31 (Netherlands)</option>
                    <option value="+32">+32 (Belgium)</option>
                    <option value="+33">+33 (France)</option>
                    <option value="+34">+34 (Spain)</option>
                    <option value="+36">+36 (Hungary)</option>
                    <option value="+39">+39 (Italy)</option>
                    <option value="+40">+40 (Romania)</option>
                    <option value="+41">+41 (Switzerland)</option>
                    <option value="+43">+43 (Austria)</option>
                    <option value="+44">+44 (United Kingdom)</option>
                    <option value="+45">+45 (Denmark)</option>
                    <option value="+46">+46 (Sweden)</option>
                    <option value="+47">+47 (Norway)</option>
                    <option value="+48">+48 (Poland)</option>
                    <option value="+49">+49 (Germany)</option>
                    <option value="+51">+51 (Peru)</option>
                    <option value="+52">+52 (Mexico)</option>
                    <option value="+53">+53 (Cuba)</option>
                    <option value="+54">+54 (Argentina)</option>
                    <option value="+55">+55 (Brazil)</option>
                    <option value="+56">+56 (Chile)</option>
                    <option value="+57">+57 (Colombia)</option>
                    <option value="+58">+58 (Venezuela)</option>
                    <option value="+60">+60 (Malaysia)</option>
                    <option value="+61">+61 (Australia)</option>
                    <option value="+62">+62 (Indonesia)</option>
                    <option value="+63">+63 (Philippines)</option>
                    <option value="+64">+64 (New Zealand)</option>
                    <option value="+65">+65 (Singapore)</option>
                    <option value="+66">+66 (Thailand)</option>
                    <option value="+81">+81 (Japan)</option>
                    <option value="+82">+82 (South Korea)</option>
                    <option value="+84">+84 (Vietnam)</option>
                    <option value="+86">+86 (China)</option>
                    <option value="+90">+90 (Turkey)</option>
                    <option value="+91">+91 (India)</option>
                    <option value="+92">+92 (Pakistan)</option>
                    <option value="+93">+93 (Afghanistan)</option>
                    <option value="+94">+94 (Sri Lanka)</option>
                    <option value="+95">+95 (Myanmar)</option>
                    <option value="+98">+98 (Iran)</option>
                    <option value="+211">+211 (South Sudan)</option>
                    <option value="+212">+212 (Morocco)</option>
                    <option value="+213">+213 (Algeria)</option>
                    <option value="+216">+216 (Tunisia)</option>
                    <option value="+218">+218 (Libya)</option>
                    <option value="+220">+220 (Gambia)</option>
                    <option value="+221">+221 (Senegal)</option>
                    <option value="+222">+222 (Mauritania)</option>
                    <option value="+223">+223 (Mali)</option>
                    <option value="+224">+224 (Guinea)</option>
                    <option value="+225">+225 (Ivory Coast)</option>
                    <option value="+226">+226 (Burkina Faso)</option>
                    <option value="+227">+227 (Niger)</option>
                    <option value="+228">+228 (Togo)</option>
                    <option value="+229">+229 (Benin)</option>
                    <option value="+230">+230 (Mauritius)</option>
                    <option value="+231">+231 (Liberia)</option>
                    <option value="+232">+232 (Sierra Leone)</option>
                    <option value="+233">+233 (Ghana)</option>
                    <option value="+234">+234 (Nigeria)</option>
                    <option value="+235">+235 (Chad)</option>
                    <option value="+236">+236 (Central African Republic)</option>
                    <option value="+237">+237 (Cameroon)</option>
                    <option value="+238">+238 (Cape Verde)</option>
                    <option value="+239">+239 (Sao Tome and Principe)</option>
                    <option value="+240">+240 (Equatorial Guinea)</option>
                    <option value="+241">+241 (Gabon)</option>
                    <option value="+242">+242 (Republic of the Congo)</option>
                    <option value="+243">+243 (Democratic Republic of the Congo)</option>
                    <option value="+244">+244 (Angola)</option>
                    <option value="+245">+245 (Guinea-Bissau)</option>
                    <option value="+246">+246 (British Indian Ocean Territory)</option>
                    <option value="+248">+248 (Seychelles)</option>
                    <option value="+249">+249 (Sudan)</option>
                    <option value="+250">+250 (Rwanda)</option>
                    <option value="+251">+251 (Ethiopia)</option>
                    <option value="+252">+252 (Somalia)</option>
                    <option value="+253">+253 (Djibouti)</option>
                    <option value="+254">+254 (Kenya)</option>
                    <option value="+255">+255 (Tanzania)</option>
                    <option value="+256">+256 (Uganda)</option>
                    <option value="+257">+257 (Burundi)</option>
                    <option value="+258">+258 (Mozambique)</option>
                    <option value="+260">+260 (Zambia)</option>
                    <option value="+261">+261 (Madagascar)</option>
                    <option value="+262">+262 (Reunion, Mayotte)</option>
                    <option value="+263">+263 (Zimbabwe)</option>
                    <option value="+264">+264 (Namibia)</option>
                    <option value="+265">+265 (Malawi)</option>
                    <option value="+266">+266 (Lesotho)</option>
                    <option value="+267">+267 (Botswana)</option>
                    <option value="+268">+268 (Swaziland)</option>
                    <option value="+269">+269 (Comoros)</option>
                    <option value="+290">+290 (Saint Helena)</option>
                    <option value="+291">+291 (Eritrea)</option>
                    <option value="+297">+297 (Aruba)</option>
                    <option value="+298">+298 (Faroe Islands)</option>
                    <option value="+299">+299 (Greenland)</option>
                    <option value="+350">+350 (Gibraltar)</option>
                    <option value="+351">+351 (Portugal)</option>
                    <option value="+352">+352 (Luxembourg)</option>
                    <option value="+353">+353 (Ireland)</option>
                    <option value="+354">+354 (Iceland)</option>
                    <option value="+355">+355 (Albania)</option>
                    <option value="+356">+356 (Malta)</option>
                    <option value="+357">+357 (Cyprus)</option>
                    <option value="+358">+358 (Finland)</option>
                    <option value="+359">+359 (Bulgaria)</option>
                    <option value="+370">+370 (Lithuania)</option>
                    <option value="+371">+371 (Latvia)</option>
                    <option value="+372">+372 (Estonia)</option>
                    <option value="+373">+373 (Moldova)</option>
                    <option value="+374">+374 (Armenia)</option>
                    <option value="+375">+375 (Belarus)</option>
                    <option value="+376">+376 (Andorra)</option>
                    <option value="+377">+377 (Monaco)</option>
                    <option value="+378">+378 (San Marino)</option>
                    <option value="+379">+379 (Vatican City)</option>
                    <option value="+380">+380 (Ukraine)</option>
                    <option value="+381">+381 (Serbia)</option>
                    <option value="+382">+382 (Montenegro)</option>
                    <option value="+383">+383 (Kosovo)</option>
                    <option value="+385">+385 (Croatia)</option>
                    <option value="+386">+386 (Slovenia)</option>
                    <option value="+387">+387 (Bosnia and Herzegovina)</option>
                    <option value="+389">+389 (Macedonia)</option>
                    <option value="+420">+420 (Czech Republic)</option>
                    <option value="+421">+421 (Slovakia)</option>
                    <option value="+423">+423 (Liechtenstein)</option>
                    <option value="+500">+500 (Falkland Islands)</option>
                    <option value="+501">+501 (Belize)</option>
                    <option value="+502">+502 (Guatemala)</option>
                    <option value="+503">+503 (El Salvador)</option>
                    <option value="+504">+504 (Honduras)</option>
                    <option value="+505">+505 (Nicaragua)</option>
                    <option value="+506">+506 (Costa Rica)</option>
                    <option value="+507">+507 (Panama)</option>
                    <option value="+508">+508 (Saint Pierre and Miquelon)</option>
                    <option value="+509">+509 (Haiti)</option>
                    <option value="+590">+590 (Guadeloupe)</option>
                    <option value="+591">+591 (Bolivia)</option>
                    <option value="+592">+592 (Guyana)</option>
                    <option value="+593">+593 (Ecuador)</option>
                    <option value="+594">+594 (French Guiana)</option>
                    <option value="+595">+595 (Paraguay)</option>
                    <option value="+596">+596 (Martinique)</option>
                    <option value="+597">+597 (Suriname)</option>
                    <option value="+598">+598 (Uruguay)</option>
                    <option value="+599">+599 (Netherlands Antilles)</option>
                    <option value="+670">+670 (East Timor)</option>
                    <option value="+672">+672 (Australian External Territories)</option>
                    <option value="+673">+673 (Brunei)</option>
                    <option value="+674">+674 (Nauru)</option>
                    <option value="+675">+675 (Papua New Guinea)</option>
                    <option value="+676">+676 (Tonga)</option>
                    <option value="+677">+677 (Solomon Islands)</option>
                    <option value="+678">+678 (Vanuatu)</option>
                    <option value="+679">+679 (Fiji)</option>
                    <option value="+680">+680 (Palau)</option>
                    <option value="+681">+681 (Wallis and Futuna)</option>
                    <option value="+682">+682 (Cook Islands)</option>
                    <option value="+683">+683 (Niue)</option>
                    <option value="+685">+685 (Samoa)</option>
                    <option value="+686">+686 (Kiribati)</option>
                    <option value="+687">+687 (New Caledonia)</option>
                    <option value="+688">+688 (Tuvalu)</option>
                    <option value="+689">+689 (French Polynesia)</option>
                    <option value="+690">+690 (Tokelau)</option>
                    <option value="+691">+691 (Micronesia)</option>
                    <option value="+692">+692 (Marshall Islands)</option>
                    <option value="+850">+850 (North Korea)</option>
                    <option value="+852">+852 (Hong Kong)</option>
                    <option value="+853">+853 (Macau)</option>
                    <option value="+855">+855 (Cambodia)</option>
                    <option value="+856">+856 (Laos)</option>
                    <option value="+880">+880 (Bangladesh)</option>
                    <option value="+886">+886 (Taiwan)</option>
                    <option value="+960">+960 (Maldives)</option>
                    <option value="+961">+961 (Lebanon)</option>
                    <option value="+962">+962 (Jordan)</option>
                    <option value="+963">+963 (Syria)</option>
                    <option value="+964">+964 (Iraq)</option>
                    <option value="+965">+965 (Kuwait)</option>
                    <option value="+966">+966 (Saudi Arabia)</option>
                    <option value="+967">+967 (Yemen)</option>
                    <option value="+968">+968 (Oman)</option>
                    <option value="+970">+970 (Palestine)</option>
                    <option value="+971">+971 (United Arab Emirates)</option>
                    <option value="+972">+972 (Israel)</option>
                    <option value="+973">+973 (Bahrain)</option>
                    <option value="+974">+974 (Qatar)</option>
                    <option value="+975">+975 (Bhutan)</option>
                    <option value="+976">+976 (Mongolia)</option>
                    <option value="+977">+977 (Nepal)</option>
                    <option value="+992">+992 (Tajikistan)</option>
                    <option value="+993">+993 (Turkmenistan)</option>
                    <option value="+994">+994 (Azerbaijan)</option>
                    <option value="+995">+995 (Georgia)</option>
                    <option value="+996">+996 (Kyrgyzstan)</option>
                    <option value="+998">+998 (Uzbekistan)</option>
                  </select>
                  <input
                    type="tel"
                    value={tempUserInfo.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              ) : (
                <p className="text-gray-800 py-2">{selectedCountryCode}{userInfo.mobile}</p>
              )}
            </div>
            <button
              onClick={() => toggleEdit('mobile')}
              className="ml-4 text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              {isEditing.mobile ? 'Cancel' : 'Edit'}
            </button>
          </div>

              {/* Location Field */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {isEditing.location ? (
                    <input
                      type="text"
                      value={tempUserInfo.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <p className="text-gray-800 py-2">{userInfo.location}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleEdit('location')}
                  className="ml-4 text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  {isEditing.location ? 'Cancel' : 'Edit'}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center font-medium"
              >
                <div className="w-5 h-5 mr-2 relative">
                  <div className="absolute inset-0 border border-current rounded-sm"></div>
                  <div className="absolute top-1 right-1 w-2 h-3 border-r border-b border-current transform rotate-45 -translate-y-0.5"></div>
                </div>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
