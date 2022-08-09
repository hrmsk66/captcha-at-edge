This README describes how to configure the VCL service to forward high-risk requests to the C@E app for validation.

## Installation

1. Add a VCL snippet below and select "init" as snippet type. Replace `XXX` with the domain of the C@E service. Also replace `YYY` with the service ID of the VCL service.

```vcl
# The backend definition for the Compute@Edge service
backend F_captcha {
    .bypass_local_route_table = true;
    .always_use_host_header = true;
    .between_bytes_timeout = 10s;
    .connect_timeout = 1s;
    .dynamic = true;
    .first_byte_timeout = 15s;
    .host = "XXX.edgecompute.app";
    .host_header = "XXX.edgecompute.app";
    .max_connections = 200;
    .port = "443";
    .share_key = "YYY";
    .ssl = true;
    .ssl_cert_hostname = "XXX.edgecompute.app";
    .ssl_check_cert = always;
    .ssl_sni_hostname = "XXX.edgecompute.app";
    .probe = {
        .dummy = true;
        .initial = 5;
        .request = "HEAD / HTTP/1.1"  "Host: XXX.edgecompute.app" "Connection: close";
        .threshold = 1;
        .timeout = 2s;
        .window = 5;
      }
}

# The token verification logic is based on the content of this page
# https://docs.fastly.com/en/guides/enabling-url-token-validation

sub token_is_valid BOOL {
  declare local var.token STRING;
  declare local var.token_expiration STRING;
  declare local var.token_signature STRING;
  declare local var.string_to_sign STRING;
  declare local var.shared_secret STRING;

  # Extract token from cookie
  set var.token =req.http.cookie:captchaAuth;

  # Make sure there is a token
  if (var.token == "") {
    return false;
  }

  # Make sure there is a valid expiration and signature
  if (var.token !~ "^(\d{10,11})_([a-f0-9]{40})$") {
    return false;
  }

  # Extract token expiration and signature
  set var.token_expiration = re.group.1;
  set var.token_signature = re.group.2;

  # Generate string to sign
  set var.string_to_sign = req.http.host + var.token_expiration;

  # Get shared secret from the dictionary
  set var.shared_secret = table.lookup(captcha_config, "shared_secret");

  # Make sure the signature is valid
  if (!digest.secure_is_equal(var.token_signature, regsub(digest.hmac_sha1(digest.base64_decode(var.shared_secret), var.string_to_sign), "^0x", ""))) {
    return false;
  }

  # Make sure the expiration time has not elapsed
  if (time.is_after(now, std.integer2time(std.atoi(var.token_expiration)))) {
    return false;
  }

  return true;
}
```

2. Add a VCL snippet to forward high-risk requests. Select **in subroutine** and **recv (vcl_recv)** for snippet type. Add conditions to the outer-if-block to determine that the request is high-risk.

```vcl
# Add conditions to the outer-if-block to determine that the request is high-risk

if (fastly.ff.visits_this_service == 0 && req.request != "FASTLYPURGE") {
  if (!req.http.cookie:captchaAuth || !token_is_valid()) {
    set req.backend = F_captcha;
    set req.http.x-orig-host = req.http.host;
    return(pass);
  }
}
```

3. Create a new dictionary named `captcha_config`. Add the following entry to the dictionary.

| Key           | Description                                                          |
| ------------- | -------------------------------------------------------------------- |
| shared_secret | The shared secret. It must be the same as the one set in the C@E app |
