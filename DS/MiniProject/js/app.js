// IIFE keeps our variables private
// and gets executed immediately!
(function () {
  // make doc editable and focus
  var doc = document.getElementById('doc');
  doc.contentEditable = true;
  doc.focus();

  // if this is a new doc, generate a unique identifier
  // append it as a query param
  var id = getUrlParameter('id');
  if (!id) {
    location.search = location.search
      ? '&id=' + getUniqueId() : 'id=' + getUniqueId();
    return;
  }

  return new Promise(function (resolve, reject) {
    // subscribe to the changes via Pusher
    var pusher = new Pusher("8da9d56271713a65600c", { cluster: 'ap3'});
    var channel = pusher.subscribe(id);
    channel.bind('client-text-edit', function(html) {
      // save the current position
      var currentCursorPosition = getCaretCharacterOffsetWithin(doc);
      console.log('client-text-edit call');
	var prehtml = doc.innerHTML;
	var newhtml = html;
	var len = prehtml.length;
	var prefix = html.slice(0, currentCursorPosition);
	console.log(prefix);
	console.log(prehtml);	    
	doc.innerHTML = html;
	
      // set the previous cursor position
	if(prehtml.slice(0, currentCursorPosition) == prefix){
	console.log("IF");
      	setCaretPosition(doc, currentCursorPosition);
	}	
	else 
	setCaretPosition(doc, currentCursorPosition + newhtml.length - prehtml.length );
    });
    channel.bind('pusher:subscription_succeeded', function() {
	console.log('subscription done');      
	function triggerChange (e) {	     
		console.log("triggerChange");
		console.log(e.target.innerHTML);
	      var flag = channel.trigger('client-text-edit', e.target.innerHTML);
		console.log(flag);
	}
	doc.addEventListener('input', triggerChange);
    });
  }).then(function (channel) {
    
  });


  // a unique random key generator
  function getUniqueId () {
    return 'private-' + Math.random().toString(36).substr(2, 9);
  }

  // function to get a query param's value
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  function getCaretCharacterOffsetWithin(element) {
	console.log('getCaretCharacterOffsetWithin');
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
      sel = win.getSelection();
      if (sel.rangeCount > 0) {
        var range = win.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
  }

  function setCaretPosition(el, pos) {
	console.log('setCaretPosition');
    // Loop through all child nodes
    for (var node of el.childNodes) {
      if (node.nodeType == 3) { // we have a text node
        if (node.length >= pos) {
            // finally add our range
            var range = document.createRange(),
                sel = window.getSelection();
            range.setStart(node,pos);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return -1; // we are done
        } else {
          pos -= node.length;
        }
      } else {
        pos = setCaretPosition(node,pos);
        if (pos == -1) {
            return -1; // no need to finish the for loop
        }
      }
    }
    return pos; // needed because of recursion stuff
  }
})();
