;(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  } else {
    factory(jQuery);
  }
}(function ($) {
  'use strict';
  var namespace = 'animsition';
  var methods = {
    counts: {},
    init: function(options){
      methods.counts.init = [];
      methods.counts.in = [];
      methods.counts.out = [];
      options = $.extend({
        inClass               :   'fade-in',
        outClass              :   'fade-out',
        inDuration            :    1.0, // => 1.0s
        outDuration           :    1.0, // => 1.0s
        inDelay               :    0,   // => 0s
        outDelay              :    0,   // => 0s
        linkElement           :   '.animsition-link',
        // e.g. linkElement   :   'a:not([target="_blank"]):not([href^=#])'
        loading               :    true,
        loadingClass          :   'animsition-loading',
        loadingWrapClass      :   'animsition-wrap',
        loadingInnerHtml      :   '', // e.g => '<img src="loading.svg" />'
        timeout               :   true,
        timeoutCountdown      :   6.0, // => 6.0s
        timeoutFunction       :   function(){},
        transition            :   function(url){ window.location.href = url; },
        unSupportCss          : [
                                  'animation-duration',
                                  '-webkit-animation-duration',
                                  '-o-animation-duration'
                                ]
        //"unSupportCss" option allows you to disable the "animsition" in case the css property in the array is not supported by your browser.
        //The default setting is to disable the "animsition" in a browser that does not support "animation-duration".
      }, options);

      // Remove the "Animsition" in a browser
      // that does not support the "animaition-duration".
      var support = methods.supportCheck.call(this, options);
      if(!support){
        // If do not have a console object to object window
        if (!('console' in window)) {
          window.console = {};
          window.console.log = function(str){ return str; };
        }
        console.log('Animsition does not support this browser.');
        return methods.destroy.call( this );
      }

      if(options.timeout) methods.setCountdown.call(this, options);

      return this.each(function(index){
        var _this = this;
        var $this = $(this);
        var $window = $(window);
        var data = $this.data(namespace);

        if (!data) {
          options = $.extend({}, options);
          $this.data(namespace, { options: options });

          if(options.loading) methods.addLoading.call(_this);

          methods.counts.init.push(index);

          // Firefox back button issue #4
          $window.on('unload.' + namespace, function() { });

          $(options.linkElement).on('click.' + namespace, function(event) {
            event.preventDefault();
            var $self = $(this);
            var url = $self.attr('href');

            // middle mouse button issue #24
            // if(middle mouse button || command key || shift key || win control key)
            if (event.which === 2 || event.metaKey || event.shiftKey || navigator.platform.toUpperCase().indexOf('WIN') !== -1 && event.ctrlKey) {
              return window.open(url, '_blank');
            } else {
              return methods.out.call(_this,$self,url);
            }
          });

        }
      }); // end each
    },

    addLoading: function(){
      var $this = $(this);
      var options = $this.data(namespace).options;
      var loadingWrapper = '<div class="' + options.loadingWrapClass + '"></div>';
      var loading = '<div class="'+options.loadingClass+'">'+ options.loadingInnerHtml +'</div>';
      $this.wrap(loadingWrapper);
      var $loadingTarget = $this.parent('.' + options.loadingWrapClass);
      return $loadingTarget.append(loading);
    },

    removeLoading: function(){
      var $this = $(this);
      var options = $this.data(namespace).options;
      var $loading = $this.siblings('.' + options.loadingClass);
      $loading.remove();
      return $this.unwrap();
    },

    supportCheck: function(options){
      var $this = $(this);
      var props = options.unSupportCss;
      var len = props.length;
      var support  = false;

      if (len === 0) support = true;

      for (var i = 0; i < len; i++) {
        if (typeof $this.css(props[i]) === 'string') {
          support = true;
          break;
        }
      }
      return support;
    },

    in: function(index,options){
      var _this = this;
      var $this = $(this);
      var data = $this.data(namespace);

      if(!data) return;

      var isInClass = $this.data('animsition-in-class');
      var isInDelay = $this.data('animsition-in-delay');
      var isInDuration = $this.data('animsition-in-duration');

      options = $.extend(data.options,{
        inClass: isInClass,
        inDelay: isInDelay,
        inDuration: isInDuration
      }, options);

      if(options.timeout && methods.counts.in.length === 0) methods.clearCountdown.call(_this);
      if(options.loading) methods.removeLoading.call(_this);

      return $this
        .trigger('animsition.inStart')
        .css({
          'animation-duration' : options.inDuration + 's',
          'animation-delay' : options.inDelay + 's'
        })
        .addClass(options.inClass)
        .animsitionCallback(function(){
          $this
            .removeClass(options.inClass)
            .css({
              'opacity' : 1,
              'animation-delay' : '0s',
            })
            .trigger('animsition.inEnd');

          methods.counts.in.push(options.inClass);

          // last callback
          if(methods.counts.init.length === methods.counts.in.length){
            return $this.trigger('animsition.inDone');
          }
        });
    },

    out: function($self,url,options){
      var $this = $(this);
      var data = $this.data(namespace);

      if(!data) return;

      var selfOutClass = $self.data('animsition-out-class');
      var thisOutClass = $this.data('animsition-out-class');
      var selfOutDelay = $self.data('animsition-out-delay');
      var thisOutDelay = $this.data('animsition-out-delay');
      var selfOutDuration = $self.data('animsition-out-duration');
      var thisOutDuration = $this.data('animsition-out-duration');
      var isOutClass = selfOutClass !== undefined ? selfOutClass : thisOutClass;
      var isOutDelay = selfOutDelay !== undefined ? selfOutDelay : thisOutDelay;
      var isOutDuration = selfOutDuration !== undefined ? selfOutDuration : thisOutDuration;

      options = $.extend(data.options,{
        outClass: isOutClass,
        outDelay: isOutDelay,
        outDuration: isOutDuration
      }, options);

      return $this
        .trigger('animsition.outStart')
        .css({
          'animation-duration' : options.outDuration + 's',
          'animation-delay' : options.outDelay + 's'
        })
        .addClass(options.outClass)
        .animsitionCallback(function(){
          methods.counts.out.push(options.outClass);
          $this.trigger('animsition.outEnd');

          // last callback
          if(methods.counts.in.length === methods.counts.out.length ){
            $this.trigger('animsition.outDone');
            return options.transition(url);
          }
        });
    },

    setCountdown: function(options){
      var _this = this;
      var $this = $(this);
      methods.counts.timer;
      return methods.counts.timer = setTimeout(function(){
        $this.trigger('animsition.timeout');
        options.timeoutFunction();
        return methods.clearCountdown.call(_this);
      }, options.timeoutCountdown * 1000);
    },

    clearCountdown: function(){
      return clearTimeout(methods.counts.timer);
    },

    destroy: function(){
      return this.each(function(){
        var $this = $(this);
        $(window).unbind('.'+namespace);
        $this
          .css({'opacity':1})
          .removeData(namespace);
      });
    }

  }; // methods

  $.fn.animsitionCallback = function(callback){
    var end = 'animationend webkitAnimationEnd mozAnimationEnd oAnimationEnd MSAnimationEnd';
    return this.each(function() {
      var $this = $(this);
      $this.bind(end, function(){
        $this.unbind(end);
        return callback.call(this);
      });
    });
  };

  $.fn.animsition = function(method){
    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.'+namespace);
    }
  };

}));
