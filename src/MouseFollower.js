import raf from 'raf';

const ZINDEX = 1000;
let instancesCount = 0;

// Store mouse coordinates to global objects which is accessible to all the instances of MouseFollower
const mouse = {x: 0, y: 0};
document.addEventListener('mousemove', function(e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
});

// Helper method to style html elements
let setElementAttributes = function(elem, attrs) {
    attrs = attrs || {};
    for (const a in attrs) {
        if (attrs.hasOwnProperty(a)) {
            switch (a) {
                case 'data':
                    for (const d in attrs[a]) {
                        if (attrs[a].hasOwnProperty(d)) {
                            elem.setAttribute('data-'+d, attrs[a][d]);
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
}

// Different follow strategies
let followStrategies = {
    basic: function(follower) {
        var o = follower.options;
        var dx = mouse.x - follower.x;
        var dy = mouse.y - follower.y;

        follower.tx += dx / o.inertia;
        follower.ty += dy / o.inertia;

        follower.x += (follower.tx - follower.x) / o.spring;
        follower.y += (follower.ty - follower.y) / o.spring;
    },
    wobble: function(follower) {
        var o = follower.options;

        follower.dx = follower.dx || 0;
        follower.dy = follower.dy || 0;

        var ox = (follower.tx - follower.x);
        var oy = (follower.ty - follower.y);
        var od = Math.sqrt(ox*ox + oy*oy) || 2;

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
    eyes: function(follower) {
        var e  = follower.options.eyes;
        var dx = mouse.x - (follower.x);// + e.offsetX);
        var dy = mouse.y - (follower.y);// + e.offsetY)
        var d = dx*dx + dy*dy;
        var ex = (follower.options.width - e.width)>>1;
        var ey = (follower.options.height - e.height)>>1;
        if (d > e.radius) {
            var ang = Math.atan2(dy,dx);
            ex += e.radius * Math.cos(ang);
            ey += e.radius * Math.sin(ang);
        }
        follower.eyes.style.transform = `translate(${ex}px, ${ey}px)`;
    }
};

export default class MouseFollower {
    constructor(options) {
        this.id = instancesCount++;
        // element x,y
        this.x  = 0; 
        this.y  = 0;
        // target  x,y
        this.tx = 0; 
        this.ty = 0;
        this.node = document.createElement('div');
        setElementAttributes(this.node, {
            id: 'follower-'+this.id,
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
            raf(()=>this.tick());
        }
    }

    update() {
        // Update position
        followStrategies[this.options.followStrategy || 'basic'](this);
        var transforms = [];
        transforms.push(`translate(${this.x-this.options.offsetX}px, ${this.y-this.options.offsetY}px)`);
        if (this.options.xflip && (this.x > mouse.x)) {
            transforms.push('scaleX(-1)');
        } else {
            transforms.push('scaleX(1)');
        }
        if (this.options.yflip && (this.y > mouse.y)) {
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
            backgroundImage:'/demos/assets/ghost_body_tartan.gif',
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
                backgroundImage:'/demos/assets/ghost_eyes.gif',
                width:12,
                height:16,
                radius: 5,
                offsetX:19,
                offsetY:16,
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
                backgroundImage: 'url("'+this.options.backgroundImage+'")',
                width:  this.options.width + 'px',
                height: this.options.height + 'px',
                opacity: this.options.opacity,
                zIndex: this.options.zindex || ZINDEX
            }
        });
        if (this.options.eyes) {
            setElementAttributes(this.eyes, {
                style: {
                    display: '',
                    backgroundImage: 'url("'+this.options.eyes.backgroundImage+'")',
                    width:  this.options.eyes.width + 'px',
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
