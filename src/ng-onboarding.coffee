#
# ngOnboarding
# by Adam Albrecht
# http://adamalbrecht.com
#
# Source Code: https://github.com/adamalbrecht/ngOnboarding
#
# Compatible with Angular 1.2.x
#

app = angular.module("ngOnboarding", [])

app.provider "ngOnboardingDefaults", ->
  options: {
    overlay: false,
    overlayOpacity: 0.8,
    overlayClass: 'onboarding-overlay',
    popoverClass: 'onboarding-popover',
    titleClass: 'onboarding-popover-title',
    contentClass: 'onboarding-popover-content',
    arrowClass: 'onboarding-arrow',
    buttonContainerClass: 'onboarding-button-container',
    buttonClass: "onboarding-button",
    showButtons: true,
    nextButtonText: 'Next',
    previousButtonText: 'Previous',
    showDoneButton: true,
    doneButtonText: 'Done',
    closeButtonClass: 'onboarding-close-button',
    closeButtonText: 'X'
  }
  $get: ->
    @options

  set: (keyOrHash, value) ->
    if typeof(keyOrHash) == 'object'
      for k, v of keyOrHash
        @options[k] = v
    else
      @options[keyOrHash] = value

app.directive 'onboardingPopover', ['ngOnboardingDefaults', '$sce', '$timeout', (ngOnboardingDefaults, $sce, $timeout) ->
  restrict: 'E'
  scope:
    enabled: '='
    steps: '='
  replace: true
  link: (scope, element, attrs) ->
    # Important Variables
    curStep = null
    attributesToClear = ['top', 'right', 'bottom', 'left', 'width', 'height', 'position']

    # Button Actions
    scope.next = -> scope.index = scope.index + 1
    scope.previous = -> scope.index = scope.index - 1
    scope.close = ->
      scope.enabled = false
      setupOverlay(false)

    # Watch for changes in the current step index
    scope.$watch 'index', (newVal, oldVal) ->
      if newVal == null
        scope.enabled = false
        setupOverlay(false)
        return

      console.log "WATCH"
      curStep = scope.steps[scope.index]
      scope.lastStep = (scope.index + 1 == scope.steps.length)
      scope.showNextButton = (scope.index + 1 < scope.steps.length)
      scope.showPreviousButton = (scope.index > 0)
      for attr in attributesToClear
        scope[attr] = null
      for k, v of ngOnboardingDefaults
        if curStep[k] == undefined
          scope[k] = v
      for k, v of curStep
        scope[k] = v

      # Allow some variables to include html
      scope.description = $sce.trustAsHtml(scope.description)
      scope.nextButtonText = $sce.trustAsHtml(scope.nextButtonText)
      scope.previousButtonText = $sce.trustAsHtml(scope.previousButtonText)
      scope.doneButtonText = $sce.trustAsHtml(scope.doneButtonText)
      scope.closeButtonText = $sce.trustAsHtml(scope.closeButtonText)
      setupOverlay()
      setupPositioning()

    setupOverlay = (showOverlay=true) ->
      $('.onboarding-focus').removeClass('onboarding-focus')
      if showOverlay
        if curStep['attachTo'] && scope.overlay
          $(curStep['attachTo']).addClass('onboarding-focus')

    setupPositioning = ->
      attachTo = curStep['attachTo']
      scope.position = curStep['position']
      xMargin = 15
      yMargin = 15
      if attachTo
        # SET X POSITION
        unless scope.left || scope.right
          left = null
          right = null
          if scope.position == 'right'
            left = $(attachTo).offset().left + $(attachTo).outerWidth() + xMargin
          else if scope.position == 'left'
            right = $(window).width() - $(attachTo).offset().left + xMargin
          else if scope.position == 'top' || scope.position == 'bottom'
            left = $(attachTo).offset().left
          if curStep['xOffset']
            left = left + curStep['xOffset'] if left != null
            right = right - curStep['xOffset'] if right != null
          scope.left = left
          scope.right = right

        # SET Y POSITION
        unless scope.top || scope.bottom
          top = null
          bottom = null
          if scope.position == 'left' || scope.position == 'right'
            top = $(attachTo).offset().top
          else if scope.position == 'bottom'
            top = $(attachTo).offset().top + $(attachTo).outerHeight() + yMargin
          else if scope.position == 'top'
            bottom = $(window).height() - $(attachTo).offset().top + yMargin
            

          if curStep['yOffset']
            top = top + curStep['yOffset'] if top != null
            bottom = bottom - curStep['yOffset'] if bottom != null
          scope.top = top
          scope.bottom = bottom

    if scope.steps.length
      scope.index = 0

  template: """
              <div class='onboarding-container' ng-show='enabled'>
                <div class='{{overlayClass}}' ng-style='{opacity: overlayOpacity}', ng-show='overlay'></div>
                <div class='{{popoverClass}} {{position}}' ng-style="{width: width, height: height, left: left, top: top, right: right, bottom: bottom}">
                  <div class='{{arrowClass}}'></div>
                  <h3 class='{{titleClass}}'>
                    <span ng-bind='title'></span>
                    <a href='' ng-click='close()' class='{{closeButtonClass}}' ng-bind-html='closeButtonText'></a>
                  </h3>
                  <div class='{{contentClass}}'>
                    <p ng-bind-html='description'></p>
                  </div>
                  <div ng-show='showButtons' class='{{buttonContainerClass}}'>
                    <a href='' ng-click='previous()' ng-show='showPreviousButton' class='{{buttonClass}}' ng-bind-html='previousButtonText'></a>
                    <a href='' ng-click='next()' ng-show='showNextButton' class='{{buttonClass}}' ng-bind-html='nextButtonText'></a>
                    <a href='' ng-click='close()' ng-show='showDoneButton && lastStep' class='{{buttonClass}}' ng-bind-html='doneButtonText'></a>
                  </div>
                </div>
              </div>
            """
]