import React from "react";
import ReCAPTCHA from "react-google-recaptcha";

type Interface = {
  captchaRef: React.RefObject<ReCAPTCHA>;
};

const GoogleRecaptcha = ({ captchaRef }: Interface) => {
  const sitekey = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY;
  if (!sitekey) {
    console.error("Google Recaptcha sitekey not found");
    return false;
  }
  return <ReCAPTCHA sitekey={sitekey} ref={captchaRef} size="invisible" />;
};

export default GoogleRecaptcha;
