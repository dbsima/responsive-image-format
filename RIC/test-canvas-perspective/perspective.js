
function perspective() {
	var image = new Image();

	image.onload = function() {

		var canvas = document.getElementById('source');

		canvas.width = image.width;
		canvas.height = image.height;
		
		var ctx = canvas.getContext('2d');

		ctx.drawImage(image, 0, 0);
		
		var size = 500;
		var offsetX = Math.round((size-image.width)/2);
		var offsetY = Math.round((size-image.height)/2);
		
		var demo = document.getElementById('perspectiveDemo');
		demo.width = size;
		demo.height = size;
		var demoCtx = demo.getContext('2d');
		demoCtx.drawImage(image, offsetX, offsetY);

		
		YUI().use('dd', function(Y) {
			var body = Y.one('#theBody');
			
			var handle = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
			handle.className = 'handle';
			
			var canvas = Y.one('#perspectiveDemo');
			var XY = canvas.getXY();
			XY[0] += offsetX;
			XY[1] += offsetY;
			
			canvas.setAttribute('offsetX', offsetX);
			canvas.setAttribute('offsetY', offsetY);
			
			var handleTL = handle.cloneNode(true);
			handleTL.id = 'handleTL';
			handleTL.setAttribute('initX', XY[0]);
			handleTL.setAttribute('initY', XY[1]);
			handleTL.style.left = (handleTL.getAttribute('initX')-3)+'px';
			handleTL.style.top = (handleTL.getAttribute('initY')-3)+'px';
			body.appendChild(handleTL);
			
			var handleTR = handle.cloneNode(true);
			handleTR.id = 'handleTR';
			handleTR.setAttribute('initX', XY[0]+image.width-1);
			handleTR.setAttribute('initY', XY[1]);
			handleTR.style.left = (handleTR.getAttribute('initX')-3)+'px';
			handleTR.style.top = (handleTR.getAttribute('initY')-3)+'px';
			body.appendChild(handleTR);
			
			var handleBL = handle.cloneNode(true);
			handleBL.id = 'handleBL';
			handleBL.setAttribute('initX', XY[0]);
			handleBL.setAttribute('initY', XY[1]+image.height-1);
			handleBL.style.left = (handleBL.getAttribute('initX')-3)+'px';
			handleBL.style.top = (handleBL.getAttribute('initY')-3)+'px';
			body.appendChild(handleBL);
			
			var handleBR = handle.cloneNode(true);
			handleBR.id = 'handleBR';
			handleBR.setAttribute('initX', XY[0]+image.width-1);
			handleBR.setAttribute('initY', XY[1]+image.height-1);
			handleBR.style.left = (handleBR.getAttribute('initX')-3)+'px';
			handleBR.style.top = (handleBR.getAttribute('initY')-3)+'px';
			body.appendChild(handleBR);
			
			
			var ddTL = new Y.DD.Drag({
				node: '#handleTL'
			});
			ddTL.on('drag:end', initTransform);
			ddTL.on('drag:drag', function() {
				if (document.getElementById('liveWarping').checked) initTransform();
			});
			
			var ddBL = new Y.DD.Drag({
				node: '#handleBL'
			});
			ddBL.on('drag:end', initTransform);
			ddBL.on('drag:drag', function() {
				if (document.getElementById('liveWarping').checked) initTransform();
			});
			
			var ddBR = new Y.DD.Drag({
				node: '#handleBR'
			});
			ddBR.on('drag:end', initTransform);
			ddBR.on('drag:drag', function() {
				if (document.getElementById('liveWarping').checked) initTransform();
			});
			
			var ddTR = new Y.DD.Drag({
				node: '#handleTR'
			});
			ddTR.on('drag:end', initTransform);
			ddTR.on('drag:drag', function() {
				if (document.getElementById('liveWarping').checked) initTransform();
			});

		});


		
		/*
		var results = document.getElementById('transformResults');
		
		var time = 0;
		for (var i=0; i<10; i++) {

			var start = new Date().getTime();

			var transformation = transformCanvas(canvas, i*2, i*-4, 10-2*i, 20+i*3, i*50, 0, i*-2, i*-5);

			var end = new Date().getTime();
			time += end - start;

			transformation.style.border = '1px solid red'
			transformation.style.margin = '1px'

			results.appendChild(transformation);
		}
		alert('Execution time: ' + time);
		*/
		
		
		vanishingPoints();
	}
	
	image.onerror = function() {
		alert('error loading image: '+image.src)
	}

	//image.src = 'image.tif';
	//image.src = 'color.png';
    image.crossOrigin="anonymous";
    image.src = 'http://i.imgur.com/lXxgMNp.png';
}

function initTransform(dx, dy, handle) {
	YUI().use('node', function(Y) {
		var TL = Y.one('#handleTL');
		var BL = Y.one('#handleBL');
		var BR = Y.one('#handleBR');
		var TR = Y.one('#handleTR');
		
		var TLdx = TL.getX()-TL.getAttribute('initX')+3;
		var TLdy = TL.getY()-TL.getAttribute('initY')+3;
		
		var BLdx = BL.getX()-BL.getAttribute('initX')+3;
		var BLdy = BL.getY()-BL.getAttribute('initY')+3;
		
		var BRdx = BR.getX()-BR.getAttribute('initX')+3;
		var BRdy = BR.getY()-BR.getAttribute('initY')+3;
		
		var TRdx = TR.getX()-TR.getAttribute('initX')+3;
		var TRdy = TR.getY()-TR.getAttribute('initY')+3;
		
		var srcCanvas = document.getElementById('source');
		
		var trans = transformCanvas(srcCanvas, TLdx, TLdy, BLdx, BLdy, BRdx, BRdy, TRdx, TRdy);
		
		var destC = document.getElementById('perspectiveDemo');
		var destCtx = destC.getContext('2d');
		
		// correct position of the transformation
		dW = Math.min(TL.getX(), TR.getX(), BL.getX(), BR.getX()) - Y.one('#perspectiveDemo').getX()+3;
		dH = Math.min(TL.getY(), TR.getY(), BL.getY(), BR.getY()) - Y.one('#perspectiveDemo').getY()+3;

		destC.width = destC.width; // clear the canvas
		//destCtx.globalAlpha = .1;
		destCtx.drawImage(trans, dW, dH);
	});
}

function transformCanvas(srcCanvas, TLdx, TLdy, BLdx, BLdy, BRdx, BRdy, TRdx, TRdy) {

	var p1 = {x: 0, y: 0}; // upper left corner
	var p2 = {x: 0, y: (srcCanvas.height)}; // lower left corner
	var p3 = {x: srcCanvas.width, y: (srcCanvas.height)}; // lower right corner
	var p4 = {x: srcCanvas.width, y: 0}; // upper right corner
	


	var q1 = {x: p1.x+TLdx, y: p1.y+TLdy}; // upper left corner
	var q2 = {x: p2.x+BLdx, y: p2.y+BLdy}; // lower left corner
	var q3 = {x: p3.x+BRdx, y: p3.y+BRdy}; // lower right corner
	var q4 = {x: p4.x+TRdx, y: p4.y+TRdy}; // upper right corner
	



	//////////////////////////////////////////////////////////
	// get the dimensions of the transformed image
	var min = {};
	var max = {};

	min.x = Math.min(q1.x, q2.x, q3.x, q4.x);
	min.y = Math.min(q1.y, q2.y, q3.y, q4.y);
	max.x = Math.max(q1.x, q2.x, q3.x, q4.x);
	max.y = Math.max(q1.y, q2.y, q3.y, q4.y);
	//alert('min.x: '+min.x+'\nmin.y: '+min.y+'\nmax.x: '+max.x+'\nmax.y: '+max.y)

	var offsetX = -Math.floor(min.x);
	var offsetY = -Math.floor(min.y);
	//alert('offset\n'+offsetX+'   '+offsetY)

	var destWidth = Math.ceil(Math.abs(max.x - min.x));
	var destHeight = Math.ceil(Math.abs(max.y - min.y));
	
	var destArea = destWidth*destHeight;
	if (destArea > 1e5) {
		alert('Warning: Transformation is too big: '+destWidth+'x'+destHeight+', Area: '+destArea);
		return -1;
	}
	//////////////////////////////////////////////////////////
	// calculate the perspective transformation matrix
	
	// the order of the points does not matter as long as it is the same in both calculateMatrix() calls
	var ps = adjoint33(calculateMatrix(p1, p2, p3, p4));
	var sq = calculateMatrix(q1, q2, q3, q4);

	var mTranslation = [[1, 0, offsetX], [0, 1, offsetY], [0, 0, 1]];
	transpose33(mTranslation);

	var mPerspective = matrix33();

	mult33(ps, sq, mPerspective);

	var fw_trafo = matrix33();
	mult33(mPerspective, mTranslation, fw_trafo);

	var bw_trafo = adjoint33(fw_trafo);
	
	//displayMatrix(bw_trafo, 'matrixdump');

	//////////////////////////////////////////////////////////
	// convert the imagedata arrays of src and dest into a two-dimensional matrix
	
	// create two-dimensional array for storing the destination data
	var destPixelData = new Array(destWidth);
	for (var x=0; x<destWidth; x++) {
		destPixelData[x] = new Array(destHeight);
	}

	// create two-dimensional array for storing the source data
	var srcCtx = srcCanvas.getContext('2d');
	srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
	
	var srcPixelData = new Array(srcData.width);
	for (var x=0; x<srcData.width; x++) {
		srcPixelData[x] = new Array(srcData.height);
	}

	// filling the source array
	var i = 0;
	for (var y=0; y<srcData.height; y++) {
		for (var x=0; x<srcData.width; x++) {

			srcPixelData[x][y] = {
				r: srcData.data[i++],
				g: srcData.data[i++],
				b: srcData.data[i++],
				a: srcData.data[i++]
			};
		}
	}
	// append width and height for later use
	srcPixelData[srcPixelData.length] = srcData.width;
	srcPixelData[srcPixelData.length] = srcData.height;
	
	var destCanvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
	destCanvas.width = destWidth;
	destCanvas.height = destHeight;
	var destCtx = destCanvas.getContext('2d');
	
	
	destCtx.beginPath();
	destCtx.moveTo(q1.x+offsetX-1, q1.y+offsetY-1);
	destCtx.lineTo(q2.x+offsetX-1, q2.y+offsetY+1);
	destCtx.lineTo(q3.x+offsetX+1, q3.y+offsetY+1);
	destCtx.lineTo(q4.x+offsetX+1, q4.y+offsetY-1);
	destCtx.closePath();
	//destCtx.strokeStyle = 'green';
	//destCtx.stroke();

	// loop over to-be-warped image and apply the transformation
	for (var x=0; x<destWidth; x++) {
		for (var y=0; y<destHeight; y++) {
			// if dest pixel is not inside the to-be-warped area, skip the transformation and assign transparent black
			if (1) {
			//if (destCtx.isPointInPath(x, y)) {
			
				var srcCoord = applyTrafo(x, y, bw_trafo);
				
				if (document.getElementById('interpolationMethod').value == 'nn') {
					destPixelData[x][y] = interpolateNN(srcCoord, srcPixelData)
				} else {
					destPixelData[x][y] = interpolateBL(srcCoord, srcPixelData)
				}
				
			} else {
				destPixelData[x][y] = {
					r: 0,
					g: 0,
					b: 0,
					a: 0
				};
			}
		}
	}

	
	var destData = destCtx.createImageData(destCanvas.width, destCanvas.height);

	// write the data back to the imagedata array
	var i = 0;
	for (var y=0; y<destHeight; y++) {
		for (var x=0; x<destWidth; x++) {

			destData.data[i++] = destPixelData[x][y].r;
			destData.data[i++] = destPixelData[x][y].g;
			destData.data[i++] = destPixelData[x][y].b;
			destData.data[i++] = destPixelData[x][y].a;
		}
	}

	destCtx.putImageData(destData, 0, 0);

	return destCanvas;
}

function interpolateNN(srcCoord, srcPixelData) {
	var w = srcPixelData[srcPixelData.length-2];
	var h = srcPixelData[srcPixelData.length-1];

	// set the dest pixel to transparent black if it is outside the source area
	if (srcCoord.x < 0 || srcCoord.x > w-1 || srcCoord.y < 0 || srcCoord.y > h-1) {
		return {
			r: 0,
			g: 0,
			b: 0,
			a: 0
		};
	}

	var x0 = Math.round(srcCoord.x);
	var y0 = Math.round(srcCoord.y);

	return srcPixelData[x0][y0];
}

function interpolateBL(srcCoord, srcPixelData) {
	var w = srcPixelData[srcPixelData.length-2];
	var h = srcPixelData[srcPixelData.length-1];
	
	var x0 = Math.floor(srcCoord.x);
	var x1 = x0+1;
	var y0 = Math.floor(srcCoord.y);
	var y1 = y0+1;

	// set the dest pixel to transparent black if it is outside the source area
	if (x0 < -1 || x1 > w || y0 < -1 || y1 > h) {
		return {
			r: 0,
			g: 0,
			b: 0,
			a: 0
		};
	}

	var f00 = (x1-srcCoord.x)*(y1-srcCoord.y);
	var f10 = (srcCoord.x-x0)*(y1-srcCoord.y);
	var f01 = (x1-srcCoord.x)*(srcCoord.y-y0);
	var f11 = (srcCoord.x-x0)*(srcCoord.y-y0);
	
	var alpha = [[-1, -1], [-1, -1]];
	
	if (x0 < 0) {
		x0 = 0;
		alpha[0][0] = 0;
		alpha[0][1] = 0;
	}
	
	if (y0 < 0) {
		y0 = 0;
		alpha[0][0] = 0;
		alpha[1][0] = 0;
	}
	
	if (x1 > w-1) {
		x1 = w-1;
		alpha[1][0] = 0;
		alpha[1][1] = 0;
	}
	
	if (y1 > h-1) {
		y1 = h-1;
		alpha[0][1] = 0;
		alpha[1][1] = 0;
	}
	
	
	//alert('srcx: '+srcCoord.x+'   srcy: '+srcCoord.y)
	//alert('x0: '+x0+'   y0: '+y0)
		
	// if alpha[x][x] has not been modified, then the pixel exists --> set alpha
	if (alpha[0][0] == -1) alpha[0][0] = srcPixelData[x0][y0].a;
	if (alpha[1][0] == -1) alpha[1][0] = srcPixelData[x1][y0].a;
	if (alpha[0][1] == -1) alpha[0][1] = srcPixelData[x0][y1].a;
	if (alpha[1][1] == -1) alpha[1][1] = srcPixelData[x1][y1].a;

	var pixel = {
		r: Math.round(srcPixelData[x0][y0].r*f00 + srcPixelData[x1][y0].r*f10 + srcPixelData[x0][y1].r*f01 + srcPixelData[x1][y1].r*f11),
		g: Math.round(srcPixelData[x0][y0].g*f00 + srcPixelData[x1][y0].g*f10 + srcPixelData[x0][y1].g*f01 + srcPixelData[x1][y1].g*f11),
		b: Math.round(srcPixelData[x0][y0].b*f00 + srcPixelData[x1][y0].b*f10 + srcPixelData[x0][y1].b*f01 + srcPixelData[x1][y1].b*f11),
		a: Math.round(alpha[0][0]*f00 + alpha[1][0]*f10 + alpha[0][1]*f01 + alpha[1][1]*f11)
	}

	if (pixel.r < 0) pixel.r = 0;
	if (pixel.g < 0) pixel.g = 0;
	if (pixel.b < 0) pixel.b = 0;
	if (pixel.a < 0) pixel.a = 0;

	if (pixel.r > 255) pixel.r = 255;
	if (pixel.g > 255) pixel.g = 255;
	if (pixel.b > 255) pixel.b = 255;
	if (pixel.a > 255) pixel.a = 255;

	return pixel;
}

function applyTrafo(x, y, trafo) {
	var w = trafo[0][2]*x + trafo[1][2]*y + trafo[2][2];
	if (w == 0) w = 1;

	return {x: (trafo[0][0]*x + trafo[1][0]*y + trafo[2][0])/w,
			y: (trafo[0][1]*x + trafo[1][1]*y + trafo[2][1])/w};
}

function mult33(m1, m2, result) {
	for (var i=0; i<3; i++) {
		for (var j=0; j<3; j++) {
			for (var k=0; k<3; k++) {
				result[i][j] += m1[i][k]*m2[k][j];
			}
		}
	}
}

function det22(m11, m12, m21, m22) {
	/*
	m11  m12
	m21  m22
	*/
	return m11*m22 - m12*m21;
}

function transpose33(matrix) {
	tmp = matrix[0][1];
	matrix[0][1] = matrix[1][0];
	matrix[1][0] = tmp;

	tmp = matrix[0][2];
	matrix[0][2] = matrix[2][0];
	matrix[2][0] = tmp;

	tmp = matrix[1][2];
	matrix[1][2] = matrix[2][1];
	matrix[2][1] = tmp;
}

function calculateMatrix(p0, p1, p2, p3) {
	/*
	a	d	g
	b	e	h
	c	f	i

	i = 1
	*/
	var a, b, c, d, e, f, g, h;


	var sx = p0.x - p1.x + p2.x - p3.x;
	var sy = p0.y - p1.y + p2.y - p3.y;

	if (sx == 0 && sy == 0) {
		a = p1.x - p0.x;
		b = p2.x - p1.x;
		c = p0.x;
		d = p1.y - p0.y;
		e = p2.y - p1.y;
		f = p0.y;
		g = 0;
		h = 0;
	} else {
		var dx1 = p1.x - p2.x;
		var dx2 = p3.x - p2.x;
		var dy1 = p1.y - p2.y;
		var dy2 = p3.y - p2.y;

		var det = det22(dx1, dx2, dy1, dy2);

		if (det == 0) {
			alert('det=0');
			return;
		}

		g = det22(sx, dx2, sy, dy2)/det;
		h = det22(dx1, sx, dy1, sy)/det;

		a = p1.x - p0.x + g*p1.x;
		b = p3.x - p0.x + h*p3.x;
		c = p0.x;
		d = p1.y - p0.y + g*p1.y;
		e = p3.y - p0.y + h*p3.y;
		f = p0.y;
	}

	var out = [[a, d, g], [b, e, h], [c, f, 1]];
	//transpose33(out)

	return out;
}

function matrix33() {
	return [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
}

function det33(matrix) {
	a1 = matrix[0][0]*matrix[1][1]*matrix[2][2];
	a2 = matrix[1][0]*matrix[2][1]*matrix[0][2];
	a3 = matrix[2][0]*matrix[0][1]*matrix[1][2];

	s1 = matrix[0][0]*matrix[2][1]*matrix[1][2];
	s2 = matrix[1][0]*matrix[0][1]*matrix[2][2];
	s3 = matrix[2][0]*matrix[1][1]*matrix[0][2];
	return  a1+a2+a3-s1-s2-s3;
}

function adjoint33(matrix) {
	/* using homogeneous coordinates, the adjoint can be used instead of the inverse of a matrix
	[[a, b, c], [d, e, f], [g, h, i]]
	m11 = e*i - h*f;
	m12 = c*h - b*i;
	m13 = b*f - c*e;

	m21 = f*g - d*i;
	m22 = a*i - c*g;
	m23 = c*d - a*f;

	m31 = d*h - e*g;
	m32 = b*g - a*h;
	m33 = a*e - b*d;
	*/

	m11 = matrix[1][1]*matrix[2][2] - matrix[2][1]*matrix[1][2];
	m12 = matrix[0][2]*matrix[2][1] - matrix[0][1]*matrix[2][2];
	m13 = matrix[0][1]*matrix[1][2] - matrix[0][2]*matrix[1][1];

	m21 = matrix[1][2]*matrix[2][0] - matrix[1][0]*matrix[2][2];
	m22 = matrix[0][0]*matrix[2][2] - matrix[0][2]*matrix[2][0];
	m23 = matrix[0][2]*matrix[1][0] - matrix[0][0]*matrix[1][2];

	m31 = matrix[1][0]*matrix[2][1] - matrix[1][1]*matrix[2][0];
	m32 = matrix[0][1]*matrix[2][0] - matrix[0][0]*matrix[2][1];
	m33 = matrix[0][0]*matrix[1][1] - matrix[0][1]*matrix[1][0];

	return [[m11, m12, m13], [m21, m22, m23], [m31, m32, m33]];
}

function matrdump(trafo) {
	alert((trafo[0][0]/trafo[2][2]).toFixed(3)+'    '+(trafo[0][1]/trafo[2][2]).toFixed(3)+'    '+(trafo[0][2]/trafo[2][2]).toFixed(3)+'\n'+(trafo[1][0]/trafo[2][2])
.toFixed(3)+'    '+(trafo[1][1]/trafo[2][2]).toFixed(3)+'    '+(trafo[1][2]/trafo[2][2]).toFixed(3)+'\n'+(trafo[2][0]/trafo[2][2]).toFixed(3)+'    '+(trafo[2][1]/trafo[2][2]).toFixed(3)+'    '+(trafo[2][2]/trafo[2][2]).toFixed(3))
}

function displayMatrix(matrix, table) {
	var td = document.getElementById(table).getElementsByTagName('td');
	
	td[0].innerHTML = (matrix[0][0]/matrix[2][2]).toFixed(4);
	td[1].innerHTML = (matrix[1][0]/matrix[2][2]).toFixed(4);
	td[2].innerHTML = (matrix[2][0]/matrix[2][2]).toFixed(4);
	td[3].innerHTML = (matrix[0][1]/matrix[2][2]).toFixed(4);
	td[4].innerHTML = (matrix[1][1]/matrix[2][2]).toFixed(4);
	td[5].innerHTML = (matrix[2][1]/matrix[2][2]).toFixed(4);
	td[6].innerHTML = (matrix[0][2]/matrix[2][2]).toFixed(4);
	td[7].innerHTML = (matrix[1][2]/matrix[2][2]).toFixed(4);
	td[8].innerHTML = (matrix[2][2]/matrix[2][2]).toFixed(4);
}

/*
function addBoundary(srcCanvas) {
	var srcCtx = srcCanvas.getContext('2d');
	var srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);

	srcCanvas.width = srcCanvas.width+2;
	srcCanvas.height = srcCanvas.height+2;
	srcCtx.putImageData(srcData, 1, 1);

	srcCtx.globalAlpha = 0;
	var wmin1 = srcCanvas.width-1;
	var wmin2 = srcCanvas.width-2;
	var hmin1 = srcCanvas.height-1;
	var hmin2 = srcCanvas.height-2;

	// upper left corner
	srcCtx.drawImage(srcCanvas, 1, 1, 1, 1, 0, 0, 1, 1);

	// left side
	srcCtx.drawImage(srcCanvas, 1, 1, 1, hmin2, 0, 1, 1, hmin2);

	// lower left corner
	srcCtx.drawImage(srcCanvas, 1, hmin2, 1, 1, 0, hmin1, 1, 1);

	// lower side
	srcCtx.drawImage(srcCanvas, 1, hmin2, wmin2, 1, 1, hmin1, wmin2, 1);

	// lower right corner
	srcCtx.drawImage(srcCanvas, wmin2, hmin2, 1, 1, wmin1, hmin1, 1, 1);

	// right side
	srcCtx.drawImage(srcCanvas, wmin2, 1, 1, hmin2, wmin1, 1, 1, hmin2);

	// upper right corner
	srcCtx.drawImage(srcCanvas, wmin2, 1, 1, 1, wmin1, 0, 1, 1);

	// upper side
	srcCtx.drawImage(srcCanvas, 1, 1, wmin2, 1, 1, 0, wmin2, 1);


	srcCtx.globalAlpha = 1;
}
*/

/* ]]> */


function vanishingPoints() {
	var image = new Image();

	image.onload = function() {
		var size = 500;
		var offsetX = Math.round((size-image.width)/2);
		var offsetY = Math.round((size-image.height)/2);
		
		var demo = document.getElementById('perspectiveDemoVP');
		demo.width = size;
		demo.height = size;
		var demoCtx = demo.getContext('2d');
		demoCtx.drawImage(image, offsetX, offsetY);

		
		YUI().use('dd', function(Y) {
			var body = Y.one('#theBody');
			
			var handle = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
			handle.className = 'handle';
			
			var canvas = Y.one('#perspectiveDemoVP');
			var XY = canvas.getXY();
			
			canvas.setAttribute('offsetX', offsetX);
			canvas.setAttribute('offsetY', offsetY);
			
			var handleVP1 = handle.cloneNode(true);
			handleVP1.id = 'handleVP1';
			handleVP1.style.left = Math.round(XY[0]+size/2)+'px';
			handleVP1.style.top = (XY[1]+10)+'px';
			body.appendChild(handleVP1);
			
			var handleVP2 = handle.cloneNode(true);
			handleVP2.id = 'handleVP2';
			handleVP2.style.left = (XY[0]+size-10)+'px';
			handleVP2.style.top = Math.round(XY[1]+size/2)+'px';
			body.appendChild(handleVP2);
			
			
			var ddVP1 = new Y.DD.Drag({
				node: '#handleVP1'
			});
			ddVP1.on('drag:end', initTransformVP);
			ddVP1.on('drag:drag', function() {
				if (document.getElementById('liveWarping').checked) initTransformVP()
			});
			
			var ddVP2 = new Y.DD.Drag({
				node: '#handleVP2'
			});
			ddVP2.on('drag:end', initTransformVP);
			ddVP2.on('drag:drag', function() {
				if (document.getElementById('liveWarping').checked) initTransformVP()
			});
			

		});
		
		initTransformVP();


		
		/*
		var results = document.getElementById('transformResults');
		
		var time = 0;
		for (var i=0; i<10; i++) {

			var start = new Date().getTime();

			var transformation = transformCanvas(canvas, i*2, i*-4, 10-2*i, 20+i*3, i*10, 0, i*-2, i*-5);

			var end = new Date().getTime();
			time += end - start;

			transformation.style.border = '1px solid red'
			transformation.style.margin = '1px'

			results.appendChild(transformation);
		}
		alert('Execution time: ' + time);
		*/
	}

	image.src = 'color.png';
}

function initTransformVP() {
	YUI().use('dd', function(Y) {
		
		var XY = Y.one('#perspectiveDemoVP').getXY();
		var canvas = document.getElementById('perspectiveDemoVP');
		var ch = parseInt(canvas.height);
		var cw = parseInt(canvas.width);
		
		var source = document.getElementById('source');
		var sh = parseInt(source.height);
		var sw = parseInt(source.width);
		
		var pTL = {
			x: XY[0]+Math.round((cw-sw)/2),
			y: XY[1]+Math.round((ch-sh)/2)
		}
		var pBL = {
			x: pTL.x,
			y: pTL.y + sh
		}
		var pBR = {
			x: pTL.x + sw,
			y: pTL.y + sh
		}
		var pTR = {
			x: pTL.x + sw,
			y: pTL.y
		}
		
		var vp1 = {
			x: Y.one('#handleVP1').getX()+3,
			y: Y.one('#handleVP1').getY()+3
		}

		var vp2 = {
			x: Y.one('#handleVP2').getX()+3,
			y: Y.one('#handleVP2').getY()+3
		}
		
		
		var vpRF = document.getElementById('vpReferencePoint').value;
		var minX = Math.min(pTL.x, pBL.x, pBR.x, pTR.x);
		var minY = Math.min(pTL.y, pBL.y, pBR.y, pTR.y);
		var maxX = Math.max(pTL.x, pBL.x, pBR.x, pTR.x);
		var maxY = Math.max(pTL.y, pBL.y, pBR.y, pTR.y);
		
		var referencePoint = -1;
		/*
		if (vpRF == 'auto') {
			if (vp1.x < minX) { // vp1 is on the left
				alert('vp1 left')
				if (vp2.y < minY) { // vp2 is above
					referencePoint = 'br';
				} else if (vp2.y > maxY) { // vp2 is below
					referencePoint = 'tr';
				} else if (vp2.x > maxX) { // vp2 is on the right
					referencePoint = 'bl';
				}
			} else if (vp1.x > maxX) { // vp1 is on the right
				alert('vp1 right')
				if (vp2.y < minY) { // vp2 is above
					referencePoint = 'bl';
				} else if (vp2.y > maxY) { // vp2 is below
					referencePoint = 'tl';
				}
			} else if (vp1.y < minY) { // vp1 is above
				alert('vp1 above')
				if (vp2.x < minX) { // vp2 is on the left
					referencePoint = 'br';
				} else if (vp2.x > maxX) { // vp2 is on the right
					referencePoint = 'bl';
				}
			} else if (vp1.y > maxY) { // vp1 is below
				alert('vp1 below')
				if (vp2.x < minX) { // vp2 is on the left
					referencePoint = 'tr';
				} else if (vp2.x > maxX) { // vp2 is on the right
					referencePoint = 'tl';
				}
			}
		} else {
			referencePoint = vpRF;
		}
		*/
		
		
		if (vpRF == 'auto') {
			// choosing the most distand input corner is most of the time the best choice
			var dx, dy, sum;
			
			dx = Math.pow(vp1.x-pTL.x, 2) + Math.pow(vp2.x-pTL.x, 2);
			dy = Math.pow(vp1.y-pTL.y, 2) + Math.pow(vp2.y-pTL.y, 2);
			sum = sum1 = dx+dy;
			referencePoint = 'tl';
			
			dx = Math.pow(vp1.x-pTR.x, 2) + Math.pow(vp2.x-pTR.x, 2);
			dy = Math.pow(vp1.y-pTR.y, 2) + Math.pow(vp2.y-pTR.y, 2);
			sum2 = dx+dy;
			if (sum2 > sum) {
				sum = dx+dy;
				referencePoint = 'tr';
			}
			
			dx = Math.pow(vp1.x-pBL.x, 2) + Math.pow(vp2.x-pBL.x, 2);
			dy = Math.pow(vp1.y-pBL.y, 2) + Math.pow(vp2.y-pBL.y, 2);
			sum3 = dx+dy;
			if (sum3 > sum) {
				sum = dx+dy;
				referencePoint = 'bl';
			}
			
			dx = Math.pow(vp1.x-pBR.x, 2) + Math.pow(vp2.x-pBR.x, 2);
			dy = Math.pow(vp1.y-pBR.y, 2) + Math.pow(vp2.y-pBR.y, 2);
			sum4 = dx+dy;
			if (sum4 > sum) {
				sum = dx+dy;
				referencePoint = 'br';
			}
			
			//alert(sum1+'\n'+sum2+'\n'+sum3+'\n'+sum4)
			
		} else {
			referencePoint = vpRF;
		}
		
		document.getElementById('vpSelectedReferencePoint').innerHTML = referencePoint;
		
		if ((minY <= vp1.y && vp1.y <= maxY) || (minX <= vp2.x && vp2.x <= maxX)) {
			alert('Warning: Invalid vanishing point.')
			return;
		}
				
		if (referencePoint == -1) {
			alert('Warning: Rev. Point == -1');
			return false;
		}
		
		switch (referencePoint) {
			case 'tl':
				var _pTL = pTL; // tl remains the same
			
				// _pBL: get line through pTL and VP1 and intersection with line pBL-pBR
				var m1 = (pTL.y-vp1.y)/(pTL.x-vp1.x);
				var q1 = vp1.y - m1*vp1.x;
			
				var _pBL = {
					x: Math.round((pBL.y-q1)/m1),
					y: pBL.y
				}
				
				// _pTR: get line through pTL and VP2 and intersection with line pTR-pBR
				var m2 = (pTL.y-vp2.y)/(pTL.x-vp2.x);
				var q2 = vp2.y - m2*vp2.x;
				
				var _pTR = {
					x: pTR.x,
					y: Math.round(m2*pTR.x+q2)
				}
				
				// _pBR: get the lines _pTR-VP1 and _pBL-VP2 and their intersection
				var m3 = (_pTR.y-vp1.y)/(_pTR.x-vp1.x);
				var q3 = vp1.y - m3*vp1.x;
				
				var m4 = (_pBL.y-vp2.y)/(_pBL.x-vp2.x);
				var q4 = vp2.y - m4*vp2.x;
				
				var _pBR = {
					x: Math.round((q3-q4)/(m4-m3)),
					y: Math.round((m3*q4-m4*q3)/(m3-m4))
				}
			break;
			
			case 'bl':
				var _pBL = pBL; // bl remains the same
			
				// _pTL: get line through pBL and VP1 and intersection with line pTL-pTR
				var m1 = (pBL.y-vp1.y)/(pBL.x-vp1.x);
				var q1 = vp1.y - m1*vp1.x;
			
				var _pTL = {
					x: Math.round((pTL.y-q1)/m1),
					y: pTL.y
				}
				
				// _pBR: get line through pBL and VP2 and intersection with line pTR-pBR
				var m2 = (pBL.y-vp2.y)/(pBL.x-vp2.x);
				var q2 = vp2.y - m2*vp2.x;
				
				var _pBR = {
					x: pBR.x,
					y: Math.round(m2*pBR.x+q2)
				}
				
				// _pTR: get the lines _pBR-VP1 and _pTL-VP2 and their intersection
				var m3 = (_pBR.y-vp1.y)/(_pBR.x-vp1.x);
				var q3 = vp1.y - m3*vp1.x;
				
				var m4 = (_pTL.y-vp2.y)/(_pTL.x-vp2.x);
				var q4 = vp2.y - m4*vp2.x;
				
				var _pTR = {
					x: Math.round((q3-q4)/(m4-m3)),
					y: Math.round((m3*q4-m4*q3)/(m3-m4))
				}
			break;
			
			case 'br':
				var _pBR = pBR; // br remains the same
			
				// _pTR: get line through pBR and VP1 and intersection with line pTL-pTR
				var m1 = (pBR.y-vp1.y)/(pBR.x-vp1.x);
				var q1 = vp1.y - m1*vp1.x;
			
				var _pTR = {
					x: Math.round((pTR.y-q1)/m1),
					y: pTR.y
				}
				
				// _pBL: get line through pBR and VP2 and intersection with line pTL-pBL
				var m2 = (pBR.y-vp2.y)/(pBR.x-vp2.x);
				var q2 = vp2.y - m2*vp2.x;
				
				var _pBL = {
					x: pBL.x,
					y: Math.round(m2*pBL.x+q2)
				}
				
				// _pTL: get the lines _pBL-VP1 and _pTR-VP2 and their intersection
				var m3 = (_pBL.y-vp1.y)/(_pBL.x-vp1.x);
				var q3 = vp1.y - m3*vp1.x;
				
				var m4 = (_pTR.y-vp2.y)/(_pTR.x-vp2.x);
				var q4 = vp2.y - m4*vp2.x;
				
				var _pTL = {
					x: Math.round((q3-q4)/(m4-m3)),
					y: Math.round((m3*q4-m4*q3)/(m3-m4))
				}
			break;
			
			case 'tr':
				var _pTR = pTR; // tr remains the same
			
				// _pBR: get line through pTR and VP1 and intersection with line pBL-pBR
				var m1 = (pTR.y-vp1.y)/(pTR.x-vp1.x);
				var q1 = vp1.y - m1*vp1.x;
			
				var _pBR = {
					x: Math.round((pBR.y-q1)/m1),
					y: pBR.y
				}
				
				// _pTL: get line through pTR and VP2 and intersection with line pTL-pBL
				var m2 = (pTR.y-vp2.y)/(pTR.x-vp2.x);
				var q2 = vp2.y - m2*vp2.x;
				
				var _pTL = {
					x: pTL.x,
					y: Math.round(m2*pTL.x+q2)
				}
				
				// _pBL: get the lines _pTL-VP1 and _pBR-VP2 and their intersection
				var m3 = (_pTL.y-vp1.y)/(_pTL.x-vp1.x);
				var q3 = vp1.y - m3*vp1.x;
				
				var m4 = (_pBR.y-vp2.y)/(_pBR.x-vp2.x);
				var q4 = vp2.y - m4*vp2.x;
				
				var _pBL = {
					x: Math.round((q3-q4)/(m4-m3)),
					y: Math.round((m3*q4-m4*q3)/(m3-m4))
				}
			break;
		}
		
		var trans = transformCanvas(source, _pTL.x-pTL.x, _pTL.y-pTL.y, _pBL.x-pBL.x, _pBL.y-pBL.y, _pBR.x-pBR.x, _pBR.y-pBR.y, _pTR.x-pTR.x, _pTR.y-pTR.y);
		
		canvas.width = canvas.width;
		
		var ct = canvas.getContext('2d');
		
		dW = Math.min(_pTL.x, _pTR.x, _pBL.x, _pBR.x) - XY[0]+3;
		dH = Math.min(_pTL.y, _pTR.y, _pBL.y, _pBR.y) - XY[1]+3;
		
		ct.drawImage(trans, dW, dH);
		
		/*
		ct.beginPath();
		ct.moveTo(pTL.x-XY[0], pTL.y-XY[1])
		ct.lineTo(vp1.x-XY[0], vp1.y-XY[1])
		ct.strokeStyle = 'red';
		ct.stroke();
		*/
	})
}
