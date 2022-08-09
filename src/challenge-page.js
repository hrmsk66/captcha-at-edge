export default function generateChallengePage(siteKey, staticParam) {
  return `
<html>
  <head>
    <title>CAPTCHA challenge</title>
    <link rel="icon" href="https://developer.fastly.com/favicon-32x32.png" type="image/png" />
    <script src="${staticParam.scriptURL}" async defer></script>
    <style>
      .container {
        display: grid;
        justify-items: center;
        align-content: center;
        height: 100%;
      }

      .logo {
        width: 300px;
        margin-bottom: 30px;
      }

      .h-captcha {
        width: 300px;
      }

      form {
        text-align: center;
      }

      .submit-btn {
        cursor: hand;
        color: #c20105;
        border: 2px solid #c20105;
        border-radius: 4px;
        background: #fff;
        height: 40px;
        width: 120px;
        font-family: sans-serif;
        font-weight: bold;
      }

      .submit-btn:hover {
        color: #fff;
        background: #c20105;
        text-shadow: 0 0 6px #00000052;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132.32 84.66">
          <defs>
            <style>
              .cls-1 {
                fill: #c20105;
              }
            </style>
          </defs>
          <title>flying shield</title>
          <g id="Layer_2" data-name="Layer 2">
            <g id="icons">
              <path
                class="cls-1"
                d="M97.18,23.22c-3.55.77-10.5-2.53-13.81-4.14a38.55,38.55,0,0,1-15-13.48.92.92,0,0,0-1.26-.33c-6,4.64-10.29,8.08-17.69,10.12C43.55,17,36.26,19.06,30.13,18.9a.93.93,0,0,0-.88,1.16c.83,5.4.6,11,1.34,16.38.77,5.57,3.19,10.83,5.63,15.79a103,103,0,0,0,7.92,12.84c1.51,2.11,3.19,4.1,4.74,6.17.74,1,2.69,2.34,3,3.33a.94.94,0,0,0,.64.64c2.13.52,3.6,4.36,6.6,4.76,2.81.36,6.45-2.45,8.63-3.83a63.85,63.85,0,0,0,16.13-15,79.77,79.77,0,0,0,9.48-16.64c1.6-3.62,2.06-7.75,3.26-11.54.8-2.51,2-5.76,1.7-8.54A1,1,0,0,0,97.18,23.22ZM95,30.65c-.8,3.48-1.68,6.87-2.69,10.27-1.79,6-5.1,12-8.59,17.36A54.69,54.69,0,0,1,70.21,72.17c-2,1.42-4.56,2.61-6.75,3.84-1.75,1-2.71,2.23-4.82,1.61-.75-.22-3.72-2.45-3.94-3.28a.92.92,0,0,0-.64-.64c-2-.48-4.6-5.1-5.8-6.81C45,62.26,41.94,57.7,39.06,52.8c-2.26-3.85-4.84-8.53-5.81-13s-.94-9.5-1.52-14.21C31.31,22.16,30,21,33.09,20.33a65,65,0,0,1,6.77-.61C43.3,19.37,47,17.79,50.27,17a37.36,37.36,0,0,0,12.46-5.35c1-.68,3-3.4,4.27-3.55.29,0,.42-.13.45-.24.23.26.56.61,1.07,1.1.26.26.3.81.54,1.11a23.82,23.82,0,0,0,2.86,2.65A46.67,46.67,0,0,0,84.3,21.59c3.26,1.51,8.3,3.79,12.21,3.55C96.5,27,95.33,29.2,95,30.65Z"
              />
              <path
                class="cls-1"
                d="M131.87,31.79c-5.6-3.49-12.18.32-17,3.34-5.32,3.29-10.58,5.21-16.21,7.62.45-1.28.9-2.57,1.34-3.89a67.66,67.66,0,0,0,2.57-9.37c.41-2.23.41-5.54,1.4-7.5a1,1,0,0,0-.92-1.38c-3.39-1.28-7.43-2.06-10.89-3.14a44,44,0,0,1-8.91-4.3A35.8,35.8,0,0,1,75,6.68c-1.87-2-3.69-5-5.85-6.55A.92.92,0,0,0,68,.27c-9.27,10.94-28.81,14.67-42.37,15a.94.94,0,0,0-.89,1.16c1.44,5.42.8,11.6,1.63,17.17.19,1.27.42,2.51.68,3.74-7.31-4.47-12.66-12.1-21.34-13.8C2.25,22.87-2,24.78,1,28.69a12.45,12.45,0,0,0,5.56,3.55,2.91,2.91,0,0,0,0,3.18c.91,1.5,3,2.14,5.29,2.43l-.16.17c-1.06,1.27-1.93,3.12-.38,4.4,1.38,1.15,4.09.38,5.52.06,3-.67,8.23-1.87,11.2-.89h.07A52.57,52.57,0,0,0,31.78,51,136.37,136.37,0,0,0,51.14,79.3c3.72,4.19,6.64,6.85,12.08,4.45A49.09,49.09,0,0,0,75.56,76,82.4,82.4,0,0,0,95.11,51.06a57.79,57.79,0,0,0,2.51-5.63c3-.22,6.24,1,8.95,2,1.39.49,4,1.58,5.47,1.18s2.6-1.16,2.17-2.84a2.13,2.13,0,0,0-.18-.5c3-.24,6.1-1,7.43-2.7s.94-2.83-.22-3.46a15.91,15.91,0,0,0,3.15-.74,23.23,23.23,0,0,0,7.66-5.11A.93.93,0,0,0,131.87,31.79ZM17.28,40.45c-.75.14-4,1.32-4.53.38-1.76-2.89,4.87-2.69,6-2.64s1.17-1.74,0-1.83a27.42,27.42,0,0,0-3.88-.18,20.32,20.32,0,0,1-4.36-.54c.09,0-1.75-.85-1.8-1C8,33.36,8.18,33,8.61,32.94c2.1.65,4.19,1.13,5.78,1.53v0l.24.06c1,.13,1.23-1.56.24-1.81l-1.66-.42c-1.43-.55-2.93-1.44-4.39-1.32A15,15,0,0,1,3.7,28.2C-1,23.64,8,26,10,27c3.31,1.56,5.25,4.18,8,6.37a66.94,66.94,0,0,0,8.87,6,.75.75,0,0,0,.24.08C23.94,38.94,20.36,39.84,17.28,40.45Zm10-.93a.78.78,0,0,0,.22,0l0,.09Zm68.91,3.75a93.81,93.81,0,0,1-9.46,17.66A63.73,63.73,0,0,1,69.29,78.34c-2.13,1.42-8.2,5.26-10.78,4.55-2.75-.77-6.07-5.11-8.07-7.37a125.63,125.63,0,0,1-15-21.88,64.89,64.89,0,0,1-5.65-13.21c-1.35-4.53-1.34-9.21-2-13.82-.28-1.84-.66-3.74-.76-5.61,0-.07-.09-3.05-.06-3.12.6-1.38-.33-.29,1.72-.83,3.43-.9,7.13-.91,10.6-1.55C46.84,14.1,54.43,12.08,61.09,8c1.16-.69,2.25-1.47,3.33-2.25s1.84-2.14,3.41-2.64a3,3,0,0,0,.86-.38c0,.11,0,.38.64.85,3,2.33,5.16,5.81,8.28,8.19s7,5.22,10.79,6.58c4.36,1.55,9.08,2.2,13.47,3.77-1,2.59-.87,5.41-1.31,8.06C99.83,34.59,97.87,39.16,96.21,43.27Zm31.27-8.78c-4.18,2.49-9.1,2.28-13.2,4.47-.9.47-.27,2.07.7,1.67,2.17-.87,7.2-.39,3.08,1.67-2.41,1.2-7.22,1.43-9.72,1a.92.92,0,0,0-.49,1.77c1.15.4,6,1.43,2.22,1.17a17.48,17.48,0,0,1-3.89-1.18,37.26,37.26,0,0,0-5.05-1.22,72.79,72.79,0,0,0,8.33-3.08c4.16-2,7.65-5.11,11.87-6.86a15.6,15.6,0,0,1,5.21-1.39C130.19,32.33,130.35,32.78,127.48,34.49Z"
              />
              <path
                class="cls-1"
                d="M76.6,29.42c-3.64,3.49-8.3,7.3-10.81,11.64-1.48,2.55-2.62,5.17-4.17,7.78a25.92,25.92,0,0,0-1.42,3.1c-.35.75-.69,1.31-.93,1.91-2.45-2.19-6.64-4.47-9.28-4.25-1.16.1-1.17,1.94,0,1.84,2-.18,8.08,3.56,9.2,5,.51.64,1.58.09,1.56-.65a14,14,0,0,1,1.17-2.54c.86-1.75,1.28-3.29,2.32-5.11a74.72,74.72,0,0,1,3.91-6.77A84.14,84.14,0,0,1,77.9,30.71C78.75,29.9,77.46,28.6,76.6,29.42Z"
              />
            </g>
          </g>
        </svg>
      </div>
      <form action="?captcha=true" method="POST">
        <div class="${staticParam.class}" data-sitekey="${siteKey}"></div>
        <br />
        <input class="submit-btn" type="submit" value="Submit" />
      </form>
    </div>
  </body>
</html>`;
}