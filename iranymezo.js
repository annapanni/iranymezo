const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d");

ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;
ctx.strokeStyle = "grey"

let sett = {
	origo: {x: canvas.width/2, y: canvas.height/2},
	scale: 70,
	maxX: () => (canvas.width - sett.origo.x) / sett.scale,
	maxY: () => sett.origo.y / sett.scale,
	minX: () => -1 * sett.origo.x / sett.scale,
	minY: () => -1 *(canvas.height - sett.origo.y) / sett.scale,
}

function onScreen(x, y){
	const x2 = sett.origo.x + x * sett.scale;
	const y2 = sett.origo.y - y * sett.scale ;
	return {x: x2, y:y2}
}
function onCoord(x, y){
	const x2 = (x - sett.origo.x) / sett.scale;
	const y2 = (sett.origo.y - y) / sett.scale ;
	return {x: x2, y:y2}
}

function drawLineBySlope(x, y, m, len=0.3, vert=false, hor=false){
	const pos = onScreen(x,y)
	let dx, dy;
	const lenpx = len * sett.scale
	if (vert || hor) {
		dx = vert ? 0 : lenpx
		dy = vert ? lenpx : 0
	} else {
		dx = Math.sqrt(lenpx*lenpx / (m*m + 1))
		dy = (-1*Math.sign(m)) * Math.sqrt(lenpx*lenpx / (1/(m*m) + 1))
	}
	ctx.beginPath()
	ctx.moveTo(pos.x - dx/2, pos.y - dy/2)
	ctx.lineTo(pos.x + dx/2, pos.y + dy/2)
	ctx.stroke()
}

function drawAxes(){
	ctx.lineWidth = 2;
	ctx.strokeStyle = "black";
	ctx.beginPath()
	ctx.moveTo(0, sett.origo.y)
	ctx.lineTo(canvas.width, sett.origo.y)
	ctx.moveTo(sett.origo.x, 0)
	ctx.lineTo(sett.origo.x, canvas.height)
	ctx.stroke()
	drawLineBySlope(1, 0, 0, len=0.4, vert=true)
	drawLineBySlope(0, 1, 0, len=0.4, vert=false, hor=true)
	ctx.strokeStyle = "grey"
	ctx.lineWidth = 1;
}

function drawRect(x, y, w, h, color){
	const fs = ctx.fillStyle
	ctx.fillStyle = color
	const pos = onScreen(x,y)
	ctx.fillRect(pos.x, pos.y, w*sett.scale, h*sett.scale)
	ctx.fillStyle = fs
}

//számolás
sin = Math.sin
cos = Math.cos
sign = Math.sign
abs = Math.abs
ln = Math.log
pow = Math.pow
const e = Math.E
function f(x,y){
	return x*x + y*y -10
}
function analitic(x){}

function drawSlopeField(){
	for (let x = Math.floor(sett.minX()); x <= Math.ceil(sett.maxX()); x+=0.25) {
		for (let y = Math.floor(sett.minY()); y <= Math.ceil(sett.maxY()); y+=0.25) {
			drawLineBySlope(x, y, f(x, y))
		}
	}
}

function drawIsocline(v, eps=1){
	let prevRow = []
	ctx.fillStyle = "green"
	for (let i = 0; i <= canvas.width; i++) {prevRow[i] = 0}
	for (let y = 0; y <= canvas.height; y++){
		const pos = onCoord(0, y)
		let fxy = f(pos.x,pos.y)
		for (let x = 0; x < canvas.width; x++){
			const npos = onCoord(x+1, y)
			const nfxy = f(npos.x,npos.y)
			const d = abs(fxy-prevRow[x], 2) + abs(fxy-nfxy, 2)
			if (Math.abs(fxy - v) < eps * d) {
				ctx.fillRect(x, y, 1, 1)
			}
			prevRow[x] = fxy
			fxy = nfxy
		}
	}
}

function getDyMethod1(x, y, dx){
	return dx * f(x,y)
}
function getDyRK4(x, y, dx){
	const k1 = f(x, y)
	const k2 = f(x + dx/2, y + dx*k1/2)
	const k3 = f(x + dx/2, y + dx*k2/2)
	const k4 = f(x + dx, y + dx*k3)
	return (dx/6) * (k1 + 2*k2 + 2*k3 + k4)
}

function drawIC(x, y, getDy,dx){
	let inScreen = true
	let prev = {x:x, y:y}
	while (dx > 0 ? x < sett.maxX() : x > sett.minX()){
		const dy = getDy(x, y, dx)
		x += dx
		y += dy
		const pos = onScreen(x, y)
		const nextIS = y <= sett.maxY() && y >= sett.minY()
		if (!inScreen && nextIS)
			ctx.lineTo(prev.x, prev.y)
		if (inScreen)
			ctx.lineTo(pos.x, pos.y)
		inScreen = nextIS
		prev = pos
	}
}
function drawIntegralCurve(x, y, color, getDy, dx=0.01){
	const ss = ctx.strokeStyle
	const lw = ctx.lineWidth
	ctx.strokeStyle = color
	ctx.lineWidth = 2
	ctx.beginPath()
	const pos = onScreen(x, y)
	ctx.moveTo(pos.x, pos.y)
	drawIC(x, y, getDy, dx)
	ctx.moveTo(pos.x, pos.y)
	drawIC(x, y, getDy, -dx)
	ctx.stroke()
	ctx.strokeStyle = ss
	ctx.lineWidth = lw
}

function drawFunction(func){
	ctx.strokeStyle = "LimeGreen"
	const lw = ctx.lineWidth
	ctx.lineWidth = 2
	ctx.beginPath()
	const pos = onCoord(0, 0) //dontcare y
	const screenPos = onScreen(pos.x, func(pos.x))
	ctx.moveTo(screenPos.x, screenPos.y)
	for (let x = 1; x < canvas.width; x++) {
		const pos = onCoord(x, 0) //dontcare y
		const screenPos = onScreen(pos.x, func(pos.x))
		ctx.lineTo(screenPos.x, screenPos.y)
	}
	ctx.stroke()
	ctx.lineWidth = lw
}

//futás
const fInput = document.getElementById("f_input")
const xy_input = document.getElementById("xy_input")
const isoCheck = document.getElementById("izoklina")
const isoVal = document.getElementById("izoklinaValue")
const IC1Check = document.getElementById("IC1")
const IC_RK4Check = document.getElementById("IC_RK4")
const analFCheck = document.getElementById("analFCheck")
const analFinp = document.getElementById("analFinp")
const fillICsBtn = document.getElementById("fillICsBtn")

let currentIntCu = [0,0]
let randICs = []
function fillICs(){
	for (let i = 0; i < 500; i++) {
		w = sett.maxX() - sett.minX()
		h = sett.maxY() - sett.minY()
		randICs.push([Math.random()*w + sett.minX(), Math.random()*h + sett.minY()])
	}
}

function show(randomPoints=false){
	if (!randomPoints) randICs = []
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawAxes()
	drawSlopeField()
	//drawing isolcine
	if (isoCheck.checked){drawIsocline(+isoVal.value)}
	//drawing integral curves
	if (currentIntCu.length == 2){
		xy_input.value = `${currentIntCu[0].toFixed(3)}, ${currentIntCu[1].toFixed(3)}`
		if (IC1Check.checked){
			drawIntegralCurve(currentIntCu[0], currentIntCu[1], "red", getDyMethod1)
		}

		if (IC_RK4Check.checked){
			drawIntegralCurve(currentIntCu[0], currentIntCu[1], "blue", getDyRK4)
		}

	}
	//drawing multiple integral curves
	for (let i = 0; i < randICs.length; i++) {
		if (IC1Check.checked)
			drawIntegralCurve(randICs[i][0], randICs[i][1], "red", getDyMethod1)
		if (IC_RK4Check.checked)
			drawIntegralCurve(randICs[i][0], randICs[i][1], "blue", getDyRK4)
	}
	//draw analitic solution
	if (analFCheck.checked) {
		drawFunction(analitic)
	}
}

//window events
window.onkeydown = (k) => {
	let changed = true
	switch (k.keyCode){
		case 37: //left
			sett.origo.x += sett.scale/2; break;
		case 38: //up
			sett.origo.y += sett.scale/2; break;
		case 39: //right
			sett.origo.x -= sett.scale/2; break;
		case 40: //down
			sett.origo.y -= sett.scale/2; break;
		case 81: //q
			sett.scale += 5; break;
		case 87: //w
			sett.scale -= 5; break;
		default: changed = false
	}
	if (changed) show()
}
window.onresize = () => {
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	show()
}

//checkbox events
isoCheck.onchange = show
IC1Check.onchange = show
IC_RK4Check.onchange = show
analFCheck.onchange = show

//textinput events
function addToOnleave(obj, func){
	obj.onkeydown = (e) => {
		if (e.keyCode == 13)
			func()
	}
	obj.onblur = func
}
const newF = () => {
	try {
		f = eval("(x, y) => " + fInput.value)
		if (typeof f(5,2) != "number")
			throw "rossz f"
		show()
	} catch (e){
		console.log("Rendes függvényt!", e, fInput.value);
	}
}
const newxy = () => {
	const [x, y] = xy_input.value.split(",")
	if (typeof (+x) == "number" && typeof (+y) == "number") {
		currentIntCu = [+x, +y]
		show()
	}
}
const newAnalitic = () => {
	try {
		analitic = eval("(x) => " + analFinp.value)
		if (typeof analitic(5) != "number")
			throw "rossz analitikus"
		show()
	} catch (e){
		console.log("Rendes függvényt!", e, analFinp.value);
	}
}
addToOnleave(fInput, newF)
addToOnleave(xy_input, newxy)
addToOnleave(analFinp, newAnalitic)
addToOnleave(isoVal, show)


//mouse events
fillICsBtn.onclick = () => {
	fillICs()
	show(randomPoints=true)
}
canvas.onmousedown = e => {
	const pos = onCoord(e.clientX, e.clientY)
	currentIntCu = [pos.x, pos.y]
	show()
}

show()

/*
Érdekes:
x - y*y
x*x + y*y -10

Előre kiszámolt:
4*pow(e, -3*sin(x)) - 3*cos(x)*y
0.000, 0.000
4*x*pow(e, -3*sin(x))

-1* cos(x)*y
0.000, 1.000
pow(e, -1*sin(x))
*/
