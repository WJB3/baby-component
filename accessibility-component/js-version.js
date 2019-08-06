;(function (global, undefined) {
	'use strict'//使用js严格模式检查，使语法更规范
	var _global;
	//工具函数
	//对象合并
	function extend(o, n, override) {
		for (var keyA in n) {
			if (n.hasOwnProperty(keyA) && (!o.hasOwnProperty(keyA) || override)) {
				o[keyA] = n[keyA];
			}
		}
		return o;
	}
	//通过class查找dom
	if (!('getElementsByClass' in HTMLElement)) {
		HTMLElement.prototype.getElementsByClass = function (n, target) {
			var el = [],
				_el = (!!target ? target : this).getElementsByTagName('*');
			for (var i = 0; i < _el.length; i++) {
				if (!!_el[i].className && (typeof _el[i].className == 'string') && _el[i].className.indexOf(n) > -1) {
					el[el.length] = _el[i];
				}
			}
			return el;
		};
		((typeof HTMLDocument !== 'undefined') ? HTMLDocument : Document).prototype.getElementsByClass = HTMLElement.prototype.getElementsByClass;

	}
	//根据class删除dom
	if(!('removeElementsByClass' in HTMLElement)){
		HTMLElement.prototype.removeElementsByClass=function(target){
			var classList=document.getElementsByClassName(target);
			if(classList){
				for(let i=0;i<classList.length;i++){
					//删除元素
					if(classList[i]!=null){
						classList[i].parentNode.removeChild(classList[i]);
					}
				}
			}
		}
	}
	//插件构造函数
	function Accessibility(opt) {
		this._initial(opt);
	}

	Accessibility.prototype = {
		constructor: this,
		_initial: function (opt) {
			//默认参数
			var def = {
				minFontSize:14,
				maxFontSize:22
			};
			this.def = extend(def, opt, true);//配置参数
			this.dom = '<div class="acc_banner acc_hidden"><div class="acc_magnify banner_first"><div class="acc_magnify_image"><img src="./images/magnify.png" /></div>' +
				'<div class="acc_magnify_text">放大</div></div><div class="acc_shrink banner_first"><div class="acc_shrink_image"><img src="./images/shrink.png" /></div>' +
				'<div class="acc_shrink_text">缩小</div></div></div>';
			document.body.insertBefore(this._parseToDom(this.dom)[0],document.body.firstChild);

			this.hasDom = false;//检查dom树中的accessibity节点是否存在
			this.listeners = [];//自定义事件，用于监听插件的用户交互
			this.handlers = {};
			const _this=this;
			document.getElementsByClass('magnify')[0].onclick=function(e){
				let classList=document.getElementsByClassName('fangda');
				for(let i=0;i<classList.length;i++){
					let flag=Number(getComputedStyle(classList[i]).fontSize.substring(0,getComputedStyle(classList[i]).fontSize.length-2))+1>_this.def.maxFontSize;
					if(flag){
						alert('字体大小不可超过'+_this.def.maxFontSize+'px!')
					}else if(!flag){
						classList[0].style.fontSize=Number(getComputedStyle(classList[i]).fontSize.substring(0,getComputedStyle(classList[i]).fontSize.length-2))+1+'px';
					}
				}
			}
			document.getElementsByClass('shrink')[0].onclick=function(e){
				let classList=document.getElementsByClassName('suoxiao');
				for(let i=0;i<classList.length;i++){
					let flag=Number(getComputedStyle(classList[i]).fontSize.substring(0,getComputedStyle(classList[i]).fontSize.length-2))-1<_this.def.minFontSize;
					if(flag){
						alert('字体大小不可低于'+_this.def.minFontSize+'px!')
						break ;
					}else if(!flag){
						classList[0].style.fontSize=Number(getComputedStyle(classList[i]).fontSize.substring(0,getComputedStyle(classList[i]).fontSize.length-2))-1+'px';
					}
				}
			}
		},
		show:function (callback) {
			var _this = this;
			if (this.hasDom) return;
			document.getElementsByClass('acc_banner')[0].classList.remove("acc_hidden")
			this.hasDom = true;
			callback && callback();
			return this;
		},
		hide: function (callback) {
			document.getElementsByClass('acc_banner')[0].classList.add("acc_hidden")
			this.hasDom = false;
			callback && callback();
			return this;
		},
		_parseToDom: function (str) {//将字符串转为dom
			var div = document.createElement('div');
			if (typeof str == "string") {
				div.innerHTML = str;
			}
			return div.childNodes;
		},
		css:function(styleObj){
			for(var prop in styleObj){
				var attr=prop.replace(/[A-Z]/g,function(word){
					return '-'+word.toLowerCase();
				});
				this.dom.style[attr]=styleObj[prop];
			}
			return this;
		},
		on: function (type, handler) {
			if (typeof this.handlers[type] === "undefined") {
				this.handlers[type] = [];
			}
			this.listeners.push(type);
			this.handlers[type].push(handler);
			return this;
		},
		off: function (type, handler) {
			if (this.handlers[type] instanceof Array) {
				var handlers = this.handlers[type];
				for (var i = 0, len = handlers.length; i < len; i++) {
					if (handlers[i] === handler) {
						break;
					}
				}
				this.listeners.splice(i, 1);
				handlers.splice(i, 1);
				return this;
			}
		},
		emit: function (event) {
			if (!event.target) {
				event.target = this;
			}
			if (this.handlers[event.type] instanceof Array) {
				var handlers = this.handlers[event.type];
				for (var i = 0, len = handlers.length; i < len; i++) {
					handlers[i](event);
					return true;
				}
			}
			return false;
		}

	}

 

	//最后将插件对象暴露给全局对象
	_global = (function () { return this || (0, eval)('this'); }())
	if (typeof module !== "undefined" && module.exports) {
		module.exports = plugin;
	} else if (typeof define === "function" && defined.amd) {
		define(function () { return plugin; });
	} else {
		!('Accessibility' in _global) && (_global.Accessibility = Accessibility);
	}

}());