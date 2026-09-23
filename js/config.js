/**
 * Shahera Nayeb Laboratory High School
 * Centralized Institutional Configuration & Site Settings
 */

const SCHOOL_CONFIG = {
  nameBn: "সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল",
  nameEn: "Shahera Nayeb Laboratory High School",
  slogan: "শিক্ষা • শৃঙ্খলা • চরিত্র",
  eiin: "১২৩৪৫৬", // Reference: NEEDS_CONTENT.md
  boardCode: "ঢাকা শিক্ষা বোর্ড",
  establishedYear: "১৯৯৮",
  
  // Contact Information
  phone: "01531927956",
  email: "snlhs07@gmail.com",
  address: "সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল ক্যাম্পাস, ঢাকা, বাংলাদেশ",
  officeHours: "রবি - বৃহস্পতি: সকাল ৮:০০ - বিকাল ৫:০০",
  
  // Principal Info
  principalName: "প্রধান শিক্ষক (ভারপ্রাপ্ত)",
  principalDesignation: "প্রধান শিক্ষক",
  
  // External Integration / Form endpoints
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbyILVijIB4XhEn24c1uqQK24WbzBN7tpsC2t3_Q6mDM_Y6mPWQfkCyPQAYOT3oTEo77VQ/exec",
  
  // Social links
  social: {
    facebook: "https://facebook.com",
    youtube: "https://youtube.com"
  }
};

// Freeze config object to prevent accidental mutation
Object.freeze(SCHOOL_CONFIG);
