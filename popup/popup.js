document.getElementById('submit').addEventListener('click', function(){
	showLoad();
	initActionCreation(false);
});

document.getElementById('nirvana').addEventListener('click', function(){
	browser.runtime.sendMessage({type: 'open-nirvana'});
});

document.getElementById('main-image').addEventListener('click', function(){
	browser.runtime.sendMessage({type: 'open-settings'});
});

browser.runtime.onMessage.addListener(msg => {
	if(msg.type == "success-detected") {
		showSuccess(msg.message);
	}
	if(msg.type == 'error-detected') {
		showError(msg.message);
		if(msg.sendViaMail) {
			initActionCreation(true);
		}
	}
});

var getSettings = browser.storage.local.get("settings");
getSettings.then((res) => {
	const {settings} = res;
	
	if(isUsernameDefined(settings.username) && isPasswordDefined(settings.password)) {
		var tags = document.getElementsByClassName('tags');
		for (var i = 0; i < tags.length; i++) {
			tags[i].style.display = 'inline';
		}
	}
});

function isUsernameDefined(username) {
	return username !== '' && username !== 'username@example.com';
}

function isPasswordDefined(password) {
	return password !== '' && password !== 'd41d8cd98f00b204e9800998ecf8427e'; // Password empty or hash of empty string
}

function showLoad() {
	var message = 'Loading ...';
	show(
		document.getElementById('load'),
		document.getElementById('success'),
		document.getElementById('error'),
		message);
}

function showSuccess(message) {
	show(
		document.getElementById('success'),
		document.getElementById('error'),
		document.getElementById('load'),
		message);
}

function showError(message) {
	show(
		document.getElementById('error'),
		document.getElementById('success'),
		document.getElementById('load'),
		message);
}

function show(show, hide1, hide2, message) {
	show.style.display = 'block';
	hide1.style.display = 'none';
	hide2.style.display = 'none';

	show.innerHTML = message;
}

function initActionCreation(sendViaMail) {
	var getSettings = browser.storage.local.get("settings");
	getSettings.then((res) => {
		const {settings} = res;
		browser.runtime.sendMessage({
			type: 'create-task',
			inboxmail: settings.inboxmail,
			username: settings.username,
			password: settings.password,
			subject: document.getElementById('subject').value,
			message: document.getElementById('message').value,
			tags: document.getElementById('tags').value,
			sendViaMail: sendViaMail
		});
	});
}