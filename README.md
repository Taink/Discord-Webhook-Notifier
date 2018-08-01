## Discord-Webhook-Notifier
A simple webhook I wrote in Node.js to keep my friends notified when a free game is available.  
It consists in a single .js file and a .json file to store the different webhooks through which the message will go.

### JavaScript file
The .js file does not require any external module and should not require [Node.js](https://nodejs.org/) v10.7.0 but is written with this version, so you might aswell check that.

It uses the following modules (already packed within Node.js):
- [Readline](https://nodejs.org/dist/latest-v10.x/docs/api/readline.html)
- Both [HTTP](https://nodejs.org/dist/latest-v10.x/docs/api/http.html) and [HTTPS](https://nodejs.org/dist/latest-v10.x/docs/api/https.html)
- [File System](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html)

It currently only supports french and english, but I could add support for other languages in the future.

### JSON file
The .json file is pretty simple aswell, it **MUST** be named 'webhooks.json' **AND** placed in the *same* directory as the .js file (or you can modify the code to make it different).  
In this file, you can for example set wether or not you mention everyone, and in which language the message will be displayed.  
I've included an example file, named [webhooks_ex.json](https://github.com/Taink/Discord-Webhook-Notifier/blob/master/webhooks_ex.json) to help you with the format of this file.  
**NOTE THAT THIS FILE IS NOT WORKING BUT IS HERE TO HELP YOU WITH THE FORMAT. YOU MUST CHANGE ITS FIELDS FOR IT TO WORK PROPERLY.**  
For example, your 'webhooks.json' file could look like this :
```json
{
	"guilds": [
		{
			"everyone": true,
			"webhookUrl": "https://discordapp.com/api/webhooks/123456789101112131/This-is-not-a-real-token-WUsp-el7InHniIe2zUgl34Y8WXJ9UZr8GcRhwEkVh9GR",
			"lang": "US",
			"name": "Test-Server1"
        },
        {
			"everyone": true,
			"webhookUrl": "https://discordapp.com/api/webhooks/123456789101112131/This-is-not-a-real-token-eitherl7InHniIe2zUgl34Y8WXJ9UZr8GcRhwEkVh9GR",
			"lang": "US",
			"name": "Test-Server2"
        }
    ]
}
```

#### TODO:
- Add support for other websites (it only supports Steam, Humble Bundle and GOG)
  - Add support for both GOG and Humble Bundle thumbnails, as it currently doesn't (I've replaced these thumbnails with placeholders for now)
- Add support for other languages (I'll see what I can do for other languages, but at the moment english should be enough).

#### Special thanks:
To [Maks](https://github.com/Maks-s), as he helped me in making it work properly.
