angular.module('app.services', [])


    /**
    * @ngdoc Factories
    * @name app.services.MyCareMakerCalendar
    * @description
    * This is the MyCareMakerCalendar it provides a simplified wrapper class to the
    * ngCordova $cordovaCalendar.
    * @param {Object} MyCareMakerNotifications Factory Object
    */
    .factory('MyCareMakerCalendar', ['$cordovaCalendar', 'MyCareMakerNotifications', function($cordovaCalendar, MyCareMakerNotifications){

        /**
         * Validation array of the error codes that an event may have.
         * @type Array
         * @memberOf MyCareMakerCalendar
         */
        var validationErrorCodes = [
            "TITLE_EMPTY",
            "END_DATE_BEFORE_START_DATE",
            "NO_END_DATE",
            "NO_START_DATE"
        ];
        /**
         * Inputs list array. Create the necessary input fields and is cloned by
         * a method in the controller.
         * 
         * @type Array
         * @memberOf MyCareMakerCalendar
         */
        var inputsList = [
            {
                label: "Title:",
                type: "text"
            },
            {
                label: "Date From:",
                type: "datetime-local"
            },
            {
                label: "Date To:",
                type: "datetime-local"
            },
            {
                label: "Location:",
                type: "text"
            },
            {
                label: "Notes:",
                type: "text"
            },
            {
                label: "Reminders:",
                type: "select",

                options: [{label: "At time of event", value: 0},{label: "15 minutes before", value: 15}
                    ,{label: "30 minutes before", value: 30},{label: "45 minutes before", value: 45}
                    ,{label: "60 minutes before", value: 60, selected: true}]
            }
        ];

        return {
            /**
             * Is a function that returns the necessary calendar inputs in order
             * to create an event.
             * 
             * @returns {Object} This returns the calendar inputs to be put into
             * mycaremaker-add AngularJS tags.
             * @memberOf MyCareMakerCalendar
             */

            getCalendarInputs: function() {   
                //Creates a clone of the inputsList object.
                return JSON.parse(JSON.stringify(inputsList));
            },
            /**
             *
             * @param inputArray is an array containing the input elements required
             * to create an event(e.g. title, startDate,
             * endDate, location, notes, reminder).
             * The elements in the array are then assigned to each key of the event variable.
             *
             * @returns {{event}}
             * @memberOf MyCareMakerCalendar
             */
            constructCalendarEventFromInputs: function(inputArray) {
                var event = {};

                event.title = inputArray[0].ngmodel;
                event.startDate = inputArray[1].ngmodel;
                event.endDate = inputArray[2].ngmodel;
                event.location = inputArray[3].ngmodel;
                event.notes = inputArray[4].ngmodel;
                event.reminder = inputArray[5].ngmodel;

                return event;
            },
            /**
             * This method is used to return validation errors in order to
             * enhance debugging.
             * @returns {Array}
             * @memberOf MyCaremakerCalendar
             */
            getValidationErrorCodes: function() {
                return validationErrorCodes;
            },
            /**
             * This method checks the fields of the object to ensure they
             * are not empty or undefined. The method ensures the start time
             * is not later than the end date. The method does not validate location
             * and notes as they can be left empty.
             * @param event The event variable holds the following values title, startDate,
             * endDate, location, notes, reminder.
             * @returns {{error: boolean, codes: boolean[]}}
             * @memberOf MyCareMakerCalendar
             */

            validateEvent: function(event) {

                var validationErrors = {
                    error: false,
                    codes: [false, false]
                };

                if (event.title === undefined || event.title === "") { 
                    validationErrors.codes[0] = validationErrorCodes[0];
                    validationErrors.error = true;
                }
                if (event.endDate < event.startDate) { 
                    validationErrors.codes[1] = validationErrorCodes[1]; 
                    validationErrors.error = true;
                }
                if (event.endDate === undefined) {
                    validationErrors.codes[2] = validationErrorCodes[2]; 
                    validationErrors.error = true;
                }
                if (event.startDate === undefined) {
                    validationErrors.codes[3] = validationErrorCodes[3]; 
                    validationErrors.error = true;
                }


                return validationErrors;
            },
            /**
             * This method utilises the cordovaCalendar method deleteEvent to delete
             * the event selected. It does so by deleting the event based on its
             * title, startDate and endDate. The method also uses the removeNotification
             * function to ensure event notifications are deleted as well.
             * The method returns an alert if the event fails to delete.
             * @param event This parameter and its values are used to specify the event to be deleted.
             * @param callback
             * @param eventType
             * @memberOf MyCareMakerCalendar
             */
            delete: function (event, callback, eventType) {

                event.newTitle = event.title;
                event.startDate = event.startDate.replace(" ", "T");
                event.endDate = event.endDate.replace(" ", "T");

                $cordovaCalendar.deleteEvent(event)
                .then(function (result) {
                    //Success
    //                            alert("Event deleted.");
                    var notificationId = event.json.mcmId;

                    MyCareMakerNotifications.removeNotification(notificationId);

                    getEvents(callback, eventType);

                }, function (err) {
                    //Error
                    alert("failed to delete");
                });
            },
            /**
             *  This method passes all the values (startDate, endDate, title,
             *  location, notes) into a JSON object. In addition it creates reminders
             *  and sets appropriate Notifications using the title, event type, and location
             *  according to the time the reminder was set.
             * @param event
             * @param eventType
             * @param callback
             * @memberOf MyCareMakerCalendar
             */
            create: function (event, eventType, callback) {

                var notes = event.notes;
                var reminderDate = event.startDate.setMinutes(
                    event.startDate.getMinutes()-parseInt(event.reminder));

                console.log(JSON.stringify(event));

                console.log(event.startDate + " " + event.endDate);

                //Create JavaScript object.
                var jsonOb = {
                    notes: notes,
                    type: eventType,
                    mcmId: MyCareMakerNotifications.getCurrentId()
                };

                event.notes = JSON.stringify(jsonOb); //Saves JSON data in the event.

                event.startDate = dateConstruct(event.startDate);
                event.endDate = dateConstruct(event.endDate);

                $cordovaCalendar.createEvent(event)
                .then(function (result) {

    //                            alert("Successfully created.");
    //                            alert(reminderDate);

                    var title = "Calendar Reminder: " + event.title;
                    var message = "You have an " + eventType + " in " + event.reminder 
                        + " minutes at " + event.location;

                    if (parseInt(event.reminder) === 0) {
                        message = "You have an " + eventType + " now at " + event.location;
                    }

                    MyCareMakerNotifications.addNotification(
                        title, message, reminderDate, function(){});

                    getEvents(callback, eventType);

                }, function (err) {
                    console.error("There was an error: " + err);
                    alert("failure to create.");
                });


            },

            getEvents: function(callback, eventType) {
                getEvents(callback, eventType);
            }       

        };
        /**
         * This calendar plugin does not include a method to get events.
         * The goal of this method is to list the events registered for the
         * current day. To achieve such functionality the findEvent method is utilised.
         * The startDate was set as 00:00:00 which corresponds to the fist hour, minute,
         * second of the day and then the endDate was set to 23:59:59 which corresponds to
         * the last hour, minute and second of the day respectively. The rest of the field
         * values are left blank to ensure all the events within the timeframe are included.
         * The events are then passed in an array.
         * The method also checks if the event type is valid.
         *
         * @param callback
         * @param eventType
         * @memberOf MyCareMakerCalendar
         */
        function getEvents(callback, eventType) {
            var refDate = new Date();

            var startDate = new Date(
                    refDate.getFullYear(),
                    refDate.getMonth(),
                    refDate.getDate(),
                    0, 0, 0, 0, 0);
            startDate.setMilliseconds(0);
            startDate.setSeconds(0);
            startDate.setMinutes(0);
            startDate.setHours(0);

            var endDate = new Date(startDate);
            endDate.setDate(startDate.getDate());
            endDate.setMilliseconds(59);
            endDate.setSeconds(59);
            endDate.setMinutes(59);
            endDate.setHours(23);

            $cordovaCalendar.findEvent({
                title: '',
                location: '',
                notes: '',
                startDate: startDate,
                endDate: endDate
            }).then(function (result) {
                // success
    //            alert(JSON.stringify(result));
                var resultsArray = [];
                var count = 0;
                for (var i = 0; i < result.length; i++) {
    //                        alert(JSON.stringify(result[i]));

                    //Incase there are non-MyCareMaker events on the calendar
                    //Not in json form catches the error 
                    try {
                        result[i].json = JSON.parse(result[i].message); 
                    } catch(e) {
                        result[i].json = {
                            notes: result[i].message,
                            type: "event",
                            mcmId: 0
                        };
                    }

                    if (eventType !== undefined && result[i].json.type !== eventType)
                        continue;
    //                alert(new Date(result[i].startDate.replace(" ", "T")));
                    result[i].timeSt = formatTime(new Date(result[i].startDate.replace(" ", "T")));
                    result[i].timeEnd = formatTime(new Date(result[i].endDate.replace(" ", "T")));


                    resultsArray[count] = result[i];
                    count++;
                }

                console.log("success " + JSON.stringify(result));

                callback(resultsArray);

            }, function (err) {
                // error
                alert("error " + err);
            });
        }
    }])

    /**
     * @ngdoc Factories
     * @name app.services.MyCareMakerNotifications
     * @description
     * This is the MyCareMakerNotifications it provides a simplified wrapper class to the
     * ngCordova $cordovaLocalNotification. As the $cordovaLocalNotfication requires a
     * ID number the MyCareMakerNotifications object automatically increments it every
     * time one it created. This allows the various controllers and objects using notifications
     * to never conflict with one another.
     * @param {Object} $cordovaLocalNotification ngCordova object for local notifications.
     */               
    .factory('MyCareMakerNotifications', ['$cordovaLocalNotification', function($cordovaLocalNotification){

        /**
         * This is the object member that holds the current notifcation ID number.
         * 
         * @memberOf MyCareMakerNotifications
         * @type Integer
         */
        var currentId = null;    

        return {
            /**
             * This method creates a local notification and has a callback function
             * that returns the id used. The id is incremented for you so there will
             * be no id clashes between notfications set.
             * 
             * @param {string} title Notifcation title
             * @param {string} message Notification message
             * @param {date} date Notifcation time and date
             * @param {function} callback Has an input parameter of the id so the id can be returned.
             * @returns {undefined}
             * @memberOf MyCareMakerNotifications
             */
            addNotification: function(title, message, date, callback) {
                this.getCurrentId();

    //            alert(currentId);

                $cordovaLocalNotification.add({
                    id: JSON.stringify(currentId),
                    date: date,
                    message: message,
                    title: title,
                    autoCancel: true,
                    sound: null
                }).then(function () {
    //                alert("The notification has been set");
                    if (callback !== null)
                        callback(currentId);
                    currentId++; //Increment id
                    storeCurrentId();
                });

            },

            /**
             * This method deletes local notifications via the id.
             * 
             * 
             * @param {type} id This is the ID of the notification you want to delete.
             * @param {type} callback Allows you to execute code on finish.
             * @returns {undefined}
             * @memberOf MyCareMakerNotifications
             */
            removeNotification: function(id, callback) {
                id = parseInt(id);
                $cordovaLocalNotification.cancel(id)
                .then(function(){
                    callback();
    //                alert(id + " Id cleared.");
                });
            },
            /**
             * @method
             * Gets the current notification ID from localStorage and assigns it to the
             * currentId member.
             * @returns {Integer} The currentId member value.
             * @memberOf MyCareMakerNotifications
             */
            getCurrentId: function() {
                var id = localStorage.getItem("currentId");
                if (id !== null) {
                    currentId = parseInt(id);
                } else {
                    currentId = 1;
                    storeCurrentId();
                }
                return currentId;
            }


        };

        /**
         * Private function.<br>Stores the ids limits the number of notifications to 10000 at one time.
         * The oldest notifications will be deleted first when automatically reset to 1.
         * 
         * @returns {undefined} 
         * @memberOf MyCareMakerNotifications
         */
        function storeCurrentId() {
            if (currentId > 10000) 
                currentId = 1;

            localStorage.setItem("currentId", JSON.stringify(currentId));

        }
    }])
    /**
    * @ngdoc Factories
    * @name app.services.MyCareMakerPopups
    * @description
    * This is the MyCareMakerPopups factory it provides a simplified wrapper class to the
    * Ionic object $ionicPopup. Again wrapped to simiplify the process of use. 
    * @param {Object} $ionicPopup Ionic popup object.
    */
    .factory('MyCareMakerPopups', ['$ionicPopup', function($ionicPopup){
        return {
            /**
             * Shows a simple Ionic popup alert.
             * 
             * @param {string} title Popup title
             * @param {string} message Popup message
             * @param {function} onFinish The callback function when it finishes.
             * @returns {undefined}
             * @memberOf MyCareMakerPopups
             */
            showAlert: function(title, message, onFinish) {

                $ionicPopup.alert({
                    title: title,
                    template: message
                }).then(function () {
                    if (onFinish !== null && onFinish !== undefined )
                        onFinish();
                });
            },
            /**
             * Shows the user a confirm dialog.
             * 
             * @param {string} title The confirm title.
             * @param {string} message The confirm message.
             * @param {function} answerYes Callback function on +ve answer
             * @param {function} answerNo Callback function on -ve answer
             * @returns {undefined}
             * @memberOf MyCareMakerPopups
             */
            showConfirm: function(title, message, answerYes, answerNo) {

                $ionicPopup.confirm({
                    title: title,
                    template: message
                })
                .then(function (res) {
                    if (res) {
                        if (answerYes !== null && answerYes !== undefined )
                            answerYes();
                    } else {
                        if (answerNo !== null && answerNo !== undefined )
                            answerNo();
                    }
                });
            },
            /**
             * Shows a multiple number of option buttons. 
             * 
             * @param {string} title The choice title
             * @param {string} message The choice message
             * @param {Array} buttons List of Ionic button objects. Members include
             * text and onTap (a function) that allows functionality on selection.
             * @returns {undefined}
             * @memberOf MyCareMakerPopups
             */
            showChoice: function(title, message, buttons) {
                $ionicPopup.show({
                    template: message,
                    title: title,
                    buttons: buttons
                });
            }

        };
    }])
    /**
     * @ngdoc Factories
     * @name app.services.CarePlanData
     * @description
     * This factory object looks to a file 'careplan.json' and creates a 2D array that
     * contains the JSON data as well as user stored data. 
     * @param {Object} $http The AngularJS http request Object.
     * @param {Promise} $q The AngularJS promise.
     */
    .factory('CarePlanData', ['$http', '$q', function($http, $q){

        /**
         * A list of the table titles.
         * @type Array
         * @memberOf CarePlanData
         */
        var titles = null;

        /**
         * The is the full table of titles and user answers.
         * 
         * @type Array2D
         * @memberOf CarePlanData
         */
        var careplan = null;

        /**
         * Object that controls the user data input and output.
         * 
         * @type Object
         * @memberOf CarePlanData
         */
        var userData = {
            setAnswers: function(answers) {
                this.answers = answers;
                localStorage.setItem("carePlanUserData", JSON.stringify(this.answers));
            },
            getAnswers: function() {

                if (this.answers !== null) {

                    console.log(this.answers);

                    return this.answers;
                } else {
                    var data = [];
                    for (var i=0; i<careplan.rowTitles.length; i++) {

                        var row = [];
                        for (var j=0; j<careplan.columnTitles.length-1; j++) {
                            row[j] = "";
                        }
                        data[i] = row;
                    }
                    console.log(careplan.rowTitles.length + " " );
                    this.setAnswers(data);

                    return this.answers;
                }

            },
            answers: JSON.parse(localStorage.getItem("carePlanUserData"))
        };

        return {
            /**
             * Initialises the CarePlan and allows code run once the $http object has
             * returned.
             * 
             * @returns {Promise} Standard AngularJS promise by using .then()
             * @memberOf CarePlanData
             */
            initialise: function() {
                return $http.get('careplan.json').then(function(response) {

                    careplan = response.data;
                    titles = careplan.columnTitles;
                    var answerData = userData.getAnswers();

                    var table = [];
                    table[0] = careplan.columnTitles;
                    for (var i=1; i<careplan.rowTitles.length; i++) {

                        var row = [];
                        row[0] = careplan.rowTitles[i];
                        for (var j=1; j<careplan.columnTitles.length; j++) {
                            row[j] = answerData[i-1][j-1];//Should be j-1? //"testing123"; //

                        }

                        table[i] = row;

                    }

                    careplan = table;

                    return careplan; //Returns data via a promise.

                }, function(response) {
                    return $q.reject(response.data);
                });

            },
            /**
             * Returns careplan member.
             * 
             * @returns {Array2D} Encapsulates the careplan member.
             * @memberOf CarePlanData
             */
            getCarePlan: function() {

                return careplan;     
            },
            /**
             * Encapsulates.
             * 
             * @returns {Array} Array of strings of the careplan column titles.
             * @memberOf CarePlanData
             */
            getColumnTitles: function() {

                return titles;     
            },
            /**
             * Strips down the Careplans table and hands the data to the userData
             * member.
             * 
             * @param {Array2D} Full careplan table.
             * @returns {undefined}
             * @memberOf CarePlanData
             */
            storeAnswers: function(table) {
                var newTable = [];
                for (var i=0; i<table.length-1; i++) {

                    var row = [];
                    for(var j=0; j<table[0].length-1; j++) {

                        row[j] = table[i+1][j+1];

                    }
    //                console.log(i + " " + row);
                    newTable[i] = row;
                }
                userData.setAnswers(newTable);
            }

        };         
    }])
    /**
     * @ngdoc Factories
     * @name app.services.BudgetData
     * @description
     * This factory holds the information displayed in the My Budget page. I refer to
     * things in this factory using database terminology but that is only but it's
     * simpler to think of the budgetData member as a database where the index number
     * of the array is a rows primary key.
     */
    .factory('BudgetData', [function(){

        /**
         * Holds the value of wether the monthly renewal has been added yet.
         * @type boolean
         * @memberOf BudgetData
         */
        var addedRenewal;
        /**
         * Holds the renewal date of the the personal budget and the amount it is.
         * @type Object
         * @memberOf BudgetData
         */
        var personalBudgetInfo; 
        /**
         * An array of the budget objects.
         * @type Array
         * @memberOf BudgetData
         */
        var budgetData; 
        /**
         * An object with the possible validation errors as keys. Clones for use.
         * @type Object
         * @memberOf BudgetData
         */
        var validationErrorCodes = {
            error: false,
            NO_DATE : false,
            NO_CREDIT: false,
            N0_DEBIT: false,
            NO_DESCRIPTION: false,
            CREDIT_NAN: false,
            DEBIT_NAN: false
        };
        /**
         * Array of objects used with the MyCareMakerAdd directive. The input list
         * required for a budget object to be valid.
         * @type Array
         * @memberOf BudgetData
         */
        var inputsList =  [
            {
                label: "Date:",
                type: "date"
            },
            {
                label: "Credit: £",
                type: "tel"
            },
            {
                label: "Debit: £",
                type: "tel"
            },
            {
                label: "Description:",
                type: "text"
            }
        ];



        return {
            /**
             * Clones the validationErrorCodes object.
             * 
             * @returns {Object} Cloned version of validationErrorCodes object.
             * @memberOf BudgetData
             */
            getValidationErrorCodes: function() {
                return validationErrorCodes;
            },    
            /**
             * Validates a new user inputted row.
             * 
             * @param {type} row A new budget object, potential new element for budgetData 
             * @returns {Object} A processed version of the validationErrorCodes object.
             * @memberOf BudgetData
             */
            validateRow: function(row) {

                var validationErrors = JSON.parse(JSON.stringify(validationErrorCodes));

                if (row.date === undefined) { 
                    validationErrors.NO_DATE = true;
                    validationErrors.error = true;
                }
                if (row.credit === undefined) { 
                    validationErrors.NO_CREDIT = true; 
                    validationErrors.error = true;
                }
                if (row.debit === undefined) {
                    validationErrors.NO_DEBIT = true; 
                    validationErrors.error = true;
                }
                if (row.description === undefined) {
                    validationErrors.NO_DESCRIPTION = true; 
                    validationErrors.error = true;
                }
                if (isNaN(row.credit)) { 
                    validationErrors.CREDIT_NAN = true; 
                    validationErrors.error = true;
                }
                if (isNaN(row.debit)) {
                    validationErrors.DEBIT_NAN = true; 
                    validationErrors.error = true;
                }
                return validationErrors;
            }, 
            /**
             * Produces the new budget object from the input list.
             * 
             * @param {Array} inputArray List of inputs same object as this objects inputsList member.
             * @returns {Object} A user input budget object.
             * @memberOf BudgetData
             */
            getNewRowFromInputs: function(inputArray) {
                var row = {};

                var date = (inputArray[0].ngmodel !== undefined ? formatDate(inputArray[0].ngmodel) 
                        : undefined );

                row.date = date;
                row.credit = inputArray[1].ngmodel;
                row.debit = inputArray[2].ngmodel;
                row.description = inputArray[3].ngmodel;

                return row;
            },
            /**
             * Returns the inputsList member for use with a MyCareMakerAdd directive
             * tag.
             * 
             * @returns {Object} Clones the inputsList member.
             * @memberOf BudgetData
             */
            getBudgetInputList: function() {
                //Clones object.
                return JSON.parse(JSON.stringify(inputsList));
            }, 
            /**
             * Gets the budgetData array after first initialising it and sorting it
             * by date.
             * 
             * @returns {Array} The array of budget objects, budgetData. 
             * @memberOf BudgetData
             */
            getBudgetData: function() {
                initialiseData();

                budgetData = sortData(budgetData);

                console.log(JSON.stringify(budgetData));

                return budgetData;
            },
            /**
             * Sums the credit, debit columns of the budgetData array and returns the
             * sum. 
             * 
             * @returns {Number} Balance of the object data.
             * @memberOf BudgetData
             */
            getBalance: function() {
                if (budgetData !== null) {
                    var sum = 0;
                    for (var i=0; i<budgetData.length; i++) {

                        var data = budgetData[i];
                        sum += data.credit - data.debit;
                    }
                    return sum;
                } else {
                    return personalBudgetInfo.personalBudget;
                }
            },
            /**
             * Removes a row from the budgetData array.
             * 
             * @param {type} index Position of the row being removed.
             * @returns {undefined}
             */
            removeRow: function(index) {

                budgetData.splice(index, 1);

                storeBudgetData();
            },
            /**
             * Adds a balance variable to the row and then adds it to the budgetData 
             * object.
             * 
             * @param {type} row Row to be added to budgetData array.
             * @returns {undefined}
             * @memberOf BudgetData
             */
            addRow: function(row) {

                row.balance = this.getBalance() + parseFloat(row.credit) - parseFloat(row.debit);
                addRow(row);

            },
            /**
             * Returns the length of the budgetData array.
             * 
             * @returns {Integer} Length of the budgetData array.
             * @memberOf BudgetData
             */
            length: function() {
                return budgetData.length;

            }

        };

        /**
         * Private function.<br>
         * This function initialises the budgetData array, and will add rows automatically
         * if it is your monthly budget renewal date or your first time using the budget 
         * system.
         * 
         * @returns {undefined}
         * @memberOf BudgetData
         */ 
        function initialiseData() {
            //Gets personal budget info.          
            if (!initialisePersonalBudgetInfo()) 
                alert("PB info is not set."); //This is a normal alert as it should never happen to a user!

            initialiseAddedRenewal(); //Will initiate the addedRenewal var

            initialiseBudgetData();

            console.log(!isAnniversaryDate());
            if (!isAnniversaryDate()) {
                setAddedRenewal(false);
            }

            //If there are no elements in the array one is added as a first go.
            if (budgetData.length > 0) {

                //Adds a renewal once a month on the date.
                if ( !addedRenewal && isAnniversaryDate() ) {

                    var date = formatDate(new Date());

                    var data = {
                        date: date, 
                        credit: personalBudgetInfo.personalBudget, 
                        debit: 0, 
                        balance: personalBudgetInfo.personalBudget,
                        description: "Monthly Personal Budget renewal."
                    };
                    addRow(data);

                    storeBudgetData();

                    setAddedRenewal(true);
                }

            } else {
                var date = getFirstTimeDate();

                var data = {
                        date: date, 
                        credit: personalBudgetInfo.personalBudget, 
                        debit: 0, 
                        balance: personalBudgetInfo.personalBudget,
                        description: "First time using MyCareMaker Budget"
                };

                addRow(data);

                storeBudgetData();
            }

        }   


        /**
         * Private function.<br>
         * Adds a row to the budgetData array. Is wrapped around by the object method
         * addRow.
         * 
         * @param {type} row The row to be added to the budgetData array.
         * @returns {undefined}
         * @memberOf BudgetData
         */
        function addRow(row) {

            budgetData.splice(0, 0, row);
            console.log(JSON.stringify(budgetData[0]));

            storeBudgetData();
        }  

        /**
         * Private function.<br>
         * True if pb info is set. False otherwise.
         * 
         * @returns {Boolean} Success or fail.
         * @memberOf BudgetData
         */
        function initialisePersonalBudgetInfo() {
            personalBudgetInfo = JSON.parse(localStorage.getItem("personalBudgetInfo"));

            if (personalBudgetInfo === null) {
                return false;
            }

            return true;
        }  
        /**
         * Private function.<br>
         * Gets the addedRenewal value from storage.
         * @returns {boolean} The addedRenewal value.
         * @memberOf BudgetData
         */
        function initialiseAddedRenewal() {
            addedRenewal = JSON.parse(localStorage.getItem("addedRenewal"));

            if (addedRenewal === null) {
                setAddedRenewal(true);
            }

            return addedRenewal;
        }
        /**
         * Private function.<br>
         * Sets the budgetData object from localStorage.
         * @returns {undefined} 
         * @memberOf BudgetData
         */
        function initialiseBudgetData() {

            budgetData = JSON.parse(localStorage.getItem("budgetData"));

            if (budgetData === null) {
                budgetData = [];
            }

        } 
        /**
         * Private function.<br>
         * Sets the addedRenewal value to true or false and stores in localStorage.
         * @param {boolean} bool True or false.
         * @returns {undefined}
         * @memberOf BudgetData
         */
        function setAddedRenewal(bool) {
            addedRenewal = bool;
            localStorage.setItem("addedRenewal", JSON.stringify(addedRenewal));
        }
        /**
         * Private function.<br>
         * Stores the budgetData array in localStorage.
         * 
         * @returns {undefined} 
         * @memberOf BudgetData
         */
        function storeBudgetData() {

            localStorage.setItem("budgetData", JSON.stringify(budgetData));

        }
        /**
         * Private function.<br>
         * Checks if it is the anniversary date.
         * @returns {Boolean} True if it is.
         * @memberOf BudgetData
         */
        function isAnniversaryDate() {
            return parseInt((new Date()).getDate()) === parseInt(personalBudgetInfo.anniversaryDate);
        }
        /**
         * Private function.<br>
         * This calculates the date of the first payment to the user based on the 
         * anniversaryDate they have chosen. It will back date the first date.
         * 
         * @returns {Date} The users first personal budget date.
         * @memberOf BudgetData
         */
        function getFirstTimeDate() {
            var date = new Date();

            date.setDate(personalBudgetInfo.anniversaryDate);

            if ((new Date()).getDate() < date.getDate() ) {
                var month = date.getMonth();
                if (month - 1 >= 0) 
                    date.setMonth(month - 1);
                else {
                    var year = date.getYear();
                    date.setYear(year - 1);
                    date.setMonth(11);
                }

            }

            date = formatDate(date);

            return date;
        }


        /**
         * Private function.<br>
         * Sorts the budget.data by the elements dates.
         * 
         * @param {array} data The budgetData array.
         * @returns {Array} The array that is put in but sorted.
         * @memberOf BudgetData
         */
        function sortData(data){

            var hasSwapped = true;

            while (hasSwapped) {

                hasSwapped = false;

                for (var i=0; i<data.length-1; i++) {

                    if ((new Date(data[i].date)) < (new Date(data[i+1].date))) {
                        var temp = data[i];
                        data[i] = data[i+1];
                        data[i+1] = temp;
                        hasSwapped = true;
                    }
                }
            }

            return data;
        }    
    }])

    /**
     * @ngdoc Factories
     * @name app.services.GooglePlaces
     * @description
     * This factory object holds the communication with the GooglePlaces.js file and 
     * can set a coordinate based on a UK postcode and then return a list of places 
     * based on that location.
     * @param GooglePlaces.js This file contains the Google data logic.
     * @param $q AngularJS promise object.
     */
    .factory('GooglePlaces', ['$q', function($q){

        /**
         * Waits for the GooglePlaces api to return data.
         * 
         * @name AsyncWait
         * @param {type} timeout Timeout in integer seconds.
         * @param {type} functionName Either setCoordinates or executeGoogleScript
         * there is a different behaviour for each method.
         * @returns {Promise} Returns the AngularJS promise.
         * @memberOf GooglePlaces
         */
        function asyncWait(timeout, functionName) {
            var deferred = $q.defer();

            sessionStorage.setItem("finished", JSON.stringify(false));

            waitForGooglePlaces(new Date(), timeout, functionName);

            return deferred.promise;

            /**
             * Sets the promise value after either timeout or data is returned.
             * 
             * @param {Date} time Time of execution.
             * @param {Integer} timeout Inherited from asyncWait()
             * @param {String} functionName Inherited from asyncWait()
             * @memberOf AsyncWait
             */
            function waitForGooglePlaces(time, timeout, functionName) {

                var timeoutDate = new Date(time);
                timeoutDate.setTime(time.getTime() + timeout*1000);
    //            alert(timeoutDate);
                var currentDate = new Date();
                if (currentDate > timeoutDate) {

                    deferred.reject('FAILED');
                }

                setTimeout(function() {
                    deferred.notify(true + " " + currentDate > timeoutDate );

                    var finished = JSON.parse(sessionStorage.getItem("finished"));

                    if (!finished) {

                        waitForGooglePlaces(time, timeout, functionName); 

                    } else {

                        switch(functionName) {
                            case "executeGoogleScript":
                                var places = getPlaces();

                                if (places.length > 0)
                                    deferred.resolve(places);
                                else {
                                    deferred.reject('FAILED');
                                }

                                break;
                            case "setCoordinates":
                                var coords = getCoordinates();

                                if (coords !== "ERROR") {
                                    deferred.resolve(coords);
                                } else {
                                    deferred.reject('FAILED');
                                }

                                break;

                        }
                        deferred.notify(false);
                    }
                }, 200);
            }

        }

        /**
         * This gets the GooglePlaces data if it exists. If it doesn't returns an
         * empty array.
         * 
         * @returns {Array} Array of Google Places data.
         */
        function getPlaces(){
            var placesString = sessionStorage.getItem("googlePlaces");
            var places; 
            if (placesString !== null) {
                places = JSON.parse(placesString);
            } else {
                places = [];
            }

            return places;
        }   

        /**
         * Returns a location object in the form of latitude and longitude.
         * 
         * @returns {Object} Has lat and lng members.
         */
        function getCoordinates() {
            var status = sessionStorage.getItem("errorStatus");

            if (status === "OK") {
                return JSON.parse(sessionStorage.getItem("location"));
            } else {
                return "ERROR";
            }
        }

        //The callback function and logic are found in GooglePlaces.js (Uses JQuery getScript)
        return {
            /**
             * Executes the Google API code and returns a promise.
             * 
             * @param {string} key The Google API key.
             * @param {Object} searchOb Has members; textSearch, searchArray and radius.
             * Have types String, Array of Strings, and Integer respecitively.
             * @param {integer} timeout Timeout time in seconds.
             * @returns {promise} Promise from AsynWait().
             * @memberOf GooglePlaces
             */
            executeGooleScript: function(key, searchOb, timeout) {
                sessionStorage.setItem("finished", JSON.stringify(false));
                sessionStorage.setItem("googlePlacesSearchObject", JSON.stringify(searchOb));

                var src = "https://maps.googleapis.com/maps/api/js?key=" + key
                            + "&signed_in=true&libraries=places&callback=googlePlacesCallbackFunction";

                $.getScript(src);

    //            waitForEventFinishedReceive(0, onFinish);
                return asyncWait(timeout, "executeGoogleScript");

            },
            /**
             * Sets the coordinates and is mandatory for the executeGoogleScript 
             * method to run.
             * 
             * @param {String} key The Google API key.
             * @param {Integer} timeout Timout in seconds.
             * @returns {Promise}
             * @memberOf GooglePlaces
             */
            setCoordinates: function(key, timeout) {
                sessionStorage.setItem("finished", JSON.stringify(false));

                var src = "https://maps.googleapis.com/maps/api/js?key=" + key
                            + "&signed_in=true&libraries=places&callback=getCoordinates";

                $.getScript(src);

                return asyncWait(timeout, "setCoordinates");

            }

        };           
    }])

    .factory('Contacts', [function(){
        var contacts = null;
        var key = null;
        return {
            initialise: function(storageKey) {
                key = storageKey;
                contacts = JSON.parse(localStorage.getItem(key));
                if (!contacts)
                    contacts = [];


                console.log(JSON.stringify(contacts))
            },
            store: function() {
                localStorage.setItem(key, JSON.stringify(contacts));
            },
            getNumberOfContactsStored: function() {

                return contacts.length;
            },
            getAppContacts: function() {
                if (contacts === null)
                    contacts = [];
                console.log(JSON.stringify(contacts));
                return contacts;

            },
            saveContact: function(contact) {
                if (contacts.length < 6) {
                    console.log(JSON.stringify(contacts) + " " + contacts);
                    console.log(JSON.stringify(contact));
                    contacts.splice(contacts.length, 0, contact);
                    this.store();
                    return true;
                } else {
                    console.log("Failed to add contact");
                    return false;
                }
            },
            deleteContact: function(index) {
                console.log(index);
                console.log("pre removal: " + JSON.stringify(contacts));
                contacts.splice(index, 1);
                console.log("post removal: " + JSON.stringify(contacts));
                this.store();
            },
            deleteAllContacts: function() {
                contacts = [];
                this.store();
            }
        };
    }])


    .service('MedicationService', function (MyCareMakerNotifications,$cordovaLocalNotification) {

        var inputsList =  [
            {
                label: "Name:",
                type: "text"
            },
            {
                label: "Description:",
                type: "text"
            },
            {
                label: "Time of the day",
                type: "select",
                options: [{label: "morning", value: "morning", selected: true},
                    {label: "afternoon", value: "afternoon", selected: false},
                    {label: "evening", value: "evening", selected: false},
                    {label: "night", value: "night", selected: false}]
            }
        ];

        this.getInputsList = function() {
            return JSON.parse(JSON.stringify(inputsList));
        };

        this.MedicationData = function (name, description, time, id) {
            this.name = name;
            this.description = description;
            this.momentOfDay=time;
            this.id=id;
            return this;
        };
        this.getMedications = function () {
            var i = 0;
            var s = "medication";
            var obj;
            var medications = [];
            do {
                obj = window.localStorage[s + String(i)] || null;
                i++;
                if (obj != null) {
                    obj = JSON.parse(obj);
    //                        window.alert(obj);
                    medications.push(new this.MedicationData(obj.name,obj.description,obj.momentOfDay,obj.id));
                }
            } while (obj != null);

            //sort medicatiosn by time of day
            medications.sort(function(a, b){
                if(a.momentOfDay < b.momentOfDay) return -1;
                if(a.momentOfDay > b.momentOfDay) return 1;
                return 0;
            });

            return medications;
        };
    this.saveMedication = function (name,description,time) {
           // window.alert(med.id);
            var s = "medication";
            var i = 0;
            var obj;
            do {
                //window.alert(s + String(i));
                obj = window.localStorage[s + String(i)] || null;
                i++;
            } while (obj != null);
            i--;
            MyCareMakerNotifications.addNotification(name,"Medication alarm:"+name,new Date(),function(){});
             var id=MyCareMakerNotifications.getCurrentId()-1;
             var med=this.MedicationData(name,description,time,id);
                   var first=new Date();
            switch(med.momentOfDay){
                case med.momentOfDay.match(/morning/):
                    first.setHour(9);
                    break;
                case med.momentOfDay.match(/afternoon/):
                    first.setHour(16);
                    break;
                case med.momentOfDay.match(/evening/):
                    first.setHour(19);
                    break;
                case med.momentOfDay.match(/night/):
                    first.setHour(22);
                    break;
                default:
                    break;                    
            }
            var medId=MyCareMakerNotifications.getCurrentId()-1;
            $cordovaLocalNotification.schedule([{id:medId,firstAt:first,every:"day"}]);
            obj = JSON.stringify(med);
            window.localStorage[s + String(i)] = obj;
           // window.alert("save ok");
    //                window.alert("saved medication: " + JSON.parse(obj));
        };
        this.deleteAllMedications = function () {
            var s = "medication";
            var i = 0;
            var obj;
            do {
                obj = window.localStorage[s + String(i)] || null;
                if (obj != null)
                    window.localStorage.removeItem(s + String(i));
                i++;
            }
            while (obj != null);
        };
        this.deleteMedication = function (name) {
            var i = 0;
            var s = "medication";
            var obj;
            do {
                obj = window.localStorage[s + String(i)] || null;
                obj = JSON.parse(obj);
                i++;
            } while (obj.name != name);
            i--;
            do {
                var obj2 = window.localStorage[s + String(i + 1)] || null;
                if (obj2 != null)
                    window.localStorage[s + String(i)] = obj2;
                i++;
            } while (obj2 != null);

            var med = JSON.parse(localStorage.getItem(s + String(i - 1)));
    //                alert(med);
            var noteId = med.id;
    //                alert(noteId + " " + med);
            MyCareMakerNotifications.removeNotification(noteId, function() {
    //                    alert("Successfully removed!");
            });

            window.localStorage.removeItem(s + String(i - 1));
    //                alert("removed");
        };
    })

    /**
     * @ngdoc Factories
     * @name app.services.ConfigurationData
     * @description
     * This holds the user configuration data in localstorage, as well as API keys used 
     * in the GooglePlaces object.
     */
    .service('ConfigurationData', [function(){

        var configurationData = {

            /**
             * Returns an Google API that is Android or iOS.
             * 
             * @returns {String} Google API key for either android of iOS.
             * @memberOf ConfigurationData
             */
            getKey: function() {
                var os = navigator.platform;
                var iOS = /iPad|iPhone|iPod/.test(os);
                if (iOS)
                    return this.apiKeyIos;
                else 
                    return this.apiKeyAndroid;
            },
            /**
             * Returns false if the user has set their postcode. And true otherwise.
             * 
             * @returns {boolean} First time on the App.
             * @memberOf ConfigurationData
             */
            isFirstSet: function() {
                if (localStorage.getItem("firstSet") === null) {
                    localStorage.setItem("firstSet", JSON.stringify(true));
                    this.firstSet = true;
                }
                return this.firstSet;
        //        return true;
            },
            /**
             * Returns true if the personal budget information is set.
             * 
             * @returns {boolean} If the personal budget data is set.
             */
            isBudgetSet: function() {
                if (localStorage.getItem("budgetSet") === null) {
                    this.setBudgetSet(false);
                    console.log("setting to false");
                }
                console.log("Actual value " + this.budgetSet);
                return this.budgetSet;
            },
            /**
             * Can set the budgetSet value to true or false.
             * 
             * @param {boolean} bool The value it is to be set to.
             * @memberOf ConfigurationData
             */
            setBudgetSet: function(bool) {
                this.budgetSet = bool;
                localStorage.setItem("budgetSet", JSON.stringify(this.budgetSet));
            },
            /**
             * Sets the firstSet value to a boolean value, true or false.
             * 
             * @param {type} bool Value to be set.
             * @memberOf ConfigurationData
             */
            setFirstSet: function(bool) {
                this.firstSet = bool;
                localStorage.setItem("firstSet", JSON.stringify(this.firstSet));
            },
            /**
             * Gets the user set postcode for the settings page.
             * 
             * @returns {String} The user set postcode.
             * @memberOf ConfigurationData
             */
            getPostCode: function() {
                return this.postCode;     
            },
            /**
             * Sets the users stored postcode for the app.
             * @param {String} newPostCode String of a UK postcode.
             * @memberOf ConfigurationData
             */
            setPostCode: function(newPostCode) {
                this.postCode = newPostCode.toUpperCase().replace(' ','');
                localStorage.setItem("postCode", this.postCode);
            },
            /**
             * Gets the coordinates of the user location if it has been set. 
             * 
             * @param currentOrPostcodeFlag Not supported potential for getting the phones
             * current position.
             * @returns {Object} Returns the Google Places location same object as 
             * GooglePlaces getCoordinates returns.
             * 
             * @memberOf ConfigurationData
             */
            getCoordinates: function(currentOrPostcodeFlag) {
                if (currentOrPostcodeFlag === 0) {
                    return this.postCodeCoordinates;
                }
                else { 
                    //Return an object with postion lat and lng
                    alert("configurationData.getCoordinates(!=0) not supported yet.");
                    return this.currentCoordinates;

                }
            },
            /**
             * Sets the users postcode location and stores it in localstorage.
             * 
             * 
             * @param {type} newCoordinates Coordinates object from GooglePlaces.
             * @memberOf ConfigurationData
             */
            setCoordinates: function(newCoordinates) {
                this.postCodeCoordinates = newCoordinates;
                localStorage.setItem("postCodeCoordinates", JSON.stringify(this.postCodeCoordinates));
            },
            /**
             * Style options can be 'style_vanilla' or 'style_green'.
             * 
             * @param {type} style The user style option.
             * @memberOf ConfigurationData
             */
            setStyleOption: function(style) {
                this.styleOption = style;
                localStorage.setItem("styleOption", this.styleOption);
            },
            /**
             * Gets the user set style string from localstorage.
             * 
             * @returns {String} Returns the user set style value.
             * @memberOf ConfigurationData
             */
            getStyleOption: function() {
                if (this.styleOption === null) {
                    this.setStyleOption("style_vanilla");
                }

                return this.styleOption;
            },    
            /**
             * This returns the user set font size from localstorage. The value is an
             * int that sets the fontsize to a basic size of < p > tags have the font
             * size of 14px.
             * 
             * @returns {Integer} The font size in pixel size.
             * @memberOf ConfigurationData
             */
            getFontSize: function() {
                if (this.fontSize === null) {
                    return 18;
                } else {
                    return this.fontSize;
                }
            },
            /**
             * Set the font size to localstorge.
             * 
             * @param {Integer} size Font size to be stored.
             * @memberOf ConfigurationData
             */
            setFontSize: function(size) {
                this.fontSize = size;
                localStorage.setItem("fontSize", JSON.stringify(this.fontSize));
            },
            /**
             * Returns the user data set on the personalbudget .
             * 
             * @returns {Object} Personalbudget object.
             */
            getPersonalBudgetInfo: function() {
                if (this.personalBudgetInfo === null) {
                    var pb = {
                        personalBudget: 0,
                        anniversaryDate: 1
                    };
                    this.personalBudgetInfo = pb;
                    console.log("getPb " + this.personalBudgetInfo);
                } 
                return this.personalBudgetInfo;
            },
            /**
             * Stores a user set personalBudget info object.
             * 
             * @param {type} newPbInfo A new personalbudget info object to be stored.
             * @memberOf ConfigurationData
             */
            setPersonalBudgetInfo: function(newPbInfo) {
                this.personalBudgetInfo = newPbInfo;
                localStorage.setItem("personalBudgetInfo", JSON.stringify(this.personalBudgetInfo));

                this.setBudgetSet(true);
            },
            /**
             * Personal budget object.
             * Members personalBudget object and anniversaryDate types number and integer respecitively.
             * 
             * @type Object 
             * @memberOf ConfigurationData
             */
            personalBudgetInfo: JSON.parse(localStorage.getItem("personalBudgetInfo")),
            /**
             * Font size holder.
             * @type Integer
             * @memberOf ConfigurationData
             */
            fontSize: JSON.parse(localStorage.getItem("fontSize")), //16, //Eventually this may need to be an object with all the different font sizes.
            /**
             * A string of either 'style_vanilla' and 'style_green'.
             * @type String
             * @memberOf ConfigurationData
             */
            styleOption: localStorage.getItem("styleOption"), //Get this from local storage as well.
            /**
             * Google API for Android
             * @type String
             * @memberOf ConfigurationData
             */
            apiKeyAndroid: "AIzaSyB2PthaJSZp7Y6BMFFgWFf9H0ErBbrRI8s", //Android
            /**
             * Google API for use in browser (Android key will work)
             * @type String
             * @memberOf ConfigurationData
             */
            apiKeyBrowser: "AIzaSyDoJffrxRA2ilg-94g67lHS_nQkwQ-wSrU", //Browser
            /**
             * Google API for iOS.
             * @type String
             * @memberOf ConfigurationData
             */
            apiKeyIos: "AIzaSyAzXeKs1KCaZGpUlF6U71_OWutD0rPaApk", //iOS
            /**
             * Holds the firstSet value.
             * @type boolean 
             * @memberOf ConfigurationData
             */
            firstSet: JSON.parse(localStorage.getItem("firstSet")),
            /**
             * True if the budget data is set.
             * @type boolean
             * @memberOf ConfigurationData
             */
            budgetSet: JSON.parse(localStorage.getItem("budgetSet")),
            /**
             * The postcode value.
             * @type String
             */
            postCode: localStorage.getItem("postCode"), //String
            /**
             * The locations obeject from GooglePlaces.
             * @type Object
             */
            postCodeCoordinates: JSON.parse(localStorage.getItem("postCodeCoordinates")), //Objects
            currentCoordinates: "" //Coord object.. may not be required to be in memory
        };
        return {
            /**
             * Gets the data.
             * @returns {Object} Returns the configurationData object.
             */
            get: function() {
                return configurationData;
            }
        };
    }]);

