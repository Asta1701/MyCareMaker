 /**
  * Module for app
  * 
  * @namespace app.app
  */
// angular.module is a global place for creating, registering and retrieving Angular modules
angular.module('app', ['ionic','ionic.service.core', 'ionic.service.analytics', 'ngCordova',
                'app.controllers', 'app.routes', 'app.services', 'app.directives', 'mycaremakerAdd'])

.run(function($ionicPlatform, $ionicNavBarDelegate, $state, $ionicHistory, $rootScope, $ionicAnalytics, ConfigurationData) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)

        $ionicAnalytics.register(); //Registers analytics.

        $ionicPlatform.onHardwareBackButton(function(){
            $ionicHistory.goBack();
        }); //Ensures the Android back button works.
        
        if(window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          
        }
        if(window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }

        //$rootScope variable used in index.html inside an ng-if to remove the 
        //back button from the header if the platform is not iOS.
        $ionicNavBarDelegate.showBackButton((ionic.Platform.isIOS() ? true : false));
        $rootScope.isIOS = (ionic.Platform.isIOS() ? "block" : "none");
        $rootScope.titleFontSize = (ionic.Platform.isIOS() ? "0px" : "35px");
        
        
        $rootScope.goHome = function() {
            $state.go('main-Page');
            
        };
        
        $rootScope.goSettings = function() {
            $state.go('settings');
            
        };
//        alert($rootScope.isIOS + " " + $rootScope.titleFontSize);

    });
})
