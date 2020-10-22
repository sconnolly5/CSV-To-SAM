const params = new URLSearchParams(window.location.search);
const imageBlobURL = params.get("csv");
document.querySelector("img").setAttribute("src", imageBlobURL);