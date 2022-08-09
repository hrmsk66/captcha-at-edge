export default {
  recaptcha: {
    class: "g-recaptcha",
    backend: "recaptcha",
    scriptURL: "https://www.google.com/recaptcha/api.js",
    siteVerifyURL: "https://www.google.com/recaptcha/api/siteverify",
  },
  hcaptcha: {
    class: "h-captcha",
    backend: "hcaptcha",
    scriptURL: "https://js.hcaptcha.com/1/api.js",
    siteVerifyURL: "https://hcaptcha.com/siteverify",
  },
};
