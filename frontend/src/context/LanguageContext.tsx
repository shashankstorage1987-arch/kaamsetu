'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (text: string, defaultText?: string) => string;
  translateTrade: (trade: string) => string;
  translateProfession: (prof: string) => string;
  translateStatus: (status: string) => string;
}

const DICTIONARY: Record<string, string> = {
  // Navigation & Headers
  'Employer Dashboard': 'नियोक्ता डैशबोर्ड',
  'Worker Dashboard': 'कारीगर डैशबोर्ड',
  'KaamSetu Business Hub': 'कामसेतु व्यापार केंद्र',
  'Location Permission': 'लोकेशन अनुमति',
  'Notification Permission': 'सूचना अनुमति',
  'Enable location for hyperlocal job discovery': 'सटीक स्थानीय काम खोजने के लिए लोकेशन सक्षम करें',
  'Enable notifications for instant job alerts': 'त्वरित जॉब अलर्ट के लिए सूचनाएं सक्षम करें',
  'Business Details': 'व्यापार का विवरण',
  'Tell workers about your shop': 'कारीगरों को अपनी दुकान के बारे में बताएं',
  'Business Address': 'दुकान / व्यापार का पता',
  'Location where workers will report': 'स्थान जहां कारीगर काम पर आएंगे',
  'Worker Skill Passport': 'कारीगर स्किल पासपोर्ट',
  'Skill Passport': 'स्किल पासपोर्ट',
  'Verified Worker Credentials': 'सत्यापित कारीगर प्रोफ़ाइल',
  'Worker Sign Up': 'कारीगर पंजीकरण',
  'Create your verified worker profile': 'अपना सत्यापित कारीगर प्रोफ़ाइल बनाएं',
  'Employer Sign Up': 'नियोक्ता पंजीकरण',
  'Register your business & hire workers': 'अपना व्यापार पंजीकृत करें और कारीगर रखें',
  'Login': 'लॉगिन करें',
  'Log In to KaamSetu': 'कामसेतु में लॉग इन करें',
  'Welcome back': 'वापस स्वागत है',
  'Enter your registered phone and PIN': 'अपना पंजीकृत फोन नंबर और पिन दर्ज करें',
  'My Job Applications': 'मेरे जॉब आवेदन',
  'My Applications': 'मेरे आवेदन',
  'Track your application status': 'अपने आवेदन की स्थिति देखें',
  'Find Skilled Workers Nearby': 'आसपास के कुशल कारीगर खोजें',
  'Search Nearby Skilled Workers': 'आसपास के कुशल कारीगर खोजें',
  'Search Skilled Workers': 'कुशल कारीगर खोजें',
  'Find Workers': 'कारीगर खोजें',
  'Find Jobs': 'नौकरियां खोजें',
  'Hyperlocal Nearby Candidates': 'आपके आसपास के कुशल उम्मीदवार',
  'Hyperlocal Jobs Near You': 'आपके आसपास की नौकरियां',
  'Post a Job Need': 'नई नौकरी पोस्ट करें',
  'Post a Job Need Instead': 'नौकरी की आवश्यकता पोस्ट करें',
  'Post a Job Requirement': 'नौकरी की आवश्यकता पोस्ट करें',
  'Need to post a fallback job?': 'क्या आपको नौकरी पोस्ट करनी है?',
  'Interested Applicants': 'इच्छुक उम्मीदवार',
  'Applicants & Pipeline': 'आवेदक और हायरिंग पाइपलाइन',
  'Review applicants & track hiring decisions': 'आवेदकों की समीक्षा करें और निर्णय लें',
  'Review applicants & confirm hiring': 'आवेदकों की समीक्षा करें और पुष्टि करें',
  'Hire Confirmation': 'हायरिंग पुष्टि',
  'Finalize hiring terms': 'हायरिंग शर्तों को अंतिम रूप दें',
  'Hire Confirmations': 'हायरिंग पुष्टियां',

  // Steps
  'Step 1 of 3': 'चरण 1 / 3',
  'Step 2 of 3': 'चरण 2 / 3',
  'Step 3 of 3': 'चरण 3 / 3',
  'Step 1 of 4': 'चरण 1 / 4',
  'Step 2 of 4': 'चरण 2 / 4',
  'Step 3 of 4': 'चरण 3 / 4',
  'Step 4 of 4': 'चरण 4 / 4',

  // Buttons & Actions
  'Save Details & Next': 'विवरण सहेजें और आगे बढ़ें',
  'Complete Business Profile': 'व्यापार प्रोफ़ाइल पूरा करें',
  'Allow Location Access': 'लोकेशन अनुमति दें',
  'Allow Notifications': 'सूचनाएं चालू करें',
  'Not Now': 'अभी नहीं',
  'Edit Business Profile': 'व्यापार प्रोफ़ाइल संपादित करें',
  'Edit Profile': 'प्रोफ़ाइल संपादित करें',
  'Log Out': 'लॉग आउट',
  'Close': 'बंद करें',
  'View Candidates': 'उम्मीदवार देखें',
  'Back': 'पीछे',
  'Go Back': 'वापस जाएं',
  'Go Back to Previous Screen': 'पिछले पेज पर वापस जाएं',
  'Back to Dashboard': 'डैशबोर्ड पर वापस जाएं',
  'Back to Home': 'होम पेज पर वापस जाएं',
  'Back to Search Results': 'खोज परिणामों पर वापस जाएं',
  'Back to Worker Search': 'कारीगर खोज पर वापस जाएं',
  'Back to Job Search': 'नौकरी खोज पर वापस जाएं',
  'Back to Applicants': 'आवेदकों की सूची पर वापस जाएं',
  'Back to Job Details': 'नौकरी विवरण पर वापस जाएं',
  'Back to Candidates': 'उम्मीदवारों की सूची पर वापस जाएं',
  'Apply Now': 'आवेदन करें',
  'Express Interest': 'आवेदन करें (रुचि दिखाएं)',
  'Reveal Contact': 'संपर्क नंबर देखें',
  'Reveal Worker Mobile Number': 'कारीगर का मोबाइल नंबर देखें',
  'Call Worker': 'कारीगर को कॉल करें',
  'Contact Revealed': 'संपर्क उपलब्ध',
  'Hire Candidate': 'उम्मीदवार को रखें',
  'Reject Candidate': 'अस्वीकार करें',
  'Reject': 'अस्वीकार करें',
  'Confirm Hiring': 'हायरिंग की पुष्टि करें',
  'Select & Confirm Hire': 'चयनित करें और हायर करें',
  'Processing...': 'प्रक्रिया जारी है...',
  'Cancel': 'रद्द करें',
  'Save Profile': 'प्रोफ़ाइल सहेजें',
  'Change Photo': 'फोटो बदलें',
  'Remove': 'हटाएं',
  'Upload Shop Front Photo (Optional)': 'दुकान की फोटो अपलोड करें (वैकल्पिक)',
  'Upload Profile Photo': 'प्रोफ़ाइल फोटो अपलोड करें',
  '+ Upload Shop Photo': '+ दुकान की फोटो अपलोड करें',
  'Go Available': 'उपलब्ध बनें',
  'Go Unavailable': 'अनुपलब्ध बनें',
  'View My Skill Passport': 'मेरा स्किल पासपोर्ट देखें',
  'Find Nearby Jobs': 'आसपास की नौकरियां खोजें',
  'Use Current Device Location': 'डिवाइस लोकेशन का उपयोग करें',
  'Detecting Location...': 'लोकेशन जांची जा रही है...',

  // Status & Badges
  'ACTIVE': 'सक्रिय',
  'CLOSED': 'बंद',
  'Active Jobs': 'सक्रिय नौकरियां',
  'Closed Jobs': 'बंद नौकरियां',
  'Applied': 'आवेदन किए',
  'Selected': 'चयनित',
  'Rejected': 'अस्वीकृत',
  'Employer': 'नियोक्ता',
  'Worker': 'कारीगर',
  'Overall Hiring Pipeline': 'कुल हायरिंग पाइपलाइन',
  'Across All Posted Jobs': 'सभी पोस्ट की गई नौकरियों में',
  'Available for Work': 'काम के लिए उपलब्ध',
  'Not Available for Work': 'काम के लिए अनुपलब्ध',
  'Ready to Work Today': 'आज काम के लिए तैयार',
  'Currently Off-Duty': 'फ़िलहाल ड्यूटी पर नहीं',
  'Aadhaar Verified': 'आधार सत्यापित',
  'Available Now': 'अभी उपलब्ध',
  'Not Available': 'अनुपलब्ध',
  'Already Applied': 'आवेदन किया हुआ',
  'Hired!': 'हायर हो गया!',
  'Already Hired': 'पहले से चयनित',
  'PENDING': 'प्रक्रियाधीन',
  'HIRED': 'हायर किया गया',
  'NOT_SELECTED': 'अस्वीकृत',
  'Shift': 'शिफ्ट',
  'DAY': 'दिन',
  'NIGHT': 'रात',
  'Day Shift': 'दिन की शिफ्ट',
  'Night Shift': 'रात की शिफ्ट',

  // Filter labels
  'Category Trade': 'व्यापार श्रेणी',
  'Select Role': 'पद चुनें',
  'All Trades': 'सभी व्यापार',
  'All Professions': 'सभी पद',
  'Max Distance': 'अधिकतम दूरी',
  'Available Now Only': 'केवल अभी उपलब्ध',
  'Verified Only': 'केवल सत्यापित',
  'Similar Shop Experience': 'समान दुकान का अनुभव',
  'Search Results': 'खोज परिणाम',
  'Candidate Matches': 'उम्मीदवार मैच',
  'Distance Radius': 'दूरी दायरा',
  'Match Score': 'मैच स्कोर',
  'Interested': 'इच्छुक',
  '% Match': '% मैच',
  'km away': 'कि.मी. दूर',
  'Yrs Exp': 'वर्ष अनुभव',
  'Years': 'वर्ष',
  'KM': 'कि.मी.',

  // Forms & Inputs
  'Full Name': 'पूरा नाम',
  'Full Name (as per Aadhaar)': 'पूरा नाम (आधार के अनुसार)',
  '10-Digit Mobile Number': '10 अंकों का मोबाइल नंबर',
  '6-Digit Security PIN': '6 अंकों का सुरक्षा पिन',
  '6-Digit PIN': '6 अंकों का पिन',
  '12-Digit Aadhaar Number': '12 अंकों का आधार नंबर',
  '12-Digit Aadhaar Number (Verification Only)': '12 अंकों का आधार नंबर (केवल सत्यापन हेतु)',
  'Raw Aadhaar number is verified transiently and NEVER saved in our system.': 'आधार नंबर केवल सत्यापन के लिए उपयोग किया जाता है और सिस्टम में कभी सहेजा नहीं जाता।',
  'Years in Business': 'व्यापार के वर्ष',
  'Typical Roles You Hire For': 'पद जिनके लिए आप भर्ती करते हैं',
  'Shop Address / Landmark': 'दुकान का पता / लैंडमार्क',
  'Area / Sector': 'क्षेत्र / सेक्टर',
  'City': 'शहर',
  'Pincode': 'पिन कोड',
  'Monthly Salary': 'मासिक वेतन',
  'Monthly Salary (₹)': 'मासिक वेतन (₹)',
  'Known Languages (comma-separated)': 'ज्ञात भाषाएं (कॉमा से अलग करें)',
  'Max Distance (KM)': 'अधिकतम दूरी (कि.मी.)',
  'Preferred Monthly Salary': 'अपेक्षित मासिक वेतन',
  'Preferred Monthly Salary (₹)': 'अपेक्षित मासिक वेतन (₹)',
  'Preferred Max Travel Distance (KM)': 'अधिकतम यात्रा दूरी (कि.मी.)',
  'Preferred Work Radius': 'कार्य क्षेत्र दायरा',
  'Total Experience': 'कुल अनुभव',
  'Work History': 'कार्य अनुभव इतिहास',
  'Duration': 'अवधि',
  'Duration (Months)': 'अवधि (महीनों में)',
  'Shop / Business': 'दुकान / व्यापार',
  'Location & Languages': 'स्थान और भाषाएं',
  'Address Line': 'पता',
  'Street / Address Line': 'गली / मकान नंबर / पता',
  'Street Address Line': 'सड़क / पता',
  'Area / City': 'क्षेत्र / शहर',
  'Known Languages': 'ज्ञात भाषाएं',
  'Contact Information': 'संपर्क जानकारी',
  'Primary Employer Action': 'मुख्य नियोक्ता कार्य',
  'Search local workers by trade, profession, distance, and availability for instant contact reveal.': 'तुरंत संपर्क देखने के लिए व्यापार, पेशे, दूरी और उपलब्धता के अनुसार स्थानीय कारीगरों को खोजें।',
  'No active job requirements posted yet': 'अभी तक कोई सक्रिय नौकरी पोस्ट नहीं की गई है',
  'No closed job requirements found': 'कोई बंद नौकरी नहीं मिली',
  'No matching workers found in this radius': 'इस दूरी में कोई मेल खाता कारीगर नहीं मिला',
  'No matching jobs found in this radius': 'इस दूरी में कोई नौकरी नहीं मिली',
  'Try increasing your search radius or changing category filters': 'खोज का दायरा बढ़ाएं या फ़िल्टर बदलें',
  'No interested applicants yet for this job': 'इस नौकरी के लिए अभी तक कोई इच्छुक आवेदक नहीं है',
  'No rejected applicants': 'कोई अस्वीकृत आवेदक नहीं',
  'No applications yet': 'अभी तक कोई आवेदन नहीं',
  'Explore nearby jobs and express your interest with one tap': 'आसपास की नौकरियां देखें और एक क्लिक में आवेदन करें',
  'Find Hyperlocal Jobs': 'आसपास की नौकरियां खोजें',
  'Turn on availability to receive immediate job offers and contact reveals from nearby shops.': 'आसपास की दुकानों से तुरंत काम के ऑफर और कॉल पाने के लिए उपलब्धता ऑन करें।',
  'Employer Profile': 'नियोक्ता प्रोफ़ाइल',
  'Business & Shop Information': 'व्यापार और दुकान की जानकारी',
  'Business / Shop Name': 'व्यापार / दुकान का नाम',
  'Owner Name': 'मालिक का नाम',
  'Owner / Manager Name': 'मालिक / प्रबंधक का नाम',
  'Years in operation': 'वर्षों से कार्यरत',
  'Trade / Category': 'व्यापार श्रेणी',
  'Typical Roles Hired': 'भर्ती किए जाने वाले पद',
  'No shop photo uploaded yet': 'अभी तक कोई दुकान की फोटो अपलोड नहीं की गई',

  // Landing Page
  'KaamSetu': 'कामसेतु',
  'Hyperlocal Worker Discovery': 'स्थानीय कारीगर खोज',
  'Connecting local businesses with trusted, verified skilled workers in real-time.': 'स्थानीय व्यवसायों को वास्तविक समय में विश्वसनीय, सत्यापित कुशल कारीगरों से जोड़ना।',
  'For Workers': 'कारीगरों के लिए',
  'Find daily & full-time local jobs': 'दैनिक और पूर्णकालिक स्थानीय काम खोजें',
  'For Employers': 'नियोक्ताओं के लिए',
  'Hire skilled helpers & billers nearby': 'आसपास के कुशल हेल्पर और बिलर रखें',
  'Aadhaar ID Verified Platform': 'आधार सत्यापित मंच',
  'Create New Account': 'नया खाता बनाएं',
  'Log In with PIN': 'पिन से लॉग इन करें',

  // Role Choice / Signup
  'Join KaamSetu': 'कामसेतु से जुड़ें',
  'Select your role to get started': 'शुरू करने के लिए अपनी भूमिका चुनें',
  'I am a Worker': 'मैं कारीगर हूँ',
  'Looking for shop helper, waiter, or mechanic jobs nearby': 'आसपास दुकान के हेल्पर, वेटर या मैकेनिक के काम की तलाश में',
  'I am a Shop Owner / Employer': 'मैं दुकानदार / नियोक्ता हूँ',
  'Hiring skilled helpers, billers, and staff for my shop': 'अपनी दुकान के लिए कुशल हेल्पर, बिलर और स्टाफ रखना चाहता हूँ',
  'Continue': 'आगे बढ़ें',
  'Create Profile & Continue': 'प्रोफ़ाइल बनाएं और आगे बढ़ें',
  'Create Account & Continue': 'खाता बनाएं और आगे बढ़ें',
  'Create your employer account': 'अपना नियोक्ता खाता बनाएं',

  // Login & Forgot PIN
  'Enter mobile number & PIN to continue': 'आगे बढ़ने के लिए मोबाइल नंबर और पिन दर्ज करें',
  'Session Expired': 'सत्र समाप्त हो गया',
  'You were logged out due to inactivity. Enter your PIN to log back in.': 'निष्क्रियता के कारण आप लॉग आउट हो गए। वापस लॉग इन करने के लिए अपना पिन दर्ज करें।',
  'Mobile Phone Number': 'मोबाइल फोन नंबर',
  'Registered Mobile Phone Number': 'पंजीकृत मोबाइल फोन नंबर',
  'Forgot PIN?': 'पिन भूल गए?',
  "Don't have an account?": 'खाता नहीं है?',
  'Sign Up': 'पंजीकरण करें',
  'Forgot PIN': 'पिन भूल गए',
  'Reset PIN': 'पिन रीसेट करें',
  'Verify your mobile number': 'अपना मोबाइल नंबर सत्यापित करें',
  'Enter OTP & your new PIN': 'ओटीपी और नया पिन दर्ज करें',
  'Send Verification OTP': 'सत्यापन ओटीपी भेजें',
  '6-Digit Verification OTP': '6 अंकों का सत्यापन ओटीपी',
  'Enter New 6-Digit PIN': 'नया 6 अंकों का पिन दर्ज करें',
  'Reset PIN & Log In': 'पिन रीसेट करें और लॉग इन करें',

  // Worker Home Page
  'Worker Home': 'कारीगर होम',
  '12h Active Window': '12 घंटे सक्रिय विंडो',
  'Session Time Left': 'सत्र का शेष समय',
  'Employers nearby can discover your Skill Passport. Your availability stays active for 12 hours.': 'निकटवर्ती नियोक्ता आपका स्किल पासपोर्ट देख सकते हैं। आपकी उपलब्धता 12 घंटे तक सक्रिय रहेगी।',
  'Turn Availability Off': 'उपलब्धता बंद करें',
  '12-Hour Availability Expired': '12 घंटे की उपलब्धता समाप्त हो गई',
  'Your 12-hour active period has ended. You are currently hidden from employer searches until you turn availability back on.': 'आपकी 12 घंटे की सक्रिय अवधि समाप्त हो गई है। जब तक आप फिर से उपलब्धता चालू नहीं करते, आप खोज में नहीं दिखेंगे।',
  'Turn Available Back On': 'वापस उपलब्ध बनें',
  'Offline': 'ऑफ़लाइन',
  'Turn on availability to allow local employers to search and match with your Skill Passport for 12 hours.': 'स्थानीय दुकानदारों को 12 घंटे तक आपका स्किल पासपोर्ट खोजने के लिए उपलब्धता चालू करें।',
  'Set Available for 12 Hours': '12 घंटे के लिए उपलब्ध सेट करें',
  'Aadhaar ID Verified': 'आधार सत्यापित',
  'My Profile →': 'मेरी प्रोफ़ाइल →',
  'Preferred Distance': 'पसंदीदा दूरी',
  'Registered Trades': 'पंजीकृत व्यापार',
  'Find & Browse Nearby Jobs': 'आसपास की नौकरियां खोजें',
  'Hire Prompts': 'हायरिंग अनुरोध',

  // Worker Applications Page
  'Track your expressed interest & hiring status': 'अपनी व्यक्त रुचि और स्थिति देखें',
  'Pending Review': 'समीक्षाधीन',
  'No Job Applications Yet': 'अभी तक कोई नौकरी आवेदन नहीं',
  'When you express interest in jobs from employers, they will show up here.': 'जब आप नियोक्ताओं की नौकरियों में रुचि दिखाएंगे, तो वे यहाँ दिखाई देंगी।',
  'SUBMITTED APPLICATIONS': 'प्रस्तुत आवेदन',
  'Sorted by Date': 'दिनांक अनुसार',
  'Offered Pay:': 'प्रस्तावित वेतन:',
  'View Details': 'विवरण देखें',

  // Job Detail & View Pages
  'Job Details': 'नौकरी का विवरण',
  'Requirement Details': 'आवश्यकता विवरण',
  'Min Experience': 'न्यूनतम अनुभव',
  'Work Shift': 'कार्य शिफ्ट',
  'Target Radius': 'लक्षित दूरी',
  'Verification': 'सत्यापन',
  'Verified Employer': 'सत्यापित नियोक्ता',
  'Express Interest in Job': 'नौकरी में रुचि दिखाएं',
  'Interest Already Expressed': 'रुचि पहले ही व्यक्त की जा चुकी है',
  'My Applications & Status': 'मेरे आवेदन और स्थिति',
  'Your Application Status': 'आपके आवेदन की स्थिति',
  'Job Status': 'नौकरी की स्थिति',
  'Active & Hiring': 'सक्रिय और हायरिंग जारी',
  'Standard': 'सामान्य',
  'Job Requirement Details': 'नौकरी आवश्यकता विवरण',
  'Trade & Role': 'व्यापार और पद',
  'Shift & Timing': 'शिफ्ट और समय',
  'Live Hiring Funnel': 'लाइव हायरिंग फनल',
  'Live Progress': 'लाइव प्रगति',
  'Notified': 'सूचित',
  'Viewed': 'देखा',
  'Hired': 'हायर किया गया',
  'View Applicants & Select Hire': 'आवेदक देखें और हायर करें',
  'Review applicants, check match scores, and initiate hire requests.': 'आवेदकों की समीक्षा करें, मैच स्कोर जांचें और हायरिंग शुरू करें।',
  'Edit Job Parameters': 'नौकरी पैरामीटर संपादित करें',
  'Close Job Need': 'नौकरी आवश्यकता बंद करें',
  'Back to Job Detail': 'नौकरी विवरण पर वापस जाएं',
  'Edit Active Job': 'सक्रिय नौकरी संपादित करें',
  'Save Edits': 'बदलाव सहेजें',
  'Hired Worker Outside KaamSetu': 'कामसेतु के बाहर से कारीगर रखा',
  'No Longer Hiring for This Requirement': 'अब इस पद के लिए कारीगर की आवश्यकता नहीं है',
  'Confirm Closure': 'बंद करने की पुष्टि करें',
  'Please select the reason for closing this job requirement. Once closed, this job cannot be edited or reopened.': 'कृपया इस नौकरी को बंद करने का कारण चुनें। एक बार बंद होने के बाद, इसे दोबारा नहीं खोला जा सकता।',
  'Fallback Hiring Requirement': 'वैकल्पिक भर्ती आवश्यकता',
  'Search-First Recommendation': 'सर्च-फ़र्स्ट सुझाव',
  'KaamSetu connects you instantly with nearby workers. Job posting is a fallback when nearby candidate search returns no suitable matches.': 'कामसेतु आपको तुरंत आसपास के कारीगरों से जोड़ता है। नौकरी पोस्ट करना केवल तब करें जब सीधी खोज में कारीगर न मिले।',
  'Trade / Industry *': 'व्यापार / उद्योग *',
  'Profession / Role *': 'पेशा / पद *',
  'Min Exp (Yrs)': 'न्यूनतम अनुभव (वर्ष)',
  'Work Shift *': 'कार्य शिफ्ट *',
  'Working Timing': 'काम का समय',
  'Matching Radius': 'मिलान दायरा',
  'Publish Active Job': 'सक्रिय नौकरी प्रकाशित करें',
  'Posting Job...': 'नौकरी पोस्ट की जा रही है...',

  // Applicants & Candidate Review
  'INTERESTED CANDIDATES': 'इच्छुक उम्मीदवार',
  'REJECTED CANDIDATES': 'अस्वीकृत उम्मीदवार',
  'Sorted by Match Score': 'मैच स्कोर के अनुसार',
  'Workers nearby will appear here as they express interest in this job requirement.': 'जैसे ही आसपास के कारीगर इस नौकरी में रुचि दिखाएंगे, वे यहाँ दिखाई देंगे।',
  'Candidates you reject will be tracked here.': 'जिन उम्मीदवारों को आप अस्वीकार करेंगे, वे यहाँ दिखाई देंगे।',
  'View Worker Skill Passport →': 'कारीगर का स्किल पासपोर्ट देखें →',
  'Confirm Hire Selection': 'हायरिंग चयन की पुष्टि करें',
  'Are you sure you want to select': 'क्या आप वाकई चुनना चाहते हैं',
  'for this requirement?': 'इस पद के लिए?',
  'Atomic State Transition Notice': 'हायरिंग स्थिति सूचना',
  'This action will atomically mark the job as': 'यह कार्रवाई नौकरी को',
  'and send a 2-sided hire confirmation request to the worker.': 'के रूप में चिह्नित करेगी और कारीगर को पुष्टि अनुरोध भेजेगी।',

  // Hire Confirmations
  'Hire Request Detail': 'हायरिंग अनुरोध विवरण',
  'Verify job hire requests from employers': 'नियोक्ताओं से प्राप्त हायरिंग अनुरोधों की पुष्टि करें',
  'Response Required': 'प्रतिक्रिया आवश्यक',
  'Confirmed Hired': 'हायरिंग की पुष्टि हुई',
  'Declined (Mismatch)': 'अस्वीकृत (बेमेल)',
  'No Hire Requests': 'कोई हायरिंग अनुरोध नहीं',
  'When an employer selects you for a job, you will receive a hire confirmation prompt here to confirm or decline.': 'जब कोई नियोक्ता आपको काम के लिए चुनेगा, तो आपको पुष्टि या अस्वीकार करने के लिए यहाँ सूचना मिलेगी।',
  'Hire Confirmation Prompts': 'हायरिंग पुष्टि अनुरोध',
  'Trade Role:': 'व्यापार पद:',
  'Agreed Pay:': 'सहमति वेतन:',
  'Did you work on this job with': 'क्या आपने इनके साथ इस काम पर कार्य किया था:',
  'Confirming YES will mark this job as successfully completed on KaamSetu. Select NO if you did not work.': 'हाँ की पुष्टि करने से कामसेतु पर यह कार्य पूर्ण माना जाएगा। यदि आपने कार्य नहीं किया तो नहीं चुनें।',
  'YES, I Worked': 'हाँ, मैंने काम किया',
  'NO, I Did Not': 'नहीं, मैंने काम नहीं किया',
  'Two-sided hire confirmed! Both you and': 'हायरिंग की पुष्टि हो गई! आप और',
  'agreed on this job completion.': 'दोनों ने कार्य पूर्ण होने पर सहमति व्यक्त की।',
  'Hire mismatch logged. Job remains permanently closed on KaamSetu.': 'हायरिंग मिसमैच दर्ज किया गया। नौकरी कामसेतु पर बंद रहेगी।',
  'Back to Confirmations List': 'पुष्टि सूची पर वापस जाएं',

  // Onboarding Pages
  'GPS Spatial Precision': 'जीपीएस स्थान सटीकता',
  'Use exact device coordinates for high-precision worker matching': 'सटीक कारीगर मिलान के लिए डिवाइस निर्देशांक का उपयोग करें',
  'Use exact device coordinates for employer location matching': 'नियोक्ता लोकेशन मिलान के लिए डिवाइस निर्देशांक का उपयोग करें',
  'GPS Captured': 'जीपीएस स्थान प्राप्त हुआ',
  'Exact device GPS point saved for spatial query': 'सटीक जीपीएस स्थान सुरक्षित किया गया',
  'Save Address & Next': 'पता सहेजें और आगे बढ़ें',
  'Work Experience': 'कार्य अनुभव',
  'Add your shop experience and skills': 'अपनी दुकान का अनुभव और कौशल जोड़ें',
  'Trade / Shop Type': 'व्यापार / दुकान का प्रकार',
  'Job Role / Profession': 'पद / पेशा',
  'Previous Employer / Shop Name': 'पूर्व नियोक्ता / दुकान का नाम',
  'Core Skills (comma separated)': 'मुख्य कौशल (कॉमा से अलग करें)',
  'Save & Continue': 'सहेजें और आगे बढ़ें',
  'Worker Preferences': 'कारीगर प्राथमिकताएं',
  'Set your expected salary & availability': 'अपेक्षित वेतन और उपलब्धता सेट करें',
  'Set myself Available for work': 'स्वयं को काम के लिए उपलब्ध सेट करें',
  'Initial profile preference stored during onboarding': 'ऑनबोर्डिंग के दौरान प्रारंभिक प्रोफ़ाइल प्राथमिकता',
  'Complete Onboarding': 'पंजीकरण पूरा करें',

  // Permissions copy
  'Discover Hyperlocal Opportunities': 'स्थानीय अवसर खोजें',
  'Never Miss a Local Opportunity': 'स्थानीय अवसर कभी न चूकें',
  'KaamSetu uses your spatial location to connect you with employers and jobs within your proximity': 'कामसेतु आपको निकटतम नियोक्ताओं और नौकरियों से जोड़ने के लिए आपके स्थान का उपयोग करता है',
  'Your location is kept strictly private and secure, and is used exclusively for proximity matching and connecting you with nearby opportunities.': 'आपकी लोकेशन पूरी तरह से निजी और सुरक्षित रखी जाती है, और इसका उपयोग केवल निकटतम अवसरों से जोड़ने के लिए किया जाता है।',
  'Get real-time alerts when shop owners search for workers in your trade or send job invitations.': 'जब दुकानदार आपके व्यापार में कारीगर खोजें या आमंत्रण भेजें तो तुरंत अलर्ट प्राप्त करें।',
  'Notifications help you respond instantly when local shop owners match with your profile or send hiring requests.': 'सूचनाएं आपको स्थानीय दुकानदारों के अनुरोधों पर तुरंत प्रतिक्रिया देने में मदद करती हैं।',

  // Canonical Trades
  'ELECTRICAL': 'बिजली की दुकान',
  'HARDWARE': 'हार्डवेयर स्टोर',
  'SALON': 'सैलून / पार्लर',
  'GROCERY': 'किराना स्टोर',
  'RESTAURANT': 'रेस्टोरेंट / कैफ़े',
  'MEDICAL': 'मेडिकल स्टोर',
  'GARAGE': 'ऑटो गैरेज',
  'OTHER': 'अन्य',
  'Electrical': 'बिजली की दुकान',
  'Hardware': 'हार्डवेयर स्टोर',
  'Salon / Beauty': 'सैलून / पार्लर',
  'Salon / Parlour': 'सैलून / पार्लर',
  'Grocery / Retail': 'किराना स्टोर',
  'Grocery / Kirana': 'किराना स्टोर',
  'Restaurant / Food': 'रेस्टोरेंट / कैफ़े',
  'Restaurant / Cafe': 'रेस्टोरेंट / कैफ़े',
  'Medical / Pharmacy': 'मेडिकल स्टोर',
  'Medical Store': 'मेडिकल स्टोर',
  'Medical': 'मेडिकल स्टोर',
  'Garage / Auto': 'ऑटो गैरेज',
  'Auto Garage': 'ऑटो गैरेज',
  'Other': 'अन्य',
  'Electrical Shop': 'बिजली की दुकान',

  // Professions
  'HELPER': 'हेल्पर / सहायक',
  'BILLER': 'बिलर / मुनीम',
  'SALES': 'सेल्स / विक्रेता',
  'BARBER': 'नाई / हेयर ड्रेसर',
  'WAITER': 'वेटर / सर्वर',
  'MECHANIC': 'मैकेनिक',
  'CASHIER': 'कैशियर',
  'DELIVERY': 'डिलीवरी बॉय',
  'Helper': 'हेल्पर / सहायक',
  'Biller': 'बिलर / मुनीम',
  'Sales Assistant': 'सेल्स / विक्रेता',
  'Sales Counter': 'सेल्स काउंटर',
  'Barber / Stylist': 'नाई / हेयर ड्रेसर',
  'Waiter / Server': 'वेटर / सर्वर',
  'Waiter': 'वेटर',
  'Mechanic': 'मैकेनिक',
  'Cashier': 'कैशियर',
  'Delivery': 'डिलीवरी बॉय',
  'Delivery Assistant': 'डिलीवरी सहायक',

  // Extra Onboarding & UI Phrases
  'Enter 6-digit OTP (Mock: 123456)': '6 अंकों का ओटीपी दर्ज करें (मॉक: 123456)',
  'Please enter your 10-digit registered mobile number': 'कृपया अपना 10 अंकों का पंजीकृत मोबाइल नंबर दर्ज करें',
  'Please enter the 6-digit verification OTP': 'कृपया 6 अंकों का सत्यापन ओटीपी दर्ज करें',
  'Please enter a new 6-digit PIN': 'कृपया एक नया 6 अंकों का पिन दर्ज करें',
  'This mobile number is not registered with KaamSetu. Please verify your number or register as a new user.': 'यह मोबाइल नंबर कामसेतु में पंजीकृत नहीं है। कृपया अपना नंबर जांचें या नया खाता बनाएं।',
  'The OTP entered is incorrect or has expired. Please try again.': 'दर्ज किया गया ओटीपी गलत है या समाप्त हो गया है। कृपया पुनः प्रयास करें।',
  'Invalid OTP or PIN format. Please check your details and try again.': 'ओटीपी या पिन का प्रारूप अमान्य है। कृपया अपने विवरण की जाँच करें और पुनः प्रयास करें।',
  'Unable to send OTP. Please check your mobile number and try again.': 'ओटीपी भेजने में असमर्थ। कृपया अपना मोबाइल नंबर जांचें और पुनः प्रयास करें।',
  'Unable to reset PIN. Please check your details and try again.': 'पिन रीसेट करने में असमर्थ। कृपया अपने विवरण की जाँच करें और पुनः प्रयास करें।',
  'Hide PIN': 'पिन छुपाएं',
  'Show PIN': 'पिन देखें',
  'Loading business details...': 'व्यापार विवरण लोड हो रहा है...',
  'Loading address details...': 'पता विवरण लोड हो रहा है...',
  'Loading Skill Passport...': 'स्किल पासपोर्ट लोड हो रहा है...',
  'Worker profile not found.': 'कारीगर प्रोफ़ाइल नहीं मिली।',
  'Business Trade / Category': 'व्यापार श्रेणी',
  'Click to capture or select a photo (JPEG, PNG up to 10MB)': 'फोटो खींचने या चुनने के लिए क्लिक करें (JPEG, PNG 10MB तक)',
  'Processing photo...': 'फोटो प्रोसेस हो रही है...',
  'Shop photo saved!': 'दुकान की फोटो सुरक्षित हो गई!',
  'Shop No., Market / Building': 'दुकान नं., बाज़ार / इमारत',
  'e.g. Flat 202, Block B': 'उदा. फ्लैट 202, ब्लॉक बी',
  'e.g. Sector 143': 'उदा. सेक्टर 143',
  'e.g. Noida': 'उदा. नोएडा',
  'e.g. 201301': 'उदा. 201301',
  'Worker Address': 'कारीगर का पता',
  'Set your primary work location': 'अपना प्राथमिक कार्य स्थान सेट करें',
  'Profile preference stored. You can manage your 12-hour real-time availability anytime from your Worker Home dashboard.': 'प्रोफ़ाइल प्राथमिकता सहेजी गई। आप अपने होम डैशबोर्ड से कभी भी अपनी 12 घंटे की उपलब्धता प्रबंधित कर सकते हैं।',
  'Two-sided hire confirmed! Both parties agreed on job completion.': 'हायरिंग की पुष्टि हो गई! दोनों पक्षों ने कार्य पूर्ण होने पर सहमति जताई।',
  'Hire mismatch logged. Job remains permanently closed.': 'हायरिंग मिसमैच दर्ज किया गया। नौकरी बंद रहेगी।',
  'Confirmation not found': 'पुष्टि विवरण नहीं मिला',
  'View All Confirmations': 'सभी पुष्टियां देखें',
  'Confirming YES marks this job as successfully completed. Select NO if you did not work.': 'हाँ की पुष्टि करने से काम पूरा माना जाएगा। यदि काम नहीं किया तो नहीं चुनें।',
  'OTP sent to your registered mobile number (Mock OTP: 123456)': 'आपके पंजीकृत मोबाइल नंबर पर ओटीपी भेजा गया (मॉक ओटीपी: 123456)',
  'PIN reset successfully! Please log in with your new PIN.': 'पिन सफलतापूर्वक रीसेट हो गया! कृपया अपने नए पिन से लॉग इन करें।',
  'Invalid phone number or PIN': 'अमान्य फोन नंबर या पिन',
  'Too many failed login attempts. Account locked for 15 minutes.': 'बहुत सारे असफल प्रयास। खाता 15 मिनट के लिए लॉक है।',
  'Shop / Business Name': 'दुकान / व्यापार का नाम',
  'Day': 'दिन',
  'Night': 'रात',
  '1 km': '1 कि.मी.',
  '5 km': '5 कि.मी.',
  '10 km': '10 कि.मी.',
  '10+ km': '10+ कि.मी.',
  'Monthly Salary (₹) *': 'मासिक वेतन (₹) *',
  'Search': 'खोजें',
  'Loading...': 'लोड हो रहा है...',
  'Please enter your full name': 'कृपया अपना पूरा नाम दर्ज करें',
  'Please enter a valid 10-digit phone number': 'कृपया 10 अंकों का मान्य फोन नंबर दर्ज करें',
  'Please enter a valid 10-digit mobile number': 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें',
  'Please enter a 6-digit security PIN': 'कृपया 6 अंकों का सुरक्षा पिन दर्ज करें',
  'Please enter a valid 12-digit Aadhaar number for identity verification': 'कृपया पहचान सत्यापन के लिए 12 अंकों का आधार नंबर दर्ज करें',
  'Worker sign up failed': 'कारीगर पंजीकरण विफल रहा',
  'Please enter your business or shop name': 'कृपया अपनी दुकान या व्यापार का नाम दर्ज करें',
  'Please enter owner / manager name': 'कृपया मालिक / प्रबंधक का नाम दर्ज करें',
  'Employer sign up failed': 'नियोक्ता पंजीकरण विफल रहा',
  'e.g. Ramesh Kumar': 'उदा. रमेश कुमार',
  'e.g. Sharma Electricals & Hardware': 'उदा. शर्मा इलेक्ट्रिकल्स एंड हार्डवेयर',
  'e.g. Suresh Sharma': 'उदा. सुरेश शर्मा',
  '10-digit mobile number': '10 अंकों का मोबाइल नंबर',
  '12-digit Aadhaar number': '12 अंकों का आधार नंबर',
  'Network error fetching job details.': 'नौकरी विवरण लोड करने में नेटवर्क त्रुटि।',
  'Failed to fetch job details.': 'नौकरी विवरण लाने में विफल।',
  'Network error submitting interest.': 'रुचि दर्ज करने में नेटवर्क त्रुटि।',
  'Failed to express interest in job.': 'नौकरी में रुचि व्यक्त करने में विफल।',
  'Your interest has been submitted! The employer will review your profile.': 'आपकी रुचि प्रस्तुत की गई है! नियोक्ता आपकी प्रोफ़ाइल की समीक्षा करेगा।',
  '500 KM+': '500+ कि.मी.',
  '500+ KM': '500+ कि.मी.',
  'Hired Workers': 'हायर किए गए कारीगर',
  'My Hired Workers': 'मेरे हायर किए गए कारीगर',
  'Hired Candidate': 'हायर किया गया उम्मीदवार',
  'Job Closed': 'नौकरी बंद',
  'View Hired Worker': 'हायर किया गया कारीगर देखें',
  'This job requirement is closed. Candidate selection and hiring actions are finalized.': 'यह नौकरी आवश्यकता बंद हो चुकी है। उम्मीदवार चयन और हायरिंग निर्णय अंतिम हैं।',
  'No hired workers yet': 'अभी तक कोई कारीगर हायर नहीं किया गया',
  'When you hire candidates for your jobs, they will appear here with full contact details.': 'जब आप अपनी नौकरियों के लिए कारीगर हायर करेंगे, तो वे यहाँ पूरी संपर्क जानकारी के साथ दिखाई देंगे।',
  'Confirmed': 'पुष्टि हुई',
  'No matching candidates found in 500KM+ radius': '500+ कि.मी. के दायरे में कोई उम्मीदवार नहीं मिला',
  'No matching jobs found in 500KM+ radius': '500+ कि.मी. के दायरे में कोई नौकरी नहीं मिली',
  'Hired Worker Details': 'हायर किए गए कारीगर का विवरण',
  'Hired via KaamSetu': 'कामसेतु द्वारा हायर किया गया',
  'Confirmed Hire': 'पुष्टि की गई हायरिंग',
  'Hired Worker': 'हायर किया गया कारीगर',
  'View All Hired Workers': 'सभी हायर किए गए कारीगर देखें',
  'View Workers': 'कारीगर देखें',
  'Position Filled · Actions Disabled': 'पद भर गया · कार्रवाई अक्षम',
  'Job Requirement Closed': 'नौकरी की आवश्यकता बंद',
  'Candidate actions are disabled because this job is closed.': 'यह नौकरी बंद होने के कारण उम्मीदवार पर कार्रवाई अक्षम है।',
  'Hiring Concluded · Job Closed': 'हायरिंग समाप्त · नौकरी बंद',
  'Verified Workers Hired via KaamSetu': 'कामसेतु के जरिए हायर किए गए सत्यापित कारीगर',
  'Passport': 'पासपोर्ट',
  'Call': 'कॉल करें',
  'No Phone': 'फोन नंबर नहीं',

  // Job View & Workplace Address
  'Shop & Workplace Address': 'दुकान / कार्यस्थल का पता',
  'Workplace Location': 'कार्यस्थल स्थान',
  'Get Directions (Google Maps)': 'दिशा-निर्देश (Google Maps)',
  'Directions': 'दिशा-निर्देश',
  'Address not configured by employer': 'नियोक्ता द्वारा पता दर्ज नहीं किया गया',
  'Posted by': 'द्वारा पोस्ट किया गया:',
  'OFFERED PAY': 'प्रस्तावित वेतन',
  'Offered Pay': 'प्रस्तावित वेतन',
  'Submitted on': 'आवेदन दिनांक:',
  'Recently': 'हाल ही में',
  'Success!': 'सफल!',

  // Fresher Onboarding
  'I am a Fresher': 'मैं एक फ्रेशर हूँ',
  'I am a Fresher (No previous work experience)': 'मैं एक फ्रेशर हूँ (कोई पिछला अनुभव नहीं)',
  'I am a Fresher (No prior shop work experience)': 'मैं एक फ्रेशर हूँ (दुकान का कोई पूर्व कार्य अनुभव नहीं)',
  'No prior shop work experience (0 years)': 'दुकान का कोई पूर्व कार्य अनुभव नहीं (0 वर्ष)',
  'Select trade & role you wish to work in; experience will be set to 0.': 'जिस काम को आप करना चाहते हैं उसे चुनें; अनुभव 0 सेट किया जाएगा।',
  'Fresher Status': 'फ्रेशर स्थिति',
  'Fresher (Looking for First Job)': 'फ्रेशर (पहली नौकरी की तलाश में)',
  '0 Years (Fresher)': '0 वर्ष (फ्रेशर)',
  'As a fresher, your experience is set to 0.0 years. Select the trade and role you want to work in.': 'एक फ्रेशर के रूप में, आपका अनुभव 0.0 वर्ष निर्धारित है। वह व्यापार और पद चुनें जिसमें आप काम करना चाहते हैं।',
  'Total work experience will be saved as 0 months. You will be matched with employers looking for entry-level and fresher workers in this trade.': 'कुल कार्य अनुभव 0 महीने के रूप में सहेजा जाएगा। आपको इस व्यापार में शुरुआती और फ्रेशर कारीगरों की तलाश करने वाले नियोक्ताओं से मिलाया जाएगा।',
  'Fresher': 'फ्रेशर',

  // Units & Measurements
  '/ month': '/ माह',
  '/ mo': '/ माह',
  'Min': 'न्यूनतम',
  'Max': 'अधिकतम',
  'km radius': 'कि.मी. दायरा',
  'Standard Timing': 'सामान्य समय',
  'Months': 'महीने',

  // Search & Discovery
  'Search Radius Distance': 'खोज का दायरा (दूरी)',
  'Search Radius': 'खोज दायरा',
  'ACTIVE JOBS NEARBY': 'सक्रिय नौकरियां आसपास',
  'WORKERS FOUND NEARBY': 'कारीगर आसपास उपलब्ध',
  'Sorted by Date & Distance': 'दिनांक और दूरी अनुसार',
  'View Details & Apply': 'विवरण देखें और आवेदन करें',
  'View Details & Apply →': 'विवरण देखें और आवेदन करें →',
  'Expand Radius by +50 KM': 'दायरा +50 कि.मी. बढ़ाएं',
  'Expand Radius to Maximum (500 KM)': 'दायरा अधिकतम (500 कि.मी.) करें',
  'No active jobs found within': 'के भीतर कोई सक्रिय नौकरी नहीं मिली',
  'No employers have posted active jobs matching your criteria within': 'आपके द्वारा चुने गए दायरे में किसी नियोक्ता ने सक्रिय नौकरी पोस्ट नहीं की है:',
  'Try expanding your search radius.': 'कृपया अपना खोज दायरा बढ़ाकर देखें।',

  // Match Breakdown
  'Match Breakdown': 'मैच विवरण',
  'Total': 'कुल',
  'Trade (35%):': 'व्यापार (35%):',
  'Profession (30%):': 'पेशा / पद (30%):',
  'Experience (15%):': 'अनुभव (15%):',
  'Distance (15%):': 'दूरी (15%):',
  'Availability (5%):': 'उपलब्धता (5%):',

  // Worker Profile & Contact Box
  'Expected Monthly Pay': 'अपेक्षित मासिक वेतन',
  'Registered Mobile Number': 'पंजीकृत मोबाइल नंबर',
  'Direct Phone Number': 'सीधा फोन नंबर',
  'Call Now': 'कॉल करें',
  'Masked': 'सुरक्षित / छुपाया गया',
  'View Contact Number': 'संपर्क नंबर देखें',
  'Experience Summary': 'अनुभव सारांश',
  'Shop / Business:': 'दुकान / व्यापार:',
  'Duration:': 'अवधि:',
  'Not specified': 'दर्ज नहीं है',
  'Local Area': 'स्थानीय क्षेत्र',
  'Self Profile': 'स्वयं की प्रोफ़ाइल',
  'Verified': 'सत्यापित',
  'Uploading...': 'अपलोड हो रहा है...',
  'Change Profile Photo': 'प्रोफ़ाइल फोटो बदलें',
  'Profile updated successfully!': 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!',
  'Profile photo updated successfully!': 'प्रोफ़ाइल फोटो सफलतापूर्वक अपडेट हो गई!',
  'Local Worker': 'स्थानीय कारीगर',
  'Address not configured': 'पता दर्ज नहीं किया गया',
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (text: string) => text,
  translateTrade: (trade: string) => trade,
  translateProfession: (prof: string) => prof,
  translateStatus: (status: string) => status,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kaamsetu_lang') as Language;
      if (saved === 'hi' || saved === 'en') {
        setLanguageState(saved);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('kaamsetu_lang', lang);
    } catch (e) {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'hi' : 'en';
    setLanguage(next);
  };

  const t = (text: string, defaultText?: string): string => {
    if (!text) return defaultText || '';
    if (language === 'hi') {
      const trimmed = text.trim();
      return DICTIONARY[trimmed] || defaultText || text;
    }
    return defaultText || text;
  };

  const TRADE_CANONICAL_EN: Record<string, string> = {
    ELECTRICAL: 'Electrical Shop',
    HARDWARE: 'Hardware Store',
    SALON: 'Salon / Parlour',
    GROCERY: 'Grocery / Kirana',
    RESTAURANT: 'Restaurant / Cafe',
    MEDICAL: 'Medical Store',
    GARAGE: 'Auto Garage',
    OTHER: 'Other',
  };

  const TRADE_CANONICAL_HI: Record<string, string> = {
    ELECTRICAL: 'बिजली की दुकान',
    HARDWARE: 'हार्डवेयर स्टोर',
    SALON: 'सैलून / पार्लर',
    GROCERY: 'किराना स्टोर',
    RESTAURANT: 'रेस्टोरेंट / कैफ़े',
    MEDICAL: 'मेडिकल स्टोर',
    GARAGE: 'ऑटो गैरेज',
    OTHER: 'अन्य',
  };

  const TRADE_ALIAS_MAP: Record<string, string> = {
    'ELECTRICAL': 'ELECTRICAL',
    'ELECTRICAL SHOP': 'ELECTRICAL',
    'ELECTRICIAN': 'ELECTRICAL',
    'HARDWARE': 'HARDWARE',
    'HARDWARE STORE': 'HARDWARE',
    'SALON': 'SALON',
    'SALON / BEAUTY': 'SALON',
    'SALON / PARLOUR': 'SALON',
    'BEAUTY': 'SALON',
    'GROCERY': 'GROCERY',
    'GROCERY / RETAIL': 'GROCERY',
    'GROCERY / KIRANA': 'GROCERY',
    'KIRANA': 'GROCERY',
    'KIRANA / GROCERY': 'GROCERY',
    'RESTAURANT': 'RESTAURANT',
    'RESTAURANT / FOOD': 'RESTAURANT',
    'RESTAURANT / CAFE': 'RESTAURANT',
    'RESTAURANT / DHABA': 'RESTAURANT',
    'CAFE': 'RESTAURANT',
    'MEDICAL': 'MEDICAL',
    'MEDICAL STORE': 'MEDICAL',
    'MEDICAL / PHARMACY': 'MEDICAL',
    'PHARMACY': 'MEDICAL',
    'GARAGE': 'GARAGE',
    'AUTO GARAGE': 'GARAGE',
    'GARAGE / AUTO': 'GARAGE',
    'AUTO': 'GARAGE',
    'OTHER': 'OTHER',
  };

  const PROFESSION_CANONICAL_EN: Record<string, string> = {
    HELPER: 'Helper',
    BILLER: 'Biller',
    SALES: 'Sales Assistant',
    BARBER: 'Barber / Stylist',
    WAITER: 'Waiter / Server',
    MECHANIC: 'Mechanic',
    CASHIER: 'Cashier',
    DELIVERY: 'Delivery',
    OTHER: 'Other',
  };

  const PROFESSION_CANONICAL_HI: Record<string, string> = {
    HELPER: 'हेल्पर / सहायक',
    BILLER: 'बिलर / मुनीम',
    SALES: 'सेल्स / विक्रेता',
    BARBER: 'नाई / हेयर ड्रेसर',
    WAITER: 'वेटर / सर्वर',
    MECHANIC: 'मैकेनिक',
    CASHIER: 'कैशियर',
    DELIVERY: 'डिलीवरी बॉय',
    OTHER: 'अन्य',
  };

  const PROFESSION_ALIAS_MAP: Record<string, string> = {
    'HELPER': 'HELPER',
    'HELPER / ASSISTANT': 'HELPER',
    'BILLER': 'BILLER',
    'BILLER / MUNIM': 'BILLER',
    'SALES': 'SALES',
    'SALES ASSISTANT': 'SALES',
    'SALES COUNTER': 'SALES',
    'BARBER': 'BARBER',
    'BARBER / STYLIST': 'BARBER',
    'WAITER': 'WAITER',
    'WAITER / SERVER': 'WAITER',
    'MECHANIC': 'MECHANIC',
    'AUTO MECHANIC': 'MECHANIC',
    'CASHIER': 'CASHIER',
    'DELIVERY': 'DELIVERY',
    'DELIVERY BOY': 'DELIVERY',
    'DELIVERY ASSISTANT': 'DELIVERY',
    'OTHER': 'OTHER',
  };

  const translateTrade = (trade: string): string => {
    if (!trade) return '';
    const clean = trade.trim().toUpperCase();
    const key = TRADE_ALIAS_MAP[clean] || (TRADE_CANONICAL_EN[clean] ? clean : null);
    if (key) {
      return language === 'hi' ? TRADE_CANONICAL_HI[key] : TRADE_CANONICAL_EN[key];
    }
    return language === 'hi' ? DICTIONARY[trade.trim()] || trade : trade;
  };

  const translateProfession = (prof: string): string => {
    if (!prof) return '';
    const clean = prof.trim().toUpperCase();
    const key = PROFESSION_ALIAS_MAP[clean] || (PROFESSION_CANONICAL_EN[clean] ? clean : null);
    if (key) {
      return language === 'hi' ? PROFESSION_CANONICAL_HI[key] : PROFESSION_CANONICAL_EN[key];
    }
    return language === 'hi' ? DICTIONARY[prof.trim()] || prof : prof;
  };

  const translateStatus = (status: string): string => {
    if (!status) return '';
    return language === 'hi' ? DICTIONARY[status.trim()] || status : status;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        translateTrade,
        translateProfession,
        translateStatus,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export function T({ text, fallback }: { text: string; fallback?: string }) {
  const { t } = useLanguage();
  return <>{t(text, fallback)}</>;
}
