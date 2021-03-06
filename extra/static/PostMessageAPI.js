/**
 * Nextcloud - spreedme
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Leon <leon@struktur.de>
 * @copyright struktur AG 2016
 */

// This file is loaded both in Nextcloud and in WebRTC context

(function(window) {

	var PostMessageAPI = function(config) {
		// Bind polyfill
		if (!Function.prototype.bind) {
			Function.prototype.bind = function(that) {
				var context = this;
				var s = Array.prototype.slice;
				var sc = s.call(arguments, 1);
				return function() {
					return context.apply(that, sc.concat(s.call(arguments)));
				}
			};
		}

		var IN_IFRAME = (function() {
			try {
				return window.self !== window.top;
			} catch (e) {
				return true;
			}
		})();

		this.parent = IN_IFRAME ? config.parent : null;
		this.iframe = config.iframe;
		this.popup = config.popup;
		this.opener = config.opener;
		this.allowedPartners = config.allowedPartners;
		this.partnerOrigin = null;
		this.listeners = [];
		this.eventListener = this.gotEvent.bind(this); // To stay in context

		this.init();
	};
	PostMessageAPI.prototype.log = function(message) {
		var args = Array.prototype.slice.call(arguments);
		args.unshift("PostMessageAPI:");
		console.log.apply(console, args);
	};
	PostMessageAPI.prototype.init = function() {

	};
	PostMessageAPI.prototype.post = function(obj) {
		this.log("POSTING FROM", document.location, "TO " + (this.partnerOrigin || this.allowedPartners[0]), obj);
		var pw = this.getPartnerWindow();
		pw.postMessage(obj, this.partnerOrigin || this.allowedPartners[0]);
	};
	PostMessageAPI.prototype.requestResponse = function(id, data, cb) {
		data.id = data.type + ":" + id;

		var listener = function(event) {
			if (event.data.id === data.id) {
				this.unbind(listener);
				cb(event);
			}
		}.bind(this);
		this.bind(listener);
		this.post(data);
	};
	PostMessageAPI.prototype.answerRequest = function(request, data) {
		// Create clone
		request = request.data;
		data.id = request.id;
		this.post(data);
	};
	PostMessageAPI.prototype.getPartnerWindow = function() {
		var pw = null;
		if (this.parent) {
			pw = this.parent;
		} else if (this.iframe) {
			pw = this.iframe.contentWindow;
		} else if (this.popup) {
			pw = this.popup;
		} else if (this.opener) {
			pw = this.opener;
		}
		if (pw === null) {
			this.log("Found no partner window");
		}
		return pw;
	};
	PostMessageAPI.prototype.gotEvent = function(event) {
		if (this.validateEvent(event)) {
			if (!this.partnerOrigin) {
				this.partnerOrigin = event.origin;
			}
			this.log("Got event", event);
			for (var i = 0, l = this.listeners.length; i < l; i++) {
				var listener = this.listeners[i];
				if (listener) {
					listener(event);
				}
			}
		}
	};
	PostMessageAPI.prototype.validateEvent = function(event) {
		var valid = true;
		if (this.partnerOrigin && event.origin !== this.partnerOrigin) {
			valid = false;
		} else if (!Array.isArray(this.allowedPartners) || this.allowedPartners.indexOf(event.origin) === -1) {
			valid = false;
		} else if (event.source !== this.getPartnerWindow()) {
			valid = false;
		}
		return valid;
	};
	PostMessageAPI.prototype.bind = function(fnct) {
		var firstListener = !this.listeners[0];
		this.listeners.push(fnct);
		if (firstListener) {
			window.addEventListener("message", this.eventListener, false);
		}
	};
	PostMessageAPI.prototype.unbind = function(fnct) {
		for (var i = 0, l = this.listeners.length; i < l; i++) {
			var listener = this.listeners[i];
			if (listener === fnct) {
				this.listeners.splice(i, 1);
			}
		}
	};
	PostMessageAPI.prototype.unbindAll = function() {
		window.removeEventListener("message", this.eventListener, false);
		this.listeners = [];
	};

	if (typeof define === "function" && define.amd) {
		define(function() {
			return PostMessageAPI;
		});
	} else {
		window.PostMessageAPI = PostMessageAPI;
	}

})(window);
