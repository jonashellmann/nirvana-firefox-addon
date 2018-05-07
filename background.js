function buttonClicked() {
	var getSettings =  browser.storage.local.get("settings");
	getSettings.then((res) => {
		const {settings} = res;
		var inboxmail = settings.inboxmail;
		if(inboxmail === 'example@nirvana.com') {
			browser.runtime.openOptionsPage();
		}
	});
}

function handleInstalled(details) {
	if(details.reason=="install") {
		browser.storage.local.set({
            settings: {
                inboxmail: 'example@nirvana.com',
				username: 'username@example.com',
				password: ''
            },
        });
	}
}

function onUpdateSettings(settings) {
	if(settings.inboxmail !== 'example@nirvana.com' || (settings.username !== 'username@example.com' && settings.password !== '')) {
		browser.browserAction.setPopup({popup: 'popup/popup.html'});
	}
	else {
		browser.browserAction.setPopup({popup: ''});
	}
    
}

function openNirvana() {
	var querying = browser.tabs.query({url: 'https://focus.nirvanahq.com/'});
	querying.then((tab) => {
		if(tab.length > 0) 
		{
			browser.tabs.update(tab[0].id, { active: true });
		} 
		else 
		{
			// TODO Login, wenn Benutzername und Passwort gesetzt
			browser.tabs.create({url: 'https://focus.nirvanahq.com', active: true});
		}
	});
}

function createTask(msg) {
	if((msg.username == 'username@example.com' || msg.password == '')) {
		var mailtourl = 'mailto:' + encodeURIComponent(msg.inboxmail) + '?subject=' + encodeURIComponent(msg.subject) + '&body=' + encodeURIComponent(msg.message);
		var creating = browser.tabs.create({url: mailtourl});
	}
	else {
		getAuthToken(msg.username, msg.password)
		.then(token => {
			var now = Math.floor( Date.now() / 1000 );
			
			var body = '';
			// TODO Body String
			// var body = '{"method": "task.save", "id": "' + uuidv4() + '", "type": 0, "_type": ' + now + ', "state": 0, "_state": ' + now + ', "name": "' + msg.subject + '", "_name": ' + now + '}';
			
			var headers = new Headers();
			// TODO Content Type ?
			headers.append('Content-Type', 'application/json');
			
			postData('https://api.nirvanahq.com/?api=json&appid=gem&authtoken=' + token, headers, body)
				.then(data =>
					/* browser.runtime.sendMessage({
						type: 'success-detected',
						message: 'Action successfully created'
					}) */
					console.log(data)
				)
				.catch(error => 
					browser.runtime.sendMessage({
						type: 'error-detected',
						message: 'Authentication failed. Wrong password or username.' + error
					})
				);
		});
	}
}

function getAuthToken(username, passwordHash) {
	var body = 'method=auth.new&u=' + username + '&p=' + passwordHash;
	var headers = new Headers();
	headers.append('Content-Type', 'application/x-www-form-urlencoded');
	
	return postData('https://nirvanahq.com/api?api=rest', headers, body)
		.then(response => response.results[0].auth.token);
}

function postData(url, headers, body) {
	
	
	return fetch(url, {
		headers: headers,
		body: body,
		method: 'POST'
	})
		.then(response => response.json());
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

browser.browserAction.onClicked.addListener(buttonClicked);
browser.runtime.onInstalled.addListener(handleInstalled);
browser.runtime.onMessage.addListener(msg => {
    if(msg.type == "settings-updated") {
        const {settings} = msg.message;
        onUpdateSettings(settings);
    }
	if(msg.type == 'create-task') {
		createTask(msg);
	}
	if(msg.type == 'open-nirvana') {
		openNirvana();
	}
});
var getSettings = browser.storage.local.get("settings"); 
getSettings.then((res) => { 
	const {settings} = res; 
	onUpdateSettings(settings); 
});
