# CAPTCHA at the edge

Present clients with a CAPTCHA challenge to verify that they are not a bot. This Compute@Edge app is intended to be used as a backend to a VCL service; the VCL service should be configured to forward high-risk requests to this app for validation.

![captcha_mini](https://user-images.githubusercontent.com/30490956/180640532-e10ad0da-b2da-4da3-96d0-37601bb8c654.jpg)

## Prerequisites

This app uses Google reCAPTCHA V2. To start using reCAPTCHA, you need to sign up for an API key pair for your site.

Go to https://www.google.com/recaptcha/admin and:

- Get an API key pair. The key pair consists of a site key and a secret key
- Register target domains
- Register `127.0.0.1` as domain (For local testing)

_It is not necessary to register each subdomain. A registration for `example.com` also registers `subdomain.example.com`_

### Limitations of reCAPTCHA

In addition to the terms of service, please be aware of the limitation below.

> If you wish to make more than 1000 calls per second or 1000000 calls per month, you must use reCAPTCHA Enterprise or fill out this form and wait for an exception approval. [Link](https://developers.google.com/recaptcha/docs/faq#are-there-any-qps-or-daily-limits-on-my-use-of-recaptcha)

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

2. Open `fastly.toml` and replace the values of **shared_secret** and **recaptcha_secret_key** respectively. Optionally, change **token_lifetime** (in seconds)

Example (_the example reCAPTCHA keys have already been deactivated_):

```toml
[local_server.dictionaries.captcha_config.contents]
  "shared_secret" = "jCoYTjfhMUymOAhDXTS7ajJZFqnYNHPsKkon9GVzeV8="
  "recaptcha_secret_key" = "6Letrw4hAAAAACyoy_IZ3UEEYAi7BlUS3jgGS5wG"
  "token_lifetime" = "86400"
```

3. Open `src/captcha-challenge-fastly.html` and replace **{your-site-key}** with your reCAPTCHA site key.

Example (_the example reCAPTCHA keys have already been deactivated_):

```html
<form action="?captcha=true" method="POST">
  <div class="g-recaptcha" data-sitekey="6Letrw4hAAAAAHT3xMRwVz7I6B0z8FrxWhtYGtxr"></div>
  <br />
  <input class="submit-btn" type="submit" value="Submit" />
</form>
```

4. Run the `fastly compute serve` command to start the testing server and open `http://127.0.0.1:7676` in your browser to test it. If the CAPTCHA challenge is successful, the following message will appear in the console.

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
Log: It's a pass! returning a response with a token set in the session cookie <<
```

### Publish the project to a new Fastly service

1. Once you’re happy with your code and want to deploy the project to Fastly, run `fastly compute publish`.
2. At the prompts, provide details about the service you're creating:

- **Domain**: Press enter to accept the automatically generated domain name or enter the name of the domain you'd like to associate with your service (e.g. **{company-name}-captcha.edgecompute.app**)
- **Backend**: Create a host that has the hostname of `www.google.com`, enter `443` for the port number and name it **captcha_backend**.

```
fastly compute publish
✓ Initializing...
( snip )
Create new service: [y/N] y

✓ Initializing...
✓ Creating service...

Domain: [example.edgecompute.app]

Backend (hostname or IP address, or leave blank to stop adding backends): www.google.com
Backend port number: [80] 443
Backend name: [backend_1] captcha_backend

Backend (hostname or IP address, or leave blank to stop adding backends):

✓ Creating domain 'example.edgecompute.app'...
✓ Creating backend 'captcha_backend' (host: www.google.com, port: 443)...
✓ Uploading package...
✓ Activating version...

Manage this service at:
	https://manage.fastly.com/configure/services/XXXXX

View this service at:
	https://example.edgecompute.app


SUCCESS: Deployed package (service XXXXX, version 1)
```

3. Once the project is deployed successfully, go to the Fastly service page, click `Edit configuration`, and select `Clone version 1` to edit. Go to Dictionaries and create a new dictionary named `captcha_config`. Add the following items in the dictionary:

| Key                  | Description                                            |
| -------------------- | ------------------------------------------------------ |
| shared_secret        | The shared secret you created with the openssl command |
| recaptcha_secret_key | Your reCAPTCHA secret key                              |
| token_lifetime       | Token lifetime (in seconds)                            |

4. To finish up and deploy your service click on the **Activate** button.

### Setting up the VCL service

See [Link](https://github.com/hrmsk66/captcha-at-edge/blob/main/README_vcl_service.md).

## Sequence / Determined to be a high-risk request by VCL

```mermaid
sequenceDiagram
autonumber
    participant Client
    participant VCL
    participant C@E
    participant reCAPTCHA
    participant NGWAF
    participant Origin
    Client->>VCL: Request without session cookie
    VCL->>VCL: Determined to be a high-risk request<br/>Forwarding it to C@E
    VCL->>C@E: Request without session cookie
    C@E->>VCL: Challenge page
    VCL->>Client: Challenge page
    Client->>VCL: Challenge response
    VCL->>C@E: Challenge response
    C@E->>reCAPTCHA: request verification
    reCAPTCHA->>C@E: verified (success)
    C@E->>C@E: Generate a session-token
    C@E->>VCL: Sends the session-token as a cookie
    VCL->>Client: Sends the session-token as a cookie
    Client->>VCL: Request with session cookie
    VCL->>VCL: Validate the token and token expiration (success)
    VCL->>NGWAF: Allowed to access content
    NGWAF->>Origin: Request
    Origin->>NGWAF: Response
    NGWAF->>VCL: Response
    VCL->>Client: Response
```

## Sequence / Determined to be a high-risk request by NGWAF

```mermaid
sequenceDiagram
autonumber
    participant Client
    participant VCL
    participant NGWAF
    participant C@E
    participant reCAPTCHA
    participant Origin
    Client->>VCL: Request w/o session cookie
    VCL->>VCL: Not a high-risk request
    VCL->>NGWAF: Request w/o session cookie
    NGWAF->>NGWAF: Determined to be a high-risk request based on the IP reputation DB<br/>Returning response with special status code (e.g. 499)
    NGWAF->>VCL: Response (499)
    VCL->>VCL: Detect 499 and restart<br/>Forwarding it to C@E
    VCL->>C@E: Request without session cookie
    C@E->>VCL: Challenge page
    VCL->>Client: Challenge page
    Client->>VCL: Challenge response
    VCL->>C@E: Challenge response
    C@E->>reCAPTCHA: request verification
    reCAPTCHA->>C@E: verified (success)
    C@E->>C@E: Generate a session-token
    C@E->>VCL: Sends the session-token as a cookie
    VCL->>Client: Sends the session-token as a cookie
    Client->>VCL: Request with session cookie
    VCL->>VCL: Validate the token and token expiration (success)
    VCL->>NGWAF: Allowed to access content
    NGWAF->>NGWAF: Detect session cookie and allow access
    NGWAF->>Origin: Request
    Origin->>NGWAF: Response
    NGWAF->>VCL: Response
    VCL->>Client: Response
```

## Sequence / a low-risk request

```mermaid
sequenceDiagram
    participant Client
    participant VCL
    participant NGWAF
    participant Origin
    Client->>VCL: Request
    VCL->>VCL: Not a high-risk request
    VCL->>NGWAF: Request
    NGWAF->>NGWAF: Not a high-risk request
    NGWAF->>Origin: Request
    Origin->>NGWAF: Response
    NGWAF->>VCL: Response
    VCL->>Client: Response
```
