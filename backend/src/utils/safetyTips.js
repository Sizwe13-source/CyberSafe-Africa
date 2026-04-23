// src/utils/safetyTips.js

export const getSafetyTips = (type) => {
  const tips = {
    Phishing: [
      "Do not click unknown or suspicious links",
      "Verify the sender's email address carefully",
      "Enable two-factor authentication (2FA)",
      "Avoid entering sensitive information on unfamiliar websites",
    ],

    Scam: [
      "Do not send money to unknown individuals",
      "Avoid offers that sound too good to be true",
      "Verify identities before responding to requests",
      "Be cautious of urgent payment requests",
    ],

    Malware: [
      "Avoid downloading files from unknown sources",
      "Install trusted antivirus software",
      "Keep your system and apps updated",
      "Do not install APKs or unknown software",
    ],

    "Fake Website": [
      "Check the website URL carefully",
      "Look for HTTPS and valid certificates",
      "Avoid logging into suspicious websites",
      "Verify the website through official sources",
    ],

    "Social Engineering": [
      "Be cautious of people asking for sensitive information",
      "Do not trust urgent or emotional requests blindly",
      "Verify identities before taking action",
      "Avoid sharing personal or financial data",
    ],

    "Data Breach": [
      "Change your passwords immediately",
      "Use strong, unique passwords",
      "Enable two-factor authentication",
      "Monitor your accounts for unusual activity",
    ],

    Other: [
      "Stay cautious when interacting online",
      "Avoid sharing sensitive information",
      "Keep your software updated",
    ],
  };

  return tips[type] || tips["Other"];
};