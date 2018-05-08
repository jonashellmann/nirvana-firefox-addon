document.getElementById('submit').addEventListener('click', function(){
	showLoad();
	initActionCreation();
});

document.getElementById('nirvana').addEventListener('click', function(){
	browser.runtime.sendMessage({type: 'open-nirvana'});
});

browser.runtime.onMessage.addListener(msg => {
	if(msg.type == "success-detected") {
		showSuccess(msg.message);
	}
	if(msg.type == 'error-detected') {
		showError(msg.message);
	}
});

var getSettings = browser.storage.local.get("settings");
getSettings.then((res) => {
	const {settings} = res;
	
	if(settings.username !== '' && settings.username !== 'username@example.com' && settings.password !== '') {
		var tags = document.getElementsByClassName('tags');
		for (var i = 0; i < tags.length; i++) {
			tags[i].style.display = 'inline';
		}
	}
});

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

function initActionCreation() {
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
			tags: document.getElementById('tags').value
		});
	});
}