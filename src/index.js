import { Buffer } from "buffer";
import crypto from "crypto";
import captchaPage from "./captcha-challenge-fastly.html";

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)));

async function handleRequest(event) {
  let req = event.request;
  const local = fastly.env.get("FASTLY_HOSTNAME") === "localhost";

  // If testing locally, add the x-orig-host header with a dummy domain to skip the header validation in the next if-block
  if (local) {
    req.headers.set("x-orig-host", "example.com");
  }

  // The x-orig-host header is required for the request
  if (!req.headers.has("x-orig-host")) {
    return new Response("Missing required request headers", {
      status: 400,
    });
  }

  let url = new URL(req.url);
  const isChallenge = url.searchParams.has("captcha");

  if (req.method === "POST" && isChallenge) {
    const captchaConfig = new Dictionary("captcha_config");
    const secretKey = captchaConfig.get("recaptcha_secret_key");
    const isPass = await handleCaptchaRequest(req, secretKey);

    if (isPass) {
      console.log("It's a pass! returning a response with a token set in the session cookie");
      // It's a pass! Set a cookie, so that this user is not challenged again within the token lifetime
      // If isPass is false, fall through to the remainder of the function and redisplay the CAPTCHA page

      // Get params and generate token
      const tokenLifetime = captchaConfig.get("token_lifetime");
      const sharedSecret = captchaConfig.get("shared_secret");
      const domainName = req.headers.get("x-orig-host");
      const token = generateToken(tokenLifetime, sharedSecret, domainName);

      let headers = new Headers();
      url.searchParams.delete("captcha");
      headers.set("Location", url.pathname);
      headers.set("Cache-Control", "private, no-store");
      headers.set("Set-Cookie", `captchaAuth=${token}; path=/; max-age=${tokenLifetime}`);

      return new Response("", { status: 302, headers });
    }
  }

  // Return the CAPTCHA page
  let headers = new Headers();
  headers.set("Content-Type", "text/html; charset=utf-8");
  let body = captchaPage;
  return new Response(body, { status: 200, headers });
}

// The token generation logic is based on the content of this page
// https://docs.fastly.com/en/guides/enabling-url-token-validation#configuring-your-application
//
// Generate token from domain name and token expiration time
function generateToken(tokenLifetime, sharedSecret, domainName) {
  // Calculate token expiration time
  const tokenExpiration = Math.round(Date.now() / 1000 + parseInt(tokenLifetime));

  // Generate signature and convert to HEX
  const key = Buffer.from(sharedSecret, "base64");
  const stringToSign = domainName + String(tokenExpiration);
  const tokenSignature = crypto.createHmac("sha1", key).update(stringToSign).digest("hex");

  // Generate a token from expiration and signature
  const token = String(tokenExpiration) + "_" + tokenSignature;
  return token;
}

async function handleCaptchaRequest(req, secretKey) {
  // Extract the user's response from the POST body and verify it with the reCAPTCHA API.
  const body = await req.text();
  const captcha = body.split("=")[1];
  const captchaURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
  const captchaReq = new Request(captchaURL);
  const cacheOverride = new CacheOverride("pass");

  console.log("Sending to CAPTCHA API to verify");
  let res = await fetch(captchaReq, {
    backend: "captcha_backend",
    cacheOverride,
  });

  const result = await res.json();
  return result.success || false;
}
