document.getElementById('my-form').addEventListener('submit', function(){
	var getSettings = browser.storage.local.get("settings");
	getSettings.then((res) => {
		const {settings} = res;
		var inboxmail=settings.inboxmail;;
		var subject=document.getElementByID('subject').value;
		var message=document.getElementByID('message').value;
		window.open('mailto:'+inboxmail+'?subject='+subject+'&body='+message);	 
		return false;
	});
});
