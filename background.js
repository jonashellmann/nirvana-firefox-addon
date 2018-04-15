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

browser.browserAction.onClicked.addListener(buttonClicked);
browser.runtime.onInstalled.addListener(handleInstalled);
browser.runtime.onMessage.addListener(msg => {
    if(msg.type == "settings-updated") {
        const {settings} = msg.message;
        onUpdateSettings(settings);
    }
	if(msg.type == 'send-mail') {
		var mailtourl = 'mailto:' + msg.inboxmail + '?subject=' + msg.subject + '&body=' + escape(msg.message);
		var creating = browser.tabs.create({url: mailtourl});
	}
	if(msg.type == 'open-nirvana') {
		browser.tabs.create({url: 'https://focus.nirvanahq.com'});
	}
});
var getSettings = browser.storage.local.get("settings"); 
getSettings.then((res) => { 
	const {settings} = res; 
	onUpdateSettings(settings); 
});
