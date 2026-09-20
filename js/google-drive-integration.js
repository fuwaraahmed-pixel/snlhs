/**
 * Shahera Nayeb Laboratory High School
 * Google Drive & Google Sheets Integration Helper (100% Free Setup)
 */

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyILVijIB4XhEn24c1uqQK24WbzBN7tpsC2t3_Q6mDM_Y6mPWQfkCyPQAYOT3oTEo77VQ/exec';

/**
 * Fetch Notices dynamically from Google Sheet with fallback to local JSON
 */
async function fetchNoticesFromGoogleSheet() {
  try {
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=get_notices`);
    if (!response.ok) throw new Error('Google Script response error');
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Could not fetch notices from Google Sheet, loading local fallback data:', err);
  }

  // Fallback to local notices.json
  try {
    const localRes = await fetch('../data/notices.json');
    if (!localRes.ok) {
      const rootRes = await fetch('data/notices.json');
      return await rootRes.json();
    }
    return await localRes.json();
  } catch (e) {
    console.error('Fallback notices error:', e);
    return [];
  }
}

/**
 * Submit Admission Form to Google Sheet & Drive
 */
async function submitAdmissionToGoogleSheet(payload) {
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'submit_admission',
        ...payload
      })
    });
    const resText = await response.text();
    try {
      return JSON.parse(resText);
    } catch {
      return { status: 'success', message: 'আবেদন সফলভাবে গৃহীত হয়েছে!' };
    }
  } catch (err) {
    console.error('Error submitting admission form:', err);
    throw err;
  }
}

/**
 * Submit Contact Form to Google Sheet
 */
async function submitContactToGoogleSheet(payload) {
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'submit_contact',
        ...payload
      })
    });
    const resText = await response.text();
    try {
      return JSON.parse(resText);
    } catch {
      return { status: 'success', message: 'বার্তা সফলভাবে পাঠানো হয়েছে!' };
    }
  } catch (err) {
    console.error('Error submitting contact form:', err);
    throw err;
  }
}
