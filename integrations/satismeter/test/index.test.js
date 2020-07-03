'use strict';

var Analytics = require('@segment/analytics.js-core').constructor;
var integration = require('@segment/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var tester = require('@segment/analytics.js-integration-tester');
var SatisMeter = require('../lib/');

function testSuite(satismeterOptions, writeKey) {
  var analytics;
  var satismeter;

  beforeEach(function() {
    analytics = new Analytics();
    satismeter = new SatisMeter(satismeterOptions);
    analytics.use(SatisMeter);
    analytics.use(tester);
    analytics.add(satismeter);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    satismeter.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(
      SatisMeter,
      integration('SatisMeter')
        .global('satismeter')
        .option('apiKey', '')
    );
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(satismeter, 'load');
    });

    describe('#initialize', function() {
      it('should call #load', function() {
        analytics.initialize();
        analytics.called(satismeter.load);
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(satismeter, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.stub(window, 'satismeter');
      });

      it('should send writeKey and user id', function() {
        analytics.identify('id');
        analytics.called(window.satismeter, {
          writeKey: writeKey,
          userId: 'id',
          traits: {},
          type: 'identify'
        });
      });

      it('should send email', function() {
        analytics.identify('id', { email: 'email@example.com' });
        analytics.called(window.satismeter, {
          writeKey: writeKey,
          userId: 'id',
          traits: {
            email: 'email@example.com'
          },
          type: 'identify'
        });
      });

      it('should send user name', function() {
        analytics.identify('id', { name: 'john doe' });
        analytics.called(window.satismeter, {
          writeKey: writeKey,
          userId: 'id',
          traits: {
            name: 'john doe'
          },
          type: 'identify'
        });
      });

      it('should send signUpDate', function() {
        var now = new Date();
        analytics.identify('id', { createdAt: now });
        analytics.called(window.satismeter, {
          writeKey: writeKey,
          userId: 'id',
          traits: {
            createdAt: now
          },
          type: 'identify'
        });
      });

      it('should send custom traits', function() {
        analytics.identify('id', {
          translation: {
            FOLLOWUP: 'What can we improve'
          },
          language: 'en'
        });
        analytics.called(window.satismeter, {
          writeKey: writeKey,
          userId: 'id',
          traits: {
            translation: {
              FOLLOWUP: 'What can we improve'
            },
            language: 'en'
          },
          type: 'identify'
        });
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window, 'satismeter');
      });

      it('should send event with properties', function() {
        analytics.track('User Created Subscription', {
          planPrice: 2000,
          planId: 'Example Plan'
        });
        analytics.called(
          window.satismeter,
          'track',
          'User Created Subscription',
          {
            planPrice: 2000,
            planId: 'Example Plan'
          }
        );
      });
    });

    describe('#page', function() {
      beforeEach(function() {
        analytics.stub(window, 'satismeter');
      });

      it('should send writeKey, user id and page properties', function() {
        analytics.user().id('id');
        analytics.page('Pricing', {
          customProperty: 'Example'
        });

        analytics.called(window.satismeter, {
          writeKey: writeKey,
          userId: 'id',
          type: 'page',
          name: 'Pricing',
          properties: {
            name: 'Pricing',
            path: window.location.pathname,
            referrer: window.document.referrer,
            search: window.location.search,
            title: window.document.title,
            url: window.location.href,
            customProperty: 'Example'
          }
        });
      });
    });

    describe('#group', function() {
      beforeEach(function() {
        analytics.stub(window, 'satismeter');
      });

      it('should send group id and traits', function() {
        analytics.user().id('id');
        analytics.group('groupId', {
          employees: 50,
          industry: 'Technology'
        });

        analytics.called(window.satismeter, 'group', 'groupId', {
          employees: 50,
          industry: 'Technology'
        });
      });
    });
  });
}

describe('SatisMeter', function() {
  var options = {
    apiKey: 'xy1gopRgdl'
  };

  testSuite(options, options.apiKey);
});

describe('SatisMeter - legacy setup', function() {
  var options = {
    token: 'xy1gopRgdl'
  };

  testSuite(options, options.token);
});
