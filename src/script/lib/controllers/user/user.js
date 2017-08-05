angular
    .module('strichliste.user', [
        'ngRoute',
        'ui.bootstrap',
        'strichliste.filter.localtime',
        'strichliste.services.message',
        'strichliste.services.location',
        'strichliste.services.transaction',
        'strichliste.services.user',
        'strichliste.services.audio',
        'strichliste.services.serverSettings'
    ])

    .config(function($routeProvider) {
        $routeProvider.when('/user/:userId', {
            templateUrl: 'controllers/user/user.html',
            controller: 'UserController'
        })
    })

    .controller('UserController', function ($scope, $routeParams, $timeout, $modal,
                                            Message, Location, Transaction, User, Audio, ServerSettings) {

        var userId = $routeParams.userId;

        function loadUser(userId) {
            User
                .getUser(userId)
                .success(function (user) {
                    $scope.user = user;
                })
                .error(function (body, httpCode) {
                    if (httpCode == 404) {
                        return Message.error('userDoesNotExist');
                    }

                    return Message.httpError(body, httpCode);
                });
        }

        ServerSettings
            .getUserBoundaries()
            .then(function(result) {
                $scope.boundary = result;
            });

        ServerSettings
            .getProductList()
            .then(function(result) {
                $scope.productList = result.entries;
                $scope.categories = {};
                result.entries.forEach((p) => {
                    if (!$scope.categories[p.category]) $scope.categories[p.category] = [];
                    $scope.categories[p.category].push(p);
                });
            });

        $scope.backClick = function() {
            Location.gotoHome();
        };

        $scope.showAllClick = function() {
            Location.gotoTransactions(userId);
        };

        $scope.transactionClick = function(value, productId) {

            if(settings.audio.transaction) {
                Audio.play(settings.audio.transaction);
            }

            var balanceElement = angular.element('.account-balance');
            balanceElement.addClass((value > 0)? 'change-positive' : 'change-negative');

            $scope.transactionRunning = true;
            $scope.user.balance += value;

            $timeout(function() {
                balanceElement.removeClass('change-positive change-negative');
                $scope.transactionRunning = false;
            }, 800);

            Transaction
                .createTransaction(userId, value, productId)
                .success(function() {
                    loadUser(userId);
                })
                .error(function(body, httpCode) {
                    if(httpCode == 403) {
                        return Message.error('userBoundaryReached');
                    }

                    return Message.httpError(body, httpCode);
                });
        };

        $scope.customTransactionClick = function(transactionMode) {

            var modalInstance = $modal.open({
                templateUrl: 'modals/customTransaction/customTransaction.html',
                controller: 'CustomTransactionController',
                resolve: {
                    transactionMode: function(){
                        return transactionMode;
                    }
                }
            });
        };

        if(settings.paymentSteps.customTransactions) {
            $scope.depositSteps = settings.paymentSteps.deposit.slice(0, 4);
            $scope.dispenseSteps = settings.paymentSteps.dispense.slice(0, 4);
            $scope.customTransactions = true;
        } else {
            $scope.depositSteps = settings.paymentSteps.deposit;
            $scope.dispenseSteps = settings.paymentSteps.dispense;
        }

        loadUser(userId);
    });