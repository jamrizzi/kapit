'use strict';

var _ = require('lodash');
var blessed = require('blessed');

var data = require('./data');
var edit = require('./edit');
var exec = require('./exec');
var render = require('./render');
var widgets = require('./widgets');

var screen = blessed.screen();

/**
 * ## Widgets
 *
 * This app only needs four widgets on the screen. A message box at the bottom,
 * a step list at the top and then two windows for the request and response.
 *
 * We abstract away our common [blessed](https://github.com/chjj/blessed)
 * options with the **section** function, create our widgets, and then add them
 * to the screen.
 *
 * * **chain**: the top window showing the current chain's list of steps.
 * * **request**: the left window showing the current request.
 * * **response**: the right window showing the current response.
 * * **message**: the message line at the bottom of the app.
 */
var chain = widgets.section('No Chains', {
  align: 'left',
  width: '100%',
  height: 3,
  content: ''
});

var request = widgets.section('Request', {
  width: '50%',
  top: 3,
  bottom: 2,
  scrollable: true,
  alwaysScroll: true,
  keys: true,
  vi: true
});

var response = widgets.section('Response', {
  width: '50%',
  right: 0,
  top: 3,
  bottom: 2,
  focused: true,
  scrollable: true,
  alwaysScroll: true,
  keys: true,
  vi: true
});

var help = widgets.modal('Help', {
  top: 5,
  bottom: 4
});
help.setContent(render.help());

var input = widgets.input('Input');

var message = widgets.message();

var setMessage = function(msg) {
  message.setContent(msg);
};

var clearMessage = function() {
  message.setContent('');
};
clearMessage();

screen.append(chain);
screen.append(request);
screen.append(response);
screen.append(message);
screen.append(input);
screen.append(help);

var getInput = function(label, value, callback) {
  input.setLabel(label);
  input.setValue(value || '');
  input.show();
  screen.focusPush(input);
  screen.render();
  input.readInput(function(err, value) {
    input.hide();
    screen.focusPop().focus();

    if(err) {
      setMessage('{red-fg}' + err.message + '{/}');
    } else {
      callback(value);
    }

    screen.render();
  });
};

/**
 * Updates the chain widget with a new render
 */
var updateChain = function() {
  var currentChain = data.getCurrentChain();
  if (currentChain) {
    chain.setLabel(currentChain.name);
    chain.setContent(render.chain());
  }
};

/**
 * Updates the request widget with a new render and caches it
 */
var updateRequest = function() {
  var step = data.getCurrentStep();
  if (step) {
    step.render.request = render.request(step);
    request.setContent(step.render.request);
  } else {
    request.setContent('');
  }
};

/**
 * Updates the response widget with a new render and caches it
 */
var updateResponse = function() {
  var step = data.getCurrentStep();
  if (step) {
    step.render.response = render.response(step);
    response.setContent(step.render.response);
  } else {
    response.setContent('');
  }
};

/**
 * Takes the current step and loads the request and response from previous
 * renders. If there are no previous renders, then create them.
 */
var activateStep = function() {
  var step = data.getCurrentStep();

  if (step) {
    if(!step.render.request) {
      step.render.request = render.request(step);
    }
    request.setContent(step.render.request);

    if(!step.render.response) {
      step.render.response = render.response(step);
    }
    response.setContent(step.render.response);

    updateChain();

    screen.render();
  }
};

/**
 * ## Keybindings
 *
 * Here we define all of the keybindings on our app and what they do.
 */
screen.key('q', function() {
  return process.exit(0);
});

screen.key('?', function() {
  help.show();
  screen.focusPush(help);
  screen.grabKeys = true;
  screen.render();
});
help.key(['escape', '?', 'q'], function() {
  help.hide();
  screen.grabKeys = false;
  screen.focusPop().focus();
  screen.render();
});

screen.key('C-n', function() {
  data.nextStep();
  activateStep();
});

screen.key('C-p', function() {
  data.prevStep();
  activateStep();
});

screen.key('x', function() {
  var step = data.getCurrentStep();

  if (step) {
    data.resetStep();
    setMessage('{bold}{red-fg}Loading ...{/}');
    updateResponse();
    updateChain();
    screen.render();

    exec.step(step)
      .finally(clearMessage)
      .catch(function(err) {
        step.response.error = err.message;
      })
      .finally(updateRequest)
      .finally(updateResponse)
      .finally(updateChain)
      .finally(function() {
        screen.render();
      });
  } else {
    setMessage('{red-fg}No request to execute!{/}');
    screen.render();
  }
});

screen.key('S-s', function() {
  setMessage('Saving...');
  screen.render();

  data.save().then(function() {
    setMessage('Saved ' + data.getFilename());
    screen.render();
  });
});

screen.key('S-n', function() {
  var currentChain = data.getCurrentChain();

  if (currentChain) {
    data.newStep();
    updateRequest();
    updateResponse();
    updateChain();
  } else {
    setMessage('{red-fg}No current chain to add step to!{/} Use {yellow-fg}C{/} to create one!');
  }

  screen.render();
});

screen.key('S-c', function() {
  data.newChain();
  updateRequest();
  updateResponse();
  updateChain();
  screen.render();
});

screen.key('S-d', function() {
  getInput('Confirm deletion by typing: delete', '', function(name) {
    if (name === 'delete') {
      data.deleteStep();
      updateRequest();
      updateResponse();
      updateChain();
    }
  });
});

screen.key('r', function() {
  var step = data.getCurrentStep();

  if (step) {
    data.resetStep();
    updateRequest();
    updateResponse();
    updateChain();
  } else {
    setMessage('{red-fg}No current step to reset!{/}');
  }

  screen.render();
});

screen.key('S-r', function() {
  data.resetAllSteps();
  updateRequest();
  updateResponse();
  updateChain();
  screen.render();
});

screen.key('w', function() {
  var step = data.getCurrentStep();

  if (step) {
    data.toggleRaw();
    updateRequest();
    updateResponse();
  } else {
    setMessage('{red-fg}No current step to toggle raw mode on!{/}');
  }

  screen.render();
});

screen.key('tab', function() {
  if(request.focused) {
    response.focus();
  } else if (response.focused) {
    request.focus();
  }
});

screen.key('b', function() {
  var step = data.getCurrentStep();

  if (step) {
    var text = step.request.body || (step.request.json ? {} : '');
    edit(screen, text).then(function(body) {
      if (body.trim()) {
        if (step.request.json) {
          step.request.body = JSON.parse(body);
        } else {
          step.request.body = body;
        }
      } else {
        delete step.request.body;
      }

      updateRequest();
      screen.render();
    });
  } else {
    setMessage('{red-fg}No body to edit!{/}');
    screen.render();
  }
});

var editJson = function(value) {
  var step = data.getCurrentStep();

  if (step) {
    var text = step.request[value] || '';
    edit(screen, text).then(function(edited) {
      if (edited.trim()) {
        step.request[value] = JSON.parse(edited);
      } else {
        delete step.request[value];
      }

      updateRequest();
      screen.render();
    });
  } else {
    setMessage('{red-fg}No ' + value + ' to edit!{/}');
    screen.render();
  }
};

screen.key('f', function() {
  editJson('form');
});

screen.key('d', function() {
  editJson('data');
});

screen.key('C-c', function() {
  var context = data.context();

  if(!_.isEmpty(context)) {
    var text = JSON.stringify(data.context(), null, 2);
    edit(screen, text);
  } else {
    setMessage('{red-fg}No context to edit!{/}');
    screen.render();
  }
});

screen.key('n', function() {
  var step = data.getCurrentStep();

  if (step) {
    getInput('Step Name', step.name, function(name) {
      step.name = name;
      updateChain();
      updateRequest();
    });
  }
});

screen.key('t', function() {
  var step = data.getCurrentStep();

  if (step) {
    getInput('Step Type', step.type, function(type) {
      step.type = type;
      updateRequest();
    });
  }
});

var editField = function(label, field) {
  var step = data.getCurrentStep();

  if (step) {
    getInput(label, step.request[field], function(value) {
      step.request[field] = value;
      updateRequest();
    });
  }
};

screen.key('u', function() {
  editField('URL', 'url');
});

screen.key('m', function() {
  editField('Method', 'method');
});

screen.key('a', function() {
  var step = data.getCurrentStep();

  if (step) {
    getInput('Action', step.request.action, function(action) {
      if (action) {
        step.request.action = action;
      } else {
        delete step.request.action;
      }
      updateRequest();
    });
  }
});

screen.key('c', function() {
  var currentChain = data.getCurrentChain();

  if (currentChain) {
    getInput('Chain Name', currentChain.name, function(name) {
      if (name) {
        currentChain.name = name;
      } else {
        currentChain.name = 'Unnamed';
      }
      updateChain();
    });
  } else {
    setMessage('{red-fg}No current chain to edit name on!{/}');
    screen.render();
  }
});

screen.key('S-f', function() {
  setMessage('Data file: ' + data.getFilename());
  screen.render();
});

screen.key('o', function() {
  var step = data.getCurrentStep();

  if (step) {
    step.request.json = !step.request.json;
    updateRequest();
    screen.render();
  }
});

screen.key('h', function() {
  var step = data.getCurrentStep();

  if (step) {
    getInput('Header', '', function(header) {
      var current = '';
      if (step.request.headers) {
        current = step.request.headers[header] || '';
      }
      getInput('Value (leave blank to delete)', current, function(value) {
        if (value) {
          // Add header
          if (!step.request.hasOwnProperty('headers')) {
            step.request.headers = {};
          }
          step.request.headers[header] = value;
        } else {
          // Remove header
          if (step.request.headers) {
            delete step.request.headers[header];
          }
          if (_.isEmpty(step.request.headers)) {
            delete step.request.headers;
          }
        }

        updateRequest();
      });
    });
  }
});

// Initialize the app by first loading the data file, then updating the screen.
data.load()
  .then(updateRequest)
  .then(updateResponse)
  .then(updateChain)
  .then(function() {
    screen.render();
  })
  .catch(function(e) {
    console.error(e.stack);
  });
