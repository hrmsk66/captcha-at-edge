# CAPTCHA at the edge

Present clients with a CAPTCHA challenge to verify that they are not a bot. This Compute@Edge app is intended to be used as a backend to a VCL service; the VCL service should be configured to forward high-risk requests to this app for validation.

![captcha_mini](https://user-images.githubusercontent.com/30490956/180640532-e10ad0da-b2da-4da3-96d0-37601bb8c654.jpg)

## Prerequisites

This app uses Google reCAPTCHA V2 or hCaptcha or both, you need to sign up for an API key pair for your site and:

- Get an API key pair. The key pair consists of a site key and a secret key
- Register target domains
- Register `127.0.0.1` as domain for local testing (This seems unnecessary for an hCaptcha account)

_It is not necessary to register each subdomain. A registration for `example.com` also registers `subdomain.example.com`_

### Limitation of the free captcha services

Both reCAPTCHA and hCaptcha are limited to 1,000 requests per second and 1,000,000 requests per month in the free version.

- [reCAPTCHA](https://developers.google.com/recaptcha/docs/faq#are-there-any-qps-or-daily-limits-on-my-use-of-recaptcha)

- [hCaptcha](https://www.hcaptcha.com/terms)

## Installation

### Create a new Compute@Edge project

- Run the command below to scaffold a new Fastly Compute@Edge project. The CLI will generate source code for your project in the current working directory.

```
$ mkdir captcha-at-edge && cd captcha-at-edge
$ fastly compute init --from=https://github.com/hrmsk66/captcha-at-edge
```

### Running a local testing server

1. Generate the shared secret with the command below.

```
$ openssl rand -base64 32
jCoYTjfhMUymOAhDXTS7ajJZFqnYNHPsKkon9GVzeV8=
```

The generated value is used in step 2. The value is also to be added to the dictionary (captcha_config) of both the VCL and the C@E service with the key name `shared_secret`.

2. Open `fastly.toml` and replace the dictionary values respectively.

```toml
[local_server.dictionaries.captcha_config.contents]
  "account0_type" = "XXX (recaptcha or hcaptcha)"
  "account0_secret_key" = "XXX"
  "account0_site_key" = "XXX"
  "account1_type" = "XXX (recaptcha or hcaptcha)"
  "account1_secret_key" = "XXX"
  "account1_site_key" = "XXX"
  "number_of_accounts" = "X (should be 2 in this example)"
  "shared_secret" = "XXX"
  "token_lifetime" = "86400"
```

Each dictionary item is described in the table below:

| Key                 | Description                                                                   |
| ------------------- | ----------------------------------------------------------------------------- |
| account0_type       | Account type for the 1st captcha account(account0). "recaptcha" or "hcaptcha" |
| account0_site_key   | Site key for account0                                                         |
| account0_secret_key | Secret key for account0                                                       |
| account1_type       | Account type for the 2nd captcha account(account1). "recaptcha" or "hcaptcha" |
| account1_site_key   | Site key for account1                                                         |
| account1_secret_key | Secret key for account1                                                       |
| number_of_accounts  | Number of CAPTCHA accounts                                                    |
| shared_secret       | The shared secret you created with the openssl command                        |
| token_lifetime      | Token lifetime (in seconds)                                                   |

3. Run the `fastly compute serve` command to start the testing server and open `http://127.0.0.1:7676` in your browser to test it. If the CAPTCHA challenge is successful, the following message will appear in the console.

```
$ fastly compute serve
( snip )

✓ Running local server...

Jul 24 15:43:57.290  INFO checking if dictionary adheres to Fastly's API
Jul 24 15:43:57.291  INFO checking if backend 'captcha_backend' is up
Jul 24 15:43:57.510  INFO backend 'captcha_backend' is up
Jul 24 15:43:57.510  INFO Listening on http://127.0.0.1:7676
Jul 24 15:43:59.892  INFO request{id=0}: handling request GET http://127.0.0.1:7676/
Jul 24 15:43:59.911  INFO request{id=0}: request completed using 14.8 MB of WebAssembly heap
Jul 24 15:43:59.911  INFO request{id=0}: request completed in 18.089791ms
Jul 24 15:44:17.040  INFO request{id=1}: handling request POST http://127.0.0.1:7676/?captcha=true
Log: Sending to CAPTCHA API to verify
Log: It's a pass! returning a response with a token set in the cookie <<
```

### Publish the project to a new Fastly service

Once you’re happy with your code and want to deploy the project to Fastly:

1. Open `fastly.toml` and replace the dictionary values respectively.

```toml
[setup.dictionaries]
  [setup.dictionaries.captcha_config]
    [setup.dictionaries.captcha_config.items]
      [setup.dictionaries.captcha_config.items.account0_secret_key]
        value = "XXX"
      [setup.dictionaries.captcha_config.items.account0_site_key]
        value = "XXX"
      [setup.dictionaries.captcha_config.items.account0_type]
        value = "XXX (recaptcha or hcaptcha)"
      [setup.dictionaries.captcha_config.items.account1_secret_key]
        value = "XXX"
      [setup.dictionaries.captcha_config.items.account1_site_key]
        value = "XXX"
      [setup.dictionaries.captcha_config.items.account1_type]
        value = "XXX (recaptcha or hcaptcha)"
      [setup.dictionaries.captcha_config.items.number_of_accounts]
        value = "X (should be 2 in this example)"
      [setup.dictionaries.captcha_config.items.shared_secret]
        value = "XXX"
      [setup.dictionaries.captcha_config.items.token_lifetime]
        value = "86400"
```

2. Run `fastly compute publish`. It displays the captcha backends and dictionay items to be configured. Press enter to continue if there is no mistake.

```
fastly compute publish
✓ Initializing...
( snip )
Create new service: [y/N] y

✓ Initializing...
✓ Creating service...

Domain: [example.edgecompute.app]

Configure a backend called 'recaptcha'

Hostname or IP address: [www.google.com]
Port: [443]

Configure a backend called 'hcaptcha'

Hostname or IP address: [hcaptcha.com]
Port: [443]

Configuring dictionary 'captcha_config'

Create a dictionary key called 'account1_site_key'
( snip )

✓ Creating domain 'example.edgecompute.app'...
✓ Creating backend 'recaptcha' (host: www.google.com, port: 443)...
✓ Creating backend 'hcaptcha' (host: hcaptcha.com, port: 443)...
✓ Creating dictionary 'captcha_config'...
✓ Creating dictionary item 'account1_site_key'...
( snip )

✓ Uploading package...
✓ Activating version...

Manage this service at:
	https://manage.fastly.com/configure/services/XXXXX

View this service at:
	https://example.edgecompute.app


SUCCESS: Deployed package (service XXXXX, version 1)
```

### Setting up the VCL service

See [Link](https://github.com/hrmsk66/captcha-at-edge/blob/main/README_vcl_service.md).

## Sequence

```mermaid
sequenceDiagram
    participant Client
    participant VCL
    participant C@E
    participant reCAPTCHA
    participant Origin
    Client->>VCL: Request without cookie
    VCL->>VCL: Determine high-risk request or not<br/>Forward high-risk request to C@E
    VCL->>C@E: Request without cookie
    C@E->>VCL: Challenge page
    VCL->>Client: Challenge page
    Client->>VCL: Challenge response
    VCL->>C@E: Challenge response
    C@E->>reCAPTCHA: request verification
    reCAPTCHA->>C@E: verified (success)
    C@E->>C@E: Generate a session-token
    C@E->>VCL: Sends the session-token as a cookie
    VCL->>Client: Sends the session-token as a cookie
    Client->>VCL: Request with cookie
    VCL->>VCL: Validate the token and token expiration (success)
    VCL->>Origin: Allowed to access content
    Origin->>VCL: Content
    VCL->>Client: Content
```
