angular.module('app.routes', [])

        .config(function ($stateProvider, $urlRouterProvider) {

            // Ionic uses AngularUI Router which uses the concept of states
            // Learn more here: https://github.com/angular-ui/ui-router
            // Set up the various states which the app can be in.
            // Each state's controller can be found in controllers.js
            $stateProvider

                    .state('test-State', {
                        url: '/test',
                        templateUrl: 'templates/test.html',
                        controller: 'testCtrl'
                    })

                    .state('main-Page', {
                        url: '/main',
                        templateUrl: 'templates/main-Page.html',
                        controller: 'main-PageCtrl'
                    })

                    .state('settings', {
                        url: '/settings',
                        templateUrl: 'templates/settings.html',
                        controller: 'settingsCtrl'
                    })

                    .state('add-new-medication', {
                        url: '/add-new-medication',
                        templateUrl: 'templates/add-new-medication.html',
                        controller: 'add-new-medicationCtrl'
                    })

                    .state('things-To-Do-Today', {
                        url: '/things-to-do-today',
                        templateUrl: 'templates/things-To-Do-Today.html',
                        controller: 'things-To-Do-TodayCtrl'
                    })

                    .state('budget', {
                        url: '/budget',
                        templateUrl: 'templates/budget.html',
                        controller: 'budgetCtrl'
                    })

                    //Routes linking to contacts (friends and family and urgent care)
                    .state('contacts', {
                        url: '/contacts',
                        templateUrl: 'templates/contacts.html',
                        controller: 'contactsCtrl'
                    })

                    //Routes under planning my care.
                    .state('planning-My-Care', {
                        url: '/planning-my-care',
                        templateUrl: 'templates/planning-My-Care.html',
                        controller: 'general-Planning-My-CareCtrl'
                    })
                    .state('help-At-Home', {
                        url: '/help-at-home',
                        templateUrl: 'templates/help-At-Home.html',
                        controller: 'general-Planning-My-CareCtrl'
                    })
                    .state('social-Services', {
                        url: '/social-services',
                        templateUrl: 'templates/social-Services.html',
                        controller: 'general-Planning-My-CareCtrl'
                    })
                    .state('my-Transport', {
                        url: '/my-transport',
                        templateUrl: 'templates/my-Transport.html',
                        controller: 'general-Planning-My-CareCtrl'
                    })
                    .state('my-Appointments', {
                        url: '/my-appointments',
                        templateUrl: 'templates/my-Appointments.html',
                        controller: 'my-AppointmentsCtrl'
                    })
                    .state('my-Medication', {
                        url: '/my-medication',
                        templateUrl: 'templates/my-Medication.html',
                        controller: 'general-Planning-My-CareCtrl'
                    })
                    .state('my-Meals', {
                        url: '/my-meals',
                        templateUrl: 'templates/my-Meals.html',
                        controller: 'general-Planning-My-CareCtrl'
                    })
                    .state('places-Services', {
                        url: '/places-services',
                        templateUrl: 'templates/places-Services.html',
                        controller: 'placesCtrl',
//                        cache: false //This causes a reload on the back button.
                    })
                    .state('medications', {
                        url: '/medications',
                        templateUrl: 'templates/medications.html',
                        controller: 'medicationsCtrl'
                    })

                    .state('my-Care-Plan', {
                        url: '/my-care-plan',
                        templateUrl: 'templates/my-Care-Plan.html',
                        controller: 'my-Care-PlanCtrl'
                    });


            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/main');

        });
