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
            },
        });
	}
}

function onUpdateSettings(settings) {
	if(settings.inboxmail !== 'example@nirvana.com') {
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

browser.browserAction.onClicked.addListener(buttonClicked);
browser.runtime.onInstalled.addListener(handleInstalled);
browser.runtime.onMessage.addListener(msg => {
    if(msg.type == "settings-updated") {
        const {settings} = msg.message;
        onUpdateSettings(settings);
    }
	if(msg.type == 'send-mail') {
		var mailtourl = 'mailto:' + encodeURIComponent(msg.inboxmail) + '?subject=' + encodeURIComponent(msg.subject) + '&body=' + encodeURIComponent(msg.message);
		var creating = browser.tabs.create({url: mailtourl});
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
