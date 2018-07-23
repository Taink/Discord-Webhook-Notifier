const http = require('http');
const https = require('https');
const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// request(urlPath, data)
function request(urlPath, data="") {
	let options = {
		host: "discordapp.com",
		method: "POST",
		headers: {
			"Connection": "keep-alive",
			"Content-Type": "application/json; charset=utf-8"
		}
	};

	if (data == "") {
		console.error("ERROR: There was a problem in reading the JSON data. Please double-check the code.");
		process.exit();
	} else {
		options["path"] = urlPath;
		options["headers"]["Content-Length"] = Buffer.byteLength(data);

		// console.log("Content-Length: "+options["headers"]["Content-Length"]);
		// console.log("\nJSON:\n"+data);
		
		let req = https.request(options, (res) => {
			console.log(`\nSTATUS: ${res.statusCode}, ${http.STATUS_CODES[res.statusCode]}`);
			// console.log(`\nHEADERS: ${JSON.stringify(res.headers)}`);

			res.setEncoding('utf8');

			res.on('data', (chunk) => {
				console.log(`\nBODY: ${chunk}`);
			});

			res.on('end', () => {
				console.log('\n--EOF--\n');
			});
		});

		req.on('error', (e) => {
			console.error(`ERROR: Problem with request: ${e.message}`);
		});

		req.end(data, 'utf8', () => {
			console.log('\nRequest Successful!\n');
		});

		// console.log('DATA SENT:\n'+data);
	}
}

// getRandomInt(min, max)
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

// capitalize(string)
function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// buildWebhookMsg(gameUrl[, activateEveryone])
function buildWebhookMsg(gameUrl, activateEveryone=true) {
	gameUrl = new URL(gameUrl);
	let re = /^\/app\/([0-9]+)\/(\w+)\/$/i;
	let path = gameUrl.pathname;
	let gamename = "";
	let provider = "";
	let content = "";
	let thumbnail;

	if (gameUrl.href.startsWith("https://www.humblebundle.com/store/")) { // Humble Bundle
		gamename = path.substr(7);
		provider = "Humble Bundle";
		thumbnail = {"url": "https://i.imgur.com/hZVyC1Y.png"};
		//console.log('The name of your game is: ' + gamename);
	} else if (gameUrl.href.startsWith("https://www.gog.com/game/")) { // GOG
		gamename = path.substr(6);
		provider = "GOG";
		thumbnail = {"url": "https://i.imgur.com/fMC8MRV.png"};
		//console.log('The name of your game is: ' + gamename);
	} else if (gameUrl.href.startsWith("https://store.steampowered.com/app/")) { // Steam
		gamename = re.exec(path)[2];
		let appid = re.exec(path)[1];
		provider = "Steam";
		thumbnail = {"url": `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/header.jpg`}
		// console.log('The name of your game is: ' + gamename);
		// console.log('And its App_ID is: ' + appid);
	}
	else {
		console.error('ERROR: unrecognized URL type!');
		process.exit();
	}

	gamename = capitalize(gamename);
	gamename = gamename.replace(/_/gi, ' ');

	if (activateEveryone === true) {
		content = `@everyone: Nouveau jeu gratuit !\n*${gamename}* gratuit sur ${provider}, à l'adresse suivante : ${gameUrl.href} !`;
	} else {
		content = `Nouveau jeu gratuit !\n*${gamename}* gratuit sur ${provider}, à l'adresse suivante : ${gameUrl.href} !`
	}

	return JSON.stringify(
	{
		"content":content,
		"username":"TinkBot",
		"avatar_url":"https://i.imgur.com/d3E5Gly.jpg",
		"embeds": [
			{
				"title":`${gamename} gratuit sur ${provider} !`,
				"description":`${gamename} est gratuit sur ${provider} pendant une durée limitée [ici](${gameUrl.href})`,
				"url":gameUrl.href,
				"color":getRandomInt(0, 16777215),
				"thumbnail": thumbnail,
				"fields": [
					{
						"name":"Pendant combien de temps le jeu est-il gratuit ?",
						"value":`Le jeu est gratuit jusqu'à une date limite visible sur [la page du jeu](${gameUrl.href}).`,
						"inline":false
					},
					{
						"name":"Le jeu m'appartiendra-t-il pour toujours ?",
						"value":`Oui, le jeu reste dans votre bibliothèque de jeux, même après la date limite. Il faut juste "l'acheter" une fois sur ${provider} :-)`,
						"inline":false
					},
					{
						"name": ":salad: ?",
						"value": ":salad:.",
						"inline": false
					}
				]
			}
		]
	}
	);
}

fs.readFile('./webhooks.json', 'utf8', (err, webh) => {
	if (err) throw err;
	let webhookData = JSON.parse(webh);

	rl.question('Input URL: ', (gUrl) => {
		for (let i in webhookData.guilds) {
			let mes = buildWebhookMsg(gUrl, webhookData.guilds[i].everyone);
			let webhookUrl = new URL(webhookData.guilds[i].webhookUrl);
			webhookUrl = webhookUrl.pathname;
			// Send the HTTP POST request to Discord
			request(webhookUrl, mes);
			// Notify the console user
			console.log(`\nNotification sent to '${webhookData.guilds[i].name}'!\n`);
		}

		rl.close();
	})
});