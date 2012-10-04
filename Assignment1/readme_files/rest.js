Responder = {
  isReady: false,
  source: null,
  listen: function(event) {
    var self = Responder;
    var json = {};
    if(event && event.data) {
      try {
        var json = JSON.parse(event.data);
      }
      catch(e) {
        var json = {};
      }
    }
    //debug("REST [received]",event,event.data,json);
    Responder.source = event.source;

    if(json.rest=="ack") {
      self.send({ rest:"ready" });
    }
    else if(json.rest && MAP[json.rest]) {
      var respond = typeof MAP[json.rest] == "function" && MAP[json.rest](json) || MAP[json.rest];
      //debug("rest request", typeof MAP[json.rest], MAP[json.rest], respond);
      self.send(respond);
    }
    else if(json.ext_api) {
      Extension[json.ext_api] && Extension[json.ext_api](json.ext_args);
    }

    if(json.modal) {
      self.send({modal:"show"});
    }
  },
  send: function(message) {
    if(typeof message == undefined) { return false; }
    //debug("response send:",Responder.source, message);
    Responder.source && Responder.source.postMessage(JSON.stringify(message), '*');
  },
  init: function() {
    //debug("init responder side");
    //Add Event Listents For HTML5 message
    if (window.addEventListener) {
      window.addEventListener("message", Responder.listen, false);
    }
    else if (window.attachEvent) {
      window.attachEvent("onmessage", Responder.listen, false);
    }
  }
};

// method mapper
MAP = {};
MAP.get_user = { user: parse_json(Cookie.get("cu_rest")) };

MAP.get_product_info = function(json){
  //debug(json);
  // get prices and etc...
  return { data: "title is: "+(exists("fields.title",json) || 'none'), fields:json.fields };
};

Extension = {};
Extension.get_site_whitelist = function(current_url){
  var sites = Extension.whitelist && Extension.whitelist.sites;
  //current_url = current_url.replace(/\/$/,"");
  //debug( (+new Date), current_url, sites, this);
  var data = { ext_api:1 };

  if(current_url && sites) {
    var total = sites.length - 1, start = 0;
    while(start <= total) {
      var site = sites[start];
      //debug("checking",current_url,site.url);
      if(site.url && current_url.match(new RegExp(site.url), 'i')) {
        data.site = site;
        data.bar = "parse_site";
        //debug("found:",site);
        break
      }
      start++;
    }
  }
  //debug(data);
  Responder.send(data);
};

// var cachedWhiteList = Storage.get("whitelist"), cachedWLsince = "";
// cachedWhiteList = cachedWhiteList && JSON.parse(cachedWhiteList);
// cachedWLsince = cachedWhiteList && cachedWhiteList.updated;
// Extension.whitelist = cachedWhiteList;

// setTimeout(function(){
//  var since = (cachedWLsince>0 ? "&since="+cachedWLsince : "");
//  $.getJSON(ENV.url.httpdomain+"/bar/whitelist?_v=1"+since+(ENV.dev?"&_t="+now():""),function(json){
//    if(json && json.updated && json.updated>0) {
//      Extension.whitelist = json;
//      Storage.set("whitelist",json);
//    }
//    else {
//      Extension.whitelist = cachedWhiteList;
//    }
//  });
// },500);
//

var WL_L = ENV.url.httpdomain+"/bar/whitelist?_v=1"+(ENV.dev?"&_t="+now():"")+"&uri="+ENV.rev.ts+"&site="+URI.decode(URI.get("site"));
var WL_S = ENV.url.cdn+"whitelist.json";
//var WL = (ENV.dev ? WL_L : WL_S);
var WL = WL_L; //(ENV.dev ? WL_L : WL_S);
//debug(WL);
Responder.init();
$.getJSON(WL, function(json){
//$.ajax({url:WL, dataType:"jsonp", success:function(json) {
  Extension.whitelist = json;
  Storage.set("whitelist",json);
  Responder.send({ rest:"ready" });
  //debug(json);
});
