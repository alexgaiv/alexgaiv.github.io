var screenshots = document.getElementById("screenshots");
var overlay = document.getElementById("overlay");
var wrap = document.getElementById("wrap");

function addImg(img, i) {
	img = img.cloneNode();
	img.setAttribute("data-s", i);
	img.id = img.className = "overlay-img"
	wrap.appendChild(img);
}

screenshots.onclick = function(e) {
	if (e.target.tagName != "IMG") return;

	var img = document.getElementById("overlay-img");
	if (img) wrap.removeChild(img);

	addImg(e.target, e.target.id[1]);
	wrap.style.display = "block";
	overlay.style.display = "block";
}
overlay.onclick = function(e) {
	wrap.style.display = "none";
	overlay.style.display = "none";
}
var ctrls = document.getElementsByClassName("control");
ctrls[0].onclick = ctrls[1].onclick = function(e) {
	var img = document.getElementById("overlay-img");
	var i = +img.getAttribute("data-s") +
		(e.target.id == "back" || e.target.parentNode.id == "back" ? -1 : 1);
	if (i > 5) i = 1;
	if (i < 1) i = 5;
	var img2 = document.getElementById("s"+ i);
	if (img2) {
		wrap.removeChild(img);
		addImg(img2, i);
	}
	e.preventDefault();
	return false;
}
ctrls[0].onmousedown = ctrls[1].onmousedown = function() {
	return false;
}