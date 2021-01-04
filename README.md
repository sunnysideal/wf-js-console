# wf-js-console
Purely browser based console display for the WeatherFlow Tempest PWS

The aim of this project is to create a configurable console to use instead of the WeatherFlow default for owners of a Tempest personal weather station.
Details of that system can be found at https://weatherflow.com/tempest-weather-system/

WeatherFlow have provided both a REST and WebSocket API to access your own data, and this project simply makes use of these just like the WeatherFlow app or website does.

Note: You must have a system and account with WeatherFlow for this to work.
To use you will need your personal key..
Personal key: You will need to sign in to the Tempest Web App at tempestwx.com, then go to Settings -> Data Authorizations -> Create Token, then use that token when prompted during initialisation.

This information is then only stored in your browser storage.

You can either launch the web page from https://www.wxconsole.in.net or download the source files from here and launch locally.

Currently to get back to change any settings this is done by a URL parameter, so https://www.wxconsole.in.net?settings

This is a project I created to teach myself about JS and HTML5 so it is very rough around the edges, sorry, not sorry!
