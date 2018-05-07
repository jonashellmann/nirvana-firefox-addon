document.getElementById('submit').addEventListener('click', function(){
	var getSettings = browser.storage.local.get("settings");
	getSettings.then((res) => {
		const {settings} = res;
		browser.runtime.sendMessage({
			type: 'create-task',
			inboxmail: settings.inboxmail,
			username: settings.username,
			password: settings.password,
			subject: document.getElementById('subject').value,
			message: document.getElementById('message').value
		});
	});
});

document.getElementById('nirvana').addEventListener('click', function(){
	browser.runtime.sendMessage({type: 'open-nirvana'});
});