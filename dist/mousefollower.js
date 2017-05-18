/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_raf__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_raf___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_raf__);


const ZINDEX = 1000;
let instancesCount = 0;

// Store mouse coordinates to global objects which is accessible to all the instances of MouseFollower
const mouse = { x: 0, y: 0 };
document.addEventListener('mousemove', function (e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
});

// Helper method to style html elements
let setElementAttributes = function (elem, attrs) {
    attrs = attrs || {};
    for (const a in attrs) {
        if (attrs.hasOwnProperty(a)) {
            switch (a) {
                case 'data':
                    for (const d in attrs[a]) {
                        if (attrs[a].hasOwnProperty(d)) {
                            elem.setAttribute('data-' + d, attrs[a][d]);
                        }
                    }
                    break;
                case 'style':
                    for (const s in attrs[a]) {
                        if (attrs[a].hasOwnProperty(s)) {
                            elem.style[s] = attrs[a][s];
                        }
                    }
                    break;
                case 'className':
                case 'innerHTML':
                    elem[a] = attrs[a];
                    break;

                default:
                    elem.setAttribute(a, attrs[a]);
            }
        }
    }
};

// Different follow strategies
let followStrategies = {
    basic: function (follower) {
        var o = follower.options;
        var dx = mouse.x - follower.x;
        var dy = mouse.y - follower.y;

        follower.tx += dx / o.inertia;
        follower.ty += dy / o.inertia;

        follower.x += (follower.tx - follower.x) / o.spring;
        follower.y += (follower.ty - follower.y) / o.spring;
    },
    wobble: function (follower) {
        var o = follower.options;

        follower.dx = follower.dx || 0;
        follower.dy = follower.dy || 0;

        var ox = follower.tx - follower.x;
        var oy = follower.ty - follower.y;
        var od = Math.sqrt(ox * ox + oy * oy) || 2;

        var dx = o.spring * (ox / od);
        var dy = o.spring * (oy / od);

        var ddx = (dx - follower.dx) / o.inertia;
        var ddy = (dy - follower.dy) / o.inertia;
        follower.dx += ddx;
        follower.dy += ddy;

        follower.x += follower.dx;
        follower.y += follower.dy;

        follower.tx = mouse.x + (Math.random() - 0.5) * o.wobble;
        follower.ty = mouse.y + (Math.random() - 0.5) * o.wobble;
    },
    eyes: function (follower) {
        var e = follower.options.eyes;
        var dx = mouse.x - follower.x; // + e.offsetX);
        var dy = mouse.y - follower.y; // + e.offsetY)
        var d = dx * dx + dy * dy;
        var ex = follower.options.width - e.width >> 1;
        var ey = follower.options.height - e.height >> 1;
        if (d > e.radius) {
            var ang = Math.atan2(dy, dx);
            ex += e.radius * Math.cos(ang);
            ey += e.radius * Math.sin(ang);
        }
        follower.eyes.style.transform = `translate(${ex}px, ${ey}px)`;
    }
};

class MouseFollower {
    constructor(options) {
        this.id = instancesCount++;
        // element x,y
        this.x = 0;
        this.y = 0;
        // target  x,y
        this.tx = 0;
        this.ty = 0;
        this.node = document.createElement('div');
        setElementAttributes(this.node, {
            id: 'follower-' + this.id,
            style: {
                position: 'absolute',
                pointerEvents: 'none',
                backgroundSize: 'contain',
                imageRendering: 'pixelated',
                backgroundRepeat: 'no-repeat'
            }
        });
        this.eyes = document.createElement('div');
        setElementAttributes(this.eyes, {
            style: {
                position: 'absolute',
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
                display: 'none'
            }
        });
        this.node.appendChild(this.eyes);
        document.body.appendChild(this.node);
        this.setOptions(options);
        this.enabled = false;
    }

    tick() {
        if (this.enabled) {
            this.update();
            __WEBPACK_IMPORTED_MODULE_0_raf___default()(() => this.tick());
        }
    }

    update() {
        // Update position
        followStrategies[this.options.followStrategy || 'basic'](this);
        var transforms = [];
        transforms.push(`translate(${this.x - this.options.offsetX}px, ${this.y - this.options.offsetY}px)`);
        if (this.options.xflip && this.x > mouse.x) {
            transforms.push('scaleX(-1)');
        } else {
            transforms.push('scaleX(1)');
        }
        if (this.options.yflip && this.y > mouse.y) {
            transforms.push('scaleY(-1)');
        } else {
            transforms.push('scaleY(1)');
        }
        this.node.style.transform = transforms.join(' ');

        if (this.options.eyes) {
            followStrategies.eyes(this);
        }
    }

    setOptions(options) {
        options = options || {};
        let defaultOptions = {
            backgroundImage: '/demos/assets/ghost_body_tartan.gif',
            followStrategy: 'basic',
            width: 50,
            height: 50,
            offsetX: 25,
            offsetY: 25,
            opacity: 0.8,
            spring: 8,
            inertia: 30,
            wobble: 50,
            xflip: false,
            yflip: false,
            eyes: {
                backgroundImage: '/demos/assets/ghost_eyes.gif',
                width: 12,
                height: 16,
                radius: 5,
                offsetX: 19,
                offsetY: 16,
                opacity: 1
            }
        };
        this.options = {};
        for (const o in defaultOptions) {
            if (o == 'eyes') {
                if (options[o] === false) {
                    this.options[o] = false;
                } else {
                    options[o] = options[o] || {};
                    this.options[o] = {};
                    for (const e in defaultOptions[o]) {
                        this.options[o][e] = options[o].hasOwnProperty(e) ? options[o][e] : defaultOptions[o][e];
                    }
                }
            } else {
                this.options[o] = options.hasOwnProperty(o) ? options[o] : defaultOptions[o];
            }
        }

        setElementAttributes(this.node, {
            style: {
                backgroundImage: 'url("' + this.options.backgroundImage + '")',
                width: this.options.width + 'px',
                height: this.options.height + 'px',
                opacity: this.options.opacity,
                zIndex: this.options.zindex || ZINDEX
            }
        });
        if (this.options.eyes) {
            setElementAttributes(this.eyes, {
                style: {
                    display: '',
                    backgroundImage: 'url("' + this.options.eyes.backgroundImage + '")',
                    width: this.options.eyes.width + 'px',
                    height: this.options.eyes.height + 'px',
                    opacity: this.options.eyes.opacity
                }
            });
        } else {
            this.eyes.style.display = 'none';
        }
    }

    start() {
        this.enabled = true;
        this.tick();
    }

    stop() {
        this.enabled = false;
    }

    hide() {
        this.node.style.display = "none";
        this.stop();
    }

    show() {
        this.node.style.display = "";
        this.start();
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = MouseFollower;


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__MouseFollower_js__ = __webpack_require__(0);

window.MouseFollower = __WEBPACK_IMPORTED_MODULE_0__MouseFollower_js__["a" /* default */];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

//# sourceMappingURL=performance-now.js.map

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 3 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var now = __webpack_require__(2)
  , root = typeof window === 'undefined' ? global : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function() {
  root.requestAnimationFrame = raf
  root.cancelAnimationFrame = caf
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 5 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })
/******/ ]);