angular.module('app.controllers', [])
    /**
     * @ngdoc Controllers
     * @name app.controllers.main-PageCtrl
     * @description
     * Controller for the first page of the app.
     */
    .controller('main-PageCtrl', function ($scope, ConfigurationData, MyCareMakerPopups) {

        var config = ConfigurationData.get();
        initDocument(config);

        $scope.style = config.getStyleOption();

        $scope.todaysDate
        var date = new Date(); //Sets todays date in the a specific format.
        var weekday = new Array(7);
        weekday[0]=  "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";

        $scope.day = weekday[date.getDay()];
        var formattedDate = formatDate(date);
        $scope.date = formattedDate.split(" ")[1] + " " + formattedDate.split(" ")[2]
            + " " + formattedDate.split(" ")[3];
        //If a user has not set there post code this confirm dialog will direct them 
        //to the settings on a click of yes.
        if (config.isFirstSet()) {
            MyCareMakerPopups.showConfirm('Welcome to MyCareMaker',
                    'Would you like to set a Postcode?',
                    function () {
                        window.location.href = "#/settings";
                    },
                    function () {
                        MyCareMakerPopups.showAlert('Nevermind!',
                                'You can always set it later by clicking the settings button in' +
                                ' the top right hand corner.');
                    });
        }

    })

    /**
     * @ngdoc Controllers
     * @name app.controllers.settingsCtrl
     * @description
     * Controller for the settings page of the app.
     */
    .controller('settingsCtrl', function ($scope, $timeout, ConfigurationData, GooglePlaces, MyCareMakerPopups) {

        var configurationData = ConfigurationData.get();
        initDocument(configurationData);
        $scope.style = configurationData.getStyleOption();
        //Sets postcode from factory object.
        $scope.postCode = configurationData.getPostCode();

        $scope.postCodeForm = function (newPostCode) {
            console.log(newPostCode);

            //Validates the postcode.
            if (newPostCode !== "" && newPostCode !== undefined && newPostCode !== null) {

                configurationData.setPostCode(newPostCode);

                $scope.postCode = configurationData.getPostCode();

                //Sets new postcode using google places factory object.
                GooglePlaces.setCoordinates(configurationData.getKey(), 15)
                .then(function(location) {

                    console.log(location.lat + " " + location.lng);
                    configurationData.setCoordinates(location);
                    $scope.postCode = configurationData.getPostCode();

                    console.log("Coordinates set. (Last)");
                    var firstSet = JSON.parse(sessionStorage.getItem("firstSet"));
                    configurationData.setFirstSet(firstSet);

                    MyCareMakerPopups.showAlert("Postcode is set!", "", null);

                }, function() {
                    MyCareMakerPopups.showAlert("Postcode not found.", 
                        "Please make sure there are no typos", null);
                });

                console.log($scope.postCode);
            } else {
                MyCareMakerPopups.showAlert("Please enter a postcode!", "", null);
            }
        };

        //Sets text size from factory object.
        $scope.textSize = configurationData.getFontSize();

        //Sets the new fonts size. Requires no validation as value is from a slider.
        $scope.fontSizeForm = function (newFontSize) {
            console.log("In form: " + newFontSize);

            configurationData.setFontSize(newFontSize);

            $scope.textSize = configurationData.getFontSize();

            //Sets the fonts size immediately on button press.
            initDocument(null, "setFontSizes", [$scope.textSize]);

            MyCareMakerPopups.showAlert("Font size is set!", "", null);
        };

        //Sets the personal budget information from the config object in the factory.
        $scope.pb = configurationData.getPersonalBudgetInfo();

        //Sets the new budget information. Validation on both renewal data and budget.
        $scope.personalBudgetForm = function (newPb) {

            //Checks personal budget is a parsable number.
            if (isNaN(newPb.personalBudget)) {
                MyCareMakerPopups.showAlert("Budgets is not a number!", "", null);
                return;
            }

            var anDate = newPb.anniversaryDate;
            //Checks date is in the right range.
            if (anDate < 1 || anDate > 31) {
                MyCareMakerPopups.showAlert("Renewal date outside of a month!", "", null);
                return;
            }

            configurationData.setPersonalBudgetInfo(newPb);
            $scope.pb = newPb;

            MyCareMakerPopups.showAlert("Personal budget information is set!", "", null);
        };


        //Gives the correctly checked or unchecked depending on saved choice.
        $scope.styleChoice = {
            checked: (configurationData.getStyleOption() === "style_vanilla" ? true : false)
        };


        /**
         * This function changes the styling of the views and saves the new style for
         * the initDocument to change on every view.
         * 
         * $timeout method was taken from http://codepen.io/rossmartin/pen/iwuvC
         * 
         * @returns {undefined}
         */
        $scope.styleChoiceForm = function () {
            $timeout(function () {
    //            alert($scope.styleChoice.checked);
                var oldStyle = configurationData.getStyleOption();
                if ($scope.styleChoice.checked) {
                    //Light background

                    configurationData.setStyleOption("style_vanilla");
                } else {
                    //Dark background
                    configurationData.setStyleOption("style_green");
                }

                console.log("HERE!!!  " + oldStyle + " " + configurationData.getStyleOption());

                initDocument(null, "setStyling", [configurationData.getStyleOption()]);
                initDocument(null, "removeStyling", [oldStyle]);

            }, 0);
        };

        function onFinish() {
            console.log(sessionStorage.getItem("errorStatus"));
            var status = sessionStorage.getItem("errorStatus");

            if (status === "OK") {

                var location = JSON.parse(sessionStorage.getItem("location"));
                console.log(location.lat + " " + location.lng);
                configurationData.setCoordinates(location);
                $scope.postCode = configurationData.getPostCode();
                $scope.$apply();
                console.log("Coordinates set. (Last)");
                var firstSet = JSON.parse(sessionStorage.getItem("firstSet"));
                configurationData.setFirstSet(firstSet);

                MyCareMakerPopups.showAlert("Postcode is set!", "", null);
            } else {
                MyCareMakerPopups.showAlert("Postcode not found.", "Please make sure there are no typos", null);
            }
        }
    })

    /**
     * @ngdoc Controllers
     * @name app.controllers.things-To-Do-TodayCtrl
     * @description
     * Controller for the Things to do Today page of the app.
     */
    .controller('things-To-Do-TodayCtrl', function ($scope, MyCareMakerCalendar, MyCareMakerPopups, ConfigurationData) {

        var config = ConfigurationData.get();
        initDocument(config);

        //Returns an array for the MyCareMakerAdd directive 
        $scope.inputList = MyCareMakerCalendar.getCalendarInputs();

        $scope.style = config.getStyleOption(); //Should be set from configdata

        $scope.events = []; //debugCalendarArray(); // 

        var isPhone = (ionic.Platform.isIOS() || ionic.Platform.isAndroid() ? true : false);

        if (isPhone) {
            MyCareMakerCalendar.getEvents(function(events){
                $scope.events = events;
            });
                //Assigns $scope.events to the calendar events.
        }

        $scope.deleteEvent = function (event) {
//            alert(JSON.stringify(event));
            MyCareMakerPopups.showConfirm("Are you sure you want to delete this event?", "",
            function() {
                if (isPhone) {
                    MyCareMakerCalendar.delete(event, function(events) {

                        $scope.events = events;

                        MyCareMakerPopups.showAlert("Event deleted!", "", null);
                    });
                }
            }, function() {
                //No other functionality.
            });

        };

        $scope.createEvent = function () {

            var event = MyCareMakerCalendar.constructCalendarEventFromInputs($scope.inputList);

            var validation = MyCareMakerCalendar.validateEvent(event);

            if (validation.error) {
                var errorCodes = MyCareMakerCalendar.getValidationErrorCodes();
                var message = "";
                for (var i=0; i<validation.codes.length; i++) {
                    switch(validation.codes[i]) {
                        case errorCodes[0]:
                            message += "Please enter a title.<br/>";
                            break;
                        case errorCodes[1]:
                            message += "The start date must be before the end date.<br/>";
                            break;
                        case errorCodes[2]:
                            message += "Please enter an end date.<br/>";
                            break;
                        case errorCodes[3]:
                            message += "Please enter a start date.<br/>";
                            break;                        
                    }

                }

                MyCareMakerPopups.showAlert("Cannot create event!", 
                    message, null);

                return;
            }

            if (isPhone) { 
                MyCareMakerCalendar.create(event, "event", function (events) {
                    //Successful creation.
                    $scope.events = events;

                    MyCareMakerPopups.showAlert("Event created!", "", null);

                    $scope.inputList = MyCareMakerCalendar.getCalendarInputs();

                });
            }
        };

        /**
         * Just a simple debug array for checking styling and fontsize when debugging
         * on browser as the calendar api does not work.
         * 
         * @returns {Array}
         */
        function debugCalendarArray() {
            return [
                {"title": "Test1",
                    "startDate": "1",
                    "endDate": "2",
                    "location": "test",
                    "message": {notes: "test"}},
                {"title": "Test2",
                    "dtstart": "1",
                    "dtend": "2",
                    "eventLocation": "test",
                    "allDay": "0"},
                {"title": "Test3",
                    "dtstart": "1",
                    "dtend": "2",
                    "eventLocation": "test",
                    "allDay": "0"}
            ];
        }
    })

    /**
     * @ngdoc Controllers
     * @name app.controllers.budgetCtrl
     * @description
     * Controller for the My Budget page of the app.
     */
    .controller('budgetCtrl', function ($scope, BudgetData, ConfigurationData, MyCareMakerPopups, $ionicHistory) {

        var config = ConfigurationData.get();
        initDocument(config);

        $scope.balance = 0; //Initialises the placeholder to 0.

        if (!config.isBudgetSet()) {
            MyCareMakerPopups.showAlert('Personal Budget not set!',
                    'Please go to the settings page to set your personal budget information.', null);
            $ionicHistory.goBack(); //Sends you back if budget info is not set.
            return;
        }

        $scope.style = config.getStyleOption(); //For styling the ngRepeat.

        //Dynamically generated list input. Means lists can be easily changed from 
        //the controller. The ngModel can be accessed through for example 
        // $scope.inputList[0].ngmodel 
        $scope.inputList = BudgetData.getBudgetInputList();

        $scope.budgets = BudgetData.getBudgetData();

    //            alert(JSON.stringify($scope.budgets));

        $scope.balance = BudgetData.getBalance();

        $scope.submission = function () {

            //Creates row object and assigns the values from the input directive.
            var row = BudgetData.getNewRowFromInputs($scope.inputList);

            var validation = BudgetData.validateRow(row);

            if (validation.NO_DATE) {
                row.date = formatDate(new Date());
                validation.NO_DATE = false;
            }
            if (validation.NO_DEBIT ^ validation.NO_CREDIT && 
                    !(validation.DEBIT_NAN && validation.CREDIT_NAN)) {

                if (validation.NO_DEBIT)
                    row.debit = 0;

                if (validation.NO_CREDIT)
                    row.credit = 0;

                validation.error = false;
            }

    //                alert(validation.error + " " + !validation.NO_DATE)

            if (validation.error && !validation.NO_DATE) {

                var message = "";

                if (validation.DEBIT_NAN)
                    message += "Debit is not a number!<br/>";

                if (validation.CREDIT_NAN)
                    message += "Credit is not a number!<br/>";

                if (validation.NO_DEBIT)
                    message += "No debit entered!<br/>";

                if (validation.NO_CREDIT)
                    message += "No credit entered!<br/>";

                MyCareMakerPopups.showAlert("Not added!", message, null);

                return;
            }

            BudgetData.addRow(row);

            $scope.balance = BudgetData.getBalance();

            $scope.budgets = BudgetData.getBudgetData();

            $scope.inputList = BudgetData.getBudgetInputList();

            MyCareMakerPopups.showAlert("Expense added!", "", null);

        };

        $scope.remove = function (index) {
            MyCareMakerPopups.showConfirm('Delete Expense?', '',
                    function () {
                        BudgetData.removeRow(index);
                        $scope.balance = BudgetData.getBalance();
                    }, null);
        };

    })

    /**
     * @ngdoc Controllers
     * @name app.controllers.contactsCtrl
     * @description
     * Contacts controllers linking the contacts templates and etc.. links to 
     * two pages friends and family and urgent care
     */
    .controller('contactsCtrl', function ($scope, $timeout, $location, $ionicHistory, $cordovaContacts, $ionicPopup, MyCareMakerPopups, ConfigurationData, Contacts) {

        var config = ConfigurationData.get();
        initDocument(config);
        $scope.style = config.getStyleOption();
        $scope.fontSize = config.getFontSize();

        //As both urgent care and f & f will have the same functionality but with
        //only differing contact objects a contacts controller will be used.
        switch (GET()) {
            case "faf":
                Contacts.initialise("fafContacts");
                $scope.title = "Friends And Family";
                break;
            case "uc":
                Contacts.initialise("ucContacts");
                $scope.title = "Urgent Care";
                break;
            default:
                $ionicHistory.goBack();
                alert("Unknown get request.");
                break;
        }

        $scope.appContacts = [];
        $scope.appContacts = Contacts.getAppContacts(); //Gets the contacts stored.

        if (ionic.Platform.isAndroid() || ionic.Platform.isIOS())
            getContacts(); //Gets the contacts from the phone directory.
        else 
            fakeContacts();

        var dirPopup; //Directory contact list popup.

        //Input list for the manually added contact.
        $scope.inputList = [
            {
                label: "Name:",
                type: "text"
            },
            {
                label: "Phone number:",
                type: "tel"
            }
        ];

        $scope.callContact = function(tel) {

            window.location.href="tel:"+tel;
    //                $timeout(function() {
    //                    $location.absUrl("tel:" + tel);
    //                    alert("linking");
    //                },10); 
    //                alert("fin");
        };

        //Function when  contact is added from the directory.
        $scope.addDirectory = function(dirContact) {

            var contact = {
                name: dirContact.displayName,
                phoneNumber: dirContact.phoneNumbers[0].value,
                photo: (dirContact.photos === null ? null : dirContact.photos[0].value)
            };

            if (Contacts.saveContact(contact)) {

                $scope.appContacts = Contacts.getAppContacts();

                MyCareMakerPopups.showAlert(contact.name + " added!", "", null);
            } else {
                dirPopup.close();
                MyCareMakerPopups.showAlert("Too Many Contacts!", 
                "You can only have a maximum of six contacts", null);
            }

        };

        //Add function for the user manually add contacts button.
        $scope.addManual = function() {
            //Validates name
            if ($scope.inputList[0].ngmodel === "" || $scope.inputList[0].ngmodel === null 
                    || $scope.inputList[0].ngmodel === undefined) {
                MyCareMakerPopups.showAlert("Please Enter a Name.", 
                    "", null);
                return;
            }

            //Validates phone number. Regex http://stackoverflow.com/questions/5286046/javascript-phone-number-validation
            var validNumber = /^(\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)(44)\)?[\s-]?)?\(?0?(?:\)[\s-]?)?([1-9]\d{1,4}\)?[\d\s-]+)((?:x|ext\.?|\#)\d{3,4})?$/.test($scope.inputList[1].ngmodel);
            if (!validNumber) {

                MyCareMakerPopups.showAlert("Invalid Phone Number.", 
                "", null);
                return;
            } 

            var contact = {
                name: $scope.inputList[0].ngmodel,
                phoneNumber: $scope.inputList[1].ngmodel,
                photo: null
            };

            if (Contacts.saveContact(contact)) {
                $scope.inputList[0].ngmodel = null;
                $scope.inputList[1].ngmodel = null;

                $scope.appContacts = Contacts.getAppContacts();
                MyCareMakerPopups.showAlert(contact.name + " added!", "", null);
            } else {
                MyCareMakerPopups.showAlert("Too Many Contacts!", 
                "You can only have a maximum of six contacts", null);
            }      

        };

        //Gets the contacts from the devices phonebook. Doesn't work in browser.
        function getContacts() {
            $scope.phoneContacts = [];

            $cordovaContacts.find({}).then(function(contacts) {
                //On success callback function.
                console.log(JSON.stringify(contacts));

                for (var i = 0; i < contacts.length; i++) {
                    var contact = contacts[i];

                    //window.alert(JSON.stringify(contact.photos));
                    if (contacts[i].phoneNumbers !== null) {

                        if (contact.displayName === null) {
                            if (contact.name.givenName !== null)
                                contact.displayName = contact.name.givenName;
                            else 
                                contact.displayName = "Unknown Name";
                        }

                        $scope.phoneContacts.push(contact);
                    }
                }

                //Sort function alphabetically.
                //http://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
                $scope.phoneContacts.sort(function(a, b){
                    if(a.displayName < b.displayName) return -1;
                    if(a.displayName > b.displayName) return 1;
                    return 0;
                });
            }, function(Error) {
                //On failure callback function
                MyCareMakerPopups.showAlert("Error" ,
                "There was an problem loading your contacts. ", null);
            });

        };

        //Fake contacts for debugging and styling when testing in browser.
        function fakeContacts() {
            $scope.phoneContacts = [
            {displayName: "AEd", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "Ed1", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "Ed2", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "Ed3", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "AEd", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "Ed1", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "Ed2", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "BEd3", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "Ed", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "Ed1", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "BEd2", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "Ed3", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "Ed", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "CEd1", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "Ed2", phoneNumbers: [{value: "345443234354"}], photos: null}
            ,{displayName: "Ed3", phoneNumbers: [{value: "345443234354"}], photos: null}];

            //Sort function, sorts the list alphabetically 
            //http://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
            $scope.phoneContacts.sort(function(a, b){
                if(a.displayName < b.displayName) return -1;
                if(a.displayName > b.displayName) return 1;
                return 0;
            });
        }

        //Directory popup displays the list of contacts from the phone's directory.
        $scope.showDirectoryPopup = function() {

            dirPopup = $ionicPopup.show({

                templateUrl: 'templates/add-From-Directory.html',
                scope: $scope,
                buttons: [
                    {   
                        text: 'Done',
                        type: 'button-positive'
                    }
                ]
            });

        };

        $scope.deleteContact = function (index) {

            MyCareMakerPopups.showConfirm("Are you sure you want to delete this contact?", ""
            ,function(){
                Contacts.deleteContact(index);

                $scope.appContacts = Contacts.getAppContacts();
            },
            function(){

            });
        };

        //Not being used but can be used full for debugging.
        $scope.deleteAllContacts = function () {
            Contacts.deleteAllContacts();

            $scope.appContacts = Contacts.getAppContacts();
        };
    })

    /**
     * @ngdoc Controllers
     * @name app.controllers.general-Planning-My-CareCtrl
     * @description
     * Controllers under planning my care. There is one general controller for all
     * pages that contain no functionality but links to other views.
     */      
    .controller('general-Planning-My-CareCtrl', function ($scope, ConfigurationData) {

        var config = ConfigurationData.get();
        initDocument(config);
        
        $scope.style = config.getStyleOption(); 
        //So sorry about this hacky crap. Very last minute changes.
        switch($scope.style) {
            case 'style_vanilla':
                $scope.style = 'white';
                break;
            case 'style_green':
                $scope.style = '#009688';
                break;
        }
        
    })

    .controller('my-AppointmentsCtrl', function ($scope, MyCareMakerCalendar, MyCareMakerPopups, ConfigurationData) {


        var config = ConfigurationData.get();
        initDocument(config);

        //Returns an array for the MyCareMakerAdd directive 
        $scope.inputList = MyCareMakerCalendar.getCalendarInputs();

        $scope.style = config.getStyleOption(); //Should be set from configdata

        $scope.appointments = []; //debugCalendarArray(); // 

        var isPhone = (ionic.Platform.isIOS() || ionic.Platform.isAndroid() ? true : false);

        if (isPhone) {
            MyCareMakerCalendar.getEvents(function(appointments){
                $scope.appointments = appointments;
            }, "appointment");
                //Assigns $scope.appointments to the calendar appointments.
        }

        $scope.deleteAppointment = function (appointment) {

            MyCareMakerPopups.showConfirm("Are you sure you want to delete this appointment?", "",
            function() {
                if (isPhone) {
                    MyCareMakerCalendar.delete(appointment, function(appointments) {
                        $scope.appointments = appointments;

                        MyCareMakerPopups.showAlert("Appointment deleted!", "", null);
                    }, "appointment");
                }
            }, function() {
                //No other functionality.
            });

        };

        $scope.createAppointment = function () {

            var appointment = MyCareMakerCalendar.constructCalendarEventFromInputs($scope.inputList);

            var validation = MyCareMakerCalendar.validateEvent(appointment);

            if (validation.error) {
                var errorCodes = MyCareMakerCalendar.getValidationErrorCodes();
                var message = "";
                for (var i=0; i<validation.codes.length; i++) {
                    switch(validation.codes[i]) {
                        case errorCodes[0]:
                            message += "Please enter a title.<br/>";
                            break;
                        case errorCodes[1]:
                            message += "The start date must be before the end date.<br/>";
                            break;
                        case errorCodes[2]:
                            message += "Please enter an end date.<br/>";
                            break;
                        case errorCodes[3]:
                            message += "Please enter a start date.<br/>";
                            break;                        
                    }

                }

                MyCareMakerPopups.showAlert("Cannot create appointment!", 
                    message, null);

                return;
            }

            if (isPhone) { 
                MyCareMakerCalendar.create(appointment, "appointment", function (appointments) {
                    //Successful creation.
                    $scope.inputList = MyCareMakerCalendar.getCalendarInputs();

                    $scope.appointments = appointments;

                    MyCareMakerPopups.showAlert("Appointment created!", "", null);
                });
            }
        };

    })

    .controller('my-Care-PlanCtrl', function ($scope, CarePlanData, ConfigurationData) {

        var config = ConfigurationData.get();
        initDocument(config);
        $scope.style = config.getStyleOption();

        CarePlanData.initialise().then(function(careplanData) {

            $scope.table = CarePlanData.getCarePlan();
            $scope.titles = CarePlanData.getColumnTitles();
            for (var i = 1; i < 13; i++) {

                for (var j = 1; j < 5; j++) {

                    $scope.$watch('table[' + i + '][' + j + ']', function () {
                        //console.log("change");
                        $("#footer").addClass("bar-assertive");
                        $("#footer").removeClass("bar-balanced");
                    }, true);
                }

            }                
        }, function() {
            alert("failed.");
        }); //Runs the onFinish function last.

        $scope.save = function () {
            console.log($scope.table);
            $("#footer").addClass("bar-balanced");
            $("#footer").removeClass("bar-assertive");
            CarePlanData.storeAnswers($scope.table);
        };
    })
    /**
     * @ngdoc Controllers
     * @name app.controllers.medicationsCtrl
     * @description
     * Controller for the medications page of the app.
     */
    .controller('medicationsCtrl', function ($scope, MedicationService, MyCareMakerPopups, ConfigurationData) {
        var config = ConfigurationData.get();
        initDocument(config);
        $scope.medicationList=MedicationService.getMedications();

        $scope.timeExists = timeExists();

        $scope.style = config.getStyleOption();
        $scope.fontSize = config.getFontSize();
        $scope.inputList = MedicationService.getInputsList();
        /**
         * The function in charge of storing the medication
         * It uses as input for the medication's fields, the values inputed
         * in the medications page. 
         */
        $scope.saveMedication = function () {
            var name = this.inputList[0].ngmodel; //Get the inputs from the .html medications page.
            var description = this.inputList[1].ngmodel;
            var time = this.inputList[2].ngmodel;
            if (typeof name === "undefined" || typeof description === "undefined") {
                return;
            } else {
                var med=MedicationService.MedicationData(name,description,time,null);
                MedicationService.saveMedication(name,description,time);

                $scope.inputList = MedicationService.getInputsList();

                $scope.medicationList=MedicationService.getMedications(); // Update the medications list.

                $scope.timeExists = timeExists();
            }

        };
        /**
         * The function used to delete one medication
         * 
         * @param {String} The name of the meicatio to delete.
         */
        $scope.deleteMedication=function(name){

            MyCareMakerPopups.showConfirm('Delete Medication?', '',
                function () {
                    MedicationService.deleteMedication(name);

                    $scope.inputList = MedicationService.getInputsList();

                    $scope.medicationList=MedicationService.getMedications();
                    $scope.timeExists = timeExists();
                }, null);

        };

        function timeExists() {
            var exists = [false, false, false, false];
            for (var i=0; i<$scope.medicationList.length; i++) {
                switch ($scope.medicationList[i].momentOfDay) {
                    case 'morning':
                        exists[0] = true;
                        break;
                    case 'afternoon':

                        exists[1] = true;
                        break;

                    case 'evening':
                        exists[2] = true;
                        break;

                    case 'night':
                        exists[3] = true;
                        break;
                }

            }

            return exists;

        }

    })


    //Places controller controllers all template views that shows GooglePlaces data.
    .controller('placesCtrl', function ($scope, $ionicHistory, ConfigurationData, MyCareMakerPopups, GooglePlaces) {

        var config = ConfigurationData.get();
        initDocument(config);
        //$cordovaNetwork doesn't work with browser only works usign 'ionic run ...'
    //    var connection = ($cordovaNetwork.getNetwork() !== "none");
    //    console.log(connection + " " + $cordovaNetwork.getNetwork() );
        if (!navigator.onLine) {
            MyCareMakerPopups.showAlert('You are not online!',
                    'Please make sure you are connected to the internet', null);
            $ionicHistory.goBack();
            return;
        }

        if (config.isFirstSet()) {
            MyCareMakerPopups.showAlert('Set a Postcode!',
                    'You have to set your postcode before using the places search.', null);
            $ionicHistory.goBack();
            return;
        }

        var configurationData = ConfigurationData.get();
        var platform = getPlatformPath();

        console.log(platform);

        $scope.show = "Loading, please wait...";
        $scope.platform = platform;
        $scope.style = config.getStyleOption();

        var searchOb = null;

        //Add new search options/pages here. New case == new page.
        switch (GET()) {
            case "carers":
                $scope.title = "Carers";

                searchOb = {
                    textSearch: 1,
                    searchArray: ['carers'],
                    radius: 5000
                };

                break;
            case "cleaning-services":
                $scope.title = "Cleaning Services";

                searchOb = {
                    textSearch: 1,
                    searchArray: ['cleaning services'],
                    radius: 5000
                };

                break;
            case "gardening":
                $scope.title = "Gardening";

                searchOb = {
                    textSearch: 1,
                    searchArray: ['gardening services Care'],
                    radius: 5000
                };

                break;
            case "pharmacies":
                $scope.title = "Pharmacies";

                searchOb = {
                    textSearch: 0,
                    searchArray: ['pharmacy'],
                    radius: 2000
                };

                break;
            case "taxis":
                $scope.title = "Taxis";

                searchOb = {
                    textSearch: 1,
                    searchArray: ['taxi companies'],
                    radius: 2000
                };

                break;           
            case "train-stations":
                $scope.title = "Train Stations";

                searchOb = {
                    textSearch: 1,
                    searchArray: ['train stations'],
                    radius: 2000
                };

                break;                
            case "bus-stations":
                $scope.title = "Bus Stops";

                searchOb = {
                    textSearch: 0,
                    searchArray: ['bus_station'],
                    radius: 1000
                };

                break;
            case "restaurants":
                $scope.title = "Restaurants";

                searchOb = {
                    textSearch: 1,
                    searchArray: ['restaurants'],
                    radius: 1000
                };

                break;
            case "meals-on-wheels":
                $scope.title = "Meals on Wheels";

                searchOb = {
                    textSearch: 1,
                    searchArray: ['meals on wheels'],
                    radius: 3000
                };

                break;
            case "deliveries":
                $scope.title = "Deliveries";

                searchOb = {
                    textSearch: 1,
                    searchArray: ['delivery take aways'],
                    radius: 2000
                };

                break;
            case "dinner-clubs":
                $scope.title = "Dinner Clubs";

                searchOb = {
                    textSearch: 1,
                    searchArray: ['elderly persons dinner club'],
                    radius: 2000
                };

                break;
            default:
                MyCareMakerPopups.showAlert('Sorry!',
                        'This services search button is not yet supported :(', null);
                $ionicHistory.goBack();
                break;
        }

        //Will executes the script if searchOb has been set.
        if (searchOb !== null) {
            //Executes the GooglePlaces api waits for data to be returned.
            GooglePlaces.executeGooleScript(configurationData.getKey(), searchOb, 15)
            .then(function(places) {

                $scope.show = "";

                for (var i = 0; i < places.length; i++) {
                    console.log(places[i].rating);
                    if (places[i].rating !== undefined) {

                        var rating = places[i].rating;
                        rating *= 10;
                        var round = round5(rating) - 5;
    //                console.log(round);
                    }

                    console.log(places[i].rating);
                }
                $scope.places = places;

                initDocument(null, "setFontSizes", [configurationData.getStyleOption()]);

                console.log("Data successfully returned. (Should be final log in sequence)");

            }, function() {
                $scope.show = "Please return to the previous page.";

                MyCareMakerPopups.showAlert("No Results!", "Unfortunately, there" +
                    " are no matches for " + $scope.title + " near you.");

            }, function(isWaiting) {
    //                    alert(isWaiting);
                console.log(isWaiting);
            });
        }

        $scope.option = function(index) {

            var buttons = [
                { text: 'Back' },
                {
                    text: '<b>Open in Maps</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        var location = $scope.places[index].address;

                        console.log("in " + location + " '" + $scope.places[index].location + "'");

                        if (location === "United Kingdom")
                            location = $scope.places[index].location;

                        if (ionic.Platform.isIOS()) {


                            window.open('maps://apple.com/?daddr="' + location, '_system');



                        } else {

                            window.open('http://maps.google.com/maps?q=' + location, '_system');

                        }

                    }
                },

                {
                    text: '<b>Call</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        window.location.href = "tel:" + $scope.places[index].phoneNumber; //Number
                    }
                }
              ];

            MyCareMakerPopups.showChoice("What do you want to do?", "", buttons);


        };

        function round5(x) {
            return Math.ceil(x / 5) * 5;
        }

    })
    //Test controller for debugging and testing services objects.
    .controller('testCtrl', function ($scope, $q, $cordovaLocalNotification, MyCareMakerNotifications, ConfigurationData, MyCareMakerPopups) {
        $scope.remove = function(index) {
            MyCareMakerNotifications.removeNotification(index, function(){
                $scope.isScheduled();
            });
        };

        $scope.add = function() {
             var alarmTime = new Date();
             alarmTime.setMinutes(alarmTime.getMinutes() + 1);
             var idReturn = null;
             var idTwo = 0;
             MyCareMakerNotifications.addNotification("Title", "Message", alarmTime, function(id) {
                idReturn = id;
                alert(idReturn);
             });


        };
        $scope.ids = [0];
        $scope.isScheduled = function() {
            $cordovaLocalNotification.getAllIds().then(function(ids){
                $scope.ids = ids;
                alert(JSON.stringify(ids));
            });

            $cordovaLocalNotification.isScheduled("1234").then(function(isScheduled) {
                alert("Notification 1234 Scheduled: " + isScheduled);
            });
        };



        $scope.promise = function() {
            asyncWait().then(function(greeting) {
                alert('Success: ' + greeting);
            }, function(reason) {
                alert('Failed: ' + reason);
            }, function(update) {
                console.log('Got notification: ' + update);
            });

            setTimeout(function() {
                sessionStorage.setItem("finished", JSON.stringify(true));
            }, 5000);
        };

        function asyncWait() {
            var deferred = $q.defer();

            sessionStorage.setItem("finished", JSON.stringify(false));
            waitForGooglePlaces(new Date(), 10);

            return deferred.promise;


            function waitForGooglePlaces(time, timeout) {

                if (time < new Date(time.getSeconds() + timeout)) {

                    deferred.reject('FAILED');
                }

                setTimeout(function() {
                    deferred.notify(new Date().getSeconds() - time.getSeconds());

                    var finished = JSON.parse(sessionStorage.getItem("finished"));

                    if (!finished) {

                        waitForGooglePlaces(time, timeout); 

                    } else {

                        deferred.resolve('FINISHED');
                    }
                }, 200);
            }

          }

          function okToGreet(name) {
              return name === "ed";
          }

    });
