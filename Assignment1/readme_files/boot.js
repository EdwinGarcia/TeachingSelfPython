CS = window.CS || {}, ENV = window.ENV || {}, Views = window.Views || {};
ENV.merge = function(o,r) { for(var x in o) { if(r){ ENV[x]=o[x]; } else if(!ENV[x]){ ENV[x] = o[x]; } } };
ENV.get = function(k,d){ return ENV[k] || d || null; };
ENV.set = function(k,d){ ENV[k] = d; };
ENV.hooks = {};
ENV.queue = {};
ENV.queue.hooks = { beforeload:[], onload:[], afterload:[], unload:[], presence:[], away:[], ajax:[], stdby:[]};

cs_console = function(t,arg){ window.console && console[t||'log'](arg.length==1 ? arg[0] : arg); };
debug = function(){ cs_console('log',arguments); };
error = function(){ cs_console('error',arguments); };
log = function(){ cs_console('log',arguments); };

addHook = function(h,c){
  var h = typeof h==="string" && h || 'stdby';
  typeof c==="function" && ENV.queue.hooks[h] && ENV.queue.hooks[h].push(c);
};
loadHooks = function(a,n){
  var load = function(m) {
    var rH = ENV.queue.hooks[m];
    if(rH && rH.length>0) {
      for(var c in rH) {
        typeof rH[c] === "function" && rH[c]();
      }
      if(!n) {
        ENV.queue.hooks[m] = [];
      }
    }
  };
  if(a instanceof Array) {
    for(var x in a) {
      var h = typeof a[x]==="string" && a[x] || 'stdby';
      load(h);
    }
  }
  else {
    load(typeof a==="string" && a || 'stdby', n);
  }
};

_addHook = function(hook, callback) {
  if(hook && typeof callback == "function") {
    if(!ENV.hooks[hook]) { ENV.hooks[hook] = []; }
    ENV.hooks[hook].push(callback);
  }
};

_loadHook = function(hook,callback,elsefail) {
  if(hook && ENV.hooks[hook]) {
    for(var i in ENV.hooks[hook]) {
      ENV.hooks[hook][i].call();
    }
    typeof callback == "function" && callback();
  }
  else {
    typeof elsefail == "function" && elsefail();
  }
};
_removeHook = function(hook){
  if(hook && ENV.hooks[hook]) {
    delete ENV.hooks[hook];
  }
};

Function.prototype.props = function(obj){
  for(var i in obj) {
    if(!this.hasOwnProperty(i)) { this[i] = obj[i]; }
  }
  return this;
};
Function.prototype.extend = function(obj){
  for(var i in obj) {
    if(!(i in this.prototype)) { this.prototype[i] = obj[i]; }
  }
  return this;
};

TEST_STR = "abcdefghijklmnopqrstrvwxyz ABCDEFGHIJKLMNOPQRSTRVWXYZ 1234567890 -=~!@#$%^&*()_+ []\;',./{}|:\"<>?";
TEST_EXTRA = "$1,016,344.40345 <span id='id_name' class=\"my-class\">HTML</span> [brackets] {curly}";

String.extend({
  limit: function(t,c) { var s = this.toString().replace(/<\/?\w+.*?>/gim, ""); return s.substr(0,t||50) + (c && s.length>=(t||50) ? c : ''); },
  lcase: function(){ return this.toString().toLowerCase(); },
  ucase: function(){ return this.toString().toUpperCase(); },
  toTitleCase: function() { return this.toString().replace(/\w\S*/g, function(txt){ return txt.charAt(0).ucase() + txt.substr(1).lcase(); }); },
  trim: function() { return this.toString().replace(/\s{2,}/g,' ').replace(/^\s+/,'').replace(/\s+$/,''); },
  cleanAll: function() { return this.toString().replace(/[^\w\d\s\~\!\@\#\$\%\^\&\*\(\)\-\=\_\+\[\]\:\;\<\>\,\.\?\/\'\"\{\}]+/gi,''); },
  cleanNum: function() { return this.cleanAll().replace(/[^\d\.\,\s]+/gi,''); },
  cleanNumeric: function() { return this.cleanNum(); },
  cleanAlpha: function() { return this.cleanAll().replace(/[^a-z\s\-\,\.\_]+/gi,''); },
  cleanAlphaNum: function(){ return this.cleanAll().replace(/[^\w\d\s\-\,\.\_]+/gi,''); },
  cleanAlphaOnly: function(){ return this.cleanAll().replace(/[^a-z\s\-]+/gi,''); },
  cleanAlphaNumOnly: function(){ return this.cleanAll().replace(/[^a-z0-9\s\-]+/gi,''); },
  cleanHTML: function() {
    var s = this.cleanAll();
    var x = '', h = { "@":"&#064;", '"':"&quot;", "<":"&#060;", ">":"&#062;", "&":"&amp;", "{":"&#123;", "}":"&#125;", "[":"&#091;", "]":"&#093;" };
    for(var i=0; i<s.length; i++){ var a=s.charAt(i); x += (h[a] ? h[a] : a); }
    return x;
  },
  url_clean: function(){ return this.cleanAlphaNumOnly().replace(/\s+/gi,"-").lcase(); }
});

Number.extend({
  limit: function(t){ return parseInt(this.toString().substr(0,t||999)); },
  cleanAll: function(){ return this.toString().cleanAll(); }
});

Array.extend({
  map: function(mapper, that) {
    var other= new Array(this.length);
    for(var i= 0, n= this.length; i<n; i++) {
      if(other[i] && i in this) {
        other[i] = mapper.call(that, this[i], i, this);
      }
    }
    return other;
  }
});

e = function(e){ return document.getElementById(e); };

empty = function(a) {
  if(typeof a === "object") {
      for(var prop in a) { if(a.hasOwnProperty(prop)) { return false; } }
    }
    else if(typeof a !== undefined) { return false; }
    return true;
};

obj_merge = function(a,b,o) {
  if(typeof a == "object" && typeof b == "object") {
      for(var x in b) { if(o){ a[x]=b[x]; } else if(!a[x]){ a[x]=b[x]; } }
    }
    return a;
};

exists = function(search, obj){
  var find = (search||'').split('.'), obj = obj || null;
  if(!obj) { obj = window[find[0]]; delete find[0]; }
  if(!obj) { return false; }
  for(var i in find) {
    if(!obj[find[i]]) { return false; }
    obj = obj[ find[i] ];
  }
  return obj;
};

parse_json = function(s) {
  var params = {};
  if(!empty(s)) {
    try { params = $.parseJSON(s); } catch(e){ error("unable to parse json"); }
  }
  return params;
};

KEYS = { ENTER:13, RETURN:13, SPACE:8, BACKSPACE:32, DELETE:46, ESCAPE:27, TAB:9, LEFT:37, UP:38, RIGHT:39, DOWN:40, COMMA:188, PERIOD:190, CTRL:91 };
KEYS.simulate = function(type,key){
  if(type && (KEYS[key] || typeof key=="number")) {
    var key_id = KEYS[key] || key;
    var e = jQuery && jQuery.Event(type) || null;
    if(e) { e.which = e.keyCode = e.charCode = key_id; }
    return e;
  }
  return null;
};

microtime = function(t,since,nodot){
  var D = since || (new Date()).getTime();
  var m = (nodot) ? D : D.toString().substr(0,10)+'.'+D.toString().substr(10,5);
  return parseFloat(m.limit(typeof t=="boolean" && t===true && 10 || t || 20));
};

now = function(){ return parseInt(String(+new Date).substr(0,9),10); };

microtime_to_date = function(t){
  var D = (new Date( (t || microtime()) * 1000.0));
  var M = (D.getMonth()<=9?"0":"") + D.getMonth();
  var s = D.getFullYear()+"-"+M+"-"+D.getDate()+" "+D.getHours()+":"+D.getMinutes()+":"+D.getSeconds()+"."+D.getMilliseconds();
  return s;
}
time_ago = function(start,since,expand){
  var agos = { 'day':86400, 'hr':3600, 'min':60, 'sec':1 }, levels = 0, result = '', strsize = expand||0;
  var time = start / 1000;
  var now = (since || +(new Date().getTime())) / 1000;
  var diff = (time > now ? time-now : 0);
  if(diff==0) { return "just now"; }
  for(var a in agos){
    if(diff >= agos[a]){
      var age = Math.floor(diff/agos[a]);
      diff %= agos[a];
      result += '|'+age+' '+a+(age>1?'s':'');
    }
    if(levels==5){ break; }
    levels++;
  }
  var m = result.replace(/^\|/,"").split('|');
  result = (m.length>2 ? (strsize==2 ? m.join(' ') : (strsize==1 ? m[0]+' '+m[1] : m[0]) ) : m.join(' ')) + ' ago';
  return result;
};

/* converts to prefix 'data[...]', @usage: post_data_params({a:1, v:3}); @returns: {'data[a]':1, 'data[v]':3} */
post_data = function(data,f){
  var f = typeof f == "string" && f || null, post = {};
  if(data instanceof Object) {
    for(x in data) {
      var k = "data"+(f?"["+f+"]":'')+"["+x+"]";
      if(/\[.*?\]/.test(x)) {
        k = "data"+(f?"["+f+"]":'')+"["+x.replace(/\[.*?\]/gim,function(a){ return a.replace("]","").replace("[","]["); })+"]";
      }
      post[k] = data[x];
    }
  }
  return post;
};

Load = { cache:{} };
Load.file = function(id,type,url,callback) {
  if(this.cache[id]) {
    typeof callback=="function" && callback.call();
    return false;
  }
  var T = type=="css" ? "link" : "script";
  var F = document.createElement(T);
  F.type = type=="css" ? "text/css" : "text/javascript";
  F.id = "loaded_"+id;
  if(type=="css") {
    F.href = url;
    F.rel = "stylesheet";
    F.media = "screen";
  }
  else {
    F.src = url;
    F.onload = callback || false;
  }
  var H = document.getElementsByTagName(T)[0];
  H.parentNode.insertBefore(F, H);
  this.cache[id] = url;
  return this;
};
Load.js = function(id,url,callback) { Load.file(id,"js",url,callback); return this; };
Load.css = function(id,url,callback) { Load.file(id,"css",url,callback); return this; };

Storage = (function(){
  // storage engine
  var A = {}, e = window.SimpleStorage || window.localStorage;

  A.set = function(k,v) {
    v = typeof v == "object" && JSON.stringify(v) || v;
    e[k] = v;
    return this;
  };
  A.get = function(k) {
    return e[k] || null;
  };
  A.del = function(k) {
    if(e[k]) {
      delete e[k];
    }
    return this;
  };
  A.get_all = function() {
    return e || null;
  };
  A.del_all = function() {
    for(var k in e) {
      delete e[k];
    }
    return this;
  };

  return A;
})();

URI = {};
URI.get_queries = function(f) {
  var from = f || window.location.search.replace(/^\?/,"");
  if(f=="hash" || f=="h") {
    from = window.location.hash.replace(/^#/,"");
  }
  var list = {};
  from.split("&").map(function(q){
    if(q) {
      var a = q.split("=");
      list[a[0]] = a[1];
    }
  });
  return list;
};
URI.encode = function(s) { return encodeURIComponent((s||'').toString()); };
URI.decode = function(s) { return decodeURIComponent((s||'').toString()); };
URI.get = function(s,from) { return URI.get_queries(from)[s] || null; };
URI.param = URI.get;
URI.hash = location.hash.replace(/^#/,"");
URI.go = function(url) { window.location.href = url; };
URI.title = function(t) {
  if(t) { window.document.title = t; }
  return window.document.title;
};
URI.replaceState = function(url,title) {
  if(typeof window.history.replaceState == "function") {
    window.history.replaceState(title, title, url); // adds history to the back/forward buttons.
    URI.title(title);
  }
};
URI.appendQS = function(obj,f) {
  var z = [], qs = f || URI.get_queries();
  for(var x in obj) { qs[x] = obj[x]; }
  for(var i in qs) { z.push( i + "=" + (typeof qs[i]==="string" ? URI.encode(qs[i]) : qs[i])); }
  return z.join('&');
};
URI.compile = function(f,p) { return URI.appendQS(p, f||{}); };
URI.build = URI.compile;
URI.route = function(path,success,fail){
  var re = new RegExp(path);
  var url = document.location.pathname + document.location.search + document.location.hash;
  var match = url.match(re);
  typeof success == "function" && success(match,url);
  typeof fail == "function" && fail(path,url);
};

Cookie = {
  set: function(name,value,expiredays,domain) {
    if(name) {
      var D = new Date();
      D.setDate(D.getDate() + (expiredays||50));
      document.cookie = name+ "=" + escape(value) + (expiredays==null ? "" : "; expires="+D.toUTCString()) + "; path=/; domain="+(domain||"."+ENV.url.domain);
    }
  },
  get: function(name,_default) {
    if(name && document.cookie.length>0) {
      var start = document.cookie.indexOf(name + "=");
      if (start!=-1) {
        start = start + name.length + 1;
        var end = document.cookie.indexOf(";",start);
        if (end==-1) {
          end = document.cookie.length;
        }
        return unescape(document.cookie.substring(start,end));
      }
    }
    return (_default||null);
  },
  del: function(name) {
    name && this.set(name,'',-1);
  }
};

Analytics = function(){
  var A = {};
  A.google = {
    ready: false,
    init: function(){
      window._gaq = [ ['_setAccount', 'UA-19631591-1'], ['_setDomainName', 'cloudshopper.com'] ];

      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true; //$.getScript('//bit.ly/fuZ745');
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      ga.ignoreCache = true;
      ga.onload = function(){
        A.google.ready = true;
        if(ENV.dev==true) {
          _gaq.push(['_setDomainName', 'dev.cloudshopper.com']);
        }
      };
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga,s);
      return this;
    }
  };
  A.statcounter = {
    ready: false,
    init: function(){
      if(ENV.dev==true || window.location.protocol=="https:") { return false; }

      window.sc_project = 6469134;
      window.sc_invisible = 1;
      window.sc_security = "693d312a";

      var SC = document.createElement('script'); SC.type = 'text/javascript'; SC.async = true; SC.ignoreCache = true; SC.src = "http://www.statcounter.com/counter/counter.js";
      SC.onload = function(){ A.statcounter.ready = true; };
      var C = document.getElementsByTagName('script')[0]; C.parentNode.insertBefore(SC,C);

      return this;
    }
  };
  A.api = {
    transaction: function(){
      var r = new XMLHttpRequest();
      p = '/api/transaction' + window.location.search;
      r.open('GET',window.location.protocol + '//'+(ENV.dev?'dev.':'')+'cloudshopper.com'+p, true);
      r.send();
    }
  };
  return A;
};
Analytics = new Analytics();

Track = {
  page: function(url){
    this.url = url || document.location.href;
    if(window._gaq) {
      this.campaign(null,this.override, (this.override ? true : false));
      this.url += /\?/g.test(this.url) ? '&' : '?';
      this.url += (this.utm||'');
      this.url = (ENV.dev ? "DEV: " : "")+this.url;
      _gaq.push(['_trackPageview', this.url]);
      this.override = this.url = this.utm = null;
    }
    Analytics.statcounter.init();
    return this;
  },
  customVar: function(key,val,priority,level) {
    if(window._gaq) {
      key = (ENV.dev ? "DEV: " : "")+key;
      _gaq.push(['_setCustomVar',priority||1,key||null,val||null,level||3]);
    }
    return this;
  },
  event: function(cat,action,label){
    if(window._gaq) {
      cat = (ENV.dev ? "DEV: " : "")+cat;
      _gaq.push(['_trackEvent', cat||null, action||null, label||null]);
    }
    return this;
  },
  social: function(network,action,url,path){
    if(window._gaq) {
      network = (ENV.dev ? "DEV: " : "")+network;
      _gaq.push(['_trackSocial', network||null, action||null, url||null, path||null]);
    }
    return this;
  },
  campaign: function(opt,isNew,skip){
    //campaign-code [ _gc=Source:social,Medium:email,Name/Campaign:friend,Content/Via:fbcanvas,Term/Ad:paid ] or [ _gc=social:email:friend:fbcanvas:paid:referralName ]
    var o = opt || {}, gc = (URI.get("_gc") || '').split(':'), t = {};
    this.override = isNew ? true : false;
    if(window._gaq && !skip) {
      t.utm_source = o.source || (!this.override && (gc[0] || URI.get('utm_source')) );
      t.utm_medium = o.medium || (!this.override && (gc[1] || URI.get('utm_medium')) );
      t.utm_campaign = o.name || (!this.override && (gc[2] || URI.get('utm_campaign')) );
      t.utm_content = o.content || (!this.override && (gc[3] || URI.get('utm_content')) );
      t.utm_term = o.term || (!this.override && (gc[4] || URI.get('utm_term')) );
      t.utm_referral = o.referral || (!this.override && (gc[5] || URI.get('utm_referral')) );
      this.utm = URI.build(t);
    }
    return this;
  },
  metric: function(is, data, success){
    window.jQuery && $.post("/track/metric/"+(is||''),post_data(data),success);
    return this;
  }
};

//ENV.dev=1;
Analytics.api.transaction();
Analytics.google.init();
