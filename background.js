const default_nirvanamail = 'example@nirvana.com';
const default_username = 'username@example.com';
const default_password = 'd41d8cd98f00b204e9800998ecf8427e';

function buttonClicked() {
	var getSettings =  browser.storage.local.get("settings");
	getSettings.then((res) => {
		const {settings} = res;
		if(!hasSettingsChanged(settings.inboxmail, settings.username, settings.passwordHash)) {
			openOptionsPage();
		}
	});
}

function handleInstalled(details) {
	if(details.reason=="install") {
		browser.storage.local.set({
            settings: {
                inboxmail: default_nirvanamail,
				username: default_username,
				passwordHash: default_password
            },
        });
	}
}

function onUpdateSettings(settings) {
	if(hasSettingsChanged(settings.inboxmail, settings.username, settings.passwordHash)) {
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
			browser.tabs.create({url: 'https://focus.nirvanahq.com', active: true});
		}
	});
}

function createTask(msg) {
	if(msg.subject === '') {
		sendErrorMessage('A Task needs a title!', false);
		return;
	}
	
	if(!isUsernameAndPasswordDefined(msg.username, msg.passwordHash) || msg.sendViaMail === true) {
		createTaskViaMail(msg.inboxmail, msg.subject, msg.message);
	}
	else {
		createTaskViaAPI(msg.username, msg.passwordHash, msg.subject, msg.message, msg.tags);
	}
}

function createTaskViaMail(inboxmail, subject, message) {
	var mailtourl = 'mailto:' + encodeURIComponent(inboxmail) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message);
	var creating = browser.tabs.create({url: mailtourl});
}

function createTaskViaAPI(username, passwordHash, subject, note, tags) {
	getAuthToken(username, passwordHash)
		.then(token => {
			var now = Math.floor( Date.now() / 1000 );

			var body = '[{"method":"task.save","id":"' + uuidv4() + '","type": 0,"_type":' + now + ',"state":0,"_state":' + now + ',"name":"' + subject + '","_name":' + now +',"tags":"' + tags + '","_tags":' + now + ',"note":"' + note + '","_note":' + now + '}]';			
			var headers = new Headers();
			headers.append('Content-Type', 'application/json');
			
			postData('https://api.nirvanahq.com/?api=json&appid=gem&authtoken=' + token, headers, body)
				.then(data => {
					if(data.results[0].task.name === subject){
						sendSuccessMessage('Action successfully created');
					}
					else {
						sendErrorMessage('Action couldn\'t be created.', true);
					}
				})
				.catch(error => sendErrorMessage('Authentication failed. Wrong username or password!', true));
		});
}

function getAuthToken(username, passwordHash) {
	var body = 'method=auth.new&u=' + encodeURIComponent(username) + '&p=' + encodeURIComponent(passwordHash);
	var headers = new Headers();
	headers.append('Content-Type', 'application/x-www-form-urlencoded');
	
	return postData('https://nirvanahq.com/api?api=rest', headers, body)
		.then(response => response.results[0].auth.token)
		.catch(error => error);
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

function sendErrorMessage(message, sendViaMail) {
	browser.runtime.sendMessage({
		type: 'error-detected',
		message: message,
		sendViaMail: sendViaMail
	});
}

function sendSuccessMessage(message) {
	browser.runtime.sendMessage({
		type: 'success-detected',
		message: message
	});
}

function openOptionsPage() {
	browser.runtime.openOptionsPage();
}

function hasSettingsChanged(inboxmail, username, passwordHash) {
	return isNirvanaMailDefined(inboxmail) || isUsernameAndPasswordDefined(username, passwordHash);
}

function isNirvanaMailDefined(inboxmail) {
	return inboxmail !== '' && inboxmail != default_nirvanamail;
}

function isUsernameAndPasswordDefined(username, passwordHash) {
	return isUsernameDefined(username) && isPasswordDefined(passwordHash);
}

function isUsernameDefined(username) {
	return username !== '' && username !== default_username;
}

function isPasswordDefined(passwordHash) {
	return passwordHash !== '' && passwordHash !== default_password;
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
	if(msg.type == 'open-settings') {
		openOptionsPage();
	}
});
var getSettings = browser.storage.local.get("settings"); 
getSettings.then((res) => { 
	const {settings} = res; 
	onUpdateSettings(settings); 
});
