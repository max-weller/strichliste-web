var settings = require('../settings');

module.exports.install = function(app) {
    app.controller('UserController', function ($scope, $routeParams, $timeout, messageService, locationService,
                                               transactionService, userService, $modal, audioService) {

        function loadUser() {
            userService
                .getUser($routeParams.user_id)
                .success(function (user) {
                    $scope.user = user;
                })
                .error(function (body, httpCode) {
                    if (httpCode == 404) {
                        return messageService.error('userDoesNotExist');
                    }

                    return messageService.httpError(body, httpCode);
                });
        }

        $scope.backClick = function() {
            locationService.gotoHome();
        };

        $scope.showAllClick = function() {
            locationService.gotoTransactions($routeParams.user_id);
        };

        $scope.transactionClick = function(value) {

            if(settings.audio.transaction) {
                audioService.play(settings.audio.transaction);
            }

            var balanceElement = angular.element('.account-balance');
            balanceElement.addClass((value > 0)? 'change-positive' : 'change-negative');

            $timeout(function() {
                balanceElement.removeClass('change-positive change-negative');
            }, 800);

            transactionService
                .createTransaction($routeParams.user_id, value)
                .success(function() {
                    loadUser();
                })
                .error(function(body, httpCode) {
                    if(httpCode == 403) {
                        return messageService.error('userBoundaryReached');
                    }

                    return messageService.httpError(body, httpCode);
                });
        };

        $scope.customTransactionClick = function(transactionMode) {


            var modalInstance = $modal.open({
                templateUrl: 'partials/customTransaction.html',
                controller: 'CustomTransactionController',
                resolve: {
                    transactionMode: function(){
                        return transactionMode;
                    }
                }
            });
        };

        var depositSteps = settings.paymentSteps.deposit;
        var dispenseSteps = settings.paymentSteps.dispense;
        if(settings.paymentSteps.customTransactions) {
            depositSteps = depositSteps.slice(0, 4);
            dispenseSteps = dispenseSteps.slice(0, 4);
            $scope.customTransactions = true;
        }

        $scope.depositSteps = depositSteps;
        $scope.dispenseSteps = dispenseSteps;


        loadUser();
    });
};