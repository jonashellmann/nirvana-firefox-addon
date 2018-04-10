document.getElementById('submit').addEventListener('click', function(){
	var getSettings = browser.storage.local.get("settings");
	getSettings.then((res) => {
		const {settings} = res;
		var inboxmail=settings.inboxmail;;
		var subject=document.getElementById('subject').value;
		var message=document.getElementById('message').value;
		browser.runtime.sendMessage({
			type: 'send-mail',
			inboxmail: inboxmail,
			subject: subject,
			message: message
		});
	});
});

document.getElementById('nirvana').addEventListener('click', function(){
	browser.runtime.sendMessage({type: 'open-nirvana'});
}