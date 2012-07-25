// Utility
if ( typeof Object.create !== 'function' ) {
  Object.create = function( obj ) {
    function F() {};
    F.prototype = obj;
    return new F();
  };
}

(function( $, window, document, undefined ) {

var settingPort,
    KEY_IGNORE_ITEMS = "ignore_items",
    logLVL = 0 // 0 - disabled; 1 - enabled
  ;
//http*://*craigslist.org*
// Content Local Storage for settings
var settings = {
  values: {},
  loadedValues: 0,
  valuesToLoad: [KEY_IGNORE_ITEMS],

  addV: function (key,val) { this.values[key].push(val); },
  setV: function (key,val) { this.values[key] = val; },
  getV: function (key) { return this.values[key]; },
  getDV: function (key) { gDLSV(key); return this.values[key]; },

  load: function() {
    for (var i in this.valuesToLoad) { this.sendMessage(this.valuesToLoad[i]); }
    logLVL === 1 && console.log('Loaded: ',this.values);
  },

  sendMessage: function (key) {
    if (!settingPort)
      settingPort = chrome.extension.connect({ name: "getSetting" });
    settingPort.postMessage({ key: key });
  },

  receiveMessage: function (args) {
    // not using 'this' due to issues with binding on callback
    settings.values[args.key] = args.value;
    if (++settings.loadedValues == settings.valuesToLoad.length)
      settings.initializeOnReady();
  }
};

function MCT_flashNote(id,msg){
  $(id).text(msg).fadeIn().delay(5000).fadeOut('slow');
}
function gLSV(k){
  chrome.extension.sendRequest({method: "getLS", key: k}, function(response) {
    var r = response, rd = r.data;
    if( rd === '' || rd === null || typeof rd === 'undefined' ){
      logLVL === 1 && console.log('the value is `'+rd+'`' );
    } else {
      logLVL === 1 && console.log('Got info from BG!',r);
    }
    logLVL === 1 && console.log('Getting ==>',r, rd);
    if ( typeof rd === 'object' ) {
      settings.setV(k, JSON.stringify(rd));
    } else {
      settings.setV(k, rd);
    }
  });
}
function gDLSV(k){
  chrome.extension.sendRequest({method: "getDefLS", key: k}, function(response) {
    var r = response, rd = r.data;
    if( rd === '' || rd === null || typeof rd === 'undefined' ){
      logLVL === 1 && console.log('the value is `'+rd+'`' );
    } else {
      logLVL === 1 && console.log('Got info from BG!',r);
    }
    logLVL === 1 && console.log('Getting ==>',r, rd);
    if ( typeof rd === 'object' ) {
      settings.setV(k, JSON.stringify(rd));
    } else {
      settings.setV(k, rd);
    }
  });
}
function sLSV(k,v){
  chrome.extension.sendRequest({method: "setLS", key: k, value: v.replace(/\\"/g,'"')}, function(response) {
    var r = response, rd = r.data;
    logLVL === 1 && console.log('Setting ==>',r, rd);
    settings.setV(k, rd);
  });
}

function aLSV(k,v){
  chrome.extension.sendRequest({method: "addLS", key: k, value: v.replace(/\\"/g,'"')}, function(response) {
    var r = response, rd = r.data;
    logLVL === 1 && console.log('Setting ==>',r, rd);
    settings.setV(k, rd);
  });
}


var 
  AppVersion		= '0.0.1',
  cPage = {
    head: $('head'),
    head_style: $(this.head).find('style'),
    loc: window.location.href,// get the location href to find out what page is loaded
    uri: window.location.pathname.substr(10)+window.location.search,//grab the page URI
  }
  ;

  if ( cPage.head_style.length < 1 ) {
    cPage.head.append('<style/>');
    cPage.head_style = cPage.head.find('style');
  }
		
      cPage.head_style.append(''+
	  ".med_view .item:hover {"+
	  "background: #cccccc;"+
	  "}"+
      '');
	  gLSV(KEY_IGNORE_ITEMS);
  if( /999.md/.test(cPage.loc) ) {
    try {
      function GM_wait() {
		  var ignoreList=settings.getV(KEY_IGNORE_ITEMS),
				itemsList=$('#boardItemList > div.item')
			;
          if ( typeof ignoreList === 'undefined') {
              window.setTimeout(GM_wait, 100);
          } else {
			var ignoreList=JSON.parse(ignoreList);
			$('<a class="ignore ui-button ui-widget ui-state-hover ui-corner-all ui-button-text-only" title="Click to add it to ignore list">+</>').insertAfter(itemsList.find(' .text a.buy2'));
			$.each(itemsList, function(i, v) {
				v = v instanceof jQuery ? v: $(v);
				!!~$.inArray(parseInt($('a[href*="MsgID="]', v).attr('href').split('=')[1]),ignoreList) && v.hide(); 
			});			
			$('.ignore').on('click',function(){ 
				var currentItemID = $(this).parent().find('a.tit').attr('href').split('=')[1];
				aLSV(KEY_IGNORE_ITEMS,currentItemID);
				$(this).parent().parent().fadeOut();
				//console.log(this,currentItemID); 
			});
			
        }
      }
      GM_wait();
    } catch(e){
      logLVL === 1 && console.debug('Unable to load 999md.',e,e.stack);
    }
  }
  //---[ START: Options page communication ]---
  //TODO: options page
  //---[ END: Options page communication ]---
  
//------------------------------------------------------------------------------------------------------------------	
//	END:	CONTROL PANEL
//------------------------------------------------------------------------------------------------------------------	


//---[ END:	That's all GM folks

})( jQuery, window, document );

