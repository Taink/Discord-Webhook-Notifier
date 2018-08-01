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

// buildWebhookMsg(gameUrl[, activateEveryone=true])
function buildWebhookMsg(gameUrl, activateEveryone=true, lang="FR") {
	gameUrl = new URL(gameUrl);
	let re = /^\/app\/([0-9]+)\/(\w+)\/$/i;
	let path = gameUrl.pathname;
	let gamename, provider, content, thumbnail, mainTitl, mainDesc, valueTitle1, valueTitle2, valueText1, valueText2;

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
	if (provider == "Humble Bundle") {
		gamename = gamename.replace(/-/gi, ' ');
	} else {
		gamename = gamename.replace(/_/gi, ' ');
	}

	if (lang == "FR") {
		content = `Nouveau jeu gratuit !\n*${gamename}* gratuit sur ${provider} à l'adresse suivante : ${gameUrl.href} !`;
		mainTitl = `${gamename} gratuit sur ${provider} !`;
		mainDesc = `${gamename} est gratuit sur ${provider} pendant une durée limitée [ici](${gameUrl.href})`;
		valueTitle1 = "Pendant combien de temps le jeu est-il gratuit ?";
		valueText1 = `Le jeu est gratuit jusqu'à une date limite visible sur [la page du jeu](${gameUrl.href}).`;
		valueTitle2 = "Le jeu m'appartiendra-t-il pour toujours ?";
		valueText2 = `Oui, le jeu reste dans votre bibliothèque de jeux, même après la date limite. Il faut juste "l'acheter" une fois sur ${provider} :-)`;
	} else if (lang == "EN" || lang == "US") {
		content = `New free game!\n*${gamename}* is currently free on ${provider} at this adress: ${gameUrl.href}!`;
		mainTitl = `${gamename} is free on ${provider}!`;
		mainDesc = `${gamename} is currently free on ${provider} for a limited time [here](${gameUrl.href})`;
		valueTitle1 = "For how long will the game be free?";
		valueText1 = `The game is free until a specified date available on the [game page](${gameUrl.href}).`;
		valueTitle2 = "Will I get to keep the game?";
		valueText2 = `Yes, the game stays in your game library, even after the specified date. You just need to "buy" it once on ${provider} :-)`;
	} else {
		console.error("ERROR: Unrecognized language!");
		process.exit;
	}

	if (activateEveryone === true) content = '@everyone: ' + content;

	return JSON.stringify(
	{
		"content":content,
		"username":"TinkBot",
		"avatar_url":"https://i.imgur.com/d3E5Gly.jpg",
		"embeds": [
			{
				"title":mainTitl,
				"description":mainDesc,
				"url":gameUrl.href,
				"color":getRandomInt(0, 16777215),
				"thumbnail":thumbnail,
				"fields":[
					{
						"name":valueTitle1,
						"value":valueText1,
						"inline":false
					},
					{
						"name":valueTitle2,
						"value":valueText2,
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
		// for (let i in webhookData.guilds) {
			let mes = buildWebhookMsg(gUrl, webhookData.guilds[0].everyone, webhookData.guilds[0].lang);
			let webhookUrl = new URL(webhookData.guilds[0].webhookUrl);
			webhookUrl = webhookUrl.pathname;
			// Send the HTTP POST request to Discord
			request(webhookUrl, mes);
			// Notify the console user
			console.log(`\nNotification sent to '${webhookData.guilds[0].name}'!\n`);
		// }

		rl.close();
	})
});