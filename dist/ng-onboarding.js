(function() {
  var app;

  app = angular.module("ngOnboarding", ['ngOnboarding.html']);


  angular.module("ngOnboarding.html", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("ngOnboarding.html",
      "<div class='onboarding-container' ng-show='isEnabled'>\n" +
      "<div class='{{overlayClass}}' ng-style='{opacity: overlayOpacity}', ng-show='overlay'></div>\n" +
      "<div ng-hide='waitForElement' ng-class='{ \"hide-popover\": waitForElement}' class='{{popoverClass}} {{positionClass}}' ng-style=\"{width: width, height: height, left: left, top: top, right: right, bottom: bottom}\">\n" + 
      "<div class='{{arrowClass}}'></div>\n    <h3 class='{{titleClass}}' ng-show='title' ng-bind='title'></h3>\n" +
      "<a href='' ng-click='close()' class='{{closeButtonClass}}' ng-bind-html='closeButtonText'></a>\n    <div class='{{contentClass}}'>\n" +
      "<p ng-bind-html='description'></p>\n    </div>\n    <div class='{{buttonContainerClass}}' ng-show='showButtons'>\n" +
      "<span ng-show='showStepInfo' class='{{stepClass}}'>{{actualStepText}} {{visibleStepCounter}} {{totalStepText}} {{stepCount}}</span>\n" +
      "<a href='' ng-click='previous()' ng-show='showPreviousButton && showControlButtons' class='{{buttonClass}}' ng-bind-html='previousButtonText'></a>\n" + 
      "<a href='' ng-click='next()' ng-show='showNextButton && showControlButtons' class='{{buttonClass}}' ng-bind-html='nextButtonText'></a>\n" +
      "<a href='' ng-click='close()' ng-show='showDoneButton && lastStep && showControlButtons' class='{{buttonClass}}' ng-bind-html='doneButtonText'></a>\n" +
      "<a href='' ng-click='next()' ng-show='showStepButton' class='{{buttonClass}} {{stepButtonClass}}' ng-bind-html='stepButtonText'></a>\n" +
      "<a href='' ng-show='!lastStep' ng-click='close()' class='skip-onboarding' ng-bind-html='skipButtonText'></a>\n" + 
      "</div>\n  </div>\n</div>" +
      "");
  }]);

  app.provider("ngOnboardingDefaults", function() {
    return {
      options: {
        overlay: true,
        overlayOpacity: 0.6,
        overlayClass: 'onboarding-overlay',
        popoverClass: 'onboarding-popover',
        titleClass: 'onboarding-popover-title',
        contentClass: 'onboarding-popover-content',
        arrowClass: 'onboarding-arrow',
        buttonContainerClass: 'onboarding-button-container maven',
        buttonClass: "onboarding-button",
        showButtons: true,
        nextButtonText: 'Next &rarr;',
        previousButtonText: '&larr; Previous',
        showDoneButton: true,
        doneButtonText: 'Done',
        closeButtonClass: 'onboarding-close-button',
        closeButtonText: 'X',
        stepClass: 'onboarding-step-info',
        actualStepText: 'Step',
        totalStepText: 'of',
        showControlButtons: false,
        showStepInfo: true
      },
      $get: function() {
        return this.options;
      },
      set: function(keyOrHash, value) {
        var k, v, _results;
        if (typeof keyOrHash === 'object') {
          _results = [];
          for (k in keyOrHash) {
            v = keyOrHash[k];
            _results.push(this.options[k] = v);
          }
          return _results;
        } else {
          return this.options[keyOrHash] = value;
        }
      }
    };
  });

  app.directive('onboardingPopover', [
    'ngOnboardingDefaults', '$sce', '$timeout', '$rootScope', function(ngOnboardingDefaults, $sce, $timeout, $rootScope ) {
      return {
        restrict: 'E',
        scope: {
          isEnabled: '=',
          steps: '=',
          onFinishCallback: '=',
          index: '=stepIndex'
        },
        replace: true,
        link: function(scope, element, attrs) {
          console.log('onboarding::link', scope );

          var attributesToClear, curStep, setupOverlay, setupPositioning;
          curStep = null;
          attributesToClear = ['title', 'top', 'right', 'bottom', 'left', 'width', 'height', 'position'];
          scope.stepCount = scope.steps.length;
          scope.next = function() {
            if( curStep.onEnterCallback ){
              curStep.onEnterCallback();
            }

            if( scope.steps.length <= scope.index + 1 ){
              return scope.close( true );
            }

            return scope.index = scope.index + 1;
          };
          scope.previous = function() {
            return scope.index = scope.index - 1;
          };
          scope.close = function( noSkip ) {
            noSkip = !!noSkip;
            console.log('onboarding::close', scope, scope.onFinishCallback, noSkip );

            scope.isEnabled = false;
            setupOverlay(false);
            if (scope.onFinishCallback) {
              return scope.onFinishCallback( !noSkip );
            }
          };
          scope.$watch('index', function(newVal, oldVal) {
            console.log('onboarding::watch index', newVal, oldVal, scope.isEnabled );
            if( !scope.steps.length ){
              return;
            }
            var attr, k, v, _i, _len;
            if (typeof newVal === 'undefined') {
              scope.isEnabled = false;
              setupOverlay(false);
              return;
            }
            curStep = scope.steps[scope.index];
            scope.lastStep = scope.index + 1 === scope.steps.length;
            scope.showNextButton = scope.index + 1 < scope.steps.length;
            scope.showPreviousButton = scope.index > 0;
            scope.stepCount = scope.steps.length;

            for (_i = 0, _len = attributesToClear.length; _i < _len; _i++) {
              attr = attributesToClear[_i];
              scope[attr] = null;
            }
            for (k in ngOnboardingDefaults) {
              v = ngOnboardingDefaults[k];
              if (curStep[k] === void 0) {
                scope[k] = v;
              }
            }
            for (k in curStep) {
              v = curStep[k];
              scope[k] = v;
            }
            scope.description = $sce.trustAsHtml(scope.description);
            scope.nextButtonText = $sce.trustAsHtml(scope.nextButtonText);
            scope.previousButtonText = $sce.trustAsHtml(scope.previousButtonText);
            scope.doneButtonText = $sce.trustAsHtml(scope.doneButtonText);
            scope.closeButtonText = $sce.trustAsHtml(scope.closeButtonText);
            scope.actualStepText = $sce.trustAsHtml(scope.actualStepText);
            scope.totalStepText = $sce.trustAsHtml(scope.totalStepText);

            scope.visibleStepCounter = scope.visibleStepCounter;

            scope.showStepButton  = curStep.nextButtonText && true;
            scope.stepButtonClass  = curStep.stepButtonClass;
            scope.stepButtonText  = curStep.nextButtonText;
            scope.skipButtonText  = curStep.skipButtonText;

            scope.waitForElement = true;

            //check if attachTo element is already exists on page
            var maxChecks=10, checkCounter=0, attachTo = curStep['attachTo'], checkForElement = function(){
              console.log('onboarding::watch index.checkForElement', curStep, curStep.waitForElement, $(attachTo).offset(), $(attachTo).outerWidth() );
              checkCounter++;
              if( !$(attachTo).length && curStep.waitForElement){
                if( checkCounter >= maxChecks ){
                  return;
                }
                $timeout( function(){
                  checkForElement();
                }, 1000 );
              }else{

                if( $(attachTo).length && scope.waitForElement ){
                  var y = $(attachTo).position().top, 
                  windowHeight = $(window).height(), 
                  windowScroolY = $(window).scrollTop();

                  if( ( y - windowScroolY > windowHeight / 1.5  ) || ( y - windowScroolY < 0 ) ){
                    console.log('onboarding::checkForElement', 'scroll', checkCounter, y, windowScroolY, windowHeight, windowHeight / 1.5 );
                    if( checkCounter < 4 ){
                      //$(attachTo).animate({ scrollTop: windowHeight / 2 });
                      $(attachTo)[0].scrollIntoView(false, {behavior: "smooth"})
                      $timeout( function(){
                        checkForElement();
                      }, 1000 );
                      return;
                    }
                  }
                }

                scope.waitForElement = false;
                $timeout( function(){
                  setupOverlay();
                  setupPositioning();
                } );
              }
            };

            $timeout( function(){
              checkForElement();
            }, 1000);

          });

          setupOverlay = function(showOverlay) {
            console.log('onboarding::setupOverlay', showOverlay, scope.isEnabled, $(curStep['attachTo']), scope.overlay );
            if (!angular.isDefined(showOverlay) || showOverlay == null) {
              showOverlay = true;
            }
            
            console.log('onboarding::setupOverlay', showOverlay, curStep['attachTo'], scope.overlay );
            $('.onboarding-focus').removeClass('onboarding-focus');
            if (showOverlay) {
              if (curStep['attachTo'] && scope.overlay) {
                console.log('onboarding::setupOverlay', showOverlay, scope.isEnabled, $(curStep['attachTo']) );
                return $(curStep['attachTo']).addClass('onboarding-focus');
              }
            }
          };

          setupPositioning = function() {
            var attachTo, bottom, left, right, top, xMargin, yMargin;
            attachTo = curStep['attachTo'];
            scope.position = curStep['position'];

            console.log('onboarding::setupPositioning', attachTo, scope.isEnabled, curStep, $(attachTo).offset(),  $(attachTo).outerWidth() );

            //console.log('onboarding::setupPositioning.actualSetUp', $(attachTo).offset(), $(attachTo).outerWidth() );
            xMargin = 15;
            yMargin = 15;
            if (attachTo) {
              if (!(scope.left || scope.right)) {
                left = null;
                right = null;
                if (scope.position === 'right') {
                  left = $(attachTo).offset().left + $(attachTo).outerWidth() + xMargin;
                } else if (scope.position === 'left') {
                  right = $(window).width() - $(attachTo).offset().left + xMargin;
                } else if (scope.position === 'top' || scope.position === 'bottom') {
                  left = $(attachTo).offset().left;
                }
                if (curStep['xOffset']) {
                  if (left !== null) {
                    left = left + curStep['xOffset'];
                  }
                  if (right !== null) {
                    right = right - curStep['xOffset'];
                  }
                }
                scope.left = left;
                scope.right = right;
              }
              if (!(scope.top || scope.bottom)) {
                top = null;
                bottom = null;
                if (scope.position === 'left' || scope.position === 'right') {
                  top = $(attachTo).offset().top;
                } else if (scope.position === 'bottom') {
                  top = $(attachTo).offset().top + $(attachTo).outerHeight() + yMargin;
                } else if (scope.position === 'top') {
                  bottom = $(window).height() - $(attachTo).offset().top + yMargin;
                }
                if (curStep['yOffset']) {
                  if (top !== null) {
                    top = top + curStep['yOffset'];
                  }
                  if (bottom !== null) {
                    bottom = bottom - curStep['yOffset'];
                  }
                }
                scope.top = top;
                scope.bottom = bottom;
              }
            }
            if (scope.position && scope.position.length) {
              return scope.positionClass = "onboarding-" + scope.position;
            } else {
              return scope.positionClass = null;
            }
          };
          if (scope.steps.length && !scope.index) {
            return scope.index = 0;
          }

          $rootScope.$on('onboarding.next', function( event, data ) {
              console.log('onboarding.next event accepted', data, scope.index );
              scope.next();
          });

          $rootScope.$on('onboarding.close', function( event, data ) {
              console.log('onboarding.close event accepted', data, scope.index );
              scope.close( true );
          });

        },
        templateUrl: 'ngOnboarding.html'
      };
    }
  ]);

}).call(this);