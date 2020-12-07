"use strict";
{
	class Doll {
		constructor(x, size, stiffness, structure) {
			this.x = x;
			this.s = size;
			this.stiffness = stiffness;
			this.points = [];
			this.links = [];
			this.angles = [];

			class Point {
				constructor(doll) {
					this.x = doll.x;
					this.y = 10;
					this.xb = this.x;
					this.yb = this.y + 2;
					this.w = 0;
					this.stiffness = doll.stiffness;
					this.mass = 1;
				}

				anim() {
					const vx = (this.x - this.xb) * this.stiffness;
					const vy = (this.y - this.yb) * this.stiffness;
					this.xb = this.x;
					this.yb = this.y;
					this.x += vx + 0.5 * (Math.random() - 0.5);
					this.y += vy + 0.5 * (Math.random() - 0.5);
					const dx = this.x - pointer.x;
					const dy = this.y - pointer.y;
					let d = Math.sqrt(dx * dx + dy * dy);
					const w = (pointer.sw + this.w) * 0.5;

					if (d < w) {
						d = Math.abs(w - d);
						const a = Math.atan2(dy, dx);
						this.x += d * Math.cos(a);
						this.y += d * Math.sin(a);
					}

					if (this.y < 0) {
						this.y = 0;
						this.yb = -2;
					} else if (this.y > canvas.height) {
						this.y = canvas.height;
						this.yb = canvas.height + 2;
					}

					if (this.x < 0) {
						this.x = 0;
						this.xb = -2;
					} else if (this.x > canvas.width) {
						this.x = canvas.width;
						this.xb = canvas.width + 2;
					}
				}
			}

			class Angle {
				constructor(p1, p2, p3, len1, len2, angle, range, force) {
					this.p1 = p1;
					this.p2 = p2;
					this.p3 = p3;
					this.len1 = len1;
					this.len2 = len2;
					this.angle = angle;
					this.range = range;
					this.force = force || 0.2;
				}

				solve() {
					let a;
					let b;
					let c;
					let e;
					let m;
					let m1;
					let m2;
					let m3;
					let x1;
					let y1;
					let cos;
					let sin;
					a = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
					b = Math.atan2(this.p3.y - this.p2.y, this.p3.x - this.p2.x);
					c = this.angle - (b - a);
					c = c > Math.PI ? c - 2 * Math.PI : c < -Math.PI ? c + 2 * Math.PI : c;
					e = Math.abs(c) > this.range
						? (-Math.sign(c) * this.range + c) * this.force
						: 0;
					m = this.p1.mass + this.p2.mass;
					m1 = this.p1.mass / m;
					m2 = this.p2.mass / m;
					cos = Math.cos(a - e);
					sin = Math.sin(a - e);
					x1 = this.p1.x + (this.p2.x - this.p1.x) * m2;
					y1 = this.p1.y + (this.p2.y - this.p1.y) * m2;

					this.p1.x = x1 - cos * this.len1 * m2;
					this.p1.y = y1 - sin * this.len1 * m2;
					this.p2.x = x1 + cos * this.len1 * m1;
					this.p2.y = y1 + sin * this.len1 * m1;

					a = Math.atan2(this.p2.y - this.p3.y, this.p2.x - this.p3.x) + e;
					m = this.p2.mass + this.p3.mass;
					m2 = this.p2.mass / m;
					m3 = this.p3.mass / m;
					cos = Math.cos(a);
					sin = Math.sin(a);
					x1 = this.p3.x + (this.p2.x - this.p3.x) * m2;
					y1 = this.p3.y + (this.p2.y - this.p3.y) * m2;

					this.p3.x = x1 - cos * this.len2 * m2;
					this.p3.y = y1 - sin * this.len2 * m2;
					this.p2.x = x1 + cos * this.len2 * m3;
					this.p2.y = y1 + sin * this.len2 * m3;
				}
			}

			class Link {
				constructor(doll, link) {
					this.length = link.length * doll.s;
					this.width = link.width * doll.s;
					this.image = document.getElementById(link.img);
					doll.points[link.p0] = this.p0 = doll.points[link.p0]
						? doll.points[link.p0]
						: new Point(doll);
					doll.points[link.p1] = this.p1 = doll.points[link.p1]
						? doll.points[link.p1]
						: new Point(doll);
					if (this.width > this.p0.w) this.p0.w = this.width;
					const mass = link.mass || 1;
					if (mass > this.p0.mass) this.p0.mass = mass;
					if (mass > this.p1.mass) this.p1.mass = mass;
				}

				draw() {
					const dx = this.p1.x - this.p0.x;
					const dy = this.p1.y - this.p0.y;
					const a = Math.atan2(dy, dx);

					ctx.save();
					ctx.translate(this.p0.x, this.p0.y);
					ctx.rotate(a);
					ctx.drawImage(
						this.image,
						-this.width * 0.15,
						-this.width * 0.5,
						this.length + this.width * 0.3,
						this.width
					);
					ctx.restore();
				}
			}

			function len(p0, p1) {
				for (const link of structure.links) {
					if (
						(link.p0 === p0 && link.p1 === p1) ||
						(link.p0 === p1 && link.p1 === p0)
					) {
						return link.length;
						break;
					}
				}
				return 1;
			}

			for (let i = 0; i < structure.links.length; i++) {
				const link = structure.links[i];
				this.links.push(new Link(this, link));
			}

			for (let i = 0; i < structure.constraints.length; i++) {
				const constraint = structure.constraints[i];

				this.angles.push(
					new Angle(
						this.points[constraint.p1],
						this.points[constraint.p2],
						this.points[constraint.p3],
						len(constraint.p1, constraint.p2) * size,
						len(constraint.p2, constraint.p3) * size,
						constraint.angle,
						constraint.range,
						constraint.force
					)
				);
			}
		}

		anim() {
			for (const angle of this.angles) angle.solve();
			for (const point of this.points) point.anim();
			for (const link of this.links) link.draw();
		}

		collide(doll) {
			for (let i = 0, o1; (o1 = this.points[i++]); ) {
				for (let j = 0, o2; (o2 = doll.points[j++]); ) {
					const dx = o1.x - o2.x;
					const dy = o1.y - o2.y;
					let d = Math.sqrt(dx * dx + dy * dy);
					const w = (o1.w + o2.w) * 0.5;

					if (d < w) {
						d = Math.abs(w - d);
						const a = Math.atan2(dy, dx);
						const vx = d * Math.cos(a) * 0.5;
						const vy = d * Math.sin(a) * 0.5;
						o1.x += vx;
						o1.y += vy;
						o2.x -= vx;
						o2.y -= vy;
					}
				}
			}
		}
	}

	// main loop

	function run() {
		requestAnimationFrame(run);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.beginPath();
		ctx.fillStyle = "#222225";
		ctx.arc(pointer.x, pointer.y, pointer.sw / 2, 0, 2 * Math.PI);
		ctx.fill();

		if (pointer.time-- < 0) {
			if (pointer.sw > 1) pointer.sw--;
		} else pointer.sw += (canvas.sw - pointer.sw) / 10;

		dolls[0].anim();
		dolls[1].anim();
		dolls[0].collide(dolls[1]);
	}

	// canvas

	var canvas = {
		elem: document.createElement("canvas"),
		resize() {
			this.width = this.elem.width = this.elem.offsetWidth;
			this.height = this.elem.height = this.elem.offsetHeight;
			this.sw = Math.min(this.width, this.height) / 3;
		},
		init() {
			const ctx = this.elem.getContext("2d");
			document.body.appendChild(this.elem);
			window.addEventListener("resize", this.resize.bind(this), false);
			this.resize();
			return ctx;
		}
	};

	var ctx = canvas.init();

	// pointer

	var pointer = (canvas => {
		const pointer = {
			x: canvas.width / 2,
			y: -500,
			sw: 0,
			time: 0,
			pointer(e) {
				const touchMode = e.targetTouches;
				let pointer;
				if (touchMode) {
					e.preventDefault();
					pointer = touchMode[0];
				} else pointer = e;
				this.x = pointer.clientX;
				this.y = pointer.clientY;
				this.time = 200;
			}
		};

		window.addEventListener(
			"mousemove",
			function(e) {
				this.pointer(e);
			}.bind(pointer),
			false
		);
		canvas.elem.addEventListener(
			"touchmove",
			function(e) {
				this.pointer(e);
			}.bind(pointer),
			false
		);
		return pointer;
	})(canvas);

	// init

	var dolls = [];

	const structure = {
		links: [
			{
				p0: 0,
				p1: 1,
				length: 3,
				width: 3,
				img: "rd05"
			},
			{
				p0: 1,
				p1: 2,
				length: 5,
				width: 2.5,
				img: "rd09"
			},
			{
				p0: 3,
				p1: 7,
				length: 6,
				width: 3.5,
				img: "rd01"
			},
			{
				p0: 7,
				p1: 8,
				length: 7,
				width: 5,
				img: "rd06"
			},
			{
				p0: 3,
				p1: 9,
				length: 6,
				width: 3.5,
				img: "rd01"
			},
			{
				p0: 9,
				p1: 10,
				length: 7,
				width: 5,
				img: "rd06",
				mass: 10
			},
			{
				p0: 0,
				p1: 4,
				length: 4,
				width: 4.5,
				img: "rd04"
			},
			{
				p0: 0,
				p1: 3,
				length: 9,
				width: 5,
				img: "rd08"
			},
			{
				p0: 0,
				p1: 5,
				length: 5,
				width: 3,
				img: "rd05"
			},
			{
				p0: 5,
				p1: 6,
				length: 5,
				width: 2.5,
				img: "rd07"
			}
		],

		constraints: [
			{
				p1: 4,
				p2: 0,
				p3: 3,
				angle: 0,
				range: 1,
				force: 0.2
			},
			{
				p1: 3,
				p2: 0,
				p3: 1,
				angle: Math.PI / 2,
				range: Math.PI * 2,
				force: 0.2
			},
			{
				p1: 0,
				p2: 1,
				p3: 2,
				angle: -Math.PI / 2,
				range: Math.PI / 2,
				force: 0.2
			},
			{
				p1: 3,
				p2: 0,
				p3: 5,
				angle: Math.PI / 2,
				range: Math.PI * 2,
				force: 0.2
			},
			{
				p1: 0,
				p2: 5,
				p3: 6,
				angle: -Math.PI / 2,
				range: Math.PI / 2,
				force: 0.2
			},
			{
				p1: 0,
				p2: 3,
				p3: 7,
				angle: -Math.PI / 3,
				range: Math.PI / 2,
				force: 0.2
			},
			{
				p1: 0,
				p2: 3,
				p3: 9,
				angle: -Math.PI / 3,
				range: Math.PI / 2,
				force: 0.2
			},
			{
				p1: 3,
				p2: 7,
				p3: 8,
				angle: Math.PI / 2,
				range: Math.PI / 3,
				force: 0.2
			},
			{
				p1: 3,
				p2: 9,
				p3: 10,
				angle: Math.PI / 2,
				range: Math.PI / 3,
				force: 0.2
			}
		]
	};

	dolls[0] = new Doll(canvas.width * 0.25, canvas.height / 30, 0.998, structure);
	dolls[1] = new Doll(canvas.width * 0.75, canvas.height / 30, 0.998, structure);

	run();
}