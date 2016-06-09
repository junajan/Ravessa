var moment = require("moment");
var async = require("async");
var nodemailer = require('nodemailer');

var Mailer = function(app) {
	var self = this;
	var config = app.get('config');
	var emailConf = config.email;

	function getFullDate(d) {
		return d.format("YYYY-MM-DD HH:mm:ss");
	}

	this.sendDailyLog = function(log) {
		if(!emailConf.dailyLog)
			return false;
		
		var title = config.env+" sandy daily log";
		var msg = '<b>Sandy bot - daily log for '+getFullDate(moment())+"</b>";

		msg += '<br /><br />';
		msg += log;

		console.log('Sending daily log by email');
		self.send(title, msg, null, true);
	};

	this.send = function(title, text, email, isHtml) {
		email = email || emailConf.email;
		if(!emailConf.enabled)
			return false;

		transport = nodemailer.createTransport();
		var mailConfig = {  //email options
			from: emailConf.from, // sender address.  Must be the same as authenticated user if using Gmail.
			to: email, // receiver
			subject: title,
			text: text,
		};

		if(isHtml) mailConfig.html = text;
		else mailConfig.text = text;

		transport.sendMail(mailConfig, function(err, res){  //callback
			if(err){
			   console.error(err);
			}
		});
	};

	this.sendStartMessage = function() {
		var title = config.env+" sandy was stared";
		var msg = 'Sandy bot was started at '+getFullDate(moment());

		console.log('Sending welcome email');
		self.send(title, msg);
	};

	this.sendLateStartErrorMessage = function(info) {
		var title = config.env+" sandy was started too late!";
		var msg = 'Sandy bot was started too late!'
					+ '\n\tIt was started at: '+getFullDate(info.now)
					+ '\n\tStrategy init was at: '+getFullDate(info.timeStrategyInit)
					+ '\n\tClosing is at: '+getFullDate(info.timeClose);

		self.send(title, msg);
	};

	app.on('event:error_late_start', this.sendLateStartErrorMessage);
	this.sendStartMessage();
	return this;
};


module.exports = function(app) {
	return new Mailer(app);
};
