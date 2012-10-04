if(ENV._static) {
  var qs = URI.get_queries();
  ENV.client.ua = qs.browser;
  ENV.client.p_bar_g = qs._g;
  ENV.client.site = URI.decode(qs.origin);
  ENV.client.site = URI.decode(qs.site);
  ENV.client.via = qs.via;
}

Helper = window.Helper || {};
Helper.genderPronoun = function(g,s) {
  return g && s && (s.split('/')[(g==="male"?0:1)]||'') || '-';  //  _('male',"his/her");
};
Helper.FB_ServerFBML = function(opt, content, callback) {
  var opt = opt || {};
  var id = opt.id || opt, content = opt.content || content;
  var callback = opt.callback || callback;
  $(id).html("<fb:serverfbml "+(opt.attrs||'')+" width=\""+(opt.width||"100%")+"\" height=\""+(opt.height||"100%")+"\" style=\""+(opt.style||'')+"\" fbml=\""+(content||'').cleanHTML()+"\"></fb:serverfbml>");
  if(opt.parse && window.FB && FB.XFBML) {
    FB.XFBML.parse();
  }
  typeof callback === "function" && callback();
};
Helper.make_links = function(html,anchor,key){
  var html = html || ''; html=" "+html+" ";
  var key = key || ENV && ENV.hash || '', i_k=''; for(var i=0;i<=4;i++){ i_k+=key[i]; }
  var url = " <a target='_blank' href=\"/r?k="+i_k+"&rs=$1\">"+(anchor||"$1")+"</a> ";
  return html.replace(/\s(http?.*)\s/,"<b>$1</b>");
};

Helper.setIframe = function(opts){
    var opt = opts || {};
    var id = opt.id || "cloudshopper_iframe_"+(+new Date);

    var qs = {};
    for(var i in opt.qs) { qs[i] = URI.encode(opt.qs[i]); }

    var F = e(id) || document.createElement("iframe");
    F.id = id;
    F.src = opt.url + "?" + URI.build(qs);
    F.onload = opt.onload || false;
    F.onerror = opt.onerror || false;
    F.width = opt.width || 0;
    F.height = opt.height || 0;
    F.cssText = opt.style || opt.css || opt.cssText || "position:absolute;z-index:100001;top:-9999999:left:-9999999;width:0;height:0";
    F.scrolling = "no";
    F.frameBorder = opt.frameBorder || 0;
    if(opt.attrs) {
        for(var i in opt.attrs) { F.setAttribute(i, opt.attrs[i]); }
    }
    if(typeof opt.before === "function") {
        opt.before.call();
    }
    try {
        if(opt.insertBefore) {
            opt.insertBefore.insertBefore(F, opt.insertBefore.firstChild);
        }
        else if(opt.appendAfter) {
            $(opt.appendAfter).after(F);
        }
        else {
          document.body.appendChild(F);
        }
        if(typeof opt.after === "function") {
            opt.after.call();
        }
    } catch(e){}
};

User = window.User || {};
User.get = function(k,d) { return User.cu && User.cu[k] || d || null; };

User.presence = function(opts, cb){
  return {};
  var opt = opts || {};
  var callback = opt.callback || cb || typeof opt=="function" && opt;
  $.getJSON(ENV.url.httpdomain+"/user/presence?inc=user,"+(opt.presence_inc||opt.inc||'')+"&success="+(opt.success_inc||opt.success||'')+"&error="+(opt.error_inc||opt.error||''),function(json){
    User.cu = {};
    User.linked = null;
    User.uid = null;
    User.fb_uid = null;
    User.twitter_uid = null;
    if(json.User) {
      User.cu = json.User;
      User.linked = User.cu.linked || {};
      User.uid = User.cu.uid;
      User.fb_uid = User.linked.facebook;
      User.twitter_uid = User.linked.twitter;
    }
    typeof callback == "function" && callback(json);
  });
};
User.extract_cu = function(json){
  if(json) {
    User.cu = {};
    User.linked = null;
    User.uid = null;
    User.fb_uid = null;
    User.twitter_uid = null;
    if(json.User) {
      User.cu = json.User;
      User.linked = User.cu.linked || {};
      User.uid = User.cu.uid;
      User.fb_uid = User.linked.facebook;
      User.twitter_uid = User.linked.twitter;
    }
  }
  else {
    User.presence();
  }
};
User.update_cu = function(json){
  User.extract_cu(json);
};
User.cu = User.extract_cu() || {};

CS.is_fb_user = function(){ return User.fb_uid || false; };
CS.is_cs_user = function(){ return User.uid || false; };

User.OAuth = {};
User.OAuth.temp_email = function(opts,callback){
  var opt = opts || {};
  $.post("/oauth/temp_email", post_data(opt), function(json){
    typeof callback=="function" && callback(json);
  });
};
User.login = function(opts,callback){
  var opt = opts || {};
  var callback = typeof callback == "function" && callback || function(){};
  if(!opt.email || !opt.password) {
    callback({error: "An Email and Password are required to create your account." });
    return false;
  }
  $.post("/user/login", post_data(opt), function(json){
    callback(json);
  });
};
User.reset_password = function(opts,callback){
  var opt = opts || {};
  var callback = typeof callback == "function" && callback || function(){};
  if(!opt.email) {
    callback({error: "An Email is required." });
    return false;
  }
  $.post("/user/resetpass", post_data(opt), function(json){
    callback(json);
  });
};

User.signup = function(opts,callback){
  var opt = opts || {};
  var callback = typeof callback == "function" && callback || function(){};
  $.post("/user/signup", post_data(opt), function(json){
    callback(json);
  });
};

User.update_email_only = function(email,callback){
  var callback = typeof callback == "function" && callback || function(){};
  $.post("/user/update_email_only", post_data({email:email}), function(json){
    callback(json);
  });
};
User.onLoginSuccess = function(callback){
  User.presence({inc:"env,user"}, function(json){
    BAR.login_reload(json);
    BAR.pref(json);
    _loadHook('User.onLoginSuccess',function(){
      typeof callback==="function" && callback(json);
    },function(){
      typeof callback==="function" && callback(json);
    });
  });
};
User.onLogoutSuccess = function(callback){
  BAR.pref();
  _loadHook('User.onLogoutSuccess',callback,callback);
};

Account = {};
Account.sync = function(opt,callback){
  var opt = opts || {};

  var querystring = typeof opt.qs==="object" && URI.compile(opt.qs) || opt.qs;

  typeof opt.before==="function" && opt.before(opt);

  if(opt.social=="facebook") {
    CS.FB.get_permission({
      querystring: querystring,
      reauth_login: true,
      fetch_my_bio: true,
      fetch_my_friends: true
    },callback);
  }
  else if(opt.social=="twitter") {
    CS.Twitter.get_permission({
      querystring: querystring,
      renew_oauth_url: true
    },callback);
  }
};

// Facebook shortcuts
CS.FB = CS.FB || {};
CS.FB.waiting_oauth = false;
CS.FB.config = {
  app_id: 93265139042,
  permissions: 'email,friends_birthday,friends_likes,friends_activities,friends_interests,friends_relationships,friends_relationship_details,publish_stream' //,read_friendlists'
};
CS.FB.init = function(callback){
  if(CS.is_fb_user()!=User.fb_uid) {
    CS.FB.my_cache();
  }
  window.FB && FB.getLoginStatus(function(response) {
    if(response.authResponse) {
      CS.FB.fetch_my_bio();
      CS.FB.fetch_my_friends(callback);
    }
    else {
      debug("No FB Session");
      Storage.del('fb_uid');
      CS.FB.my_cache();
    }
  });
};
CS.FB.my_cache = function() {
  Storage.del('fb_bio').del('fb_friends').del('fb_data_since');
};
CS.FB.fetch_my_bio = function() {
  // get personal data...
  User.fb_bio = Storage.get('fb_bio');
  if(CS.is_fb_user()==User.fb_uid && User.fb_bio) {
    User.fb_bio = JSON.parse(User.fb_bio);
  }
  else {
    CS.FB.my_cache();
    CS.FB.get_bio(null,function(response) {
      User.fb_bio = response[0];
      Storage.set('fb_bio',User.fb_bio);
    });
  }
};
CS.FB.fetch_my_friends = function(callback){
  // get friends data...
  User.fb_friends = Storage.get('fb_friends');
  if(CS.is_fb_user()==User.fb_uid && User.fb_friends) {
    User.fb_friends = JSON.parse(User.fb_friends);
    typeof callback == "function" && callback();
  }
  else {
    CS.FB.my_cache();
    FB.api({
      method: 'fql.query',
      query: 'SELECT uid, sex, first_name, last_name, pic_square, birthday_date FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) ORDER BY name ASC'
    },function(response) {
      User.fb_friends = response;
      Storage.set('fb_friends', User.fb_friends);
      typeof callback == "function" && callback();
    });
  }
};
CS.FB.get_all_friends = function(callback) {
  FB.api({
    method: 'fql.query',
    query: 'SELECT uid, name, pic_square, activities, interests, tv, music, movies, books FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) ORDER BY name ASC'
  },callback);
};
CS.FB.get_bio = function(opt,cb) {
  var opt = opt || {};
  var callback = cb || null;
  FB.getLoginStatus(function(response) {
    if(response.authResponse) {
      //debug("getting fb bio data...");
      var fb_uid = opt.uid || (opt>0 && opt) || response.authResponse.userID;
      var fb_fields = opt.fields || "sex, first_name, last_name, name, pic_square, birthday, birthday_date, profile_blurb, website, contact_email, email, status, relationship_status, significant_other_id, family, hometown_location, activities, interests, affiliations, political, quotes, about_me, tv, music, movies, books, online_presence, allowed_restrictions, third_party_id";
      FB.api({
        method: 'fql.query',
        query: 'SELECT uid, ' + fb_fields + ' FROM user WHERE uid = ' + fb_uid
      },callback);
    }
  });
};

CS.FB._fb_oauth_win = null;
CS.FB.get_permission = function(opt,callback){
  var opt = opt || {};
  var oauth_fb_qs = (opt.querystring ? "?"+opt.querystring : "");
  var get_callback = function(fbres,cb){
    var res = fbres || {};
    CS.FB.waiting_oauth = true;
    typeof opt.before == "function" && opt.before({fb:res});
    var presence_inc = "";
    if(opt.presence_inc) {
      presence_inc = "env,"+opt.presence_inc;
    }
    $.getJSON("/oauth/facebook"+oauth_fb_qs,function(json){
      //User.update_cu(json);
      if(res.authResponse && res.authResponse.userID) {
        if(opt.fetch_my_bio) { CS.FB.fetch_my_bio(); }
        if(opt.fetch_my_friends) { CS.FB.fetch_my_friends(); }
        if(opt.reload_avatar) { CS.reload_avatar(); }
      }
      CS.FB.waiting_oauth = false;
      typeof cb == "function" && cb(json);
      typeof opt.after == "function" && opt.after(json);
    }); 
  };
  CS.FB.reauth_login_callback = null;
  if(opt.reauth_login) {
    CS.FB.reauth_login_callback = callback;
    var w_left = $(document).width() / 2 - 350;
    CS.FB._fb_oauth_win = window.open("/oauth/facebook_reauth_login"+oauth_fb_qs, "fb_reauth_login", "width=650,height=300,top=120,left="+w_left);
    return false;
  }
  if(!window.FB) { debug("No FB API"); return false; }
  FB.login(function(res){
    get_callback(res,callback);
  },{ scope: opt.permission || CS.FB.config.permissions });
};
CS.FB.reauth_login_callback = null;
CS.FB.reauth_permission_oauth = function(opts){
  if(CS.FB._fb_oauth_win) {
    CS.FB._fb_oauth_win.close();
    delete CS.FB._fb_oauth_win;
  }
  User.presence(opts,function(json){
    typeof CS.FB.reauth_login_callback==="function" && CS.FB.reauth_login_callback(json);
    CS.FB.reauth_login_callback = null;
  });
};

CS.FB.apprequests = function(msg, data, extra_filters) {
  var params = { method: 'apprequests', message: msg,  data: data, filters:['all'] };
  if(extra_filters) {
    for(var i in extra_filters) {
      params.filters.push(extra_filters[i]);
    }
  }
  FB.ui(params);
};
CS.FB.get_comments = function(opt,callback){
  var opt = opt || {};
  var object_id = opt.object_id || opt;
  var view = opt.view || "facebook_comments";
  if(object_id) {
    $.getJSON("/fb/get_comments/"+object_id,function(json){
      var count = 0;
      var comments = "";
      if(json.comments && json.comments.data) {
        for(var i in json.comments.data) {
          comments += UI.View(view).render({
            comment: json.comments.data[i].message,
            name: json.comments.data[i].from.name
          });
          count++;
        }
      }
      typeof callback === "function" && callback(count,comments);
    });
  }
};

// Facebook shortcuts
CS.Twitter = CS.Twitter || {};
CS.Twitter.waiting_oauth = false;
CS.Twitter._permission_opts = null;
CS.Twitter._permission_callback = null;
CS.Twitter.getOAuthUrl = function(opt, callback){
  if(User.twitter_id) { return false; }
  var opt = opt || {};
  var oauth_qs = (opt.querystring ? "?qs="+URI.encode(opt.querystring) : "");
  $.getJSON("/oauth/get_twitter_oauth_url"+oauth_qs,function(json){
    CS.Twitter.OAuthUrl = json.url || null;
    typeof callback == "function" && callback(opt);
  });
};

CS.Twitter.get_permission = function(opt,callback){
  var opt = opt || {};
  typeof opt.before == "function" && opt.before();
  CS.Twitter._permission_opts = opt;
  CS.Twitter._permission_callback = opt.callback || typeof callback == "function" && callback || null;
  var popup_attrs = "width=650,height=300,top=120,left="+ ($(document).width() / 2 - 350);
  var initOAuthWinChecking = function(){
    CS.Twitter.__OAuthWinCheckingClosed = setInterval(function(){
      if(CS.Twitter._twitter_oauth_win && CS.Twitter._twitter_oauth_win.closed) {
        clearInterval(CS.Twitter.__OAuthWinCheckingClosed);
        CS.Twitter._twitter_oauth_win = null;
        CS.Twitter.OAuthWinClosed();
      }
    },100);
  };
  if(opt.renew_oauth_url || !CS.Twitter.OAuthUrl) {
    CS.Twitter.getOAuthUrl(opt, function(){
      CS.Twitter._twitter_oauth_win = window.open(CS.Twitter.OAuthUrl,"twitter_oauth",popup_attrs);
      initOAuthWinChecking();
    });
  }
  else {
    CS.Twitter._twitter_oauth_win = window.open(CS.Twitter.OAuthUrl,"twitter_oauth",popup_attrs);
    initOAuthWinChecking();
  }
};
CS.Twitter.OAuthWinClosed = function(){
  _loadHook("Twitter.onOAuthCancelled",function(){
    _removeHook("Twitter.onOAuthCancelled");
  });
};
CS.Twitter.afterOAuthPermission = function(opts){
  var opt = opts || {};
  if(CS.Twitter._twitter_oauth_win) {
    CS.Twitter._twitter_oauth_win.close();
    delete CS.Twitter._twitter_oauth_win;
  }
  CS.Twitter.waiting_oauth = true;
  User.presence(opt, function(json){
    CS.Twitter.waiting_oauth = false;
    typeof CS.Twitter._permission_callback == "function" && CS.Twitter._permission_callback(json);
    CS.Twitter._permission_opts = null;
    CS.Twitter._permission_callback = null;
  });
};

CS.Login = function(){
  var L = {};
  L.facebook_callback = null;
  L.twitter_callback = null;
  
  var login_modal = $.fn.overlay && $("#login_required.modal").overlay({
    api:true,
    closeOnClick: false,
    closeOnEsc: true,
    expose: { color:'#333', loadSpeed: 100, opacity: 0.9 }
  });
  
  L.facebook = (function(c){
    L.facebook_callback = c;
    login_modal.load();
    return this;
  });
  L.fb_permission = function(p,cb){
    L.close_prompt();
    var perms = p || null;
    if(perms) {
      FB.login(cb, {perms:perms});
    }
    return this;
  };
  L.fb_login_page = function(r){
    var redirect = r || ENV && ENV.httpdomain || window.location.href;
    //Cookie.set("redirect_to", redirect);
    var login_page = "https://www.facebook.com/dialog/oauth?client_id=93265139042&redirect_uri="+encodeURIComponent(redirect)+"&response_type=token&scope="+CS.FB.config.permissions;
    //debug(login_page);
    //window.location.href = login_page;
  };
  L.fb_check_login = function(r){
    L.close_prompt();
    typeof Login.facebook_callback == "function" && Login.facebook_callback();
    //Cookie.set("redirect_to", r || window.location.href);
    
    L.fb_permission(CS.FB.config.permissions, function(response) {
      if (response.authResponse) {
        Login.oauth_fb(r, response.perms ? 2 : 0, "allowed="+response.perms||"none");
      } 
      else {
        Track.event("Login", "Facebook", "FB login, no session (uid: "+ENV.uid+")");
      }
    });
    
    return this;
  };
  L.show_logins = function(){
    $("#activity_bar_container #login_buttons").html("<a href='javascript:void(0)' onclick='fb_check_login();' class='matrix_a login_facebook'></a>");
    $("#activity_bar_container").removeClass("grid_9 push_16").addClass("grid_12 push_13").show();
    return this;
  };
  L.twitter = function(c){
    L.twitter_callback = c;
    login_modal.load();
    return this;
  };
  L.isRequired = function(e){
    if(e && ($(e).hasClass('login_skip') || $(e).data('login_skip')) ) {
      return false;
    }
    var s = false;
    $.ajax({ type:"GET", url:"/user/presence?_t="+now(), dataType:"json", async:false,
      success:function(json){
        if(json) {
          s = (json.online ? false : true);
          ENV.set('uid',(json.uid||0));
          ENV.set('fb_uid',(json.fb_id||0));
          ENV.set('online',s);
        }
      }
    });
    return s;
  };
  L.oauth_fb = function(r,a,q){
    var site = ENV && ENV.httpdomain || ENV.httpdomain;
    var fb_return = site+"/oauth/fb_return/?perms="+ (a||0) + (q ? "&"+q : '')+"&rt="+URI.encode(r);
    var cancelled = site;
    var url = "https://www.facebook.com/login.php?api_key="+CS.FB.config.app_id+"&cancel_url="+URI.encode(cancelled)+"&display=page&fbconnect=1&next="+URI.encode(fb_return)+"&return_session=1&session_version=3&v=1.0";
    URI.go(url);
  };
  L.close_prompt = function(){
    login_modal && login_modal.close();
    return this;
  };
  
  return L;
};
Login = new CS.Login();

// CS commons
CS.shuttle = function(params) {
  if(params){
    params.ruid = params.ruid || $("#dc_content_ruid").val() || ENV.dc_ruid || 0;
    $.post("/user/shuttle", post_data(params));
  }
};

CS.reload_avatar = function(el){
  $(el||".my_avatar").attr("src",User.cu.avatar);
};

CS.OpenGraph = function(opts){
    var opt = opts || {};
    var context = opt.dom || typeof opts==="string" && opts || document;
    var types = opt.types || "album|book|game|movie|product";
    var A = {};
    
    A.parse = function(context) {
        if(window.jQuery) {
            A.list = {};
            var metas = $("meta[property^='og:']",context);
            var og_type = metas.filter("[property='og:type']").attr("content");
            var regexp_types = new RegExp(types.toString(),"gim");
            if(regexp_types.test(og_type)) {
                metas.each(function(i,e){
                    var k = $(e).attr("property").replace("og:","");
                    A.list[k] = $(e).attr("content");
                });
            }
        }
        return this;
    };
    
    A.parse(context);
    
    return A;
};
CS.XPath = function(expression, context, opts) {
  var opt = opts || {};
  var iterator = null;
  
  var A = {
    result_type: (opt.result_type || 'ANY_TYPE').toUpperCase(), // STRING, NUMBER, etc... 
    result_property: opt.result_property || null, // stringValue, numberValue or booleanValue 
    expression: expression || null, 
    context: context || null, 
    nodes: [], 
    errors: []
  };
  
  var extract_exp_opts = function(expression){
    if(typeof expression!=='string') { return expression; }
    
    var regexp_result_type = /\.(ANY|NUMBER|STRING|BOOLEAN|UNORDERED_NODE_ITERATOR|ORDERED_NODE_ITERATOR|UNORDERED_NODE_SNAPSHOT|ORDERED_NODE_SNAPSHOT|ANY_UNORDERED_NODE|FIRST_ORDERED_NODE)_TYPE/;
    var get_xpath_result_type = expression.match(regexp_result_type);
    if(get_xpath_result_type) {
      expression = expression.replace(regexp_result_type,'');
      A.result_type = get_xpath_result_type[0].replace('.','') || 'ANY_TYPE';
    }
    
    var regexp_result_property = /\.(string|number|boolean)Value/;
    var get_xpath_result_property = expression.match(regexp_result_property);
    if(get_xpath_result_property) {
      expression = expression.replace(regexp_result_property,'');
      A.result_property = get_xpath_result_property[0] && get_xpath_result_property[0].replace('.','') || null;
    }
    
    return expression;
  };
  
  var parse = function(expression, context) {
    A.nodes = A.errors = [];
    A.expression = expression;
    A.context = context || document;
    var xi = null;
    var xn = null;
    try {
      var xpath_result_type = XPathResult[A.result_type] || XPathResult.ANY_TYPE;
      iterator = document.evaluate(A.expression, A.context, null, xpath_result_type, null);
      var node = iterator.iterateNext();
      xi = iterator;
      xn = node;
      
      while(node) {
        A.nodes.push(node);
        node = iterator.iterateNext();
      }
      
    } catch(e) { A.errors.push(e); }
    
    //debug("xp debug: ", expression, xi, xn, {context:context}, iterator);
    
    A.count = A.nodes.length;
  };
  
  A.get = function(index, _default) {
    return A.nodes[ index ] || _default || null;
  };
  A.val = function(_default) {
    var result = null;
    if(A.result_property) {
      result = iterator[A.result_property] || null;
    }
    else {
      var v = A.get(0,_default);
      result = v && v.nodeValue;
    }
    return result;
  };
  A.first = function() {
    return A.get(0);
  };
  A.last = function() {
    return A.get( A.nodes.length-1 );
  };
  A.each = function(callback) {
    A.nodes.forEach(callback || function(v,i){});
    return this;
  };
  A.text = function(s,_default) {
    return (s && (s.nodeValue || s.textContent) || A.val(_default) || '').toString();
  };
  A.parse = function(exp, context) {
    exp = extract_exp_opts(exp);
    parse(exp, context || A.context);
    return this;
  };
  
  if(typeof expression == 'string') {
    expression = extract_exp_opts(expression);
    parse(expression, context);
  }

  return A;
};


getInputs = function(t,f){
  var opt = typeof t==="object" && t || {};
  var target = opt.target || (t===jQuery || typeof t==="string") && t;
  var filter = opt.filter || f;
  var A = {
    serialized: {},
    fields: $("input,textarea,select", target || document)
  };
  A.fields = filter && A.fields.filter(filter) || A.fields;
  A.fields.each(function(i,k){
    var f = $(this).attr('name') || $(this).attr('id');
    var val = $(this).val();
    if(opt.clean && !val) { return null; }
    if(this.type && (this.type=="checkbox" || this.type=="radio") && !this.checked) { f = null; }
    if(f) {
      if(f.match(/\[\]$/g)) {
        var fa = f.replace("[]","");
        if(!(A.serialized[fa] instanceof Array)) {
          A.serialized[fa] = [];
        }
        A.serialized[fa].push(val);
      }
      else {
        A.serialized[f] = val;
      }
    }
  });
  A.json = A.serialized;
  return A;
};

Modal = {
  id: 'parent_modal',
  registered_callbacks: [],
  registerLoad: function(callback) {
    callback && this.registered_callbacks.push(callback);
    return this;
  },
  opt: function(opt) {
    this.load_opt = opt || null;
    return this;
  },
  get: function(id, params, callback){
    var self = this;
    var id = id || 'none';
    self.id = id;
    var href = params.href || "/view/modal/"+id;
    var params = params || {};
    $.get(href, params, function(html){
      self.populate(params,html);
      if(params.load) {
        params.id = id;
        self.show(params,callback);
      }
      else {
        typeof callback === "function" && callback(params);
      }
    });
    return this;
  },
  populate: function(opt,content){
    var opt = opt || {};
    if(opt.container) {
      content = '<div class="modal '+(opt.container_class||'')+'" id="'+(opt.container_id||'')+'"><a class="close matrix_a" id="modal_button"></a><div class="modal_content">'+content+'</div></div>';
    }
    $("<div id='parent_modal' data-modal-id='"+opt.id+"'></div>").appendTo("body");
    $("#parent_modal").html(content);
    return this;
  },
  show: function(opt,callback) {
    var self = this;
    var opt = opt || self.load_opt || {};
    var callback = opt.callback || callback || false;
    var overlay_opt = opt.overlay || {
      top:opt.top||0, fixed:opt.fixed||true, left:opt.left||"center",
      closeOnClick: opt.closeOnClick||false,
      closeOnEsc: opt.closeOnEsc||true,
      expose: opt.expose || { color: opt.color || '#333', loadSpeed: opt.loadSpeed || 200, opacity: opt.opacity || 0.9 },
      onBeforeLoad: opt.onBeforeLoad||false,
      onLoad: opt.onLoad || callback,
      onBeforeClose: opt.onBeforeClose||false,
      onClose: opt.onClose||false
    };
    overlay_opt.api = true;
    var get_modal = $("#parent_modal .modal");
    if(get_modal.length) {
      window.MODAL_CURRENT = get_modal.overlay(overlay_opt).load();
      if(opt.expose && opt.expose['class']) {
        $("#exposeMask").addClass(opt.expose['class']);
      }
      if(this.registered_callbacks.length>0) {
        for(var c in this.registered_callbacks) {
          typeof this.registered_callbacks[c] === "function" && this.registered_callbacks[c]();
        }
        this.registered_callbacks = [];
      }
    }
    else {
      throw("Modal ("+self.id+") missing class '.modal'");
    }
    return this;
  },
  close: function(id, callback){
    this.id = id || null;
    $("#parent_modal .close").click();
    typeof callback === "function" && callback();
    return this;
  },
  remove: function(){
    $("#exposeMask").remove();
    $("#parent_modal").remove();
    return this;
  }
};

UI = {};

ENV._ui_until = {};
UI.until = function(before, after) {
  var opt = typeof before == "object" && before || {};
  opt.before = opt.before || opt.check || before;
  opt.after = opt.after || opt.callback || after;
  var u = {
    id: opt.id || +(new Date),
    times: opt.times || 1000,
    _times: 0,
    run: function(){
      var finished = false;
      if(typeof opt.before=="function") {
        finished = opt.before.call(opt, opt.args);
      }
      else if($(opt.before).length>0 || this._times==this.times) {
        finished = true;
      }
      if(finished) {
        this.stop();
        typeof opt.after=="function" && opt.after.call(opt, opt.args);
      }
      this._times++;
    },
    stop: function(){
      clearInterval(this._int);
      delete ENV._ui_until[this.id];
    }
  };
  u._int = setInterval(function(){ u.run(); }, opt.delay || 10);
  ENV._ui_until[u.id] = u;
};

UI.View = function(view,opt) {
  /* returns @string, usage: UI.View("[View.placeholder]").render({k:v}); */
  var data = Views[view] || view || null;
  var opt = opt || {};
  var remove_empties = opt.leave_empties || true;
  var A = {};
  A.render = function(vars) {
    if(data==null) { return false; }
    var new_data = data;
    var params = vars || null;
    if(typeof params == "object") {
      if(opt.mergeData && typeof opt.mergeData === "object") {
        $.extend(params,opt.mergeData);
      }
      var regm = (opt.regexp) ? "i" : "gim";
      for(x in params) {
        if(typeof params[x] == "object") {
          for(i in params[x]) {
            var find1 = new RegExp("\\{"+x.trim()+"\\}", regm);
            var find2 = new RegExp("\\{"+x.trim()+"\\|\\|.*?\\}", regm);
            new_data = new_data.replace(find1, params[x]).replace(find2, params[x]);
          }
        }
        else {
          var find1 = new RegExp("\\{"+x.trim()+"\\}", regm);
          var find2 = new RegExp("\\{"+x.trim()+"\\|\\|.*?\\}", regm);
          new_data = new_data.replace(find1, params[x]).replace(find2, params[x]);
        }
      }
    }
    if(remove_empties) {
      new_data = new_data.replace(/\{[\w\_]+\|\|(.*?)\}/gim,'$1').replace(/\{[\w\_]+\}/gim,'');
    }
    return new_data;
  };
  A.split = function() {
    if(data==null) { return false; }
    return data.replace(new RegExp("\{.*?\}",'gim'),"{_S_}").split("{_S_}");
  };
  return A;
};

UI.template = function(id, params) {
  var tmpl = $("script[type='template'][rel='"+id+"']").html();
  return UI.View(tmpl).render(params) || "";
};



UI.tabs = function(opt) {
  /* usage:
  UI.tabs({
    tabs: "UL#ID", // ul tag w/ li.rel='paneName'
    current_class: "selected", // custom selected class for tabNav
    panes: "#paneContainer",  // pane containers for all pane childs w/ div.pane
    onClick: function(tab){ ... } // triggers on tabNav clicked
  }).init(relStart, callback(tab){});
  */
  var opt = opt || {};
  var list = opt.tabs || null;
  var $tab = $(list);
  var clicky = (opt.li || "li a").trim();
  var click_rel = opt.li_rel || "rel";
  var panes = opt.panes || $tab.attr('data-panes') || null;
  var pane_class = opt.pane_class || $tab.attr('data-pane-class') || '.pane';
  var current_class = opt.current_class || "current";
  var onClick = opt.onClick || null;
  var callback = opt.callback || null;
  var init_load = false;
  var run_click_callback = null;
  var current_tab_name = null;
  var onload = opt.onload || null;
  
  if(list==null || panes==null) {
    throw("Tab and Panes must be defined");
    return false;
  }
  else if(opt.debug && $tab.length==0) {
    throw("Tab not found");
    return false;
  }
  
  var show_tab = function(t,self) {
    var index = $(clicky+"["+click_rel+"]", list).index(self);
    $(clicky+"["+click_rel+"]", list).removeClass(current_class).filter(self).addClass(current_class);
    if(opt.pane_prefix || opt.pane_suffix) {
      var find_pane = (opt.pane_prefix||'') + name + (opt.pane_suffix||'');
      $(pane_class, panes).hide().end().find(find_pane+":hidden").show();
    }
    else {
      $(pane_class, panes).hide();
      $(pane_class, panes).eq(index).show();
    }
    return this;
  };
  
  var API = {};

  API.show = function(n,cb,cb2){
    current_tab_name = n || null;
    var display_tab = true;
    if(typeof cb == "boolean" && cb===false) { init_load = false; }
    
    if(typeof cb == "string" && (cb==="background" || cb==="noshow")) {
      display_tab = false;
    }
    
    if(typeof cb == "function") { run_click_callback = cb; };

    if(display_tab==true && typeof n == "number") {
      var tab = $("li *["+click_rel+"]", list).eq(n);
      if(tab.length && tab.has(":not(."+current_class+")")) {
        show_tab(n, tab);
      };
    }
    else if(display_tab==true) {
      var tab = $(clicky+"["+click_rel+"="+(n||'non')+"]:not(."+current_class+")", list);
      if(tab.length) {
        show_tab(tab.attr('rel'), tab);
      };
    }
    
    typeof cb == "function" && cb(name);
    typeof cb2 == "function" && cb2(name);
    return this;
  };
  API.doOnClick = function(n){
    current_tab_name = n || current_tab_name;
    typeof onClick == "function" && onClick(current_tab_name);
    return this;
  };
  API.init = function(i,c){
    var preset = typeof i == "number" && i || 0;
    var click_callback = typeof i == "function" && i || c || onClick || false;
    $(clicky+"["+click_rel+"]", list).live("click",function(){
      current_tab_name = $(this).attr(click_rel);
      show_tab(current_tab_name, this);
      API.doOnClick();

      init_load==true && typeof click_callback == "function" && click_callback(name);
      if(typeof run_click_callback == "function") {
        run_click_callback(name);
        run_click_callback = null;
      }
      init_load = true;
      return false;
    })
    .eq(preset).click();
    
    typeof onload=="function" && onload();
    return this;
  };
  return API;
};
UI.panes = function(opt){
  /* usage: UI.panes({ parent:"#paneContainer", panes:"div.panes" }).init(callback(id){}); */
  var opt = opt || {};
  var _class = opt.panes || null;
  var parent = opt.parent || null;
  
  if(_class==null) {
    throw("Panes class must be defined");
    return false;
  }
  
  var panes = $(_class, parent);
  
  var A = {};
  A.show = function(name,html,callback){
    var content = typeof html == "string" && html || false;
    var callback = typeof html == "function" && html || callback || false;
    panes.hide();
    var f = (typeof name == "number") ? panes.eq(name) : panes.filter(name);
    if(html) { f.html(content); }
    f.show();
    typeof callback == "function" && callback(name);
    return this;
  };
  A.init = function(i,c){
    var first = (typeof i == "number" || typeof i == "string") && i || 0;
    var callback = typeof i == "function" && i || c || false;
    panes.hide();
    opt.load && A.show(first);
    typeof callback == "function" && callback( panes.filter(":visible").attr('id') || null );
    return this;
  };
  return A;
};

UI.select = function(opts) {
  var opt = opts || {}, A = {};
  var el = $(opt.id || opts);
  var target = $("a",el);
  var trigger = $(opt.trigger);
  var parent = $("ul", el);
  var list = $("ul li[rel]", el);

  A.title = function(title,t){
    limit_chars = opt.limitChars || 50;
    current_title = (typeof title==="string" && title||current_title).limit(limit_chars,'...');
    target.attr('title',title).html(current_title);
    return this;
  };
  A.select = function(t,i){
    list.removeClass("selected");
    var get = i>=0 ? list.eq(i) : list.filter("li[rel='"+t+"']");
    if(get.length) {
      get.addClass("selected");
      A.title(get.text());
    }
    return this;
  };
  A.selected = function(){
    var e = list.filter(".selected");
    var found = e.length ? { el: e, val: e.attr("rel"), text: e.text() } : null;
    return found;
  };
  A.val = function(){
    var f = A.selected();
    return f && f.val;
  };
  A.init = function(callback){
    var callback = callback || opt.callback || false;

    if(opt.trigger && trigger.length) {
      trigger.live("click",function(){
        parent.show();
        return false;
      });
    }

    target.live("click",function(){
      parent.show();
      return false;
    });

    list.live("click",function(){
      parent.hide();
      var index = list.index(this);
      A.select(null,index);
      opt.onClick && opt.onClick.call(A, A.val(), A.selected());
      return false;
    });


    $(document).bind('click.uiSelect',function(e){
      if(!$(e.target).parents(".uiSelect").length) {
        parent.hide();
      }
    });

    typeof callback == "function" && callback(A);
    return this;
  };
  A.close = function(){
    parent.hide();
    return this;
  };
  
  return A;
};

UI.breadcrumb = function(opt) {
  /* usage: UI.breadcrumb({before:"#ID tag.class"}).show("All ITEMS", "initial text..."); */
  var opt = opt || {};
  var target = typeof opt.target == "object" && opt.target || $(opt.before || opt.appendTo || opt.target || opt);
  
  if(target.length==0) { return false; }
  var B = {};
  B.show = function(parent,child,delim) {
    var delim = delim || "&raquo;";
    var list = "<span id='BC_parent'>"+ (parent||"") +"</span> "+ delim +" ";
    if(typeof child == "object") {
      var cs = [];
      for(x in child) {
        cs.push("<span class='BC_child'>"+ child[x] +"</span>");
      }
      list += cs.join(" "+delim+" ");
    }
    else {
      list += " <span class='BC_child'>"+ child +"</span>";
    }
    
    if(opt.before) {
      $(target).before(list);
    }
    else if(opt.appendTo) {
      $(list).appendTo(target);
    }
    else {
      $(target).html(list).addClass("breadcrumb").show();
    }
  };
  B.remove = function(){
    $(target).removeClass("breadcrumb").html('').hide();
  };
  return B;
};
UI.tour = function(parent,nav,opt) {
  /* usage: uiTour = UI.tour("#ParentElement","ul#ID").pane(this); uiTour.direction(this.id); */
  var parent = $(parent);
  var nav = $(nav);
  var opt = opt || {};
  var A = {};
  var tour_id = opt.tour_id || 'tour';
  var activeClass = opt.activeClass || 'active';
  
  A.direction = function(direction) {
    var li_first = $("li:first a",nav);
    var li_last = $("li:last a",nav);
    var active_li = $("li a."+activeClass,nav).parents("li");
    if(direction.match(/prev/)) {
      if(li_first.hasClass(activeClass)) {
        li_last.click();
      }
      else {
        active_li.prev().find("a").click();
      }
    }
    else {
      if(li_last.hasClass(activeClass)) {
        li_first.click();
      }
      else {
        active_li.next().find("a").click();
      }
    }
    return this;
  };
  A.next = function(direction){
    A.direction(direction||'next');
    return this;
  };
  A.prev = function(direction){
    A.direction(direction||'prev');
    return this;
  };
  A.pane = function(self){
    var index = typeof self=="number" && self || $("li a",nav).index($(self));
    index = self==0 ? self : index;   
    var tours = $(opt.tourClass || ".tour",parent);
    tours.hide();
    tours.eq(index).show();
    $("li a",nav).removeClass(activeClass);
    $("li a",nav).eq(index).addClass(activeClass);
    return this;
  };
  A.stopAutoPlay = function(){
    if(A.__timer) {
      clearInterval(A.__timer);
      A.__timer = null;
    }
    return this;
  };
  
  if(opt.arrows) {
    $(document).unbind("keyup."+tour_id).bind("keyup."+tour_id,function(e){
      if(e.keyCode==KEYS.LEFT) {
        A.prev();
      }
      if(e.keyCode==KEYS.RIGHT) {
        A.next();
      }
    });
  }

  if(opt.autoplay) {
    A.__timer = setInterval(function(){
      var a = $("li a",nav);
      var i = a.index(a.filter("."+activeClass));
      i = i+1;
      A.pane(i>=a.length ? 0 : i);
    },2500 || opt.autoplayDelay);
  }
  return A;
};

ENV.queue.hovercard = { ajax:{}, lineup:{}, kill:{} };

UI.Hovercard = function(e,opts) {
  var self = $(e);
  var opt = opts || {};
  var hc_queue_id = null;
  var hc_el_id = null;
  var init_time = 2500; //secs
  var A = {};
  
  var hc_get = function(params){
    //debug("Getting hovercard: "+hc_queue_id);
    var xhr = $.post("/dashboard/get_hovercard", post_data(params), function(json){
      if(json.content) {
        A.remove_all();
        hc_el_id = hc_queue_id;
        var hovercard = $("<div>",{ 'class':"hovercard", 'id':hc_el_id, 'html':json.content });
        //self.after(hovercard);
        
        // TODO: fix this to get 'self' positioning and then use X/Y coordinates in DOM.
        $(hovercard).appendTo(self);
        
        opt.callback && typeof opt.callback==="function" && opt.callback(self, params);
        ENV.queue.hovercard.ajax[hc_queue_id] = null;
      }
      else {
        opt.fail && typeof opt.fail==="function" && opt.fail(self, params);
      }
    });
    return xhr;
  };
  
  A.init = function(){
    if(opt.self) { self = opt.self; }
    var params = {
      type: opt.type || self.attr('data-hc-type'),
      name: opt.name || self.attr('data-hc-name'),
      obj_id: opt.obj_id || self.attr('data-hc-obj-id')
    };
    if(params.type && (params.name || params.obj_id) ) {
      params.type = (params.type||'').cleanAlpha().trim();
      params.name = (params.name||'').cleanAlphaNum().trim();
      hc_queue_id = (params.type||'').replace(/[^a-z0-9_]/gim,"").replace(" ","_").lcase() + "_" + (params.obj_id||params.name).toString().replace(/[^a-z0-9_]/gim,"").replace(" ","_").lcase();
      
      self.attr('data-hc-id',hc_queue_id);
      
      var hcard = $("#"+hc_queue_id+".hovercard");

      if(ENV.queue.hovercard.kill[hc_queue_id]) {
        clearTimeout(ENV.queue.hovercard.kill[hc_queue_id]);
        ENV.queue.hovercard.kill[hc_queue_id] = null;
      }
      
      ENV.queue.hovercard.lineup[hc_queue_id] = setTimeout(function(){
        if(hcard.length) {
          A.remove_all();
          hcard.show();
        }
        else {
          ENV.queue.hovercard.ajax[hc_queue_id] = hc_get(params);
        }
      },init_time);

    }
    return this;
  };
  A.stop = function(id){
    var hc_id = id || hc_queue_id;
    if(ENV.queue.hovercard.lineup[hc_id]) {
      //debug("stoping linup: "+hc_id);
      clearTimeout(ENV.queue.hovercard.lineup[hc_id]);
      ENV.queue.hovercard.lineup[hc_id] = null;
    }
    if(ENV.queue.hovercard.ajax[hc_id]) {
      ENV.queue.hovercard.ajax[hc_id].abort();
      ENV.queue.hovercard.ajax[hc_id] = null;
    }
    return this;
  };
  A.remove = function(e){
    var hcard = e && $(e) || self;
    var hc_id = hcard.attr('id') || hcard.attr('data-hc-id');
    var kill_delay = 30000; //secs
    
    if(hcard.length && !hcard.hasClass('hovercard') && hc_id) {
      hcard = hcard.find(".hovercard");
      hc_id = hcard.attr('id');
    }
    
    if(hcard.length && hcard.hasClass('hovercard') && hc_id) {
      A.stop(hc_id);
      hcard.hide();
      if(!ENV.queue.hovercard.kill[hc_id]) {
        ENV.queue.hovercard.kill[hc_id] = setTimeout(function(){
          hcard.remove();
          ENV.queue.hovercard.kill[hc_id] = null;
          //debug("Removed hovercard: "+hc_id);
        },kill_delay);
      }
    }
    return this;
  };
  A.remove_all = function(){
    $(".hovercard:visible").each(function(){
      A.remove(this);
    });
  };
  
  return A;
};

UI.placeholder = function(id, opt){
  var el = $(id);
  var opt = opt || {};
  var html = opt.html || opt.pic || "<img src='/img/ajax-loader.gif' border='0' />";
  var A = {};
  A.on = function(s){
    $(".ui_placeholder",el).remove();
    var div = $("<div>",{ 'class':'ui_placeholder', 'html': s || html });
    el.html(div);
    return this;
  };
  A.off = function(){
    $(".ui_placeholder",el).remove();
    return this;
  };
  return A;
};

UI.status = function(id) {
  var el = $(id);
  var _classes = "info success warning error validation";
  var A = {};
  
  A.clean = function(){
    el.removeClass(_classes).empty();
    return this;
  };
  A.show = function(c,s) {
    A.clean();
    el.addClass(c||"success").html(s);
    return this;
  };
  A.success = function(s) {
    A.show("success",s);
    return this;
  };
  A.error = function(s) {
    A.show("error",s);
    return this;
  };
  A.info = function(s) {
    A.show("info",s);
    return this;
  };
  A.validation = function(s) {
    A.show("validation",s);
    return this;
  };
  return A;
};

UI.tooltip = function(opt){
  var opt = opt || {};
  var A = {};
  A.create = function(view){
    var prefix_view = "<div "+(opt.id ? "id=\"{ui_tt_id}\" " : "") + "class=\"{ui_tt_class}\">{ui_tt_html}</div>";
    var ui_class = "ui_tooltip "+(opt['class']||'')+" "+(opt['dir']||'tl');
    var params = {
      'ui_tt_id': opt.id||'',
      'ui_tt_class': ui_class,
      'ui_tt_html': view || opt.html || ''
    };
    var tip = UI.View(prefix_view).render(params);
    return tip;
  };
  A.add = function(id,html){
    $( html || A.create() ).appendTo(id);
    return this;
  };
  A.replace = function(id,html){
    $(id).html( html || A.create() );
    return this;
  };
  A.use_view = function(id,view) {
    var tooltip = UI.View(view).render(opt);
    A.add(id,tooltip);
    return this;
  };
  return A;
};
UI.notify = function(opt, callback){
  var opt = opt || {};
  var el = $(opt.id);
  var A = {};
  A.init = function(){
    $("#ui_notify").remove();
    var attrs = {
      'id':"ui_notify",
      'class': (opt['class'] || '') + ' hide',
      'html': opt.html || "No Message"
    };
    if(opt.triangle) {
      attrs.html += "<div class='triangle'></div>";
    }
    $("<div>",attrs).appendTo(el);
    
    typeof opt.callback == "function" && opt.callback(opt);
    return this;
  };
  A.show = function(time, callback){
    if(opt.open && opt.open=="show") {
      $("#ui_notify").show();
      callback && callback(A);
    }
    else if(opt.open && opt.open=="fadein") {
      $("#ui_notify").fadeIn(time||'slow', function(){
        callback && callback(A);
      });
    }
    else {
      $("#ui_notify").slideDown(time||'slow', function(){
        callback && callback(A);
      });
    }
    return this;
  };
  A.hide = function(time, callback){
    if(opt.close && opt.close=="hide") {
      $("#ui_notify").hide().remove();
      callback && callback(A);
    }
    else if(opt.close && opt.close=="fadeout") {
      $("#ui_notify").fadeOut(time||'slow', function(){
        $(this).remove();
        callback && callback(A);
      });
    }
    else {
      $("#ui_notify").slideUp(time||'slow', function(){
        $(this).remove();
        callback && callback(A);
      });
    }
    return this;
  };
  
  if(el.length) {
    A.init();
  }
  return A;
};

ENV.queue.jewel_title_count = 0;

UI.jewel = function(opt, callback){
  var opt = opt || {};
  var el = $(opt.el);
  var A = {};
  A.init = function(){
    if(el.length==0) { return this; }
    
    if(opt.html && opt.html.length==0) {
      return this;
    }
    
    var params = {
      'class': 'ui_jewel ' + (opt['class'] || '') + ' hide',
      'html': opt.html,
      'data-count': typeof opt.html=="number" && opt.html || 0
    };
    if(opt.id) {
      params.id = opt.id;
    }
    
    if(params.html!="0") {
      A.update_title(params['data-count']);
      $(".ui_jewel", el).remove();
      $("<div>",params).appendTo(el);
      typeof opt.callback == "function" && opt.callback(opt);
    }
    
    return this;
  };
  A.show = function(){
    $(".ui_jewel",el).show();
    return this;
  };
  A.hide = function(){
    var j = $(".ui_jewel",el);
    if(el.length) {
      A.update_title(null, j.attr('data-count') );
    }
    j.remove();
    return this;
  };
  A.update_title = function(add,sub){
    var text = document.title.replace(/\([0-9]+\)/,"");
    if(add && add>0) {
      ENV.queue.jewel_title_count = ENV.queue.jewel_title_count + parseInt(add);
    }
    if(sub && sub>0) {
      ENV.queue.jewel_title_count = ENV.queue.jewel_title_count - parseInt(sub);
    }
    if(ENV.queue.jewel_title_count>0) {
      text = "("+ENV.queue.jewel_title_count+") " + text;
    }
    URI.title(text);
  };

  return A;
};

ENV.modals = {};
UI.modal = function(opts,callback) {
  /* usage: UI.modal({ id:"request", href:"/.../", load:true, preload:function(){} }); */
  var opt = opts || {};
  var id = opt.id || typeof opts==="string" && opts || null;
  opt.after = opt.callback || typeof callback == "function" && callback;
  var name = "modal_"+(id||"unknown");
  var modal = null;
  var parent = $("#parent_modal");
  var is_alive = null;
  var A = {};
  
  if(id===null) { error("UI.modal - Missing ID"); return false; }

  var content = function(content){
    var check = $(content);
    if(check.filter(".modal").length==0 && check.find(".modal").length==0) {
      A.error = "modal ("+name+") without class found.";
      error(A.error);
      return this;
    }
    check = null;
    
    var exists = $("#"+name+".modal", parent);
    if(ENV.modals[id]) {
      var data = $(content).html();
      exists.html(data);
    }
    else {
      $(content).appendTo(parent);
    }
    
    $(".modal:last", parent).attr("id",name);
    is_alive = $("#"+name+".modal", parent);
    is_alive.hide();
    
    A.target = is_alive;
    A.name = name;
    A.modal = is_alive.overlay({
      api: true,
      fixed: opt.fixed || true,
      top: opt.top || 0,
      left: opt.left || 'center',
      closeOnClick: opt.closeOnClick || false,
      onBeforeLoad: opt.onBeforeLoad || false,
      onLoad: opt.onLoad || false,
      onBeforeClose: opt.onBeforeClose || false,
      onClose: opt.onClose || false,
      expose: opt.expose || { color: opt.color || '#aaa', loadSpeed: opt.loadSpeed || 200, opacity: opt.opacity || 0.5 }
    });
    A.modal.uiModal = A;
    
    ENV.modals[id] = A;

    $(".close",is_alive).die("click").live("click",function(){
      ENV.modals[id].close();
      return false;
    });
    
    typeof opt.preload == "function" && opt.preload();
    
    if(opt.load) {
      A.show(opt);
    }
  };
  
  var init = function(){
    if(parent.length==0) {
      $("<div>",{ id:"parent_modal" }).appendTo("body");
      parent = $("#parent_modal");
    }
    
    var method = opt.method || "GET";
    var url = opt.href || "/view/modal/"+id;
    var params = opt.params || {};
    
    if(method.lcase()=="post") {
      params = post_data(params);
    }

    if(opt.local && $("#"+name+".modal").length) {
      content( $("#"+name+".modal") );
    }
    else {
      $.ajax({ type:method, url:url, data:params, success:content });
    }
  };
  
  A.show = function() {
    if(A.modal) {
      if(ENV.modals) {
        for(var k in ENV.modals) {
          ENV.modals[k].close();
        }
      }
      $(".modal", parent).hide();
      is_alive.show();
      A.modal.load();
      $("#exposeMask").addClass("modal_mask");
      if(opt.expose && opt.expose.addClass) {
        $("#exposeMask").addClass(opt.expose.addClass);
      }
      typeof opt.after == "function" && opt.after();
    }
    return this;
  };
  A.close = function() {
    A.modal.close();
    A.target.hide();
    return this;
  };
  
  // initiate modal constructor...
  init();
  
  return A;
};
UI.modal_remove = function(){
  ENV.modals = {};
  $("#exposeMask").remove();
  $("#parent_modal").remove();
  return this;
};

UI.selectUpDown = function(opts) {
  var opt = opts || {};
  var date = +(new Date);
  var bind_keys = opt.bind || "keypress.uiSelectUpDown_"+date;
  var keyCode1 = opt.key1 || KEYS.UP;
  var keyCode2 = opt.key2 || KEYS.DOWN;
  var keyCodeTrigger1 = opt.trigger1 || KEYS.ENTER;
  var keyCodeTrigger2 = opt.trigger2 || KEYS.BACKSPACE;
  var listing = $(opt.el || opt.listing);
  var selected_class = opt.selected_class && opt.selected_class.replace(".","") || "uiSelectUpDown";
  var A = {};

  A.getSelected = function(callback){
    var selected = listing.filter("."+selected_class);
    if(typeof callback == "function") {
      callback(selected);
      return this;
    }
    return selected;
  };

  A.clear = function(callback){
    listing.removeClass(selected_class);
    typeof callback == "function" && callback();
    return this;
  };

  A.remove = function(){
    listing.removeClass(selected_class);
    $(document).unbind(bind_keys);
  };

  A.init = function(){
    if(listing.length==0) {
      //throw Error("UI.selectUpDown: target listing not found.");
      return false;
    }

    $(document).unbind(bind_keys).bind(bind_keys,function(e){
      if((e.keyCode==keyCode1 || e.keyCode==keyCode2) && listing.is(":visible")) {
        var index = listing.index( listing.filter("."+selected_class) ) || 0;
        var next = (e.keyCode==keyCode1 ? index - 1 : index + 1);
        listing.removeClass(selected_class).eq(next).addClass(selected_class);
        e.preventDefault();
      }
      if((e.keyCode==keyCodeTrigger1 || e.keyCode==keyCodeTrigger2) && listing.is(":visible")) {
        var selected = listing.filter("."+selected_class);
        e.keyCode==keyCodeTrigger1 && typeof opt.onTrigger1 == "function" && opt.onTrigger1(selected);
        e.keyCode==keyCodeTrigger2 && typeof opt.onTrigger2 == "function" && opt.onTrigger2(selected);
        e.preventDefault();
      }
    });

    return this;
  };

  return A;
};

UI.FB = {};
UI.FB.Multi_Friend_Selector = function(opts){
  var opt = opts || {};
  var el = $(opt.id);
  var A = {};

  el.html(opt.view || Views.fb_multi_friend_selector);

  var fb_uid = opt.fb_uid || User.fb_uid;
  var fb_friends = opt.fb_friends || User.fb_friends;
  var filter = el.find(".fb_mfs_filter_name");
  var clear = el.find(".fb_mfs_clear_filter");
  var no_results = el.find(".fb_mfs_no_results");
  var connect = el.find(".fb_mfs_connect");
  var users = el.find(".fb_mfs_results .fb_mfs_user");
  var total_selected = el.find(".fb_mfs_total_selected");

  A.id = opt.id;
  A.el = el;
  A.total_filter_found = 0;
  A.total_selected = 0;

  A.get_selected_users = function(){
    var selected = [];
    users.filter(".selected").each(function(i,e){
      selected.push({
        uid: $(this).attr("data-fb-id"),
        name: $(this).find(".fb_mfs_user_name").text()
      });
    });
    return selected;
  };

  A.get_selected_uids = function(){
    var uids = [];
    var selected = A.get_selected_users();
    for(var i in selected) {
      uids.push(selected[i].uid);
    }
    return uids;
  };

  A.get_selected_names = function(){
    var names = [];
    var selected = A.get_selected_users();
    for(var i in selected) {
      names.push(selected[i].name);
    }
    return names;
  };

  A.clear_filter = function(){
    filter.val('');
    clear.hide();
    no_results.hide();
    users.show();
    return this;
  };

  A.clear_selected_users = function(){
    A.total_selected = 0;
    users.removeClass("selected fb_mfs_user_found").find(".check_mark").removeClass("selected");
    return this;
  };

  A.restart = function(opt2){
    var o = opt2 || {};
    fb_uid = o.fb_uid || User.fb_uid;
    fb_friends = o.fb_friends || User.fb_friends;

    filter.val('');
    clear.hide();
    users.hide();
    no_results.hide();
    connect.show();

    if(fb_uid && fb_friends) {
      BAR.load_multi_friend_selector(el.find(".fb_mfs_results"), "fb_mfs_user");
      users = el.find(".fb_mfs_results .fb_mfs_user");
      connect.hide();
      users.show();
    }

    return this;
  };

  A.init = function(callback){
    // check if user is logged in and has friends
    A.restart();

    // click events...
    filter.live("keyup",function(){
      users.removeClass("fb_mfs_user_found");
      if(this.value.length>0) {
        users.hide();
        no_results.hide();
        clear.show();
        BAR.find_user(this.value, { except: opt.filter_except||null }, function(user){
          users.filter("[data-fb-id='"+user.uid+"']").addClass("fb_mfs_user_found").show();
        },function(){
          no_results.show();
        });
      }
      else {
        clear.hide();
        no_results.hide();
        users.show();
      }
      A.total_filter_found = users.filter(".fb_mfs_user_found").length;
      typeof opt.onFilterName == "function" && opt.onFilterName(A);
      return false;
    });

    clear.live("click",function(){
      A.clear_filter();
      typeof opt.onFilterClear == "function" && opt.onFilterClear(A);
      return false;
    });

    users.live("click",function(){
      var user = $(this);
      if(user.hasClass("selected")) {
        user.removeClass("selected").find(".check_mark").removeClass("selected");
      }
      else {
        user.addClass("selected").find(".check_mark").addClass("selected");
      }

      A.total_selected = users.filter(".selected").length;
      total_selected.text(A.total_selected);

      return false;
    });

    typeof callback == "function" && callback(A);
    return this;
  };

  return A;
};

ImageError = function(el,grace) {
  if(!el.invalid_src && grace && grace.length>0) { el.invalid_src = el.src; el.src = grace; }
  if(el.invalid_src || (grace && grace.length==0) || !grace) { $(el).addClass("image_404"); }
};

Share = function() {
  var A = {};
  A.facebook = function(opt){
    var opt = opt || {};
    if( (opt.name && opt.link) || opt.method) {
      var params = {
        method: opt.method || 'feed',
        display: opt.display || 'iframe',
        to: opt.to || null,
        name: opt.name,
        link: opt.link || ENV.url.httpdomain,
        picture: opt.picture || ENV.url.httpdomain+"/img/logo/cs_logo_128.png",
        caption: opt.caption || '',
        description: opt.description || '',
        message: opt.message || '',
        actions: opt.actions || null,
        properties: opt.properties || null
      };
      /* example:
        actions: [{ name: 'fbrell', link: 'http://fbrell.com/' }],
        properties: [ { text: 'value1', href: 'http://developers.facebook.com/'}, { text: 'value1', href: 'http://developers.facebook.com/'} ],
      */
      if(params.method=="stream.share" || params.method=="link") {
        params = { method: "stream.share", u: opt.u || params.link };
      }
      
      if(params.method=="share.new") {
        var p_w = (opt.width||575), p_h = (opt.height||365);
        var p_t = (screen.height/2)-(p_h/2)-50, p_l = (screen.width/2)-(p_w/2);
        var url = "http://www.facebook.com/sharer/sharer.php?display=popup&u="+URI.encode(opt.u || params.link);
        window.open(url,"CS_Facebook_Share","width="+p_w+",height="+p_h+",top="+p_t+",left="+p_l);
      }
      else {
        FB.ui(params, opt.callback || function(){});
      }
      typeof opt.after == "function" && opt.after(params);
    }
  };
  A.twitter = function(opt){
    var opt = opt || {};
    if(opt.link) {
      var qs = URI.compile({
        text: opt.text || '',
        url: opt.link || '',
        via: opt.via || '',
        related: opt.related || ''
      });
      var url = "http://twitter.com/intent/tweet?"+qs;
      window.open(url, "twitter_share","width=500,height=400");
    }
  };
  return A;
};

CS.scroll_action = function(opt,callback){
  var opt = opt || {};
  var el = opt.target || opt;
  $(el).unbind("scroll.scroll_upto").bind("scroll.scroll_upto",function(){
    var self = $(this);
    var me = self[0];
    var complete = $(this).data('data-scroll-upto-complete') || null;
    var upto_offset = opt.offset || $(this).attr('data-scroll-upto-offset') || 20;
    var upto_position = opt.position || $(this).attr('data-scroll-upto-position') || (me.scrollHeight - me.clientHeight - upto_offset);
    if(me.scrollTop >= upto_position && !complete) {
      self.data('data-scroll-upto-complete',true);
      typeof callback=="function" && callback(self);
    }
    return false;
  });
};

check_bar_toggle = function(success,fail,delay){
  setTimeout(function(){
    if(exists("window.CS.Plugin.BAR")) {
      success && success.call();
    }
    else {
      fail && fail.call();
    }
  },delay||500);
};

CS.Bar_Install_Buttons = {
  init: function(opt,callback) {
    var opt = opt || {};
    this.plugin = opt.skip_plugin || window.ExecBar && !ExecBar.installed || null;
    var b = opt.browser || exists("ENV.client.ua") || null;
    var BR = { get_it: opt.get_it || "Get CloudShopper", for_class:"", for_browser:"", href:""};
    var browser = {
      'chrome': 'Google Chrome',
      'firefox': 'Firefox 4+',
      'safari': 'Safari 5.1+'
    };
    if(browser[b]) {
      BR.href = "/download";
      BR.for_class = b;
      BR.for_browser = "For "+browser[b];
    }
    else {
      BR.href = "/download";
      BR.for_class = "chrome";
      BR.for_browser = "For <a target='_blank' href='http://www.google.com/chrome/'>Chrome</a>, <a target='_blank' href='http://www.mozilla.com/firefox/'>Firefox</a> and <a target='_blank' href='http://www.apple.com/safari/'>Safari</a>";
    }
    this.browser_data = BR;
    typeof callback=="function" && callback();
    return this;
  },
  add_buttons: function(opt,callback){
    if(!this.plugin) { return this; }
    var opt = opt || {};
    var buttons = UI.View(opt.view || "bar_install_buttons").render(this.browser_data || {});
    $(opt.target || "#bar_install_buttons").each(function(){
      $(this).html(buttons);
      typeof callback=="function" && callback(this);
    });
    return this;
  },
  get_browser: function(callback) {
    typeof callback=="function" && callback(this.browser_data);
    return this;
  },
  check_plugin: function(o,cb) {
    var self = this;
    setTimeout(function(){ self.init(o,cb); }, 1300);
    setTimeout(function(){ self.init(o,cb); }, 3000);
    setTimeout(function(){ self.init(o,cb); }, 10000);
    return this;
  }
};

function popUp(URL) {
  var day = new Date();
  var id = day.getTime();
  eval("page" + id + " = window.open(URL, '" + id + "', 'toolbar=1,scrollbars=1,location=1,statusbar=1,menubar=1,resizable=1,width=400,height=400,left = 520,top = 250');");
}

Function.prototype.define = function(method_name, method_body){
  this.prototype[method_name] = function(args){
    return method_body.apply(this,[args]);
  }
  return this;
}
