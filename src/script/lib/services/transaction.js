angular
    .module('strichliste.services.transaction', [])

    .factory('Transaction', function($http) {

        function Transaction() {
        }

        Transaction.prototype.getTransactionByUserId = function(userId, offset, limit) {
            return $http.get(settings.server + '/user/' + userId + '/transaction', {
                params: {
                    limit: limit,
                    offset: offset
                }
            });
        };

        Transaction.prototype.createTransaction = function(userId, value, productId) {
            return $http.post(settings.server + '/user/' + userId + '/transaction', {
                value: value,
                product_id: productId
            });
        };

        return new Transaction();
    });