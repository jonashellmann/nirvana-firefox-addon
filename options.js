var getSettings = browser.storage.local.get("settings");
getSettings.then((res) => {
	const {settings} = res;
	document.querySelector("#mail").value = settings.inboxmail;;
});

function saveOptions(e) {
	var settings = {
		settings: {
			inboxmail: document.querySelector("#mail").value
		},
	};
	    
	var result = browser.storage.local.set(settings);
	browser.runtime.sendMessage({
		type: "settings-updated",
		message: settings,
	});    
	e.preventDefault();
}

document.querySelector("form").addEventListener("submit", saveOptions);
