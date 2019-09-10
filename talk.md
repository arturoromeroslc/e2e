## Intro

Hello my name is Arturo Romero, I'm a web developer.

Lately I've been focused on testing, automation, headless chrome, puppeteer. It's a really great and intersting topic.

Headless Chrome. Double rainbow moment.

# Agenda

- What is Headless Chrome
- Puppeteer 101 - node library to work with Chrome
- AWS CDK, for your infrastructure as code
- AWS Lambda
- AWS cloudwatch

Pyramid of Puppeteer, architecture

[PHOTO]() of Chrome

Headless Chrome. - When you open chrome that is what you see.
Headless Chrome there is none of that.
Headless Chrome is Chrome without UI.

Unlocks network throttling, device emulation.

[PHOTO]() of devtool

We now have the DevTools

It is a websocket api to :9222 and do message passing. Here I'm just getting the tile of the page.

[PHOTO]() Puppeteer is a library we launch last year, you can get it off NPM.
From here we wanted to highlight the high level apis.

Node talking to chrome is all async and async/await is the best. Zero configuration, so we download chromium for you.

Puppeteer code:
This is simple, lets take a screen shot.
Now we go to page.goTo()
Now use puppeteer to take the screenshot. Very easy and very high leve.
Small api for all the stop above it

At the top is your autmation scripts.

## CDK

- define what you want
