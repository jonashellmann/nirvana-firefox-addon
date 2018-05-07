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
			message: document.getElementById('message').value,
			tags: document.getElementById('tags').value
		});
	});
});

document.getElementById('nirvana').addEventListener('click', function(){
	browser.runtime.sendMessage({type: 'open-nirvana'});
});

browser.runtime.onMessage.addListener(msg => {
	if(msg.type == "success-detected") {
		var e = document.getElementById('error');
		var s = document.getElementById('success');

		e.style.display = 'none';
		s.style.display = 'block';

		s.innerHTML = msg.message;
	}
	if(msg.type == 'create-task') {
		var e = document.getElementById('error');
		var s = document.getElementById('success');
		
		e.style.display = 'block';
		s.style.display = 'none';

		e.innerHTML = msg.message;
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